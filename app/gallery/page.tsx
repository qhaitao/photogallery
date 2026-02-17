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
            {/* ---- 标题已被移除 ---- */}

            {/* ---- 分类筛选 ---- */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-12 justify-center">
                    {/* ---- "全部" 按钮 ---- */}
                    <button
                        onClick={() => handleCategoryChange(null)}
                        className={`group relative overflow-hidden rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-500 ${!activeCategory
                            ? 'shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)] scale-105'
                            : 'text-[var(--color-text-secondary)] hover:scale-105 hover:text-white'
                            }`}
                    >
                        {/* Active: 纯白高亮 */}
                        <div className={`absolute inset-0 rounded-full bg-white transition-opacity duration-500 ${!activeCategory ? 'opacity-100' : 'opacity-0'}`} />

                        {/* Hover: 全息旋转光晕 (仅非激活态) */}
                        {activeCategory !== null && (
                            <>
                                <div
                                    className="absolute -inset-[100%] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                                    style={{
                                        backgroundImage: 'conic-gradient(from 90deg at 50% 50%, #E2CBFF 0%, #393BB2 50%, #E2CBFF 100%)',
                                        animation: 'holo-spin 4s linear infinite',
                                    }}
                                />
                                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </>
                        )}

                        {/* Default: 磨砂玻璃 */}
                        <div className={`absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 ${!activeCategory ? 'opacity-0' : 'opacity-100 group-hover:bg-white/10 group-hover:border-white/30'}`} />

                        <span className={`relative z-10 transition-colors duration-300 ${!activeCategory ? 'text-black font-bold' : ''}`}>
                            全部
                        </span>
                    </button>

                    {/* ---- 分类按钮 ---- */}
                    {categories.map((cat) => {
                        const isActive = activeCategory === cat.id
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`group relative overflow-hidden rounded-full px-8 py-2.5 text-sm font-medium transition-all duration-500 ${isActive
                                    ? 'shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)] scale-105'
                                    : 'text-[var(--color-text-secondary)] hover:scale-105 hover:text-white'
                                    }`}
                            >
                                {/* Active: 纯白高亮 */}
                                <div className={`absolute inset-0 rounded-full bg-white transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

                                {/* Hover: 全息旋转光晕 (仅非激活态) */}
                                {!isActive && (
                                    <>
                                        <div
                                            className="absolute -inset-[100%] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                                            style={{
                                                backgroundImage: 'conic-gradient(from 90deg at 50% 50%, #E2CBFF 0%, #393BB2 50%, #E2CBFF 100%)',
                                                animation: 'holo-spin 4s linear infinite',
                                            }}
                                        />
                                        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </>
                                )}

                                {/* Default: 磨砂玻璃 */}
                                <div className={`absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 ${isActive ? 'opacity-0' : 'opacity-100 group-hover:bg-white/10 group-hover:border-white/30'}`} />

                                <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-black font-bold' : ''}`}>
                                    {cat.name}
                                </span>
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
