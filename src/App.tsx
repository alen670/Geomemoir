/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { MemoryPoint } from './types';
import { INITIAL_POINTS } from './data';
import { loadPoints, savePoints } from './lib/api';
import { useUserStore } from './components/useUserStore';
import MapContainer from './components/MapContainer';
import MemoryForm from './components/MemoryForm';
import TimelineView from './components/TimelineView';
import GalleryView from './components/GalleryView';
import MyProfileView from './components/MyProfileView';
import BottomSheet from './components/BottomSheet';
import LoginModal from './components/LoginModal';
import EditProfileModal from './components/EditProfileModal';
import { Map, Calendar, Image as ImageIcon, User, Plus, Compass } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { profile } = useUserStore();
  const currentUserId = profile.isLoggedIn ? profile.id : '';

  // Theme state: default false meaning system is in elegant light mode, user choice persists
  const [darkMode, setDarkMode] = useState(() => {
    const cached = localStorage.getItem('FOOTPRINT_DARK_MODE');
    return cached ? cached === 'true' : false;
  });

  // Core states
  const [points, setPoints] = useState<MemoryPoint[]>([]);
  const [dbLoaded, setDbLoaded] = useState(false);
  
  // Tab index
  const [activeTab, setActiveTab] = useState<'map' | 'timeline' | 'gallery' | 'statistics' | 'profile'>('map');
  
  // Selected diary item for slide-up Bottom Sheet details
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // States to toggle notebook diary editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pointToEdit, setPointToEdit] = useState<MemoryPoint | null>(null);
  const [initialCoords, setInitialCoords] = useState<{ lat: number; lng: number; locationName: string } | null>(null);

  // States for user profile modal controls
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Apply dark mode theme class
  useEffect(() => {
    const rootEl = document.documentElement;
    const bodyEl = document.body;
    const reactRoot = document.getElementById('root');
    if (darkMode) {
      rootEl.classList.add('dark');
      bodyEl.classList.add('dark');
      reactRoot?.classList.add('dark');
    } else {
      rootEl.classList.remove('dark');
      bodyEl.classList.remove('dark');
      reactRoot?.classList.remove('dark');
    }
    localStorage.setItem('FOOTPRINT_DARK_MODE', String(darkMode));
  }, [darkMode]);

  // Load data — 用户切换时自动重新加载对应数据
  useEffect(() => {
    let cancelled = false;
    setDbLoaded(false);

    async function init() {
      // 先尝试本地缓存（对应 userId）
      let localData: MemoryPoint[] = [];
      try {
        const key = currentUserId
          ? `FOOTPRINT_MARKERS_DB_V2_${currentUserId}`
          : 'FOOTPRINT_MARKERS_DB_V2';
        const raw = localStorage.getItem(key);
        if (raw) localData = JSON.parse(raw);
      } catch {}

      if (localData.length > 0) {
        if (!cancelled) setPoints(localData);
      }

      // 从 Supabase 加载云端数据
      const remotePoints = await loadPoints(currentUserId);
      if (cancelled) return;

      // 云端有数据则使用云端（覆盖本地缓存）
      if (remotePoints.length > 0) {
        setPoints(remotePoints);
        // 同步到本地
        const key = currentUserId
          ? `FOOTPRINT_MARKERS_DB_V2_${currentUserId}`
          : 'FOOTPRINT_MARKERS_DB_V2';
        localStorage.setItem(key, JSON.stringify(remotePoints));
      } else if (localData.length === 0) {
        // 无远程无本地 → 空状态（不再自动填充种子数据）
        setPoints([]);
      }

      setDbLoaded(true);
    }

    init();
    return () => { cancelled = true; };
  }, [currentUserId]); // 用户登录/登出时自动触发重新加载

  // Save changes — 同步到 Supabase + localStorage，关联当前用户
  const handleSavePoints = async (newPoints: MemoryPoint[]) => {
    setPoints(newPoints);
    await savePoints(newPoints, currentUserId);
  };

  // Callback to tag footprints at map clicked coordinates
  const handleMapCreatePoint = (lat: number, lng: number, locationName: string) => {
    setInitialCoords({ lat, lng, locationName });
    setPointToEdit(null);
    setIsEditorOpen(true);
  };

  // Main Save Diary Footprint Trigger
  const handleSaveDiary = (pointData: Omit<MemoryPoint, 'createdAt'>) => {
    const existing = points.find((p) => p.id === pointData.id);
    let updated: MemoryPoint[];

    if (existing) {
      updated = points.map((p) =>
        p.id === pointData.id ? { ...p, ...pointData } : p
      );
    } else {
      const newPoint: MemoryPoint = {
        ...pointData,
        createdAt: Date.now(),
      };
      updated = [newPoint, ...points];
    }

    handleSavePoints(updated);
    setSelectedPointId(pointData.id); // Focus details instantly
    setIsEditorOpen(false);
    setPointToEdit(null);
    setInitialCoords(null);
  };

  // Delete Footprint Trigger
  const handleDeleteDiary = (id: string) => {
    const updated = points.filter((p) => p.id !== id);
    handleSavePoints(updated);
    setSelectedPointId(null);
    setIsEditorOpen(false);
    setPointToEdit(null);
  };

  // Trigger Edit Form
  const handleEditTrigger = (point: MemoryPoint) => {
    setPointToEdit(point);
    setInitialCoords(null);
    setSelectedPointId(null); // Close detail sheet first
    setIsEditorOpen(true);
  };

  // Recovery triggers for Profile tab
  const handleImportBackup = (enrichedPoints: any[]) => {
    const enriched = enrichedPoints.map((p) => ({
      ...p,
      privacyStatus: p.privacyStatus || 'private',
      mood: p.mood || '😊',
      weather: p.weather || '☀️',
    }));
    handleSavePoints(enriched);
    setSelectedPointId(null);
    setActiveTab('map');
  };

  const handleRestoreSeeds = () => {
    const seededPrivatePoints: MemoryPoint[] = INITIAL_POINTS.map((p, idx) => ({
      ...p,
      privacyStatus: 'private',
      mood: ['😊', '😌', '🧗', '🍜', '💖', '🌈'][idx % 6],
      weather: ['☀️', '☁️', '🌧️', '❄️'][idx % 4],
    }));
    handleSavePoints(seededPrivatePoints);
    setSelectedPointId(null);
    setActiveTab('map');
  };

  const handleClearAll = () => {
    handleSavePoints([]);
    setSelectedPointId(null);
    setActiveTab('map');
  };

  if (!dbLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-page text-text-secondary font-sans select-none">
        <Compass className="w-9 h-9 animate-spin text-brand-primary mb-3" />
        <span className="text-xs font-bold tracking-wider text-text-primary/80">正在开启您的私密数字足迹箱...</span>
      </div>
    );
  }

  // Active memory item for bottom sheet details
  const activeSelectedPoint = points.find((p) => p.id === selectedPointId) || null;

  // General add trigger handler (for global floating "+" button)
  const handleGlobalAddTrigger = () => {
    setInitialCoords({
      lat: 30.2741,
      lng: 120.1551,
      locationName: '西湖风景区',
    });
    setPointToEdit(null);
    setIsEditorOpen(true);
  };

  return (
    <div 
      id="app-canvas-container" 
      className={`h-screen w-screen flex flex-col font-sans overflow-hidden select-none transition-colors duration-300 ${
        darkMode ? 'dark bg-bg-page text-text-primary' : 'bg-bg-page text-text-primary'
      }`}
    >
      
      {/* 1. Primary Page Content Switcher (Tabbed screens occupy full space) */}
      <div className="flex-1 overflow-hidden relative pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'map' && (
            <motion.div
              key="map-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <MapContainer
                points={points}
                selectedPointId={selectedPointId}
                onSelectPoint={setSelectedPointId}
                onCreatePointAtCoords={handleMapCreatePoint}
                onAddTrigger={handleGlobalAddTrigger}
                darkMode={darkMode}
              />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col"
            >
              <TimelineView
                points={points}
                selectedPointId={selectedPointId}
                onSelectPoint={setSelectedPointId}
                onEditPoint={handleEditTrigger}
                onNavigateToTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col"
            >
              <GalleryView
                points={points}
                onSelectPoint={setSelectedPointId}
                onNavigateToTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col"
            >
              <MyProfileView
                points={points}
                onImportBackup={handleImportBackup}
                onRestoreSeeds={handleRestoreSeeds}
                onClearAll={handleClearAll}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onOpenLogin={() => setIsLoginOpen(true)}
                onOpenEdit={() => setIsEditOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Global Floating Action Button (FAB) (Earthy gradient, travel journal look) */}
      {activeTab !== 'map' && activeTab !== 'profile' && (
        <div className="fixed bottom-20 right-4 z-[999]">
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleGlobalAddTrigger}
            className="flex items-center gap-1.5 px-5 py-3 rounded-full floating-action-button font-bold text-xs min-w-max cursor-pointer focus:outline-none border-none outline-none font-ui"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>记录此刻</span>
          </motion.button>
        </div>
      )}

      {/* 3. Immersive Mobile Bottom Travel Tab Navigator Bar */}
      <nav 
        id="app-bottom-nav" 
        className="fixed bottom-0 inset-x-0 h-16 border-t border-brand-secondary/10 bg-bg-card backdrop-blur-2xl z-[1001] flex items-center justify-around px-2 pb-safe-bottom"
      >
        {[
          { id: 'map', label: '地图', icon: Map },
          { id: 'timeline', label: '时间轴', icon: Calendar },
          { id: 'gallery', label: '相册', icon: ImageIcon },
          { id: 'profile', label: '我的', icon: User },
        ].map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSelectedPointId(null); // Clear selected point on tab change to slide down sheet
              }}
              className="flex flex-col items-center justify-center gap-1 py-1 px-3 w-16 transition-all duration-200 relative cursor-pointer border-none bg-transparent outline-none"
            >
              <Icon 
                className={`w-4.5 h-4.5 transition-colors duration-200 shrink-0 ${
                  isActive 
                    ? 'text-brand-primary scale-105 stroke-[2.5]' 
                    : 'text-text-muted/80'
                }`} 
              />
              <span 
                className={`text-[9px] font-bold tracking-tight transition-all duration-200 leading-tight ${
                  isActive 
                    ? 'text-text-primary font-extrabold' 
                    : 'text-text-muted/70 font-normal'
                }`}
              >
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 w-8 h-1 bg-brand-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* 4. Sliding Details Bottom Sheet Detail View */}
      <BottomSheet
        point={activeSelectedPoint}
        onClose={() => setSelectedPointId(null)}
        onEdit={handleEditTrigger}
        onDelete={handleDeleteDiary}
      />

      {/* 5. Full Screen Lined Journal Editor Sheet Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-5 pointer-events-none">
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditorOpen(false);
                setPointToEdit(null);
                setInitialCoords(null);
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-[3px] pointer-events-auto"
            />

            {/* Editing Box sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-t-[30px] sm:rounded-3xl border-t sm:border border-slate-200/40 dark:border-zinc-800 shadow-2xl flex flex-col h-[92vh] sm:h-[85vh] max-h-[96vh] pointer-events-auto overflow-hidden pb-safe-bottom"
            >
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <MemoryForm
                  pointToEdit={pointToEdit}
                  initialCoords={initialCoords}
                  onSave={handleSaveDiary}
                  onDelete={handleDeleteDiary}
                  onCancel={() => {
                    setIsEditorOpen(false);
                    setPointToEdit(null);
                    setInitialCoords(null);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Global Overlays with true full viewport Gaussian blur coverage */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />

      <EditProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
      />

    </div>
  );
}
