// ============================================
// 首页 — 全屏沉浸式 Hero，书法标题
// ============================================
import { HomeHero } from '@/components/home/HomeHero'

import { getVisitCount } from '@/actions/analytics'

export default async function HomePage() {
  const visitCount = await getVisitCount()
  return <HomeHero visitCount={visitCount} />
}
