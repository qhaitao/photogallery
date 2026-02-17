// ============================================
// 首页 — Hero + 精选画廊 + 分类导航
// ============================================
import Link from 'next/link'
import Image from 'next/image'
import { getPhotos, getCategories } from '@/actions/photos'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [{ photos }, categories] = await Promise.all([
    getPhotos({ limit: 8 }),
    getCategories(),
  ])

  return (
    <div className="min-h-screen">
      {/* ============ Hero Section ============ */}
      <section className="relative flex h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* ---- Mesh Gradients Background ---- */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[10%] -top-[10%] h-[700px] w-[700px] rounded-full bg-indigo-600/40 blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute -right-[10%] top-[10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/40 blur-[120px] mix-blend-screen animate-pulse delay-1000" />
          <div className="absolute left-[20%] -bottom-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/40 blur-[120px] mix-blend-screen animate-pulse delay-2000" />
          <div className="absolute right-[20%] -bottom-[20%] h-[400px] w-[400px] rounded-full bg-cyan-600/30 blur-[100px] mix-blend-screen animate-pulse delay-3000" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,var(--color-bg)_100%)]" />
        </div>

        {/* ---- 标题: 用 inline style 实现多色渐变 (Tailwind 只支持一个 via) ---- */}
        <h1 className="relative z-10 font-[family-name:var(--font-display)] font-bold text-6xl md:text-8xl leading-none tracking-tight animate-fade-in">
          <span
            className="text-shimmer bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #e0f2fe, #67e8f9, #e0f2fe)' }}
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
      </section>

      {/* ============ 分类导航 ============ */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-8xl px-6 py-24">
          <h2 className="font-[family-name:var(--font-display)] text-3xl mb-12 text-center text-[var(--color-text-secondary)]">
            Curated Collections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/gallery?category=${cat.id}`}
                className="glass group relative overflow-hidden rounded-xl p-6 transition-all hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-bg-card)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-dim)]/0 to-[var(--color-accent-dim)]/0 group-hover:from-[var(--color-accent-dim)]/10 group-hover:to-transparent transition-all duration-500" />
                <h3 className="relative font-medium group-hover:text-[var(--color-accent)] transition-colors z-10">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="mt-2 text-xs text-[var(--color-text-muted)] line-clamp-2 relative z-10 group-hover:text-[var(--color-text-secondary)] transition-colors">
                    {cat.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ 精选作品 ============ */}
      {photos.length > 0 && (
        <section className="mx-auto max-w-[1920px] px-6 py-24 border-t border-[var(--color-border)]">
          <div className="flex items-end justify-between mb-12 max-w-7xl mx-auto">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--color-text-primary)]">
                Selected Works
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
                Latest Additions
              </p>
            </div>
            <Link
              href="/gallery"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors border-b border-transparent hover:border-[var(--color-accent)] pb-0.5"
            >
              View All Works
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {photos.map((photo) => (
              <Link
                key={photo.id}
                href={`/gallery?photo=${photo.id}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-[var(--color-bg-card)]"
              >
                <Image
                  src={photo.image_url || ''}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-white text-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{photo.title}</span>
                  {photo.description && (
                    <span className="text-white/60 text-xs mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">{photo.description}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ Footer ============ */}
      <footer className="border-t border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-text-muted)]">
        <p>时光画廊 · 2026</p>
        <p className="mt-1">Powered by Next.js × Supabase</p>
      </footer>
    </div>
  )
}
