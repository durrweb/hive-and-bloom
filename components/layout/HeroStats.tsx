// components/layout/HeroStats.tsx
export default function HeroStats() {
  const stats = [
    { num: '320+',  label: 'Articles & Guides' },
    { num: '85+',   label: 'Honey Recipes' },
    { num: '8,400+',label: 'Community Members' },
    { num: '12',    label: 'Expert Contributors' },
    { num: 'Free',  label: 'Always' },
  ]

  return (
    <div style={{ background: 'var(--honey)', padding: '1rem 0' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 2.5rem)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '0.5rem' }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <div style={{ textAlign: 'center', padding: '0.25rem 1.5rem' }}>
                <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--forest)', display: 'block' }}>
                  {s.num}
                </span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--forest)', opacity: 0.7 }}>
                  {s.label}
                </span>
              </div>
              {i < stats.length - 1 && (
                <div style={{ width: 1, height: '2.5rem', background: 'rgba(42,74,42,0.25)', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
