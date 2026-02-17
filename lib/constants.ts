// ============================================
// 全局常量 — 上传限制、bucket 名、分页
// ============================================

export const STORAGE_BUCKET = 'gallery'

// 上传限制
export const MAX_FILE_SIZE = 10 * 1024 * 1024   // 10MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_WIDTH = 2400              // 压缩目标宽度

// 分页
export const PAGE_SIZE = 20

// 缩略图尺寸（Supabase Image Proxy 或 CSS 降级）
export const THUMB_WIDTH = 400
export const MEDIUM_WIDTH = 1200
