// ============================================
// 全局类型定义
// ============================================

export interface Photo {
    id: string
    user_id: string
    title: string
    description: string | null
    storage_path: string
    image_url: string
    blur_hash: string | null
    width: number | null
    height: number | null
    file_size: number | null
    is_public: boolean
    created_at: string
    categories?: Category[]
}

export interface Category {
    id: number
    name: string
    description: string | null
    sort_order: number
}

export interface PhotoWithCategories extends Photo {
    photo_categories: { category_id: number; categories: Category }[]
}
