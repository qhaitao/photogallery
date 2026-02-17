// ============================================
// Navbar — 玻璃态导航栏
// ============================================
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
    { href: '/', label: '首页' },
    { href: '/gallery', label: '画廊' },
    { href: '/upload', label: '上传' },
]

export function Navbar() {
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => setUser(session?.user ?? null)
        )
        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <nav className="glass fixed top-0 left-0 right-0 z-50 h-16">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
                {/* ---- Logo ---- */}
                <Link href="/" className="font-[family-name:var(--font-display)] text-xl tracking-wide">
                    时光画廊
                </Link>

                {/* ---- Nav Links ---- */}
                <div className="flex items-center gap-6">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`text-sm transition-colors hover:text-[var(--color-accent)] ${pathname === href
                                    ? 'text-[var(--color-accent)]'
                                    : 'text-[var(--color-text-secondary)]'
                                }`}
                        >
                            {label}
                        </Link>
                    ))}

                    {/* ---- Auth ---- */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/profile"
                                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                            >
                                我的
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                            >
                                退出
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="rounded-full bg-[var(--color-accent-dim)] px-4 py-1.5 text-sm text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
                        >
                            登录
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
