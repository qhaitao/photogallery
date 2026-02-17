// ============================================
// 上传页 — 拖拽上传 + 元数据表单
// ============================================
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { createUploadUrl, createPhoto, getCategories } from '@/actions/photos'
import { MAX_FILE_SIZE, ALLOWED_TYPES } from '@/lib/constants'
import type { Category } from '@/lib/types'

export default function UploadPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [user, setUser] = useState<{ id: string } | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<number[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState('')
    const [dragActive, setDragActive] = useState(false)

    // ---- 检查登录状态 ----
    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) router.push('/auth/login')
            else setUser(data.user)
        })
    }, [router])

    // ---- 加载分类 ----
    useEffect(() => {
        getCategories().then(setCategories)
    }, [])

    // ---- 文件选择/验证 ----
    const handleFile = (f: File) => {
        setError('')
        if (!ALLOWED_TYPES.includes(f.type)) {
            setError('仅支持 JPEG、PNG、WebP 格式')
            return
        }
        if (f.size > MAX_FILE_SIZE) {
            setError('文件大小不能超过 10MB')
            return
        }
        setFile(f)
        setPreview(URL.createObjectURL(f))
        if (!title) setTitle(f.name.replace(/\.\w+$/, ''))
    }

    // ---- 拖拽处理 ----
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(e.type === 'dragenter' || e.type === 'dragover')
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }

    // ---- 上传 ----
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !user) return

        setUploading(true)
        setProgress(10)
        setError('')

        try {
            // Step 1: 获取 signed URL
            const { signedUrl, path, token } = await createUploadUrl(file.name)
            setProgress(30)

            // Step 2: 直传 Supabase Storage
            const supabase = createClient()
            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .uploadToSignedUrl(path, token, file)

            if (uploadError) throw new Error(uploadError.message)
            setProgress(70)

            // Step 3: 获取图片尺寸
            const img = new window.Image()
            img.src = preview!
            await new Promise((resolve) => { img.onload = resolve })

            // Step 4: 创建 DB 记录
            await createPhoto({
                title,
                description,
                storagePath: path,
                categoryIds: selectedCategories,
                width: img.naturalWidth,
                height: img.naturalHeight,
                fileSize: file.size,
            })
            setProgress(100)

            router.push('/gallery')
        } catch (err) {
            setError(err instanceof Error ? err.message : '上传失败')
            setUploading(false)
        }
    }

    // ---- 分类切换 ----
    const toggleCategory = (id: number) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        )
    }

    if (!user) return null

    return (
        <div className="mx-auto max-w-2xl px-6 py-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl mb-8">上传作品</h1>

            <form onSubmit={handleUpload} className="space-y-6">
                {/* ---- 拖拽区域 ---- */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all ${dragActive
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                        }`}
                >
                    {preview ? (
                        <div className="relative aspect-[3/4] w-48">
                            <Image src={preview} alt="预览" fill className="rounded-lg object-cover" />
                        </div>
                    ) : (
                        <>
                            <div className="text-4xl text-[var(--color-text-muted)] mb-4">📷</div>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                拖拽图片到这里，或点击选择
                            </p>
                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                JPEG / PNG / WebP · 最大 10MB
                            </p>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        className="hidden"
                    />
                </div>

                {/* ---- 标题 ---- */}
                <div>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">标题</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                        placeholder="为你的作品取个名字"
                    />
                </div>

                {/* ---- 描述 ---- */}
                <div>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">描述</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] resize-none"
                        placeholder="可选"
                    />
                </div>

                {/* ---- 分类选择 ---- */}
                {categories.length > 0 && (
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-2">分类</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`rounded-full px-3 py-1 text-xs transition-all ${selectedCategories.includes(cat.id)
                                            ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                                            : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ---- 进度条 ---- */}
                {uploading && (
                    <div className="h-2 rounded-full bg-[var(--color-bg-card)] overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {error && <p className="text-sm text-red-400">{error}</p>}

                {/* ---- 提交 ---- */}
                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {uploading ? `上传中... ${progress}%` : '上传'}
                </button>
            </form>
        </div>
    )
}
