/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryPoint } from '../types';
import { TRAVEL_CATEGORIES } from '../data';
import { 
  X, 
  MapPin, 
  Calendar, 
  Tag, 
  Lock, 
  Globe, 
  Edit3, 
  Trash2, 
  MoreHorizontal, 
  ChevronUp, 
  ChevronDown, 
  Inbox
} from 'lucide-react';

interface BottomSheetProps {
  point: MemoryPoint | null;
  onClose: () => void;
  onEdit: (point: MemoryPoint) => void;
  onDelete: (id: string) => void;
}

export default function BottomSheet({
  point,
  onClose,
  onEdit,
  onDelete,
}: BottomSheetProps) {
  const [sheetState, setSheetState] = useState<'half' | 'full'>('half');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Auto reset state on point change
  useEffect(() => {
    if (point) {
      setSheetState('half');
      setShowMoreMenu(false);
    }
  }, [point]);

  // Prevent body scroll when fully expanded on mobile
  useEffect(() => {
    if (point && sheetState === 'full') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [point, sheetState]);

  if (!point) return null;

  const categoryConfig = TRAVEL_CATEGORIES.find((c) => c.value === point.category) || TRAVEL_CATEGORIES[TRAVEL_CATEGORIES.length - 1];

  const toggleSheetState = () => {
    if (sheetState === 'half') {
      setSheetState('full');
    } else {
      setSheetState('half');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-end justify-center pointer-events-none">
        
        {/* iOS subtle dynamic overlay background - Only active when half or full */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: sheetState === 'full' ? 0.4 : 0.15 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black backdrop-blur-[1px] pointer-events-auto"
        />

        {/* Sliding Apple-style Card Sheet */}
        <motion.div
          id="apple-bottom-sheet"
          className={`relative w-full max-w-lg bg-bg-card backdrop-blur-2xl rounded-t-[20px] sm:rounded-t-[24px] border-t border-brand-secondary/12 shadow-2xl flex flex-col pointer-events-auto transition-all duration-300 ${
            sheetState === 'full' 
              ? 'h-[88vh] md:h-[82vh]' 
              : 'h-[48vh]'
          } pb-safe-bottom`}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        >
          {/* Top iOS drag handle block */}
          <div 
            onClick={toggleSheetState}
            className="w-full flex flex-col items-center pt-3 pb-2 shrink-0 cursor-pointer touch-none hover:bg-slate-500/5 dark:hover:bg-zinc-800/20 rounded-t-[24px] select-none"
          >
            {/* Minimalist Pill Drag Bar */}
            <div className="w-9 h-1.2 bg-brand-secondary/20 rounded-full transition-colors" />
          </div>

          {/* Core Status & Actions Toolbar Row */}
          <div className="flex items-center justify-between px-5 py-2 border-b border-brand-secondary/10 shrink-0">
            {/* iOS Styled Privacy Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-bg-soft text-text-secondary rounded-full text-xs font-semibold">
              {point.privacyStatus === 'public' ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-brand-primary" />
                  <span>公开可见</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>仅自己可见</span>
                </>
              )}
            </div>

            {/* Clean Rounded iOS Icon buttons */}
            <div className="flex items-center gap-2 relative">
              <button
                onClick={toggleSheetState}
                className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-text-secondary transition-colors text-[13px] font-medium flex items-center gap-0.5"
                title={sheetState === 'full' ? '收起' : '展开'}
              >
                <span className="text-[13px] font-bold">{sheetState === 'full' ? '收起' : '展开'}</span>
                {sheetState === 'full' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {/* More Actions Dropdown selector */}
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-text-secondary transition-colors cursor-pointer"
                title="更多操作"
              >
                <MoreHorizontal className="w-4.5 h-4.5" />
              </button>

              {/* Circular iOS close x */}
              <button
                onClick={onClose}
                className="p-1.5 bg-bg-soft hover:opacity-80 text-text-primary rounded-full transition-colors cursor-pointer border-none"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Apple-style actions context modal */}
              <AnimatePresence>
                {showMoreMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-10 w-44 bg-bg-card backdrop-blur-3xl border border-brand-secondary/15 rounded-2xl shadow-xl p-1.5 z-50 flex flex-col animate-fadeIn"
                    >
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          onEdit(point);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 rounded-xl text-left text-xs text-text-primary font-bold transition-colors border-none bg-transparent"
                      >
                        <Edit3 className="w-4 h-4 text-brand-primary" />
                        <span>修编足迹日记</span>
                      </button>
                      
                      <div className="h-px bg-brand-secondary/10 my-1" />
                      
                      <button
                        onClick={() => {
                          setShowMoreMenu(false);
                          if (window.confirm('您确定要彻底删除这段心爱的回忆日记吗？此操作不可撤销。')) {
                            onDelete(point.id);
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-red-55 dark:hover:bg-red-950/20 rounded-xl text-left text-xs text-red-650 dark:text-red-450 font-bold transition-colors border-none bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>彻底删除回忆</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Primary text stream & photos */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide">
            
            {/* Header Content Info */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-text-muted">
                <span className="text-sm">{categoryConfig.icon}</span>
                <span className="font-semibold uppercase tracking-wider text-text-secondary px-2.5 py-0.5 bg-bg-soft rounded-md">
                  {categoryConfig.label}
                </span>
                {point.mood && (
                  <span className="font-semibold text-text-secondary bg-bg-soft px-2.5 py-0.5 rounded-md">
                    心情: {point.mood} {point.weather && `| 天气: ${point.weather}`}
                  </span>
                )}
              </div>
              
              <h1 className="text-xl font-bold text-text-primary tracking-tight leading-snug">
                {point.title}
              </h1>
            </div>

            {/* Geographical details banner */}
            <div className="flex flex-wrap gap-3 py-2.5 text-[13px] border-b border-brand-secondary/10">
              <div className="flex items-center gap-1.5 bg-bg-soft px-3 py-1 rounded-[8px]">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <span className="font-semibold text-text-secondary">{point.date}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-bg-soft px-3 py-1 rounded-[8px] min-w-0 flex-1">
                <MapPin className="w-4 h-4 text-brand-accent shrink-0" />
                <span className="font-semibold text-text-secondary truncate">{point.locationName}</span>
              </div>
            </div>

            {/* Inline Photos Frame (Apple Photos style grid) */}
            {point.images && point.images.length > 0 && (
              <div className="pt-1 select-none">
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide snap-x">
                  {point.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-56 h-36 rounded-[12px] overflow-hidden shrink-0 snap-center bg-bg-soft border border-brand-secondary/10"
                    >
                      <img
                        src={img}
                        alt={`media-${idx}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Apple Notes Styled Diary block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-muted font-bold uppercase tracking-wider pl-0.5">
                <span>岁月笔记</span>
                {point.rating > 0 && (
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: Math.min(point.rating, 5) }).map((_, rIdx) => (
                      <span key={rIdx} className="text-[11px]">★</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div 
                className={`relative px-4 py-3.5 bg-bg-soft/50 border border-brand-secondary/8 rounded-[12px] transition-all font-serif ${
                  sheetState === 'half' ? 'line-clamp-4 max-h-32 overflow-hidden' : ''
                }`}
              >
                <p className="text-[15px] text-text-primary/95 leading-[1.85] tracking-wide font-light whitespace-pre-wrap font-serif">
                  {point.notes || '这里静静地流淌，并没有刻下回忆的文字。'}
                </p>

                {/* Fade transparent overlay for Half view */}
                {sheetState === 'half' && (
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-page dark:from-[#1C1C1E] to-transparent pointer-events-none" />
                )}
              </div>

              {/* Smooth expand bar */}
              {sheetState === 'half' && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => setSheetState('full')}
                    className="px-4.5 py-2 rounded-full font-bold text-xs cursor-pointer transition-all secondary-chip active text-center flex items-center gap-1 hover:scale-103"
                  >
                    <span>展开日记全文</span>
                    <ChevronDown className="w-3.5 h-3.5 animate-bounceSlow" />
                  </button>
                </div>
              )}
            </div>

            {/* Full information detail elements */}
            {sheetState === 'full' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 pt-1.5 border-t border-brand-secondary/10"
              >
                {/* Tags block */}
                {point.tags && point.tags.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wide pl-0.5">回忆书签</span>
                    <div className="flex flex-wrap gap-1.5">
                      {point.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-xs font-medium bg-brand-secondary/10 text-brand-secondary border border-transparent px-3 py-1 rounded-full flex items-center gap-1.5"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coordinates footer details */}
                <div className="flex justify-between items-center text-xs text-text-muted font-mono border-t border-brand-secondary/10 pt-3">
                  <span>编号: {point.id.toUpperCase()}</span>
                  <span>坐标: {point.lat.toFixed(5)}°N, {point.lng.toFixed(5)}°E</span>
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
