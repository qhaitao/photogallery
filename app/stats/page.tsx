'use client'

import { useEffect, useState } from 'react'

interface StatRow {
    created_at: string
    path: string
    country: string
    ip: string
}

export default function StatsPage() {
    const [stats, setStats] = useState<{ total: number, recent: StatRow[] } | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats')
            const data = await res.json()
            setStats(data)
        } catch (e) {
            console.error('Failed to fetch stats', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
        // Simple polling every 10s
        const interval = setInterval(fetchStats, 10000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="mx-auto max-w-5xl px-6 py-12">
            <header className="mb-12">
                <h1 className="font-[family-name:var(--font-display)] text-4xl mb-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent w-fit">
                    Traffic Analytics
                </h1>
                <p className="text-[var(--color-text-muted)]">实时访客数据监控面板</p>
            </header>

            {loading && !stats ? (
                <div className="py-20 flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Key Metric Card */}
                    <div className="md:col-span-1">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md h-full flex flex-col justify-center items-center text-center shadow-xl">
                            <h2 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Total Page Views</h2>
                            <div className="text-6xl font-[family-name:var(--font-display)] tabular-nums data-value">
                                {stats?.total?.toLocaleString() ?? 0}
                            </div>
                            <div className="mt-4 text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                                ● Live Monitoring
                            </div>
                        </div>
                    </div>

                    {/* Recent Limits Table */}
                    <div className="md:col-span-2">
                        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden shadow-xl">
                            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-medium">Recent Activity</h3>
                                <span className="text-xs text-[var(--color-text-muted)]">Auto-refreshing</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-[var(--color-text-muted)] bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Time</th>
                                            <th className="px-6 py-3 font-medium">Path</th>
                                            <th className="px-6 py-3 font-medium">Region</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {stats?.recent?.map((row, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-3 whitespace-nowrap opacity-70">
                                                    {new Date(row.created_at).toLocaleTimeString()}
                                                </td>
                                                <td className="px-6 py-3 font-mono text-[var(--color-accent)]">
                                                    {row.path}
                                                </td>
                                                <td className="px-6 py-3">
                                                    {row.country === 'unknown' ? 'N/A' : row.country}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
