// components/community/CommentSection.tsx
'use client'
import { useActionState } from 'react'
import { postComment } from '@/app/actions'
import type { Comment } from '@/types/database'

interface Props {
  articleId?: string
  recipeId?: string
  comments: Comment[]
}

type State = { error?: string; success?: boolean } | null

function CommentItem({ comment }: { comment: Comment }) {
  const author = comment.author
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'var(--honey-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', fontWeight: 500, color: 'var(--honey-deep)',
        overflow: 'hidden',
      }}>
        {author?.avatar_url
          ? <img src={author.avatar_url} alt={author.display_name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (author?.display_name?.[0] ?? '?').toUpperCase()
        }
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', fontWeight: 500, color: 'var(--forest)' }}>
            {author?.display_name ?? author?.username ?? 'Member'}
          </span>
          {author?.is_expert && (
            <span style={{ background: 'var(--honey-pale)', color: 'var(--honey-deep)', fontSize: '0.68rem', fontFamily: 'var(--font-dm-sans)', fontWeight: 500, padding: '0.1rem 0.45rem', borderRadius: 20 }}>
              Expert
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--mist)' }}>
            {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-crimson)', fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6 }}>
          {comment.body}
        </p>
      </div>
    </div>
  )
}

export default function CommentSection({ articleId, recipeId, comments }: Props) {
  const [state, action, isPending] = useActionState<State, FormData>(postComment, null)

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '2rem' }}>
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      {/* Comment form */}
      <div style={{ background: 'var(--cream)', borderRadius: 12, padding: '1.5rem', marginBottom: '2.5rem', border: '1px solid var(--cream-dark)' }}>
        <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--forest)', marginBottom: '1rem' }}>
          Join the conversation
        </h3>
        <form action={action}>
          {articleId && <input type="hidden" name="articleId" value={articleId} />}
          {recipeId  && <input type="hidden" name="recipeId"  value={recipeId} />}
          <textarea
            name="body" required rows={4}
            placeholder="Share your experience, ask a question, or add your tip…"
            style={{
              width: '100%', fontFamily: 'var(--font-crimson)', fontSize: '1rem',
              border: '1px solid #DDD', borderRadius: 6, padding: '0.75rem 1rem',
              background: 'white', color: 'var(--ink)', resize: 'vertical',
              outline: 'none', lineHeight: 1.6,
            }}
          />
          {state?.error && (
            <p style={{ color: '#C0392B', fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', margin: '0.5rem 0' }}>
              {state.error}
            </p>
          )}
          {state?.success && (
            <p style={{ color: 'var(--forest-mid)', fontFamily: 'var(--font-dm-sans)', fontSize: '0.85rem', margin: '0.5rem 0' }}>
              Comment posted!
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button
              type="submit" disabled={isPending}
              className="btn btn-primary"
              style={{ opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? 'Posting…' : 'Post comment →'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div>
          {comments.map(comment => <CommentItem key={comment.id} comment={comment} />)}
        </div>
      ) : (
        <p style={{ color: 'var(--mist)', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
          No comments yet — be the first to share your thoughts!
        </p>
      )}
    </div>
  )
}
