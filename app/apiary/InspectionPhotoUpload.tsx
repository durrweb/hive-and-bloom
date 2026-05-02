'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'hive-photos'

interface PendingPhoto { url: string; path: string; previewUrl: string }

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: '0.78rem', fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--forest)',
}

export default function InspectionPhotoUpload({
  userId, hiveId, isPro,
}: {
  userId: string; hiveId: string; isPro: boolean
}) {
  const [photos, setPhotos]       = useState<PendingPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isPro) {
    return (
      <div style={{ padding: '0.9rem 1.1rem', background: 'var(--honey-pale)', borderRadius: 8, border: '1px dashed var(--honey-light)' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.85rem', color: 'var(--honey-deep)', margin: 0 }}>
          📷 <strong>Photos</strong> are a Pro feature.{' '}
          <a href="/pricing" style={{ color: 'var(--honey-deep)', fontWeight: 600 }}>Upgrade to Pro →</a>
        </p>
      </div>
    )
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const added: PendingPhoto[] = []
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} exceeds the 10 MB limit.`)
        continue
      }
      const ext        = file.name.split('.').pop() ?? 'jpg'
      const path       = `${userId}/${hiveId}/inspections/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const previewUrl = URL.createObjectURL(file)
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file)
      if (upErr) { setError(upErr.message); continue }
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      added.push({ url: publicUrl, path, previewUrl })
    }
    setPhotos(prev => [...prev, ...added])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function removePhoto(index: number) {
    const photo = photos[index]
    setPhotos(prev => prev.filter((_, i) => i !== index))
    const supabase = createClient()
    await supabase.storage.from(BUCKET).remove([photo.path])
    URL.revokeObjectURL(photo.previewUrl)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={LABEL}>
          Photos
          <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0.1rem 0.4rem', borderRadius: 3, background: 'var(--honey)', color: 'var(--forest)', verticalAlign: 'middle', marginLeft: '0.4rem' }}>
            PRO
          </span>
        </span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', padding: '0.35rem 0.85rem', borderRadius: 4, border: '1px solid var(--forest-light)', background: 'transparent', color: 'var(--forest)', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
        >
          {uploading ? 'Uploading…' : '+ Add Photos'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.82rem', color: 'var(--coral)', margin: 0 }}>
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {photos.map((photo, i) => (
            <div key={photo.path} style={{ position: 'relative', width: 72, height: 72, borderRadius: 6, overflow: 'hidden', background: 'var(--cream-dark)', flexShrink: 0 }}>
              <img src={photo.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 3, color: 'white', cursor: 'pointer', fontSize: '0.65rem', padding: '0.15rem 0.35rem', lineHeight: 1 }}
              >
                ✕
              </button>
              <input type="hidden" name="photo_urls"  value={photo.url} />
              <input type="hidden" name="photo_paths" value={photo.path} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
