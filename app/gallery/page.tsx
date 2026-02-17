// ============================================
// 画廊页 — 瀑布流 + 分类筛选 + Lightbox
// ============================================
'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getPhotos, getCategories } from '@/actions/photos'
import { PhotoCard } from '@/components/gallery/PhotoCard'
import { Lightbox } from '@/components/gallery/Lightbox'
import type { Photo, Category } from '@/lib/types'

function GalleryContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const categoryParam = searchParams.get('category')

    const [photos, setPhotos] = useState<Photo[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [activeCategory, setActiveCategory] = useState<number | null>(
        categoryParam ? parseInt(categoryParam) : null
    )
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const loaderRef = useRef<HTMLDivElement>(null)

    // ---- 加载图片 ----
    const loadPhotos = useCallback(async (cursor?: string, reset = false) => {
        setLoading(true)
        try {
            const result = await getPhotos({
                cursor,
                categoryId: activeCategory || undefined,
            })
            setPhotos((prev) => reset ? result.photos : [...prev, ...result.photos])
            setHasMore(result.hasMore)
        } catch (err) {
            console.error('加载失败:', err)
        } finally {
            setLoading(false)
        }
    }, [activeCategory])

    // ---- 初始加载 + 分类切换 ----
    useEffect(() => {
        setPhotos([])
        loadPhotos(undefined, true)
    }, [loadPhotos])

    // ---- 加载分类 ----
    useEffect(() => {
        getCategories().then(setCategories)
    }, [])

    // ---- 无限滚动 ----
    useEffect(() => {
        if (!loaderRef.current || !hasMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore && photos.length > 0) {
                    const lastPhoto = photos[photos.length - 1]
                    loadPhotos(lastPhoto.created_at)
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(loaderRef.current)
        return () => observer.disconnect()
    }, [hasMore, loading, photos, loadPhotos])

    // ---- 切换分类 ----
    const handleCategoryChange = (id: number | null) => {
        setActiveCategory(id)
        const params = new URLSearchParams()
        if (id) params.set('category', String(id))
        router.replace(`/gallery${params.toString() ? '?' + params.toString() : ''}`)
    }

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            {/* ---- 标题 ---- */}
            <h1 className="font-[family-name:var(--font-display)] text-3xl mb-2">画廊</h1>
            <p className="text-[var(--color-text-muted)] text-sm mb-8">
                {photos.length} 幅作品
            </p>

            {/* ---- 分类筛选 ---- */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => handleCategoryChange(null)}
                        className={`rounded-full px-4 py-1.5 text-sm transition-all ${!activeCategory
                                ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                                : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
                            }`}
                    >
                        全部
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`rounded-full px-4 py-1.5 text-sm transition-all ${activeCategory === cat.id
                                    ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            {/* ---- 瀑布流网格 ---- */}
            <div className="masonry">
                {photos.map((photo, i) => (
                    <PhotoCard
                        key={photo.id}
                        photo={photo}
                        priority={i < 4}
                        onClick={() => setSelectedPhoto(photo)}
                    />
                ))}
            </div>

            {/* ---- 加载更多 / 空状态 ---- */}
            {photos.length === 0 && !loading && (
                <div className="py-20 text-center text-[var(--color-text-muted)]">
                    暂无作品
                </div>
            )}

            {loading && (
                <div className="py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                </div>
            )}

            <div ref={loaderRef} className="h-4" />

            {/* ---- Lightbox ---- */}
            <Lightbox
                photo={selectedPhoto}
                photos={photos}
                onClose={() => setSelectedPhoto(null)}
                onNavigate={setSelectedPhoto}
            />
        </div>
    )
}

export default function GalleryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <GalleryContent />
        </Suspense>
    )
}
