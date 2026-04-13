// app/calendar/page.tsx
import type { Metadata } from 'next'
import { getAllSeasonalTasks } from '@/lib/queries'
import type { Season, SeasonalTask } from '@/types/database'

export const metadata: Metadata = {
  title: "Seasonal Beekeeper's Calendar",
  description: 'Month-by-month guide for hive management, pollinator gardening, and mason bee care across all four seasons.',
}

export const revalidate = 86400

const SEASON_CONFIG: Record<Season, { label: string; emoji: string; months: string; color: string; bg: string }> = {
  spring: { label: 'Spring', emoji: '🌱', months: 'March – May',          color: '#3D6B3A', bg: '#EBF4E6' },
  summer: { label: 'Summer', emoji: '☀️', months: 'June – August',        color: '#8A4F0A', bg: '#FBF0D9' },
  autumn: { label: 'Autumn', emoji: '🍂', months: 'September – November', color: '#7A3520', bg: '#FAF0EB' },
  winter: { label: 'Winter', emoji: '❄️', months: 'December – February',  color: '#1A4A6A', bg: '#EBF3FA' },
}

const CATEGORY_COLORS: Record<string, string> = {
  hive:        '#C8771E',
  garden:      '#3D6B3A',
  'mason-bee': '#8A7BAF',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     '#3D6B3A',
  intermediate: '#8A4F0A',
  advanced:     '#7A3520',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function TaskCard({ task }: { task: SeasonalTask }) {
  const catColor  = CATEGORY_COLORS[task.category] ?? '#8A8478'
  const diffColor = task.difficulty ? DIFFICULTY_COLORS[task.difficulty] : undefined
  const catLabel  = task.category === 'hive' ? '🐝 Hive' : task.category === 'garden' ? '🌿 Garden' : '🔴 Mason Bee'

  return (
    <div className="task-card">
      <div className="task-header">
        <span className="task-category" style={{ background: `${catColor}22`, color: catColor }}>
          {catLabel}
        </span>
        {task.difficulty && (
          <span className="task-difficulty" style={{ color: diffColor }}>{task.difficulty}</span>
        )}
      </div>
      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}
      {task.month_start && (
        <div className="task-timing">
          Best in {MONTHS[task.month_start - 1]}
          {task.month_end && task.month_end !== task.month_start
            ? ` – ${MONTHS[task.month_end - 1]}`
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
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div className="container mx-auto px-5 lg:px-8">
          <span className="eyebrow">Year-Round Beekeeping</span>
          <h1>Seasonal Pollinator Calendar</h1>
          <p>Know exactly what to do in your hive, garden, and mason bee habitat — month by month, season by season.</p>
        </div>
      </div>

      {/* Season sticky nav */}
      <div className="season-nav">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="season-nav-inner">
            {seasons.map(s => {
              const cfg = SEASON_CONFIG[s]
              return (
                <a key={s} href={`#${s}`} className="season-nav-item">
                  <span className="season-icon">{cfg.emoji}</span>
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
          <span className="key-item" style={{ background: '#3D6B3A22', color: '#3D6B3A' }}>🌿 Garden &amp; Plants</span>
          <span className="key-item" style={{ background: '#8A7BAF22', color: '#8A7BAF' }}>🔴 Mason Bees</span>
        </div>
      </div>

      {/* Seasons */}
      {seasons.map(s => {
        const cfg   = SEASON_CONFIG[s]
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
    </div>
  )
}
