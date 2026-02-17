'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function SiteFooter() {
    const pathname = usePathname()

    // 首页不显示全局页脚 (首页是全屏设计)
    if (pathname === '/') return null

    return (
        <footer className="py-8 text-center text-xs text-[var(--color-text-muted)] opacity-50 hover:opacity-100 transition-opacity">
            <p>© 2026 Time Gallery. All rights reserved.</p>
            <div className="mt-2 space-x-4">
                <Link href="/stats" className="hover:text-[var(--color-accent)] transition-colors">
                    Analytics
                </Link>
            </div>
        </footer>
    )
}
