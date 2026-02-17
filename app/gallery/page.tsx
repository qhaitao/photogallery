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
            {/* ---- 标题已被移除 ---- */}

            {/* ---- 分类筛选 ---- */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-12 justify-center">
                    <button
                        onClick={() => handleCategoryChange(null)}
                        className={`group relative rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${!activeCategory
                            ? 'text-white shadow-[0_0_15px_var(--color-accent-dim)]'
                            : 'text-[var(--color-text-secondary)] hover:text-white'
                            }`}
                    >
                        {/* Active/Hover Background - Gradients */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-opacity duration-300 ${!activeCategory ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                        {/* Inactive Background - Glass/Dark */}
                        <div className={`absolute inset-0 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-opacity duration-300 ${!activeCategory ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`} />

                        <span className="relative z-10">全部</span>
                    </button>

                    {categories.map((cat) => {
                        const isActive = activeCategory === cat.id
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`group relative rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${isActive
                                    ? 'text-white shadow-[0_0_15px_var(--color-accent-dim)]'
                                    : 'text-[var(--color-text-secondary)] hover:text-white'
                                    }`}
                            >
                                {/* Active/Hover Background */}
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                {/* Inactive Background */}
                                <div className={`absolute inset-0 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`} />

                                <span className="relative z-10">{cat.name}</span>
                            </button>
                        )
                    })}
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
