import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

function parseFrom(from: string): { name: string | null; email: string } {
  const match = from.match(/^(.+?)\s*<(.+?)>\s*$/)
  if (match) return { name: match[1].trim() || null, email: match[2].trim().toLowerCase() }
  return { name: null, email: from.trim().toLowerCase() }
}

function cleanSubject(subject: string): string {
  return subject.replace(/^(Re|Fwd?|Fw)\s*:\s*/gi, '').trim()
}

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    console.error('RESEND_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const rawBody = await req.text()

  const wh = new Webhook(secret)
  let event: any
  try {
    event = wh.verify(rawBody, {
      'svix-id':        req.headers.get('svix-id') ?? '',
      'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
      'svix-signature': req.headers.get('svix-signature') ?? '',
    })
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (event.type !== 'email.received') {
    return NextResponse.json({ ok: true })
  }

  const { from, to, subject, html, text, headers: emailHeaders = {} } = event.data
  const inReplyTo = emailHeaders['in-reply-to'] ?? null
  const messageId = emailHeaders['message-id'] ?? null
  const toEmail   = Array.isArray(to) ? to[0] : (to ?? null)

  const { name, email } = parseFrom(from)
  const db = serviceClient()

  // Upsert customer — preserve existing name if already known
  const { data: customer, error: custErr } = await db
    .from('customers')
    .upsert({ email, name: name ?? undefined }, { onConflict: 'email', ignoreDuplicates: false })
    .select('id')
    .single()

  if (custErr || !customer) {
    console.error('Customer upsert failed:', custErr)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  let conversationId: string | null = null

  // 1. Match via In-Reply-To against a known message-id
  if (inReplyTo) {
    const { data: m } = await db
      .from('messages')
      .select('conversation_id')
      .eq('resend_message_id', inReplyTo)
      .maybeSingle()
    if (m) conversationId = (m as any).conversation_id
  }

  // 2. Match via normalised subject for the same customer
  if (!conversationId && subject) {
    const normalised = cleanSubject(subject)
    if (normalised) {
      const { data: c } = await db
        .from('conversations')
        .select('id')
        .eq('customer_id', (customer as any).id)
        .eq('subject', normalised)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (c) conversationId = (c as any).id
    }
  }

  // 3. Create a new conversation
  if (!conversationId) {
    const { data: newConv, error: convErr } = await db
      .from('conversations')
      .insert({
        customer_id: (customer as any).id,
        subject: subject ? cleanSubject(subject) : '(no subject)',
        last_message_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (convErr || !newConv) {
      console.error('Conversation insert failed:', convErr)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
    conversationId = (newConv as any).id
  }

  await db.from('messages').insert({
    conversation_id: conversationId,
    direction: 'inbound',
    from_email: email,
    to_email: toEmail,
    subject: subject ?? null,
    body_html: html ?? null,
    body_text: text ?? null,
    resend_message_id: messageId,
    in_reply_to: inReplyTo,
  })

  await db
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  return NextResponse.json({ ok: true })
}
