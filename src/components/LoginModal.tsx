import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, UserPlus, LogIn } from 'lucide-react';
import { useUserStore } from './useUserStore';
import { isSupabaseConfigured } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { login, signUpWithEmail, signInWithEmail, sendOTP, verifyOTP } = useUserStore();
  const supabaseReady = isSupabaseConfigured();

  const [loginType, setLoginType] = useState<'phone' | 'email'>(supabaseReady ? 'email' : 'phone');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 手机验证码倒计时
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

  const startCountdown = useCallback(() => {
    setOtpSent(true);
    setOtpCountdown(60);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setOtpSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendOTP = async () => {
    const phone = account.trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      if (supabaseReady) {
        await sendOTP(phone, 'phone');
      }
      startCountdown();
    } catch (err: any) {
      setError(err?.message || '发送验证码失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedAccount = account.trim();
    if (!trimmedAccount) {
      setError('请输入账号');
      return;
    }

    if (loginType === 'phone') {
      if (!/^1[3-9]\d{9}$/.test(trimmedAccount)) {
        setError('请输入正确的11位手机号');
        return;
      }
      if (code.length < 4) {
        setError('请输入验证码');
        return;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedAccount)) {
        setError('请输入正确的邮箱地址');
        return;
      }
      if (code.length < (supabaseReady ? 6 : 4)) {
        setError(supabaseReady ? '密码不能少于6位' : '验证码或密码不能少于4位');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (supabaseReady) {
        // Supabase 真实认证
        try {
          if (loginType === 'phone') {
            // 手机 OTP 验证登录
            await verifyOTP(trimmedAccount, code, 'phone');
          } else if (mode === 'signup') {
            await signUpWithEmail(trimmedAccount, code);
          } else {
            await signInWithEmail(trimmedAccount, code);
          }
        } catch (authErr: any) {
          const msg = authErr?.message || '';
          if (
            msg.includes('Failed to fetch') ||
            msg.includes('NetworkError') ||
            msg.includes('network') ||
            msg.includes('timeout') ||
            msg.includes('ECONNREFUSED') ||
            msg.includes('ERR_CONNECTION')
          ) {
            console.warn('⚠️ Supabase 不可达，使用本地模式登录');
            setError('');
            login(trimmedAccount);
          } else if (loginType === 'phone' && (
            msg.includes('OTP') || msg.includes('token') || msg.includes('SMS') ||
            msg.includes('not configured') || msg.includes('provider')
          )) {
            // 手机 OTP 未配置 SMS 提供商 → 回退本地模式
            console.warn('⚠️ 手机验证码服务未配置，使用本地模式登录');
            setError('');
            login(trimmedAccount);
          } else {
            throw authErr;
          }
        }
      } else {
        // 模拟登录
        await new Promise((r) => setTimeout(r, 600));
        login(trimmedAccount);
      }

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        if (onSuccess) onSuccess();
        onClose();
        setAccount('');
        setCode('');
        setMode('signin');
        setOtpSent(false);
        setOtpCountdown(0);
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || '登录失败，请稍后重试';
      if (msg.includes('Invalid login credentials')) {
        setError('账号或密码错误');
      } else if (msg.includes('User already registered')) {
        setError('该邮箱已注册，请直接登录');
        setMode('signin');
      } else if (msg.includes('Token has expired')) {
        setError('验证码已过期，请重新发送');
      } else if (msg.includes('Invalid OTP') || msg.includes('token')) {
        setError('验证码错误');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-[12px]"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-bg-card border border-brand-secondary/10 rounded-[24px] shadow-2xl p-6 overflow-hidden z-10 font-ui text-text-primary"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-text-primary tracking-tight">归乡登记</h3>
                <p className="text-[11px] text-text-muted mt-0.5">登录以同步您珍若星辰的旅行回忆</p>
              </div>
              {!isLoading && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-bg-soft rounded-full text-text-secondary cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selector */}
            <div className="flex bg-bg-soft p-1 rounded-xl mb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setLoginType('phone');
                  setAccount('');
                  setError('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-center border-none cursor-pointer transition-all ${
                  loginType === 'phone'
                    ? 'bg-bg-card text-brand-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                手机登录
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType('email');
                  setAccount('');
                  setError('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-center border-none cursor-pointer transition-all ${
                  loginType === 'email'
                    ? 'bg-bg-card text-brand-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                邮箱登录
              </button>
            </div>

            {/* Sign In / Sign Up Toggle (email only) */}
            {supabaseReady && loginType === 'email' && (
              <div className="flex bg-bg-soft/50 p-1 rounded-lg mb-5 text-[11px] font-bold">
                <button type="button" onClick={() => { setMode('signin'); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md border-none cursor-pointer transition-all ${
                    mode === 'signin' ? 'bg-bg-card text-brand-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
                  }`}>
                  <LogIn className="w-3 h-3" /> 登录
                </button>
                <button type="button" onClick={() => { setMode('signup'); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md border-none cursor-pointer transition-all ${
                    mode === 'signup' ? 'bg-bg-card text-brand-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
                  }`}>
                  <UserPlus className="w-3 h-3" /> 注册
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-1 block mb-1.5">
                  {loginType === 'phone' ? '手机号码' : '电子邮箱'}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-text-muted">
                    {loginType === 'phone' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <input
                    type={loginType === 'phone' ? 'tel' : 'email'}
                    placeholder={loginType === 'phone' ? '请输入11位手机号码' : '请输入电子邮件地址'}
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-bg-soft border border-transparent focus:border-brand-primary/20 rounded-xl outline-none text-text-primary placeholder-text-muted/60 font-bold transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-1 block mb-1.5">
                  {loginType === 'phone' ? '短信验证码' : supabaseReady ? '密码' : '密码 / 验证码'}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-text-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={loginType === 'phone' || showPassword ? 'text' : 'password'}
                    placeholder={
                      loginType === 'phone' ? '请输入6位短信验证码' :
                      supabaseReady ? '请输入密码（至少6位）' : '请输入密码或任意4位验证码'
                    }
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isLoading}
                    autoComplete="one-time-code"
                    className={`w-full py-2.5 text-xs bg-bg-soft border border-transparent focus:border-brand-primary/20 rounded-xl outline-none text-text-primary placeholder-text-muted/60 font-bold transition-all ${
                      loginType === 'phone' ? 'pl-10 pr-24' : 'pl-10 pr-10'
                    }`}
                  />
                  {/* 手机验证码发送按钮 */}
                  {loginType === 'phone' && supabaseReady && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={isLoading || otpCountdown > 0}
                      className="absolute right-1.5 top-1.5 px-3 py-1 text-[10px] font-bold rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 disabled:opacity-40 border-none cursor-pointer transition-all"
                    >
                      {otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? '重新发送' : '发送验证码'}
                    </button>
                  )}
                  {/* 邮箱密码可见性切换 */}
                  {loginType === 'email' && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary border-none bg-transparent cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-500 font-bold bg-red-500/5 px-3 py-2 rounded-lg border border-red-500/10">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 rounded-full font-bold text-xs cursor-pointer border-none transition-all primary-button shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading
                  ? '核对凭证中...'
                  : loginType === 'phone'
                    ? '验证登录'
                    : supabaseReady && mode === 'signup'
                      ? '注册并登录'
                      : '开始登录'}
              </button>
            </form>

            <p className="text-[10px] text-text-muted/70 text-center mt-4">
              {loginType === 'phone'
                ? '输入手机号并获取短信验证码即可登录'
                : supabaseReady
                  ? mode === 'signup'
                    ? '注册即表示同意服务条款，您的数据将安全加密存储'
                    : '登录以同步您珍若星辰的旅行回忆至云端'
                  : '此版本为旅行日记本地加密版，账号数据将在浏览器沙盒隔离'}
            </p>

            {/* Success Toast Overlay inside Modal */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-bg-card flex flex-col items-center justify-center z-20 text-center p-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#2F5D62] mb-3 animate-pulse" />
                  <h4 className="text-base font-bold text-text-primary">迎归旅人</h4>
                  <p className="text-xs text-text-secondary mt-1">
                    您的个人旅行日志数据箱已同步
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
