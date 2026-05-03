'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import {
  getConversationData,
  setConversationStatus,
  sendReply,
  type Conversation,
  type Message,
} from './actions'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Renders inbound HTML email in a sandboxed iframe that auto-sizes to content
function EmailHtml({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)

  const srcDoc = `<!doctype html><html><head><base target="_blank"><style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 8px 12px; font-family: sans-serif; font-size: 14px; line-height: 1.5; color: #1E1A14; }
    img { max-width: 100%; height: auto; }
    a { color: #C8771E; }
    pre, code { font-size: 12px; white-space: pre-wrap; word-break: break-all; }
  </style></head><body>${html}</body></html>`

  function resize() {
    const f = ref.current
    if (f?.contentDocument?.documentElement) {
      f.style.height = f.contentDocument.documentElement.scrollHeight + 'px'
    }
  }

  return (
    <iframe
      ref={ref}
      srcDoc={srcDoc}
      sandbox="allow-same-origin"
      onLoad={resize}
      style={{ width: '100%', border: 'none', minHeight: 60, display: 'block' }}
      title="Email content"
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InboxClient({
  initialConversations,
}: {
  initialConversations: Conversation[]
}) {
  const [conversations, setConversations] = useState(initialConversations)
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [totalConvs, setTotalConvs] = useState(0)
  const [loadingThread, setLoadingThread] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [showList, setShowList] = useState(true) // mobile toggle
  const [statusPending, startStatusTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function selectConversation(convId: string) {
    setSelectedConvId(convId)
    setMessages([])
    setSelectedConv(null)
    setReplyText('')
    setReplyError(null)
    setLoadingThread(true)
    setShowList(false)
    try {
      const data = await getConversationData(convId)
      setMessages(data.messages)
      setSelectedConv(data.conversation)
      setTotalConvs(data.totalConversations)
    } finally {
      setLoadingThread(false)
    }
  }

  async function handleSend() {
    if (!selectedConvId || !replyText.trim() || sending) return
    setSending(true)
    setReplyError(null)
    const result = await sendReply(selectedConvId, replyText.trim())
    if ('error' in result) {
      setReplyError(result.error)
    } else {
      setMessages(prev => [...prev, result.message])
      setReplyText('')
      const now = new Date().toISOString()
      setConversations(prev =>
        prev.map(c => c.id === selectedConvId ? { ...c, last_message_at: now } : c)
      )
    }
    setSending(false)
  }

  function handleToggleStatus() {
    if (!selectedConv || !selectedConvId) return
    const newStatus: 'open' | 'resolved' = selectedConv.status === 'open' ? 'resolved' : 'open'
    startStatusTransition(async () => {
      await setConversationStatus(selectedConvId, newStatus)
      setSelectedConv(prev => prev ? { ...prev, status: newStatus } : prev)
      setConversations(prev =>
        prev.map(c => c.id === selectedConvId ? { ...c, status: newStatus } : c)
      )
    })
  }

  const openCount = conversations.filter(c => c.status === 'open').length

  return (
    <>
      <style>{`
        .inbox-layout { display: flex; flex: 1; overflow: hidden; }
        .inbox-left    { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid var(--cream-dark); background: white; overflow: hidden; }
        .inbox-center  { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
        .inbox-right   { width: 250px; flex-shrink: 0; border-left: 1px solid var(--cream-dark); overflow-y: auto; background: white; }
        @media (max-width: 768px) {
          .inbox-left   { width: 100%; border-right: none; }
          .inbox-right  { display: none; }
          .inbox-left.mobile-hidden  { display: none; }
          .inbox-center.mobile-hidden { display: none; }
        }
        .conv-row:hover { background: var(--honey-pale) !important; }
        .reply-textarea:focus { border-color: var(--honey) !important; outline: none; }
      `}</style>

      <div className="inbox-layout">

        {/* ── Left: Conversation list ───────────────────────────────────── */}
        <div className={`inbox-left${!showList ? ' mobile-hidden' : ''}`}>
          <div style={{
            padding: '0.875rem 1rem 0.75rem',
            borderBottom: '1px solid var(--cream-dark)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '0.6rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair), Georgia, serif',
              fontSize: '0.95rem', fontWeight: 700,
              color: 'var(--forest)', margin: 0,
            }}>
              Conversations
            </h2>
            {openCount > 0 && (
              <span style={{
                background: 'var(--honey)', color: 'var(--forest)',
                borderRadius: 999, fontSize: '0.68rem', fontWeight: 700,
                padding: '0.1rem 0.5rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}>
                {openCount}
              </span>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.length === 0 ? (
              <div style={{
                padding: '2.5rem 1rem', textAlign: 'center',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.83rem', color: 'var(--mist)',
              }}>
                No conversations yet.<br />Emails to hello@dreamybee.com will appear here.
              </div>
            ) : (
              conversations.map(conv => {
                const selected = conv.id === selectedConvId
                return (
                  <button
                    key={conv.id}
                    className="conv-row"
                    onClick={() => selectConversation(conv.id)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '0.875rem 1rem',
                      borderBottom: '1px solid var(--cream-dark)',
                      background: selected ? 'var(--honey-pale)' : 'transparent',
                      border: 'none',
                      borderLeft: `3px solid ${selected ? 'var(--honey)' : 'transparent'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        fontSize: '0.85rem', fontWeight: 600,
                        color: 'var(--ink)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: 160,
                      }}>
                        {conv.customers.name ?? conv.customers.email}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        fontSize: '0.7rem', color: 'var(--mist)',
                        flexShrink: 0, marginLeft: '0.5rem',
                      }}>
                        {timeAgo(conv.last_message_at)}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      fontSize: '0.78rem', color: 'var(--mist)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: '0.4rem',
                    }}>
                      {conv.subject ?? '(no subject)'}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      fontSize: '0.62rem', fontWeight: 600,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '0.12rem 0.4rem', borderRadius: 3,
                      background: conv.status === 'open' ? 'var(--forest-pale)' : 'var(--cream-dark)',
                      color: conv.status === 'open' ? 'var(--forest)' : 'var(--mist)',
                    }}>
                      {conv.status}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Center: Thread + reply ────────────────────────────────────── */}
        <div className={`inbox-center${showList && !selectedConvId ? ' mobile-hidden' : ''}`}>
          {!selectedConvId ? (
            <div style={{
              flex: 1, height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '0.75rem',
            }}>
              <div style={{ fontSize: '2.5rem' }}>✉️</div>
              <p style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.88rem', color: 'var(--mist)', margin: 0,
              }}>
                Select a conversation to view
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--cream-dark)',
                background: 'white', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                {/* Mobile back button */}
                <button
                  onClick={() => setShowList(true)}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    cursor: 'pointer', color: 'var(--mist)',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.8rem', display: 'none',
                  }}
                  className="mobile-back"
                >
                  ←
                </button>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: '0.95rem', fontWeight: 700,
                    color: 'var(--forest)', margin: '0 0 0.15rem',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {selectedConv?.subject ?? '(no subject)'}
                  </h3>
                  <div style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.75rem', color: 'var(--mist)',
                  }}>
                    {selectedConv
                      ? selectedConv.customers.name
                        ? `${selectedConv.customers.name} <${selectedConv.customers.email}>`
                        : selectedConv.customers.email
                      : ''}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                background: 'var(--cream)',
              }}>
                {loadingThread ? (
                  <div style={{
                    textAlign: 'center', padding: '3rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.85rem', color: 'var(--mist)',
                  }}>
                    Loading…
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '3rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.85rem', color: 'var(--mist)',
                  }}>
                    No messages
                  </div>
                ) : (
                  messages.map(msg => {
                    const out = msg.direction === 'outbound'
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: out ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          alignSelf: out ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div style={{
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          fontSize: '0.7rem', color: 'var(--mist)',
                          marginBottom: '0.3rem',
                          textAlign: out ? 'right' : 'left',
                        }}>
                          {out
                            ? 'You (Dreamybee)'
                            : (selectedConv?.customers.name ?? msg.from_email)
                          }
                          {' · '}
                          {formatDateTime(msg.created_at)}
                        </div>
                        <div style={{
                          background: out ? 'var(--forest)' : 'white',
                          color: out ? 'rgba(255,255,255,0.92)' : 'var(--ink)',
                          border: out ? 'none' : '1px solid var(--cream-dark)',
                          borderRadius: out ? '12px 12px 4px 12px' : '4px 12px 12px 12px',
                          padding: '0.75rem 1rem',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}>
                          {!out && msg.body_html ? (
                            <EmailHtml html={msg.body_html} />
                          ) : (
                            <p style={{
                              margin: 0,
                              fontFamily: 'var(--font-crimson), Georgia, serif',
                              fontSize: '1rem', lineHeight: 1.65,
                              whiteSpace: 'pre-wrap',
                            }}>
                              {msg.body_text ?? ''}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply box */}
              <div style={{
                borderTop: '1px solid var(--cream-dark)',
                padding: '0.875rem 1.25rem',
                background: 'white', flexShrink: 0,
              }}>
                {replyError && (
                  <div style={{
                    marginBottom: '0.65rem',
                    background: '#fee2e2', border: '1px solid #fca5a5',
                    borderRadius: 6, padding: '0.45rem 0.75rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.82rem', color: 'var(--coral)',
                  }}>
                    {replyError}
                  </div>
                )}
                <textarea
                  className="reply-textarea"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
                  }}
                  placeholder="Write a reply… (⌘↩ or Ctrl↩ to send)"
                  rows={3}
                  style={{
                    width: '100%', resize: 'vertical',
                    fontFamily: 'var(--font-crimson), Georgia, serif',
                    fontSize: '1rem', lineHeight: 1.65,
                    border: '1px solid var(--cream-dark)', borderRadius: 8,
                    padding: '0.65rem 0.875rem',
                    background: 'var(--cream)', color: 'var(--ink)',
                    marginBottom: '0.625rem',
                    transition: 'border-color 0.15s',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleSend}
                    disabled={sending || !replyText.trim()}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', opacity: (!replyText.trim() || sending) ? 0.5 : 1 }}
                  >
                    {sending ? 'Sending…' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Right: Customer sidebar ───────────────────────────────────── */}
        {selectedConv && (
          <div className="inbox-right" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Customer info */}
              <div>
                <div style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '0.68rem', fontWeight: 600,
                  letterSpacing: '0.09em', textTransform: 'uppercase',
                  color: 'var(--mist)', marginBottom: '0.65rem',
                }}>
                  Customer
                </div>
                <div style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: '0.95rem', fontWeight: 700,
                  color: 'var(--forest)', marginBottom: '0.3rem',
                }}>
                  {selectedConv.customers.name ?? 'Unknown'}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedConv.customers.email)
                  }}
                  title="Click to copy email"
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.78rem', color: 'var(--honey)',
                    cursor: 'pointer', textAlign: 'left',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedConv.customers.email}
                </button>
              </div>

              {/* Stats */}
              <div style={{
                background: 'var(--cream)', borderRadius: 8,
                padding: '0.75rem 0.875rem',
                display: 'flex', flexDirection: 'column', gap: '0.55rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.75rem', color: 'var(--mist)',
                  }}>
                    Customer since
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)',
                  }}>
                    {new Date(selectedConv.customers.created_at).toLocaleDateString(undefined, {
                      month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.75rem', color: 'var(--mist)',
                  }}>
                    Conversations
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink)',
                  }}>
                    {totalConvs}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--cream-dark)' }} />

              {/* Resolve / Reopen */}
              <button
                onClick={handleToggleStatus}
                disabled={statusPending}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '0.82rem', fontWeight: 600,
                  padding: '0.6rem 1rem', borderRadius: 6,
                  cursor: statusPending ? 'not-allowed' : 'pointer',
                  border: '1px solid',
                  background: selectedConv.status === 'open' ? 'var(--forest-pale)' : 'var(--honey-pale)',
                  borderColor: selectedConv.status === 'open' ? 'var(--forest-light)' : 'var(--honey)',
                  color: selectedConv.status === 'open' ? 'var(--forest)' : 'var(--honey-deep)',
                  opacity: statusPending ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {statusPending
                  ? 'Updating…'
                  : selectedConv.status === 'open'
                    ? '✓ Mark Resolved'
                    : '↩ Reopen'}
              </button>

            </div>
          </div>
        )}

      </div>
    </>
  )
}
