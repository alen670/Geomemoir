/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { MemoryPoint, TravelBackup } from '../types';
import { useUserStore } from './useUserStore';
import UserProfileCard from './UserProfileCard';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Lock, 
  Sliders, 
  Eye, 
  ChevronRight, 
  Sun,
  Moon,
  CloudLightning,
  Check
} from 'lucide-react';

interface MyProfileViewProps {
  points: MemoryPoint[];
  onImportBackup: (points: any[]) => void;
  onRestoreSeeds: () => void;
  onClearAll: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenLogin: () => void;
  onOpenEdit: () => void;
}

export default function MyProfileView({
  points,
  onImportBackup,
  onRestoreSeeds,
  onClearAll,
  darkMode,
  setDarkMode,
  onOpenLogin,
  onOpenEdit,
}: MyProfileViewProps) {
  const { profile } = useUserStore();

  // iOS Toggles states
  const [defaultVisibility, setDefaultVisibility] = useState(() => localStorage.getItem('SETTING_DEFAULT_VISIBILITY') || 'private');
  const [locationFuzzing, setLocationFuzzing] = useState(() => localStorage.getItem('SETTING_LOCATION_FUZZING') === 'true');
  const [hideShareCoords, setHideShareCoords] = useState(() => localStorage.getItem('SETTING_HIDE_SHARE_COORDS') === 'true');
  const [localEncryption, setLocalEncryption] = useState(() => localStorage.getItem('SETTING_LOCAL_ENCRYPTION') !== 'false');
  const [cloudSync, setCloudSync] = useState(() => localStorage.getItem('SETTING_CLOUD_SYNC') === 'true');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'err'>('idle');

  // Trigger localStorage syncs
  useEffect(() => {
    localStorage.setItem('SETTING_DEFAULT_VISIBILITY', defaultVisibility);
  }, [defaultVisibility]);

  useEffect(() => {
    localStorage.setItem('SETTING_LOCATION_FUZZING', String(locationFuzzing));
  }, [locationFuzzing]);

  useEffect(() => {
    localStorage.setItem('SETTING_HIDE_SHARE_COORDS', String(hideShareCoords));
  }, [hideShareCoords]);

  useEffect(() => {
    localStorage.setItem('SETTING_LOCAL_ENCRYPTION', String(localEncryption));
  }, [localEncryption]);

  useEffect(() => {
    localStorage.setItem('SETTING_CLOUD_SYNC', String(cloudSync));
  }, [cloudSync]);

  // JSON Export Handler
  const handleExportJSON = () => {
    const backup: TravelBackup = {
      points,
      routes: [],
      version: '1.2.0',
      exportedAt: Date.now(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${profile.nickname}-私密数字足记备份.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Import Handler
  const handleImportJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json || !Array.isArray(json.points)) {
          throw new Error('格式校验失败');
        }

        onImportBackup(json.points);
        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 2500);
      } catch (err) {
        console.error('Import failed:', err);
        setImportStatus('err');
        alert('导入失败，请上传正确的足迹日记备份文件！');
        setTimeout(() => setImportStatus('idle'), 2500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-page overflow-hidden font-ui text-text-primary select-none">
      
      {/* iOS Header Title Bar */}
      <div className="bg-bg-card backdrop-blur-2xl px-5 py-4 border-b border-brand-secondary/10 shrink-0 font-ui">
        <h1 className="text-[28px] font-bold tracking-tight text-text-primary font-ui">我的设置</h1>
      </div>

      {/* Settings Scroll content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-hide pb-16">
        
        {/* 1. Customizable User Profile sync card */}
        <UserProfileCard onOpenLogin={onOpenLogin} onOpenEdit={onOpenEdit} />

        {/* 2. Group 1: Privacy Settings */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wide pl-4">隐私安全等级</span>
          <div className="bg-bg-card rounded-[18px] divide-y divide-brand-secondary/8 p-0 border border-brand-secondary/8 shadow-xs">
            
            {/* Row 1: Default privacy */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold leading-normal block">默认可见度</span>
                  <span className="text-xs text-text-secondary mt-0.5 block">封存新写照时默认的最初私密可见等级</span>
                </div>
              </div>
              
              <select
                value={defaultVisibility}
                onChange={(e) => setDefaultVisibility(e.target.value)}
                className="text-xs font-bold text-brand-primary bg-transparent outline-none border-none cursor-pointer pr-1"
              >
                <option value="private">仅自己可见</option>
                <option value="public">公开可见</option>
              </select>
            </div>

            {/* Row 2: Location fuzzing */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-secondary/10 text-brand-secondary flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold leading-normal block">地理位置模糊化</span>
                  <span className="text-xs text-text-secondary mt-0.5 block">自动针对周边物理坐标添加约 200m 轻微变动干扰</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setLocationFuzzing(!locationFuzzing)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none border-none cursor-pointer ${
                  locationFuzzing ? 'bg-brand-primary' : 'bg-bg-soft'
                }`}
              >
                <div className={`w-5 h-5 bg-[#FFF9EF] rounded-full shadow-md transition-transform duration-200 ${
                  locationFuzzing ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Row 3: Hide Coords */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold leading-normal block">分享时隐藏精确坐标</span>
                  <span className="text-xs text-text-secondary mt-0.5 block">在对外公开细节时自动裁剪高精度十进制数值</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setHideShareCoords(!hideShareCoords)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none border-none cursor-pointer ${
                  hideShareCoords ? 'bg-brand-primary' : 'bg-bg-soft'
                }`}
              >
                <div className={`w-5 h-5 bg-[#FFF9EF] rounded-full shadow-md transition-transform duration-200 ${
                  hideShareCoords ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* 3. Group 2: Data Encryption & storage */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wide pl-4">数据与存储</span>
          <div className="bg-bg-card rounded-[18px] divide-y divide-brand-secondary/8 p-0 border border-brand-secondary/8 shadow-xs">
            
            {/* Local Encryption */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold leading-normal block">安全密匙本地隔空锁</span>
                  <span className="text-xs text-text-secondary mt-0.5 block">底层对本地沙盒数据库进行二级私钥锁死</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setLocalEncryption(!localEncryption)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none border-none cursor-pointer ${
                  localEncryption ? 'bg-brand-primary' : 'bg-bg-soft'
                }`}
              >
                <div className={`w-5 h-5 bg-[#FFF9EF] rounded-full shadow-md transition-transform duration-200 ${
                  localEncryption ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Cloud Sync */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
                  <CloudLightning className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold leading-normal block">iCloud / WebDAV 同步</span>
                  <span className="text-xs text-text-secondary mt-0.5 block">用于多个个人设备间的双向安全同步校验</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setCloudSync(!cloudSync)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none border-none cursor-pointer ${
                  cloudSync ? 'bg-brand-primary' : 'bg-bg-soft'
                }`}
              >
                <div className={`w-5 h-5 bg-[#FFF9EF] rounded-full shadow-md transition-transform duration-200 ${
                  cloudSync ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* 4. Group 3: Display preference */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wide pl-4">显示偏好</span>
          <div className="bg-bg-card rounded-[18px] divide-y divide-brand-secondary/8 p-0 border border-brand-secondary/8 shadow-xs">
            
            {/* Theme switcher */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-sm font-bold leading-normal block">深色模式</span>
                  <span className="text-xs text-text-secondary mt-0.5 block">自适应随系统转换深浅两色精致视觉外观</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none border-none cursor-pointer ${
                  darkMode ? 'bg-brand-primary' : 'bg-bg-soft'
                }`}
              >
                <div className={`w-5 h-5 bg-[#FFF9EF] rounded-full shadow-md transition-transform duration-200 ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>
        </div>

        {/* 5. Group 4: Backups importer controls */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wide pl-4">足印象箱管理</span>
          <div className="bg-bg-card rounded-[18px] p-4.5 space-y-4 border border-brand-secondary/8 shadow-xs">
            <span className="text-[13px] text-text-secondary leading-relaxed block">
              当前共保全了 {points.length} 篇本地回忆。数据完全存储于浏览器沙盒，不经由外部云端服务器，保障绝对私密安全。
            </span>

            <div className="grid grid-cols-2 gap-3 text-[13px] font-bold text-center">
              {/* Backups trigger */}
              <button
                onClick={handleExportJSON}
                className="py-3 px-2 rounded-full flex items-center justify-center gap-1.5 cursor-pointer border-none font-bold transition-all primary-button"
              >
                <Download className="w-4 h-4" />
                <span>备份到本地</span>
              </button>

              {/* Import Backups trigger */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-2 bg-bg-soft text-text-primary rounded-full flex items-center justify-center gap-1.5 cursor-pointer border-none font-bold hover:scale-[1.01] transition-all"
              >
                {importStatus === 'success' ? (
                  <>
                    <Check className="w-4 h-4 text-brand-primary" />
                    <span className="text-brand-primary">导入成功</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>从备份恢复</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </div>

            {/* Seeds restoration & Clean all block */}
            <div className="flex items-center justify-between text-[13px] font-bold pt-3.5 border-t border-brand-secondary/10">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('重载演示包将向本地库重置 6 篇具有自然烟火气的个人回忆，是否继续导入？')) {
                    onRestoreSeeds();
                  }
                }}
                className="text-brand-primary flex items-center gap-1.5 border-none bg-transparent cursor-pointer font-bold hover:opacity-80"
              >
                <RefreshCw className="w-4 h-4 animate-spinSlow" />
                <span>恢复默认数据</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('警告：一键清空将永久抹掉所有已记录的数据。确定继续一键销毁吗？')) {
                    onClearAll();
                  }
                }}
                className="text-red-500 hover:text-red-650 flex items-center gap-1.5 border-none bg-transparent cursor-pointer font-bold duration-150"
              >
                <Trash2 className="w-4 h-4" />
                <span>清空所有日记</span>
              </button>
            </div>

          </div>
        </div>

        {/* 6. Group 5: About and metadata */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wide pl-4">关于本产品</span>
          <div className="bg-bg-card rounded-[18px] p-4.5 space-y-3.5 border border-brand-secondary/8 shadow-xs">
            
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-shake">📔</span>
              <div>
                <h4 className="font-bold text-brand-primary">私密回忆日记</h4>
                <p className="text-xs text-text-muted mt-0.5">私密 • 轻量 • 真实的个人旅行手帐</p>
              </div>
            </div>

            <p className="text-xs leading-[1.6] text-text-secondary font-light">
              所有的文字记录、经历过的山川湖海、心动的瞬间与相片，皆安全无虞地锁于您本机的私存保险沙盒中。岁月静静流淌，这一方天地完全独属于您。
            </p>

            <div className="flex items-center justify-between text-xs text-text-muted font-mono pt-3.5 border-t border-brand-secondary/10">
              <span className="font-semibold">
                🔒 本地加密保险盒 v1.2.0
              </span>
              <span>2026</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
