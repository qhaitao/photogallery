-- ============================================
-- 时光画廊 — Supabase Database Migration
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- ---- 分类表 ----
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INT DEFAULT 0
);

-- ---- 图片主表 ----
CREATE TABLE IF NOT EXISTS photos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  storage_path TEXT NOT NULL,
  image_url    TEXT,
  blur_hash    TEXT,
  width        INT,
  height       INT,
  file_size    INT,
  is_public    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ---- 多对多：图片 ↔ 分类 ----
CREATE TABLE IF NOT EXISTS photo_categories (
  photo_id    UUID REFERENCES photos(id) ON DELETE CASCADE,
  category_id INT  REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, category_id)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_photos_user     ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_public   ON photos(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_cursor   ON photos(created_at DESC, id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_categories ENABLE ROW LEVEL SECURITY;

-- photos: 公开可见 OR 作者可见
CREATE POLICY "photos_select" ON photos FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

-- photos: 登录用户可创建
CREATE POLICY "photos_insert" ON photos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- photos: 仅作者可修改
CREATE POLICY "photos_update" ON photos FOR UPDATE
  USING (user_id = auth.uid());

-- photos: 仅作者可删除
CREATE POLICY "photos_delete" ON photos FOR DELETE
  USING (user_id = auth.uid());

-- categories: 所有人可读
CREATE POLICY "categories_select" ON categories FOR SELECT
  USING (true);

-- photo_categories: 所有人可读
CREATE POLICY "photo_categories_select" ON photo_categories FOR SELECT
  USING (true);

-- photo_categories: 登录用户可插入（限自己的图片）
CREATE POLICY "photo_categories_insert" ON photo_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM photos WHERE id = photo_id AND user_id = auth.uid()
    )
  );

-- photo_categories: 级联删除自动处理，无需额外策略

-- ============================================
-- 种子分类数据 (13 个展厅)
-- ============================================
INSERT INTO categories (name, description, sort_order) VALUES
  ('岁月长廊', '从1岁到80岁，一个女人的职业生涯如何在时光中雕刻', 1),
  ('世界地图', '53座城市，53种风情 · 她的足迹，是献给地球的情书', 2),
  ('西域幻境', '穿越丝绸之路，邂逅大美新疆', 3),
  ('时尚殿堂', '从红毯到泳池，从健身房到歌舞厅', 4),
  ('幻想国度', '当东方面孔遇见西方幻想 · 10个平行宇宙', 5),
  ('娇妻日常', '晨光中苏醒，午后的慵懒', 6),
  ('朝代穿越', '从春秋到清朝，穿越三千年', 7),
  ('百年中国', '从1910年到2020年，110年中国变迁', 8),
  ('广州时光机', '同一个人，同一条江 · 广州珠江畔的50年城市进化史', 9),
  ('成长轨迹', '从五岁到五十五岁 · 一个人的成长史诗', 10),
  ('环球海滩', '十个国家，十片海滩', 11),
  ('私密时光', '晨曦与月光之间 · 属于她的私密空间', 12),
  ('创意终章', '概念艺术与电影致敬 · 经典与未来的对话', 13)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Storage Bucket Setup
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery', 
  'gallery', 
  TRUE, 
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
  USING ( bucket_id = 'gallery' );

CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );

CREATE POLICY "Owner Delete" ON storage.objects FOR DELETE
  USING ( bucket_id = 'gallery' AND auth.uid() = owner );

