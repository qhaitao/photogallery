'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { logVisit } from '@/actions/analytics'

export function AnalyticsTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const lastPathRef = useRef<string | null>(null)

    useEffect(() => {
        // 构建完整路径 (包括 query params)
        const url = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`

        // 避免开发环境下 React Strict Mode 导致的双重触发，虽然 server action 开销不大，但还是防抖一下也好
        // 这里简单防重：如果路径没变就不发 (但 Next.js navigation 同路径 query 变了也会触发 useEffect)
        // 逻辑：只要 url 变了就发
        if (url === lastPathRef.current) return
        lastPathRef.current = url

        // 调用 Server Action 记录
        // 生产环境 Vercel 会自动拿真实 IP
        logVisit(url).catch(err => console.error('Analytics log failed', err))
    }, [pathname, searchParams])

    return null
}
