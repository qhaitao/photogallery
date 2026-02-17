// ============================================
// Server Actions — Photos CRUD + 查询
// ============================================
'use server'

import { createClient } from '@/lib/supabase/server'
import { PAGE_SIZE, STORAGE_BUCKET } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

// ---- 获取图片列表（游标分页） ----
export async function getPhotos(opts: {
    cursor?: string
    categoryId?: number
    userId?: string
    limit?: number
}) {
    const supabase = await createClient()
    const limit = opts.limit || PAGE_SIZE

    let query = supabase
        .from('photos')
        .select(`
      *,
      photo_categories(category_id, categories(*))
    `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit + 1) // 多取一条判断是否还有更多

    if (opts.cursor) {
        query = query.lt('created_at', opts.cursor)
    }

    if (opts.categoryId) {
        // 通过联接表筛选分类
        const { data: photoIds } = await supabase
            .from('photo_categories')
            .select('photo_id')
            .eq('category_id', opts.categoryId)

        if (photoIds && photoIds.length > 0) {
            query = query.in('id', photoIds.map((p) => p.photo_id))
        } else {
            return { photos: [], hasMore: false }
        }
    }

    if (opts.userId) {
        query = query.eq('user_id', opts.userId)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    const hasMore = (data?.length || 0) > limit
    const photos = hasMore ? data!.slice(0, limit) : (data || [])

    return { photos, hasMore }
}

// ---- 获取单张图片 ----
export async function getPhoto(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('photos')
        .select(`*, photo_categories(category_id, categories(*))`)
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

// ---- 获取所有分类 ----
export async function getCategories() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
    return data || []
}

// ---- 创建分类 ----
export async function createCategory(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    // 检查是否存在
    const { data: existing } = await supabase
        .from('categories')
        .select('*')
        .eq('name', name)
        .single()

    if (existing) return existing

    // 获取最大 sort_order
    const { data: maxOrder } = await supabase
        .from('categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

    const nextOrder = (maxOrder?.sort_order || 0) + 10

    const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({ name, sort_order: nextOrder })
        .select()
        .single()

    if (error) throw new Error(error.message)
    return newCategory
}

// ---- 获取当前用户的图片 ----
export async function getMyPhotos() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('photos')
        .select(`*, photo_categories(category_id, categories(*))`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}

// ---- 创建图片记录 ----
export async function createPhoto(formData: {
    title: string
    description?: string
    storagePath: string
    categoryIds: number[]
    width?: number
    height?: number
    fileSize?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    // 获取公开 URL
    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(formData.storagePath)

    // 插入 photos 表
    const { data: photo, error } = await supabase
        .from('photos')
        .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description || null,
            storage_path: formData.storagePath,
            image_url: urlData.publicUrl,
            width: formData.width || null,
            height: formData.height || null,
            file_size: formData.fileSize || null,
            is_public: true,
        })
        .select()
        .single()

    if (error) throw new Error(error.message)

    // 插入分类关联
    if (formData.categoryIds.length > 0) {
        await supabase.from('photo_categories').insert(
            formData.categoryIds.map((cid) => ({
                photo_id: photo.id,
                category_id: cid,
            }))
        )
    }

    revalidatePath('/gallery')
    revalidatePath('/')
    return photo
}

// ---- 删除图片 ----
export async function deletePhoto(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    // 获取 storage_path 以删除文件
    const { data: photo } = await supabase
        .from('photos')
        .select('storage_path')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (!photo) throw new Error('图片不存在')

    // 删除 Storage 文件
    await supabase.storage.from(STORAGE_BUCKET).remove([photo.storage_path])

    // 删除 DB 记录（CASCADE 会自动清理联接表）
    await supabase.from('photos').delete().eq('id', id)

    revalidatePath('/gallery')
    revalidatePath('/profile')
    return { success: true }
}

// ---- 更新图片 ----
export async function updatePhoto(
    id: string,
    updates: { title?: string; description?: string; is_public?: boolean }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const { error } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error(error.message)

    revalidatePath('/gallery')
    revalidatePath('/profile')
    return { success: true }
}

// ---- 生成 Signed Upload URL ----
export async function createUploadUrl(filename: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登录')

    const now = new Date()
    const ext = filename.includes('.') ? filename.split('.').pop() : 'png'
    const safeFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    const path = `${user.id}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${safeFilename}`

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(path)

    if (error) throw new Error(error.message)

    return { signedUrl: data.signedUrl, path, token: data.token }
}
