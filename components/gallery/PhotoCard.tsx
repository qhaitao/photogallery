// ============================================
// PhotoCard — 单张图片卡片，悬浮放大 + 淡入
// ============================================
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Photo } from '@/lib/types'
import { STORAGE_BUCKET } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface PhotoCardProps {
    photo: Photo
    onClick?: () => void
    priority?: boolean
}

function getImageUrl(storagePath: string): string {
    // 如果已经是完整 URL（种子数据），直接返回
    if (storagePath.startsWith('http')) return storagePath

    const supabase = createClient()
    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath)
    return data.publicUrl
}

export function PhotoCard({ photo, onClick, priority = false }: PhotoCardProps) {
    const imageUrl = photo.image_url || getImageUrl(photo.storage_path)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative cursor-pointer overflow-hidden rounded-lg bg-[var(--color-bg-card)] transition-all duration-500 hover:shadow-[0_0_30px_-5px_var(--color-accent-dim)] ring-1 ring-white/5 hover:ring-[var(--color-accent)]/30"
            onClick={onClick}
        >
            <div className="relative aspect-[3/4]">
                <Image
                    src={imageUrl}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={priority}
                />
            </div>

            {/* ---- Hover Overlay ---- */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className="text-sm font-medium text-white">{photo.title}</h3>
                {photo.description && (
                    <p className="mt-1 text-xs text-white/60 line-clamp-2">
                        {photo.description}
                    </p>
                )}
            </div>
        </motion.div>
    )
}
