// ============================================
// 上传页 — 多图上传 + 元数据表单
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
    const [files, setFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
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
    const handleFiles = (newFiles: File[]) => {
        setError('')
        const validFiles: File[] = []

        for (const f of newFiles) {
            if (!ALLOWED_TYPES.includes(f.type)) {
                setError('部分文件格式不支持 (仅 JPEG/PNG/WebP)')
                continue
            }
            if (f.size > MAX_FILE_SIZE) {
                setError('部分文件超过 10MB 限制')
                continue
            }
            validFiles.push(f)
        }

        if (validFiles.length === 0) return

        setFiles(prev => [...prev, ...validFiles])

        // 生成预览图
        const newPreviews = validFiles.map(f => URL.createObjectURL(f))
        setPreviews(prev => [...prev, ...newPreviews])

        // 如果是第一批文件且没有标题，自动填充第一个文件名
        if (!title && files.length === 0 && validFiles.length > 0) {
            setTitle(validFiles[0].name.replace(/\.\w+$/, ''))
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => {
            // 释放 URL 对象
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
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
        if (e.dataTransfer.files?.length) {
            handleFiles(Array.from(e.dataTransfer.files))
        }
    }

    // ---- 上传 ----
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (files.length === 0 || !user) return

        setUploading(true)
        setProgress(0)
        setError('')

        try {
            const totalFiles = files.length

            for (let i = 0; i < totalFiles; i++) {
                const file = files[i]
                const currentProgressBase = (i / totalFiles) * 100

                // 自动生成标题：如果有多个文件，添加序号
                const displayTitle = totalFiles > 1 ? `${title} (${i + 1})` : title

                // Step 1: 获取 signed URL
                const { signedUrl, path, token } = await createUploadUrl(file.name)
                setProgress(currentProgressBase + (10 / totalFiles))

                // Step 2: 直传 Supabase Storage
                const supabase = createClient()
                const { error: uploadError } = await supabase.storage
                    .from('gallery')
                    .uploadToSignedUrl(path, token, file)

                if (uploadError) throw new Error(`上传 ${file.name} 失败: ${uploadError.message}`)
                setProgress(currentProgressBase + (50 / totalFiles))

                // Step 3: 获取图片尺寸
                const img = new window.Image()
                img.src = previews[i]
                await new Promise((resolve) => { img.onload = resolve })

                // Step 4: 创建 DB 记录
                await createPhoto({
                    title: displayTitle,
                    description,
                    storagePath: path,
                    categoryIds: selectedCategories,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    fileSize: file.size,
                })

                setProgress(((i + 1) / totalFiles) * 100)
            }

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
        <div className="mx-auto max-w-4xl px-6 py-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl mb-8">上传作品</h1>

            <form onSubmit={handleUpload} className="space-y-8">
                {/* ---- 拖拽区域 ---- */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${dragActive
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                        }`}
                >
                    <div className="text-4xl text-[var(--color-text-muted)] mb-4">📷</div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        支持多图拖拽上传
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        JPEG / PNG / WebP · 最大 10MB/张
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                        className="hidden"
                    />
                </div>

                {/* ---- 预览网格 ---- */}
                {files.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {previews.map((src, index) => (
                            <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border border-[var(--color-border)]">
                                <Image src={src} alt="preview" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 text-[10px] text-white truncate">
                                    {files[index].name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        {/* ---- 标题 ---- */}
                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">标题 (批量)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                                placeholder="为这一组作品取个名字"
                            />
                            {files.length > 1 && (
                                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                                    多张图片将自动添加序号，如：{title || '标题'} (1), {title || '标题'} (2)...
                                </p>
                            )}
                        </div>

                        {/* ---- 描述 ---- */}
                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">描述 (可选)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)] resize-none"
                                placeholder="讲述这些照片背后的故事..."
                            />
                        </div>
                    </div>

                    {/* ---- 分类选择 ---- */}
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
                </div>

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
                    disabled={files.length === 0 || uploading}
                    className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {uploading ? `正在上传 ${files.length} 张图片... ${Math.round(progress)}%` : `上传 ${files.length > 0 ? files.length + ' 张图片' : ''}`}
                </button>
            </form>
        </div>
    )
}
