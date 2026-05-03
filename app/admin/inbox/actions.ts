'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'

export type Customer = {
  id: string
  email: string
  name: string | null
  created_at: string
}

export type Conversation = {
  id: string
  subject: string | null
  status: 'open' | 'resolved'
  last_message_at: string
  created_at: string
  customers: Customer
}

export type Message = {
  id: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  from_email: string | null
  to_email: string | null
  subject: string | null
  body_html: string | null
  body_text: string | null
  resend_message_id: string | null
  in_reply_to: string | null
  created_at: string
}

export type ConversationData = {
  messages: Message[]
  conversation: Conversation | null
  totalConversations: number
}

async function requireStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return supabase as any
}

export async function getConversations(): Promise<Conversation[]> {
  const db = await requireStaff()
  const { data } = await db
    .from('conversations')
    .select('*, customers(*)')
    .order('last_message_at', { ascending: false })
  return data ?? []
}

export async function getConversationData(conversationId: string): Promise<ConversationData> {
  const db = await requireStaff()

  const [{ data: messages }, { data: conv }] = await Promise.all([
    db.from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }),
    db.from('conversations')
      .select('*, customers(*)')
      .eq('id', conversationId)
      .single(),
  ])

  let totalConversations = 0
  if (conv?.customer_id) {
    const { count } = await db
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', conv.customer_id)
    totalConversations = count ?? 0
  }

  return {
    messages: messages ?? [],
    conversation: conv ?? null,
    totalConversations,
  }
}

export async function setConversationStatus(
  conversationId: string,
  status: 'open' | 'resolved',
): Promise<void> {
  const db = await requireStaff()
  await db.from('conversations').update({ status }).eq('id', conversationId)
  revalidatePath('/admin/inbox')
}

export async function sendReply(
  conversationId: string,
  bodyText: string,
): Promise<{ ok: true; message: Message } | { ok: false; error: string }> {
  const db = await requireStaff()

  const { data: conv } = await db
    .from('conversations')
    .select('*, customers(*)')
    .eq('id', conversationId)
    .single()
  if (!conv) return { ok: false, error: 'Conversation not found' }

  const { data: lastInbound } = await db
    .from('messages')
    .select('resend_message_id, in_reply_to')
    .eq('conversation_id', conversationId)
    .eq('direction', 'inbound')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const subject = conv.subject ? `Re: ${conv.subject}` : 'Re: Your message'

  const extraHeaders: Record<string, string> = {}
  if (lastInbound?.resend_message_id) {
    extraHeaders['In-Reply-To'] = lastInbound.resend_message_id
    const refs = [lastInbound.in_reply_to, lastInbound.resend_message_id]
      .filter(Boolean).join(' ')
    if (refs) extraHeaders['References'] = refs
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data: sent, error: sendError } = await resend.emails.send({
    from: 'Dreamybee <hello@dreamybee.com>',
    to: conv.customers.email,
    replyTo: 'hello@dreamybee.com',
    subject,
    text: bodyText,
    headers: extraHeaders,
  })

  if (sendError || !sent) {
    return { ok: false, error: sendError?.message ?? 'Failed to send email' }
  }

  const { data: msg } = await db
    .from('messages')
    .insert({
      conversation_id: conversationId,
      direction: 'outbound',
      from_email: 'hello@dreamybee.com',
      to_email: conv.customers.email,
      subject,
      body_text: bodyText,
      resend_message_id: sent.id,
    })
    .select()
    .single()

  await db
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  revalidatePath('/admin/inbox')
  return { ok: true, message: msg as Message }
}
