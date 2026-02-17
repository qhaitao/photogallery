// ============================================
// Navbar — 玻璃态导航栏
// ============================================
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useLanguage } from '@/lib/i18n'

export function Navbar() {
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const supabase = createClient()
    const { t, language, setLanguage } = useLanguage()

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

    const toggleLanguage = () => {
        setLanguage(language === 'zh' ? 'en' : 'zh')
    }

    const navLinks = [
        { href: '/', label: t('nav.home') },
        { href: '/gallery', label: t('nav.gallery') },
        { href: '/upload', label: t('nav.upload') },
    ]

    return (
        <nav className="glass fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
                {/* ---- Logo ---- */}
                <Link href="/" className="font-[family-name:var(--font-display)] text-xl tracking-wide bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    {language === 'zh' ? '时光画廊' : 'Time Gallery'}
                </Link>

                {/* ---- Nav Links ---- */}
                <div className="flex items-center gap-8">
                    {navLinks.map(({ href, label }) => {
                        const isActive = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative text-sm font-medium tracking-wide transition-all duration-300 hover:text-[var(--color-accent)] ${isActive
                                    ? 'text-[var(--color-accent)] [text-shadow:0_0_10px_var(--color-accent-dim)]'
                                    : 'text-[var(--color-text-secondary)]'
                                    } group`}
                            >
                                {label}
                                <span className={`absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 bg-[var(--color-accent)] transition-all duration-300 ${isActive ? 'w-full shadow-[0_0_8px_var(--color-accent)]' : 'w-0 group-hover:w-full'}`} />
                            </Link>
                        )
                    })}

                    {/* ---- Language Switcher ---- */}
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all active:scale-95 text-sm font-medium"
                        title={language === 'zh' ? 'Switch to English' : '切换至中文'}
                    >
                        {language === 'zh' ? 'En' : '中'}
                    </button>

                    {/* ---- Auth ---- */}
                    {user ? (
                        <div className="flex items-center gap-4 border-l border-[var(--color-border)] pl-6">
                            <Link
                                href="/profile"
                                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                            >
                                {t('nav.profile')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                            >
                                {t('nav.logout')}
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="rounded-full bg-[var(--color-accent-dim)] px-4 py-1.5 text-sm text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
                        >
                            {t('nav.login')}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
