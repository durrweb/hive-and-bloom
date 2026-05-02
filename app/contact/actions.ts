'use server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const CONTACT_EMAIL = 'hello@dreamybee.com'

export type ContactState =
  | { status: 'success' }
  | { status: 'error'; message: string }
  | null

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name    = (formData.get('name')    as string | null)?.trim() ?? ''
  const email   = (formData.get('email')   as string | null)?.trim() ?? ''
  const subject = (formData.get('subject') as string | null)?.trim() ?? ''
  const message = (formData.get('message') as string | null)?.trim() ?? ''

  if (!name || !email || !message) {
    return { status: 'error', message: 'Please fill in all required fields.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' }
  }
  if (message.length < 10) {
    return { status: 'error', message: 'Message is too short.' }
  }

  const subjectLine = subject
    ? `[Contact] ${subject}`
    : `[Contact] Message from ${name}`

  const { error } = await resend.emails.send({
    from: 'Hive & Bloom <noreply@dreamybee.com>',
    to:   CONTACT_EMAIL,
    replyTo: email,
    subject: subjectLine,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#2A4A2A;border-bottom:2px solid #C8771E;padding-bottom:0.5rem">
          New Contact Message
        </h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem">
          <tr>
            <td style="padding:6px 0;font-weight:600;color:#555;width:80px">Name</td>
            <td style="padding:6px 0;color:#1E1A14">${name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;color:#555">Email</td>
            <td style="padding:6px 0"><a href="mailto:${email}" style="color:#C8771E">${email}</a></td>
          </tr>
          ${subject ? `<tr><td style="padding:6px 0;font-weight:600;color:#555">Subject</td><td style="padding:6px 0;color:#1E1A14">${subject}</td></tr>` : ''}
        </table>
        <div style="background:#FAF5EC;border-left:3px solid #C8771E;padding:1rem 1.25rem;border-radius:4px">
          <p style="margin:0;white-space:pre-wrap;color:#1E1A14;line-height:1.7">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        <p style="font-size:0.8rem;color:#8A8478;margin-top:2rem">
          Sent via the Hive &amp; Bloom contact form · Reply to this email to respond directly.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('Resend error:', error)
    return { status: 'error', message: 'Something went wrong. Please try again or email us directly.' }
  }

  return { status: 'success' }
}
