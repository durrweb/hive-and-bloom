// app/calendar/page.tsx
import type { Metadata } from 'next'
import { getAllSeasonalTasks } from '@/lib/queries'
import type { Season, SeasonalTask } from '@/types/database'

export const metadata: Metadata = {
  title: 'Seasonal Beekeeper\'s Calendar',
  description: 'Month-by-month guide for hive management, pollinator gardening, and mason bee care across all four seasons.',
}

export const revalidate = 86400 // daily

const SEASON_CONFIG: Record<Season, { label: string; emoji: string; months: string; color: string; bg: string }> = {
  spring: { label: 'Spring',  emoji: '🌱', months: 'March – May',       color: '#3D6B3A', bg: '#EBF4E6' },
  summer: { label: 'Summer',  emoji: '☀️', months: 'June – August',     color: '#8A4F0A', bg: '#FBF0D9' },
  autumn: { label: 'Autumn',  emoji: '🍂', months: 'September – November', color: '#7A3520', bg: '#FAF0EB' },
  winter: { label: 'Winter',  emoji: '❄️', months: 'December – February', color: '#1A4A6A', bg: '#EBF3FA' },
}

const CATEGORY_COLORS: Record<string, string> = {
  hive:      '#C8771E',
  garden:    '#3D6B3A',
  'mason-bee': '#8A7BAF',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     '#3D6B3A',
  intermediate: '#8A4F0A',
  advanced:     '#7A3520',
}

function TaskCard({ task }: { task: SeasonalTask }) {
  const catColor = CATEGORY_COLORS[task.category] ?? '#8A8478'
  const diffColor = task.difficulty ? DIFFICULTY_COLORS[task.difficulty] : undefined

  return (
    <div className="task-card">
      <div className="task-header">
        <span className="task-category" style={{ background: `${catColor}22`, color: catColor }}>
          {task.category === 'hive' ? '🐝 Hive' : task.category === 'garden' ? '🌿 Garden' : '🔴 Mason Bee'}
        </span>
        {task.difficulty && (
          <span className="task-difficulty" style={{ color: diffColor }}>{task.difficulty}</span>
        )}
      </div>
      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}
      {task.month_start && (
        <div className="task-timing">
          Best in {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][task.month_start - 1]}
          {task.month_end && task.month_end !== task.month_start
            ? ` – ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][task.month_end - 1]}`
            : ''}
        </div>
      )}
    </div>
  )
}

export default async function CalendarPage() {
  const tasksBySeason = await getAllSeasonalTasks()
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter']

  return (
    <div className="calendar-page">
      {/* Hero */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <span className="eyebrow">Year-Round Beekeeping</span>
          <h1>Seasonal Pollinator Calendar</h1>
          <p>Know exactly what to do in your hive, garden, and mason bee habitat — month by month, season by season.</p>
        </div>
      </div>

      {/* Season legend */}
      <div className="season-nav">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="season-nav-inner">
            {seasons.map(s => {
              const cfg = SEASON_CONFIG[s]
              return (
                <a key={s} href={`#${s}`} className="season-nav-item">
                  <span>{cfg.emoji}</span>
                  <div>
                    <strong>{cfg.label}</strong>
                    <span>{cfg.months}</span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* Category key */}
      <div className="container mx-auto px-5 lg:px-8" style={{ paddingTop: '2rem' }}>
        <div className="category-key">
          <span className="key-label">Task type:</span>
          <span className="key-item" style={{ background: '#C8771E22', color: '#C8771E' }}>🐝 Hive Management</span>
          <span className="key-item" style={{ background: '#3D6B3A22', color: '#3D6B3A' }}>🌿 Garden & Plants</span>
          <span className="key-item" style={{ background: '#8A7BAF22', color: '#8A7BAF' }}>🔴 Mason Bees</span>
        </div>
      </div>

      {/* Seasons */}
      {seasons.map(s => {
        const cfg = SEASON_CONFIG[s]
        const tasks = tasksBySeason[s]
        return (
          <section key={s} id={s} className="season-section" style={{ background: cfg.bg }}>
            <div className="container mx-auto px-5 lg:px-8">
              <div className="season-header">
                <div className="season-emoji-big">{cfg.emoji}</div>
                <div>
                  <h2 className="season-title" style={{ color: cfg.color }}>{cfg.label}</h2>
                  <p className="season-months">{cfg.months}</p>
                </div>
              </div>
              <div className="tasks-grid">
                {tasks.length > 0
                  ? tasks.map(task => <TaskCard key={task.id} task={task} />)
                  : <p style={{ color: 'var(--mist)', gridColumn: '1/-1' }}>No tasks scheduled for this season yet.</p>
                }
              </div>
            </div>
          </section>
        )
      })}

      <style jsx>{`
        .page-hero { background: var(--forest); padding: 4rem 0 3rem; border-bottom: 3px solid var(--honey); }
        .page-hero h1 { font-family: var(--font-playfair); font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: white; margin-bottom: 0.75rem; }
        .page-hero p { color: rgba(255,255,255,0.7); font-weight: 300; max-width: 600px; }
        .season-nav { background: white; border-bottom: 1px solid var(--cream-dark); position: sticky; top: 60px; z-index: 50; }
        .season-nav-inner { display: flex; gap: 0; overflow-x: auto; }
        .season-nav-item {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 1rem 1.5rem; text-decoration: none; border-right: 1px solid var(--cream-dark);
          transition: background 0.2s; flex: 1; white-space: nowrap;
        }
        .season-nav-item:hover { background: var(--cream); }
        .season-nav-item span:first-child { font-size: 1.5rem; }
        .season-nav-item strong { display: block; font-family: var(--font-playfair); font-size: 1rem; color: var(--forest); }
        .season-nav-item span:last-of-type { font-family: var(--font-dm-sans); font-size: 0.78rem; color: var(--mist); }
        .category-key { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0; }
        .key-label { font-family: var(--font-dm-sans); font-size: 0.78rem; font-weight: 500; color: var(--mist); letter-spacing: 0.05em; }
        .key-item { font-family: var(--font-dm-sans); font-size: 0.75rem; font-weight: 500; padding: 0.25rem 0.75rem; border-radius: 20px; }
        .season-section { padding: 4rem 0; scroll-margin-top: 120px; }
        .season-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem; }
        .season-emoji-big { font-size: 3rem; }
        .season-title { font-family: var(--font-playfair); font-size: 2.2rem; font-weight: 700; margin-bottom: 0.1rem; }
        .season-months { font-family: var(--font-dm-sans); font-size: 0.9rem; color: var(--mist); }
        .tasks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
        .task-card { background: white; border-radius: 12px; padding: 1.25rem 1.4rem; border: 1px solid rgba(0,0,0,0.06); }
        .task-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
        .task-category { font-family: var(--font-dm-sans); font-size: 0.72rem; font-weight: 500; letter-spacing: 0.06em; padding: 0.2rem 0.6rem; border-radius: 20px; }
        .task-difficulty { font-family: var(--font-dm-sans); font-size: 0.72rem; font-weight: 500; letter-spacing: 0.05em; text-transform: capitalize; }
        .task-title { font-family: var(--font-playfair); font-size: 1.05rem; font-weight: 600; color: var(--forest); line-height: 1.3; margin-bottom: 0.4rem; }
        .task-desc { font-size: 0.9rem; color: var(--mist); font-weight: 300; line-height: 1.55; }
        .task-timing { font-family: var(--font-dm-sans); font-size: 0.75rem; color: var(--honey); margin-top: 0.65rem; font-weight: 500; }
      `}</style>
    </div>
  )
}
