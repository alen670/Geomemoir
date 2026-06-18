import { useState } from 'react';
import { useUserStore } from './useUserStore';
import { ChevronRight, LogIn, Edit, User } from 'lucide-react';
import LoginModal from './LoginModal';
import EditProfileModal from './EditProfileModal';

export default function UserProfileCard({
  onOpenLogin,
  onOpenEdit,
}: {
  onOpenLogin: () => void;
  onOpenEdit: () => void;
}) {
  const { profile } = useUserStore();

  // Mask sensitive accounts nicely for visual elegance
  const formatAccount = (account?: string) => {
    if (!account) return '本地沙盒保障';
    if (account.includes('@')) {
      // Email masking: u***@mail.com
      const parts = account.split('@');
      const prefix = parts[0];
      const masked = prefix.length > 2 ? prefix.substring(0, 2) + '***' : prefix + '***';
      return `云端同步箱 • ${masked}@${parts[1]}`;
    } else {
      // Phone masking: 138****5678
      if (account.length === 11) {
        return `云端同步箱 • ${account.substring(0, 3)}****${account.substring(7)}`;
      }
      return `云端同步箱 • ${account}`;
    }
  };

  const handleCardClick = () => {
    if (profile.isLoggedIn) {
      onOpenEdit();
    } else {
      onOpenLogin();
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-bg-card hover:bg-bg-card/95 rounded-[22px] p-5 flex items-center justify-between gap-4 border border-brand-secondary/8 shadow-xs hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer font-ui select-none"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Avatar Area */}
          <div className="relative shrink-0">
            {profile.isLoggedIn && profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.nickname} 
                className="w-13 h-13 rounded-full object-cover border-2 border-brand-primary/10 shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-13 h-13 rounded-full bg-brand-primary text-[#FFF9EF] flex items-center justify-center text-lg font-black shrink-0 shadow-xs border border-brand-primary/10">
                {profile.isLoggedIn ? profile.nickname.charAt(0) : '足'}
              </div>
            )}
          </div>

          {/* User Infobar */}
          <div className="min-w-0 flex-1">
            {profile.isLoggedIn ? (
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[17px] font-extrabold text-text-primary leading-tight tracking-tight truncate">
                    {profile.nickname}
                  </h2>
                  <span className="text-[10px] text-brand-primary font-bold bg-brand-primary/10 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 font-ui shrink-0">
                    已登录
                  </span>
                </div>
                <p className="text-xs text-text-secondary truncate mt-1">
                  {formatAccount(profile.account)}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-[16px] font-bold text-text-primary leading-tight tracking-tight">
                  登录后同步你的足迹
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  同步与备份头像、昵称、安全私密设置
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions Indicator */}
        <div className="shrink-0 flex items-center gap-1.5 pl-2">
          {profile.isLoggedIn ? (
            <div className="flex items-center gap-1 text-xs text-brand-primary font-bold bg-brand-primary/10 pl-2.5 pr-2.5 py-1.5 rounded-[10px] hover:bg-brand-primary/15 transition-all">
              <Edit className="w-3.5 h-3.5" />
              <span>编辑</span>
              <ChevronRight className="w-3.5 h-3.5 leading-none shrink-0" />
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-white bg-brand-primary font-bold pl-3 pr-3 py-1.5 rounded-full hover:opacity-95 shadow-sm transition-all shadow-brand-primary/15">
              <LogIn className="w-3.5 h-3.5" />
              <span>登录</span>
              <ChevronRight className="w-3.5 h-3.5 leading-none shrink-0" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
