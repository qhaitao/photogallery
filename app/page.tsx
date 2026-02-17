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
      {/* ============ Hero Section ============ */}
      <section className="relative flex h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* 背景渐变光晕 - 增强版 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-accent-dim)_0%,_transparent_60%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_80%,var(--color-bg)_100%)]" />

        <h1 className="font-[family-name:var(--font-display)] text-6xl md:text-8xl leading-none tracking-tight relative z-10 animate-fade-in">
          时光画廊
        </h1>
        <p className="mt-4 font-[family-name:var(--font-display)] text-2xl md:text-3xl italic text-[var(--color-text-secondary)] relative z-10 animate-fade-in delay-100">
          A Thousand Faces
        </p>
        <p className="mt-8 max-w-lg text-[var(--color-text-muted)] text-sm md:text-base tracking-wide uppercase relative z-10 animate-fade-in delay-200">
          每一张图片都是一次穿越<br />每一个场景都是一段未曾到达的人生
        </p>
        <Link
          href="/gallery"
          className="mt-12 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-10 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:scale-105 active:scale-95 relative z-10 animate-fade-in delay-300"
        >
          EXPLORE GALLERY
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
