import React, { useMemo } from 'react'
import { Task } from '../types'
import { QUADRANTS } from '../lib/quadrants'
import { BarChart2, CheckCircle2, Clock, Tag, TrendingUp } from 'lucide-react'

export type StatsViewProps = {
  tasks: Task[]
}

export function StatsView({ tasks }: StatsViewProps) {
  const stats = useMemo(() => {
    const totalTasks = tasks.length
    const doneTasks = tasks.filter((t) => t.done)
    const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0

    // Active streak: consecutive days with at least one task completed
    // Since we have completedAt, we can calculate this.
    const completedDates = doneTasks
      .map((t) => t.completedAt ? new Date(t.completedAt).toDateString() : null)
      .filter((d): d is string => d !== null)
    const uniqueCompletedDates = Array.from(new Set(completedDates)).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    let streak = 0
    if (uniqueCompletedDates.length > 0) {
      // Check if the last completion was today or yesterday to keep streak alive
      const lastDate = new Date(uniqueCompletedDates[uniqueCompletedDates.length - 1])
      const diffDays = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays <= 1) {
        // Calculate consecutive streak
        let currentStreak = 1
        for (let i = uniqueCompletedDates.length - 2; i >= 0; i--) {
          const d1 = new Date(uniqueCompletedDates[i])
          const d2 = new Date(uniqueCompletedDates[i + 1])
          const diff = Math.abs(d2.getTime() - d1.getTime())
          if (diff === 86400000) { // 1 day in ms
            currentStreak++
          } else {
            break
          }
        }
        streak = currentStreak
      }
    }

    // Per-quadrant breakdown
    const quadrantStats = QUADRANTS.map((q) => {
      const qTasks = tasks.filter((t) => t.quadrant === q.id)
      const qDone = qTasks.filter((t) => t.done).length
      const rate = qTasks.length > 0 ? (qDone / qTasks.length) * 100 : 0
      return { id: q.id, label: q.label, count: qTasks.length, rate }
    })

    // Recently completed
    const recentlyCompleted = [...doneTasks]
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
      .slice(0, 5)

    // Most used tags
    const tagCounts: Record<string, number> = {}
    tasks.forEach((t) => {
      t.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      totalTasks,
      completionRate,
      streak,
      quadrantStats,
      recentlyCompleted,
      topTags,
    }
  }, [tasks])

  return (
    <div className="space-y-8 pb-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<BarChart2 className="text-indigo-500" />} label="Total Tasks" value={stats.totalTasks.toString()} />
        <StatCard icon={<TrendingUp className="text-green-500" />} label="Completion Rate" value={`${stats.completionRate}%`} />
        <StatCard icon={<Clock className="text-amber-500" />} label="Active Streak" value={`${stats.streak} days`} />
        <StatCard icon={<CheckCircle2 className="text-blue-500" />} label="Done Tasks" value={stats.recentlyCompleted.length > 0 ? `${stats.recentlyCompleted.length} recent` : '0'} />
      </div >

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Quadrant Breakdown */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-6 text-lg font-semibold">Quadrant Breakdown</h3>
          <div className="space-y-6">
            {stats.quadrantStats.map((q) => (
              <div key={q.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{q.label}</span>
                  <span className="text-gray-500">{q.count} tasks ({Math.round(q.rate)}%)</span>
                </div >
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${q.rate}%` }}
                  />
                </div >
              </div >
            ))}
          </div >
        </section>

        {/* Most Used Tags */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-6 text-lg font-semibold">Top Tags</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topTags.length > 0 ? (
              stats.topTags.map(([tag, count]) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  <Tag size={14} /> {tag} ({count})
                </span >
              ))
            ) : (
              <p className="text-sm text-gray-500">No tags used yet.</p>
            )}
          </div >
        </section>
      </div >

      {/* Recently Completed */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-6 text-lg font-semibold">Recently Completed</h3>
        <div className="space-y-4">
          {stats.recentlyCompleted.length > 0 ? (
            stats.recentlyCompleted.map((task) => (
              <div key={task.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{task.title}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {task.quadrant}
                  </span >
                </div >
              </div >
            ))
          ) : (
            <p className="text-sm text-gray-500">No recently completed tasks.</p>
          )}
        </div >
      </section>
    </div >
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-2">{icon}</div >
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</div >
      <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</div >
    </div >
  )
}
