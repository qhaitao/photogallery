// ============================================
// Lightbox — 沉浸式查看器 + 滑动手势 + 缩放
// ============================================
'use client'

import Image from 'next/image'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { useCallback, useEffect, useState, useRef } from 'react'
import type { Photo } from '@/lib/types'
import { STORAGE_BUCKET } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface LightboxProps {
    photo: Photo | null
    photos: Photo[]
    onClose: () => void
    onNavigate: (photo: Photo) => void
}

function getImageUrl(photo: Photo): string {
    if (photo.image_url?.startsWith('http')) return photo.image_url
    if (photo.storage_path?.startsWith('http')) return photo.storage_path

    const supabase = createClient()
    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(photo.storage_path)
    return data.publicUrl
}

export function Lightbox({ photo, photos, onClose, onNavigate }: LightboxProps) {
    const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1
    const [scale, setScale] = useState(1)
    const [showUI, setShowUI] = useState(true)
    const hideTimer = useRef<ReturnType<typeof setTimeout>>(null)

    // ---- 自动隐藏 UI ----
    const resetHideTimer = useCallback(() => {
        setShowUI(true)
        if (hideTimer.current) clearTimeout(hideTimer.current)
        hideTimer.current = setTimeout(() => setShowUI(false), 3000)
    }, [])

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setScale(1)
            onNavigate(photos[currentIndex - 1])
            resetHideTimer()
        }
    }, [currentIndex, photos, onNavigate, resetHideTimer])

    const goNext = useCallback(() => {
        if (currentIndex < photos.length - 1) {
            setScale(1)
            onNavigate(photos[currentIndex + 1])
            resetHideTimer()
        }
    }, [currentIndex, photos, onNavigate, resetHideTimer])

    // ---- 键盘导航 ----
    useEffect(() => {
        if (!photo) return
        resetHideTimer()

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'ArrowRight') goNext()
            if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + 0.5, 3))
            if (e.key === '-') setScale(s => Math.max(s - 0.5, 1))
            if (e.key === '0') setScale(1)
        }
        window.addEventListener('keydown', handler)
        return () => {
            window.removeEventListener('keydown', handler)
            if (hideTimer.current) clearTimeout(hideTimer.current)
        }
    }, [photo, onClose, goPrev, goNext, resetHideTimer])

    // ---- 滑动手势处理 ----
    const handleDragEnd = (_: unknown, info: PanInfo) => {
        const threshold = 80
        if (info.offset.x > threshold) goPrev()
        else if (info.offset.x < -threshold) goNext()
    }

    // ---- 双击缩放 ----
    const handleDoubleClick = () => {
        setScale(s => s === 1 ? 2 : 1)
    }

    // ---- 滚轮缩放 ----
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault()
        setScale(s => {
            const next = s - e.deltaY * 0.002
            return Math.max(1, Math.min(3, next))
        })
    }, [])

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el || !photo) return
        el.addEventListener('wheel', handleWheel, { passive: false })
        return () => el.removeEventListener('wheel', handleWheel)
    }, [photo, handleWheel])

    return (
        <AnimatePresence>
            {photo && (
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 select-none"
                    onClick={onClose}
                    onMouseMove={resetHideTimer}
                >
                    {/* ---- 顶部工具栏 ---- */}
                    <motion.div
                        animate={{ opacity: showUI ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"
                    >
                        <span className="text-sm text-white/50 pointer-events-none">
                            {currentIndex + 1} / {photos.length}
                        </span>
                        <div className="flex items-center gap-4 pointer-events-auto">
                            {/* 缩放控制 */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(s - 0.5, 1)) }}
                                className="text-white/50 hover:text-white transition-colors text-lg"
                                title="缩小 (-)"
                            >
                                −
                            </button>
                            <span className="text-xs text-white/40 min-w-[3ch] text-center">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(s + 0.5, 3)) }}
                                className="text-white/50 hover:text-white transition-colors text-lg"
                                title="放大 (+)"
                            >
                                +
                            </button>
                            <div className="w-px h-4 bg-white/20" />
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose() }}
                                className="text-white/50 hover:text-white transition-colors text-xl"
                                title="关闭 (Esc)"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>

                    {/* ---- 左箭头 ---- */}
                    {currentIndex > 0 && (
                        <motion.button
                            animate={{ opacity: showUI ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white/60 hover:bg-white/20 hover:text-white transition-all"
                            onClick={(e) => { e.stopPropagation(); goPrev() }}
                        >
                            ‹
                        </motion.button>
                    )}

                    {/* ---- 图片(可拖拽、可缩放) ---- */}
                    <motion.div
                        key={photo.id}
                        initial={{ scale: 0.9, opacity: 0, x: 0 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        drag={scale === 1 ? 'x' : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.3}
                        onDragEnd={handleDragEnd}
                        className="relative max-h-[85vh] max-w-[90vw] cursor-grab active:cursor-grabbing"
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={handleDoubleClick}
                        style={{ scale }}
                    >
                        <Image
                            src={getImageUrl(photo)}
                            alt={photo.title}
                            width={photo.width || 1024}
                            height={photo.height || 1024}
                            className="max-h-[85vh] w-auto rounded-lg object-contain pointer-events-none"
                            priority
                            draggable={false}
                        />

                        {/* ---- Caption ---- */}
                        <motion.div
                            animate={{ opacity: showUI ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-6"
                        >
                            <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                                {photo.title}
                            </h2>
                            {photo.description && (
                                <p className="mt-1 text-sm text-white/60">{photo.description}</p>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* ---- 右箭头 ---- */}
                    {currentIndex < photos.length - 1 && (
                        <motion.button
                            animate={{ opacity: showUI ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white/60 hover:bg-white/20 hover:text-white transition-all"
                            onClick={(e) => { e.stopPropagation(); goNext() }}
                        >
                            ›
                        </motion.button>
                    )}

                    {/* ---- 底部提示 ---- */}
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: showUI ? 0.6 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/30 pointer-events-none"
                    >
                        ← → 切换 · 双击缩放 · 滚轮缩放 · 滑动翻页
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
