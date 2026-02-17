// ============================================
// Lightbox — 沉浸式全屏图片查看器
// ============================================
'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect } from 'react'
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

    const goPrev = useCallback(() => {
        if (currentIndex > 0) onNavigate(photos[currentIndex - 1])
    }, [currentIndex, photos, onNavigate])

    const goNext = useCallback(() => {
        if (currentIndex < photos.length - 1) onNavigate(photos[currentIndex + 1])
    }, [currentIndex, photos, onNavigate])

    // 键盘导航
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'ArrowRight') goNext()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose, goPrev, goNext])

    return (
        <AnimatePresence>
            {photo && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
                    onClick={onClose}
                >
                    {/* ---- Close ---- */}
                    <button
                        className="absolute right-6 top-6 text-2xl text-white/50 hover:text-white transition-colors z-10"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                    {/* ---- Prev ---- */}
                    {currentIndex > 0 && (
                        <button
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-white/30 hover:text-white transition-colors z-10"
                            onClick={(e) => { e.stopPropagation(); goPrev() }}
                        >
                            ‹
                        </button>
                    )}

                    {/* ---- Image ---- */}
                    <motion.div
                        key={photo.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative max-h-[85vh] max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={getImageUrl(photo)}
                            alt={photo.title}
                            width={photo.width || 1024}
                            height={photo.height || 1024}
                            className="max-h-[85vh] w-auto rounded-lg object-contain"
                            priority
                        />

                        {/* ---- Caption ---- */}
                        <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black/80 to-transparent p-6">
                            <h2 className="font-[family-name:var(--font-display)] text-xl text-white">
                                {photo.title}
                            </h2>
                            {photo.description && (
                                <p className="mt-1 text-sm text-white/60">{photo.description}</p>
                            )}
                            <p className="mt-2 text-xs text-white/30">
                                {currentIndex + 1} / {photos.length}
                            </p>
                        </div>
                    </motion.div>

                    {/* ---- Next ---- */}
                    {currentIndex < photos.length - 1 && (
                        <button
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-3xl text-white/30 hover:text-white transition-colors z-10"
                            onClick={(e) => { e.stopPropagation(); goNext() }}
                        >
                            ›
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
