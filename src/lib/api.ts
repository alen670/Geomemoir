/**
 * MemoryPoint 数据访问层
 * 优先使用 Supabase，未配置时回退到 localStorage
 */

import { MemoryPoint } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const MARKERS_DB_KEY = 'FOOTPRINT_MARKERS_DB_V2';

// ============================================================
//  本地 localStorage 后备方案
// ============================================================

/** 按用户隔离的 localStorage key */
function localKey(userId: string): string {
  return userId ? `${MARKERS_DB_KEY}_${userId}` : MARKERS_DB_KEY;
}

function loadFromLocal(userId?: string): MemoryPoint[] {
  try {
    const key = localKey(userId || '');
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToLocal(points: MemoryPoint[], userId?: string): void {
  const key = localKey(userId || '');
  localStorage.setItem(key, JSON.stringify(points));
}

// ============================================================
//  超时包装器（使用 Promise.race）
// ============================================================

/** 给 Supabase 查询加超时 */
function withTimeout<T>(query: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    query as Promise<T>,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`[${label}] 请求超时 (${ms}ms)`)), ms)
    ),
  ]);
}

// ============================================================
//  Supabase 远程方案（按用户隔离）
// ============================================================

async function loadFromSupabase(userId: string): Promise<MemoryPoint[]> {
  // RLS 会自动过滤，但显式加 user_id 更可靠
  const { data, error } = await withTimeout(
    supabase
      .from('memory_points')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    8000,
    'loadFromSupabase'
  );

  if (error) {
    console.error('Supabase 读取失败，回退到本地:', error.message);
    return loadFromLocal(userId);
  }

  return (data || []).map(rowToPoint);
}

async function saveToSupabase(points: MemoryPoint[], userId: string): Promise<void> {
  // 清除该用户的旧数据
  const { error: deleteErr } = await withTimeout(
    supabase
      .from('memory_points')
      .delete()
      .eq('user_id', userId),
    8000,
    'saveToSupabase-delete'
  );

  if (deleteErr) {
    console.error('Supabase 清空失败:', deleteErr.message);
    throw deleteErr;
  }

  if (points.length === 0) return;

  // 写入时自动注入 user_id
  const rows = points.map((p) => pointToRow(p, userId));
  const { error: insertErr } = await withTimeout(
    supabase.from('memory_points').insert(rows),
    8000,
    'saveToSupabase-insert'
  );

  if (insertErr) {
    console.error('Supabase 写入失败:', insertErr.message);
    throw insertErr;
  }
}

// ============================================================
//  数据转换工具
// ============================================================

interface MemoryPointRow {
  id: string;
  title: string;
  date: string;
  lat: number;
  lng: number;
  location_name: string;
  notes: string;
  category: string;
  tags: string[];
  images: string[];
  rating: number;
  created_at: number;
  mood?: string;
  weather?: string;
  privacy_status?: string;
  user_id?: string;
}

function pointToRow(p: MemoryPoint, userId?: string): MemoryPointRow {
  return {
    id: p.id,
    title: p.title,
    date: p.date,
    lat: p.lat,
    lng: p.lng,
    location_name: p.locationName,
    notes: p.notes,
    category: p.category,
    tags: p.tags,
    images: p.images,
    rating: p.rating,
    created_at: p.createdAt,
    mood: p.mood,
    weather: p.weather,
    privacy_status: p.privacyStatus || 'private',
    user_id: userId,
  };
}

function rowToPoint(row: MemoryPointRow): MemoryPoint {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    lat: row.lat,
    lng: row.lng,
    locationName: row.location_name,
    notes: row.notes,
    category: row.category as MemoryPoint['category'],
    tags: row.tags || [],
    images: row.images || [],
    rating: row.rating,
    createdAt: row.created_at,
    mood: row.mood,
    weather: row.weather,
    privacyStatus: (row.privacy_status as 'private' | 'public') || 'private',
  };
}

// ============================================================
//  对外暴露的统一 API
// ============================================================

/**
 * 加载当前用户的记忆点
 * @param userId - 当前登录用户 ID（未登录时传空字符串用本地匿名存储）
 */
export async function loadPoints(userId: string): Promise<MemoryPoint[]> {
  if (isSupabaseConfigured() && userId) {
    try {
      return await loadFromSupabase(userId);
    } catch {
      return loadFromLocal(userId);
    }
  }
  return loadFromLocal(userId);
}

/**
 * 保存当前用户的记忆点
 * @param points - 记忆点数组
 * @param userId - 当前登录用户 ID
 */
export async function savePoints(points: MemoryPoint[], userId: string): Promise<void> {
  // 始终保存本地副本
  saveToLocal(points, userId);

  if (isSupabaseConfigured() && userId) {
    try {
      await saveToSupabase(points, userId);
    } catch (err) {
      console.error('Supabase 保存失败，已保存到本地:', err);
    }
  }
}
