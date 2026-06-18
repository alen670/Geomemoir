import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// ============================================================
//  内存状态
// ============================================================
let userProfileState: UserProfile = {
  id: '',
  nickname: '私密足印旅人',
  avatarUrl: undefined,
  account: undefined,
  isLoggedIn: false,
};

const listeners = new Set<() => void>();

function notify() {
  localStorage.setItem('USER_PROFILE_SESSION', JSON.stringify(userProfileState));
  localStorage.setItem('SETTING_NICKNAME', userProfileState.nickname);
  listeners.forEach((listener) => listener());
}

// ============================================================
// ============================================================
//  Supabase 驱动的状态同步
// ============================================================
//  Supabase 状态同步（秒显 auth metadata，后台加载 DB）
// ============================================================
async function syncFromSupabaseUser(user: User | null, _session: any) {
  if (user) {
    const email = user.email || user.phone || '';

    // 立即用 auth metadata 显示（不等待 DB）
    const metaNickname = user.user_metadata?.nickname || user.user_metadata?.full_name;
    userProfileState = {
      id: user.id,
      nickname: metaNickname || (email.includes('@') ? email.split('@')[0] : '探索者'),
      avatarUrl: undefined,
      account: email,
      isLoggedIn: true,
    };
    notify();

    // 后台加载 user_settings（头像兜底）
    supabase.from('user_settings')
      .select('nickname, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data: db }) => {
        if (!db) return;
        let changed = false;
        if (db.avatar_url) { userProfileState.avatarUrl = db.avatar_url; changed = true; }
        if (db.nickname && db.nickname !== userProfileState.nickname) {
          userProfileState.nickname = db.nickname; changed = true;
        }
        if (changed) notify();
      });
  } else {
    userProfileState = {
      id: '', nickname: '私密足印旅人', avatarUrl: undefined,
      account: undefined, isLoggedIn: false,
    };
    notify();
  }
}

// 监听认证状态
if (isSupabaseConfigured()) {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) await syncFromSupabaseUser(session.user, session);
    else await syncFromSupabaseUser(null, null);
  });
  // 页面加载：仅读缓存 session（快）
  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await syncFromSupabaseUser(session.user, session);
  })();
}

// ============================================================
//  对外暴露的 Store API
// ============================================================
export const userStore = {
  getProfile(): UserProfile {
    return userProfileState;
  },

  /** 邮箱注册 */
  async signUpWithEmail(email: string, password: string, nickname?: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置，请在 .env.local 中设置环境变量');
    }
    const displayName = nickname || email.split('@')[0];
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname: displayName } },
    });
    if (error) throw error;

    if (data.user) {
      syncFromSupabaseUser(data.user, data.session);
      // 后台写 user_settings
      supabase.from('user_settings').upsert({
        user_id: data.user.id, nickname: displayName,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }
    return data;
  },

  /** 邮箱登录 — 优化：signIn 本身已返回最新 user，无需额外 getUser */
  async signInWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置，请在 .env.local 中设置环境变量');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      // data.user 已是最新数据，直接同步
      syncFromSupabaseUser(data.user, data.session);
    }
    return data;
  },

  /** 发送 OTP 验证码（手机/邮箱） */
  async sendOTP(identifier: string, type: 'phone' | 'email') {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置');
    }
    if (type === 'email') {
      const { error } = await supabase.auth.signInWithOtp({ email: identifier });
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.signInWithOtp({ phone: identifier });
      if (error) throw error;
    }
  },

  /** OTP 验证码登录 */
  async verifyOTP(identifier: string, token: string, type: 'phone' | 'email') {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase 未配置');
    }
    if (type === 'email') {
      const { data, error } = await supabase.auth.verifyOtp({
        email: identifier,
        token,
        type: 'email',
      });
      if (error) throw error;
      if (data.user) {
        syncFromSupabaseUser(data.user, data.session);
      }
      return data;
    } else {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: identifier,
        token,
        type: 'sms',
      });
      if (error) throw error;
      if (data.user) {
        syncFromSupabaseUser(data.user, data.session);
      }
      return data;
    }
  },

  /** 模拟登录（Supabase 不可达时回退）—— 使用确定性 ID */
  simulateLogin(account: string, nickname?: string, avatarUrl?: string) {
    // 用账号生成确定性 ID，确保同一账号每次登录拿到相同 ID
    const deterministicId = 'local_' + btoa(account.trim().toLowerCase()).replace(/[+/=]/g, '').substring(0, 16);
    userProfileState = {
      id: deterministicId,
      nickname: nickname || '探索者_' + (account.includes('@') ? account.split('@')[0] : account),
      avatarUrl: avatarUrl || '',
      account: account,
      isLoggedIn: true,
    };
    notify();
  },

  /** 登出 */
  async logout() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    userProfileState = {
      id: '',
      nickname: '私密足印旅人',
      avatarUrl: undefined,
      account: undefined,
      isLoggedIn: false,
    };
    notify();
  },

  /** 更新个人信息 — 昵称→auth metadata，头像→user_settings */
  async updateProfile(profile: Partial<UserProfile>) {
    userProfileState = { ...userProfileState, ...profile };
    notify();

    if (!isSupabaseConfigured() || !userProfileState.isLoggedIn) return;

    const uid = userProfileState.id;
    const newNickname = userProfileState.nickname;
    const newAvatar = userProfileState.avatarUrl;

    // 1. 尝试通过 REST API 更新 auth metadata
    if (profile.nickname !== undefined) {
      const { error } = await supabase.auth.updateUser({
        data: { nickname: newNickname },
      });
      if (error) {
        // HTTP 520 等网络错误不阻塞，user_settings 兜底
        console.warn('auth.updateUser 失败:', error.status, error.message);
      }
    }

    // 2. 始终写 user_settings（昵称+头像，核心持久化）
    const { error: dbErr } = await supabase
      .from('user_settings')
      .upsert({
        user_id: uid,
        nickname: newNickname,
        avatar_url: newAvatar || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (dbErr) {
      console.error('user_settings 写入失败:', dbErr.message, dbErr.code);
    }
  },

  /** 上传头像 — 优先 Storage URL，回退 Base64，仅存 user_settings */
  async uploadAvatar(file: File): Promise<string> {
    if (!file) throw new Error('没有选择文件');
    if (file.size > 5 * 1024 * 1024) throw new Error('图片大小不能超过 5MB');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) throw new Error('仅支持 JPG, PNG 和 WEBP 格式图片');

    let finalUrl = '';

    // 方案 A：Supabase Storage（推荐，永久链接）
    if (isSupabaseConfigured() && userProfileState.isLoggedIn) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${userProfileState.id}/${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true, contentType: file.type });

        if (!error && data) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
          finalUrl = urlData.publicUrl;
        }
      } catch (e: any) {
        console.warn('Storage 上传异常:', e?.message);
      }
    }

    // 方案 B：Base64 兜底
    if (!finalUrl) {
      finalUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('文件读取出错'));
        reader.readAsDataURL(file);
      });
    }

    // 持久化到 user_settings（不碰 auth metadata，避免大小限制）
    if (isSupabaseConfigured() && userProfileState.isLoggedIn) {
      await supabase.from('user_settings').upsert({
        user_id: userProfileState.id,
        nickname: userProfileState.nickname,
        avatar_url: finalUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    // 更新内存
    userProfileState.avatarUrl = finalUrl;
    notify();
    return finalUrl;
  },
};

// ============================================================
//  React Hook
// ============================================================
export function useUserStore() {
  const [profile, setProfile] = useState<UserProfile>(userProfileState);

  useEffect(() => {
    const handleChange = () => {
      setProfile({ ...userProfileState });
    };
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return {
    profile,
    login: userStore.simulateLogin,
    signUpWithEmail: userStore.signUpWithEmail,
    signInWithEmail: userStore.signInWithEmail,
    sendOTP: userStore.sendOTP,
    verifyOTP: userStore.verifyOTP,
    logout: userStore.logout,
    updateProfile: userStore.updateProfile,
    uploadAvatar: userStore.uploadAvatar,
  };
}
