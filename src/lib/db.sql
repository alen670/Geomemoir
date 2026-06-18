-- ============================================================
--  Geomemoir 数据库迁移 SQL
--  在 Supabase SQL Editor 中执行此文件即可建表
-- ============================================================

-- 1. 记忆点表
CREATE TABLE IF NOT EXISTS memory_points (
  id            TEXT PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '',
  date          TEXT NOT NULL DEFAULT '',          -- YYYY-MM-DD
  lat           DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng           DOUBLE PRECISION NOT NULL DEFAULT 0,
  location_name TEXT NOT NULL DEFAULT '',
  notes         TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'other',     -- sightseeing|food|culture|nature|hotel|transit|other
  tags          TEXT[] DEFAULT '{}',
  images        TEXT[] DEFAULT '{}',               -- 图片 URL 数组（用 Supabase Storage）
  rating        SMALLINT DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  created_at    BIGINT NOT NULL DEFAULT 0,
  mood          TEXT,                              -- Emoji
  weather       TEXT,                              -- Emoji
  privacy_status TEXT DEFAULT 'private',           -- private|public
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname       TEXT DEFAULT '私密足印旅人',
  avatar_url     TEXT,
  dark_mode      BOOLEAN DEFAULT false,
  default_visibility TEXT DEFAULT 'private',
  location_fuzzing  BOOLEAN DEFAULT false,
  hide_share_coords BOOLEAN DEFAULT false,
  local_encryption  BOOLEAN DEFAULT true,
  cloud_sync        BOOLEAN DEFAULT false,
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- 3. 索引
CREATE INDEX IF NOT EXISTS idx_memory_points_user_id ON memory_points(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_points_date ON memory_points(date);
CREATE INDEX IF NOT EXISTS idx_memory_points_category ON memory_points(category);

-- 4. Row Level Security (RLS) — 用户只能读写自己的数据
ALTER TABLE memory_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- memory_points 策略
CREATE POLICY "用户只能访问自己的记忆点"
  ON memory_points
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_settings 策略
CREATE POLICY "用户只能访问自己的设置"
  ON user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. 存储桶（图片存储）
-- 请在 Supabase Dashboard → Storage 中手动创建名为 'memories' 的公开存储桶

-- ============================================================
-- 6. 触发器：新用户注册时自动创建 user_settings 行
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nickname', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- 绑定触发器到 auth.users 表
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
