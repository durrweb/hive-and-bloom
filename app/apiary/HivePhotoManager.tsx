'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { saveHivePhoto, deleteHivePhoto } from '@/app/apiary/actions'

interface Photo { id: string; url: string; storage_path: string; created_at: string }

const BUCKET = 'hive-photos'

const PILL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.68rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  padding: '0.2rem 0.55rem', borderRadius: 4, display: 'inline-block',
}

export default function HivePhotoManager({
  hiveId, userId, initialPhotos, isPro,
}: {
  hiveId: string; userId: string; initialPhotos: Photo[]; isPro: boolean
}) {
  const [photos, setPhotos]     = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isPro) {
    return (
      <div className="empty-state" style={{ padding: '3rem 2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📷</div>
        <h3 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: 'var(--forest)', marginBottom: '0.4rem' }}>
          Hive Photos
        </h3>
        <p style={{ color: 'var(--mist)', fontSize: '0.9rem', maxWidth: 340, margin: '0 auto 1.25rem' }}>
          Attach photos to your hives and inspections to build a visual history. Available on the Pro plan.
        </p>
        <a href="/pricing" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}>
          Upgrade to Pro
        </a>
      </div>
    )
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError(null)
    const supabase = createClient()
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} exceeds the 10 MB limit.`)
        continue
      }
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${hiveId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file)
      if (upErr) { setError(upErr.message); continue }
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const result = await saveHivePhoto(hiveId, publicUrl, path)
      if ('error' in result) { setError(result.error); continue }
      setPhotos(prev => [result as Photo, ...prev])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(photoId: string) {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
    const result = await deleteHivePhoto(photoId)
    if (result.error) setError(result.error)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--forest)', margin: 0 }}>
          Photos
          <span style={{ ...PILL, background: 'var(--honey)', color: 'var(--forest)', fontSize: '0.55rem', marginLeft: '0.5rem', verticalAlign: 'middle' }}>PRO</span>
        </h2>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
        >
          {uploading ? 'Uploading…' : '+ Add Photos'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '0.65rem 1rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.85rem', color: 'var(--coral)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {photos.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📸</div>
          <p style={{ color: 'var(--mist)', fontSize: '0.9rem', margin: 0 }}>
            No photos yet. Click &ldquo;Add Photos&rdquo; to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {photos.map(photo => (
            <div key={photo.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1 / 1', background: 'var(--cream-dark)' }}>
              <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button
                onClick={() => handleDelete(photo.id)}
                aria-label="Delete photo"
                style={{
                  position: 'absolute', top: 6, right: 6,
                  background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 4,
                  color: 'white', cursor: 'pointer', fontSize: '0.75rem',
                  padding: '0.2rem 0.45rem', lineHeight: 1.2,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
