'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function logVisit(path: string) {
    try {
        const headerList = await headers()
        const ip = headerList.get('x-forwarded-for')?.split(',')[0] || 'unknown'
        const userAgent = headerList.get('user-agent') || 'unknown'
        const referer = headerList.get('referer') || ''
        const country = headerList.get('x-vercel-ip-country') || 'unknown'

        // 简单防垃圾请求：如果是 API 调用或者静态资源，忽略
        if (path.startsWith('/api') || path.startsWith('/_next') || path.includes('.')) return

        const supabase = await createClient()

        const { error } = await supabase.from('analytics').insert({
            path,
            method: 'GET',
            ip,
            user_agent: userAgent,
            referer,
            country
        })

        if (error) {
            console.error('[Analytics Error] Insert failed:', error)
        }
    } catch (e) {
        console.error('[Analytics Critical Error]:', e)
    }
}

export async function getVisitCount() {
    try {
        const supabase = await createClient()
        const { count, error } = await supabase
            .from('analytics')
            .select('*', { count: 'exact', head: true })

        if (error) throw error
        return count || 0
    } catch (e) {
        console.error('Failed to get visit count:', e)
        return 0
    }
}
