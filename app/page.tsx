// ============================================
// 首页 — Hero + 精选画廊 + 分类导航
// ============================================
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ============ Hero — 全屏沉浸式入口 ============ */}
      <section className="relative flex h-[100vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* ---- Mesh Gradients Background ---- */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[10%] -top-[10%] h-[700px] w-[700px] rounded-full bg-indigo-600/40 blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute -right-[10%] top-[10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/40 blur-[120px] mix-blend-screen animate-pulse delay-1000" />
          <div className="absolute left-[20%] -bottom-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/40 blur-[120px] mix-blend-screen animate-pulse delay-2000" />
          <div className="absolute right-[20%] -bottom-[20%] h-[400px] w-[400px] rounded-full bg-cyan-600/30 blur-[100px] mix-blend-screen animate-pulse delay-3000" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,var(--color-bg)_100%)]" />
        </div>

        {/* ---- 标题: 多色渐变 + shimmer ---- */}
        <h1 className="relative z-10 font-[family-name:var(--font-display)] font-bold text-6xl md:text-8xl leading-none tracking-tight animate-fade-in">
          <span
            className="text-shimmer bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #f97316, #ec4899, #8b5cf6, #f97316)' }}
          >
            时光
          </span>
          <span
            className="text-shimmer bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #22d3ee, #8b5cf6, #d946ef, #f59e0b, #22d3ee)' }}
          >
            画廊
          </span>
        </h1>
        <p
          className="mt-6 font-[family-name:var(--font-display)] font-semibold text-2xl md:text-3xl italic text-shimmer bg-clip-text text-transparent relative z-10 animate-fade-in delay-100"
          style={{ backgroundImage: 'linear-gradient(90deg, #22d3ee, #a78bfa, #e879f9, #22d3ee)' }}
        >
          A Thousand Faces, A Million Dreams
        </p>
        <p className="mt-8 max-w-lg text-[var(--color-text-secondary)] text-sm md:text-base tracking-wide uppercase relative z-10 animate-fade-in delay-200">
          每一张图片都是一次穿越<br />每一个场景都是一段未曾到达的人生
        </p>
        <Link
          href="/gallery"
          className="group relative mt-12 overflow-hidden rounded-full px-12 py-3.5 text-base font-medium text-white transition-all hover:scale-105 active:scale-95 z-10 animate-fade-in delay-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 transition-opacity group-hover:opacity-100" />
          <span className="relative">探索画廊</span>
        </Link>

        {/* ---- 底部署名 ---- */}
        <p className="absolute bottom-8 text-xs text-[var(--color-text-muted)] z-10">
          时光画廊 · 2026
        </p>
      </section>
    </div>
  )
}
