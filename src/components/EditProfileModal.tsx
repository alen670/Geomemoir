import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Check, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { useUserStore } from './useUserStore';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { profile, updateProfile, uploadAvatar, logout } = useUserStore();
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(profile.avatarUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<'success' | 'none'>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef(isOpen);

  // 每次弹窗从关闭→打开时，强制同步最新的 profile 数据
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      // 刚从关闭变为打开 → 同步最新值
      setNickname(profile.nickname);
      setAvatarPreview(profile.avatarUrl);
      setPendingFile(null);
      setError('');
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('仅支持 JPG, PNG 和 WEBP 格式');
      return;
    }

    setPendingFile(file);
    setError('');

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedNickname = nickname.trim();
    if (trimmedNickname.length < 2 || trimmedNickname.length > 16) {
      setError('昵称长度需限制在 2 ~ 16 个字符之间');
      return;
    }

    if (!trimmedNickname) {
      setError('昵称不能为空或纯空格');
      return;
    }

    setIsSaving(true);

    try {
      let finalAvatarUrl = profile.avatarUrl;

      // If there is an unsaved file, upload/convert it to DataURL now
      if (pendingFile) {
        finalAvatarUrl = await uploadAvatar(pendingFile);
      }

      // Update the user profile（必须 await，否则数据库写入失败静默丢失）
      await updateProfile({
        nickname: trimmedNickname,
        avatarUrl: finalAvatarUrl
      });

      setIsSaving(false);
      setShowToast('success');

      setTimeout(() => {
        setShowToast('none');
        onClose();
      }, 1500);
    } catch (err: any) {
      setIsSaving(false);
      setError(err?.message || '保存失败，请稍后重试');
    }
  };

  const handleLogoutClick = () => {
    if (window.confirm('确认在此设备上退出本次足记登录吗？退出后您的本地设置仍将安全保留。')) {
      logout();
      onClose();
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
            onClick={isSaving ? undefined : onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-[12px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-bg-card border border-brand-secondary/10 rounded-[24px] shadow-2xl p-6 overflow-hidden z-10 font-ui text-text-primary"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary tracking-tight">编辑旅行档案</h3>
                <p className="text-[11px] text-text-muted mt-0.5">重置属于您的独特印记与流光署名</p>
              </div>
              {!isSaving && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 hover:bg-bg-soft rounded-full text-text-secondary cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Content Form */}
            <form onSubmit={handleSave} className="space-y-5">
              {/* Avatar upload center */}
              <div className="flex flex-col items-center gap-2 mb-2">
                <div 
                  onClick={isSaving ? undefined : handleAvatarClick}
                  className="relative w-20 h-20 rounded-full border-2 border-brand-primary/10 overflow-hidden cursor-pointer group hover:opacity-90 transition-all flex items-center justify-center bg-brand-primary/5 text-brand-primary"
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-2xl font-black">{nickname.charAt(0) || '足'}</span>
                  )}
                  
                  {/* Hover icon */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isSaving}
                  className="text-[11px] text-brand-primary font-bold hover:underline cursor-pointer border-none bg-transparent"
                >
                  更换头像 (JPG / PNG)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Nickname input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-1 font-ui">
                  旅人昵称 / 专属印记
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError('');
                  }}
                  disabled={isSaving}
                  className="w-full px-3.5 py-2.5 text-xs bg-bg-soft border border-transparent focus:border-brand-primary/20 rounded-xl outline-none text-text-primary placeholder-text-muted font-bold transition-all"
                  placeholder="2 ~ 16 个字符，不允许纯空格"
                />
              </div>

              {error && (
                <div className="text-xs text-red-500 font-bold bg-red-500/5 px-3 py-2 rounded-lg border border-red-500/10 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Buttons Stack */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 rounded-full font-bold text-xs cursor-pointer border-none transition-all primary-button flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>正在存入岁月日记里...</span>
                    </>
                  ) : (
                    <span>保存修改</span>
                  )}
                </button>

                {/* Secure LogOut button inside Edit profile */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  disabled={isSaving}
                  className="w-full py-3 bg-[#FCF8F2] dark:bg-zinc-800 hover:bg-red-50/60 dark:hover:bg-red-950/20 text-red-500 hover:text-red-650 border border-red-500/12 rounded-full font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>退出登录</span>
                </button>
              </div>
            </form>

            {/* Success Micro Toast */}
            <AnimatePresence>
              {showToast === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-bg-card flex flex-col items-center justify-center z-20 text-center p-6"
                >
                  <Check className="w-10 h-10 text-white bg-brand-primary rounded-full p-2.5 mb-3" />
                  <h4 className="text-base font-bold text-text-primary">档案更新成功</h4>
                  <p className="text-xs text-text-secondary mt-1">更新档案细节随时随地生效</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
