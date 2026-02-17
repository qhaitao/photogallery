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
      <section className="relative flex h-[80vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* 背景渐变光晕 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-accent-dim)_0%,_transparent_70%)]" />

        <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl leading-tight tracking-tight relative z-10">
          时光画廊
        </h1>
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl md:text-2xl italic text-[var(--color-text-secondary)] relative z-10">
          A Thousand Faces
        </p>
        <p className="mt-6 max-w-lg text-[var(--color-text-secondary)] relative z-10">
          每一张图片都是一次穿越，每一个场景都是一段未曾到达的人生。
        </p>
        <Link
          href="/gallery"
          className="mt-8 rounded-full bg-[var(--color-accent)] px-8 py-3 text-sm font-medium text-[var(--color-bg)] transition-transform hover:scale-105 relative z-10"
        >
          进入画廊
        </Link>
      </section>

      {/* ============ 分类导航 ============ */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="font-[family-name:var(--font-display)] text-2xl mb-8">
            展厅导航
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/gallery?category=${cat.id}`}
                className="glass rounded-xl p-6 transition-all hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-card)] group"
              >
                <h3 className="font-medium group-hover:text-[var(--color-accent)] transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="mt-2 text-xs text-[var(--color-text-muted)] line-clamp-2">
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
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">
              精选作品
            </h2>
            <Link
              href="/gallery"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-white">{photo.title}</span>
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
