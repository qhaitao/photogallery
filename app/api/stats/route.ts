import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabase = await createClient()

    // 1. 总访问量
    const { count: total } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })

    // 2. 最近访问 (20条)
    const { data: recent } = await supabase
        .from('analytics')
        .select('path, ip, country, created_at, user_agent')
        .order('created_at', { ascending: false })
        .limit(20)

    // 3. 热门页面 (由于 Supabase JS SDK 不支持 group by，这里简单用 RPC 或者获取一批数据自己算，
    // 或者直接列出 distinct path。为了简单，我们先不做 group by，用户量小可以直接拉取最近 1000 条在内存算)

    // 内存聚合最近 1000 条访问
    const { data: latest1000 } = await supabase
        .from('analytics')
        .select('path')
        .order('created_at', { ascending: false })
        .limit(1000)

    const pageViews: Record<string, number> = {}
    latest1000?.forEach(row => {
        pageViews[row.path] = (pageViews[row.path] || 0) + 1
    })

    const topPages = Object.entries(pageViews)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }))

    return NextResponse.json({
        total,
        top_pages_last_1000: topPages,
        recent
    })
}
