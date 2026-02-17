// ============================================
// 个人中心 — 我的图片管理
// ============================================
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getMyPhotos, deletePhoto, updatePhoto } from '@/actions/photos'
import type { Photo } from '@/lib/types'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
    const [photos, setPhotos] = useState<Photo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) {
                router.push('/auth/login')
                return
            }
            setUser(data.user)
            loadPhotos()
        })
    }, [router])

    const loadPhotos = async () => {
        setLoading(true)
        const data = await getMyPhotos()
        setPhotos(data as Photo[])
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除这张图片吗？')) return
        await deletePhoto(id)
        setPhotos((prev) => prev.filter((p) => p.id !== id))
    }

    const handleTogglePublic = async (id: string, currentState: boolean) => {
        await updatePhoto(id, { is_public: !currentState })
        setPhotos((prev) =>
            prev.map((p) => (p.id === id ? { ...p, is_public: !currentState } : p))
        )
    }

    if (!user) return null

    return (
        <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-[family-name:var(--font-display)] text-3xl">我的作品</h1>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {user.email} · {photos.length} 幅作品
                    </p>
                </div>
                <button
                    onClick={() => router.push('/upload')}
                    className="rounded-full bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-[var(--color-bg)] transition-transform hover:scale-105"
                >
                    上传新作品
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                </div>
            ) : photos.length === 0 ? (
                <div className="py-20 text-center text-[var(--color-text-muted)]">
                    <p className="text-4xl mb-4">🎨</p>
                    <p>还没有作品，去上传你的第一幅作品吧</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="group relative overflow-hidden rounded-lg bg-[var(--color-bg-card)]"
                        >
                            <div className="relative aspect-[3/4]">
                                <Image
                                    src={photo.image_url || ''}
                                    alt={photo.title}
                                    fill
                                    sizes="(max-width: 640px) 50vw, 25vw"
                                    className="object-cover"
                                />
                            </div>

                            {/* ---- 管理覆层 ---- */}
                            <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleTogglePublic(photo.id, photo.is_public)}
                                        className="rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-sm transition-colors hover:bg-white/20"
                                    >
                                        {photo.is_public ? '🔓 公开' : '🔒 私密'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(photo.id)}
                                        className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300 backdrop-blur-sm transition-colors hover:bg-red-500/40"
                                    >
                                        删除
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-white">{photo.title}</h3>
                                    <p className="mt-1 text-xs text-white/50">
                                        {new Date(photo.created_at).toLocaleDateString('zh-CN')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
