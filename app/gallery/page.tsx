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

// ---- 按钮渐变色板 (每个按钮不同色相) ----
const BUTTON_GRADIENTS = [
    'linear-gradient(90deg, #67e8f9, #a78bfa, #67e8f9)',
    'linear-gradient(90deg, #f472b6, #a78bfa, #f472b6)',
    'linear-gradient(90deg, #34d399, #22d3ee, #34d399)',
    'linear-gradient(90deg, #fbbf24, #f472b6, #fbbf24)',
    'linear-gradient(90deg, #a78bfa, #f472b6, #a78bfa)',
    'linear-gradient(90deg, #22d3ee, #34d399, #22d3ee)',
    'linear-gradient(90deg, #f97316, #fbbf24, #f97316)',
    'linear-gradient(90deg, #e879f9, #8b5cf6, #e879f9)',
]

// ---- 全息悬浮色板 ----
const HOVER_CONICS = [
    'conic-gradient(from 0deg at 50% 50%, #67e8f9, #a78bfa, #f472b6, #67e8f9)',
    'conic-gradient(from 0deg at 50% 50%, #f472b6, #fbbf24, #34d399, #f472b6)',
    'conic-gradient(from 0deg at 50% 50%, #34d399, #22d3ee, #a78bfa, #34d399)',
    'conic-gradient(from 0deg at 50% 50%, #fbbf24, #f97316, #e879f9, #fbbf24)',
    'conic-gradient(from 0deg at 50% 50%, #a78bfa, #22d3ee, #f472b6, #a78bfa)',
    'conic-gradient(from 0deg at 50% 50%, #22d3ee, #8b5cf6, #fbbf24, #22d3ee)',
    'conic-gradient(from 0deg at 50% 50%, #f97316, #e879f9, #22d3ee, #f97316)',
    'conic-gradient(from 0deg at 50% 50%, #e879f9, #67e8f9, #fbbf24, #e879f9)',
]

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
                    <FilterButton
                        isActive={!activeCategory}
                        onClick={() => handleCategoryChange(null)}
                        label="全部"
                        gradientIndex={0}
                    />

                    {/* ---- 分类按钮 ---- */}
                    {categories.map((cat, i) => (
                        <FilterButton
                            key={cat.id}
                            isActive={activeCategory === cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            label={cat.name}
                            gradientIndex={(i + 1) % BUTTON_GRADIENTS.length}
                        />
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

// ============================================
// FilterButton — 独立组件，三态按钮
// Active: 渐变背景 + 白色文字
// Hover: 全息旋转光晕 + 渐变文字
// Default: 磨砂玻璃 + 渐变文字
// ============================================
function FilterButton({
    isActive,
    onClick,
    label,
    gradientIndex,
}: {
    isActive: boolean
    onClick: () => void
    label: string
    gradientIndex: number
}) {
    const textGradient = BUTTON_GRADIENTS[gradientIndex % BUTTON_GRADIENTS.length]
    const holoGradient = HOVER_CONICS[gradientIndex % HOVER_CONICS.length]

    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden rounded-full px-8 py-2.5 text-sm font-semibold transition-all duration-500 ${isActive
                ? 'shadow-[0_0_25px_-5px_rgba(168,139,250,0.6)] scale-105'
                : 'hover:scale-105'
                }`}
        >
            {/* ---- Active: 渐变背景 ---- */}
            <div
                className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: textGradient, backgroundSize: '200% auto' }}
            />

            {/* ---- Hover: 全息旋转光晕 (仅非激活态) ---- */}
            {!isActive && (
                <>
                    <div
                        className="absolute -inset-[100%] opacity-0 blur-lg transition-opacity duration-700 group-hover:opacity-80"
                        style={{
                            backgroundImage: holoGradient,
                            animation: 'holo-spin 3s linear infinite',
                        }}
                    />
                    <div className="absolute inset-[1px] rounded-full bg-[var(--color-bg-card)] transition-all duration-500 group-hover:bg-[var(--color-bg-elevated)]" />
                </>
            )}

            {/* ---- Default: 磨砂玻璃边框 (非激活 + 非悬浮) ---- */}
            {!isActive && (
                <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 group-hover:border-transparent group-hover:bg-transparent" />
            )}

            {/* ---- 文字: 渐变色 ---- */}
            <span
                className={`relative z-10 text-shimmer bg-clip-text transition-all duration-300 ${isActive
                    ? 'text-white font-bold'
                    : 'text-transparent'
                    }`}
                style={!isActive ? { backgroundImage: textGradient } : undefined}
            >
                {label}
            </span>
        </button>
    )
}

export default function GalleryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <GalleryContent />
        </Suspense>
    )
}
