/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MemoryPoint } from '../types';
import { Camera, MapPin, X, Navigation, Image as ImageIcon } from 'lucide-react';

interface GalleryViewProps {
  points: MemoryPoint[];
  onSelectPoint: (id: string) => void;
  onNavigateToTab: (tab: 'map' | 'timeline' | 'gallery' | 'statistics' | 'profile') => void;
}

type PhotoSegment = 'year' | 'month' | 'all';

export default function GalleryView({
  points,
  onSelectPoint,
  onNavigateToTab,
}: GalleryViewProps) {
  const [segment, setSegment] = useState<PhotoSegment>('all');
  const [previewItem, setPreviewItem] = useState<{
    url: string;
    title: string;
    locationName: string;
    date: string;
    pointId: string;
  } | null>(null);

  // Aggregate all local media assets with parent markers
  const items = points
    .flatMap((point) => {
      return (point.images || []).map((img, imgIdx) => ({
        point,
        url: img,
        key: `${point.id}-${imgIdx}`,
      }));
    })
    .sort((a, b) => new Date(b.point.date).getTime() - new Date(a.point.date).getTime());

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full bg-bg-page text-text-secondary select-none">
        <div className="bg-bg-card rounded-full p-4 mb-3 shadow-md border border-brand-secondary/10">
          <Camera className="w-10 h-10 text-brand-secondary/60" />
        </div>
        <p className="text-[15px] font-bold text-text-primary">目前还没有照片记录</p>
        <p className="text-[13px] text-text-secondary mt-1 max-w-xs leading-relaxed">
          点击地图并记录你来过的地方。在记事时，点击影像摄像头按钮上传本地瞬间。
        </p>
      </div>
    );
  }

  // Group items by Year or YearMonth
  const getGroupedItems = () => {
    if (segment === 'all') return null;

    const grouped: { [key: string]: typeof items } = {};
    items.forEach((item) => {
      const dateObj = new Date(item.point.date);
      if (isNaN(dateObj.getTime())) {
        const key = '未知时期';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      } else {
        const year = dateObj.getFullYear();
        if (segment === 'year') {
          const key = `${year}年`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        } else {
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const key = `${year}年 ${month}月`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        }
      }
    });

    return Object.entries(grouped);
  };

  const groupedPhotos = getGroupedItems();

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-page overflow-hidden font-ui text-text-primary select-none">
      
      {/* 1. iOS Album Title Navigation Bar & Segmented control */}
      <div className="bg-bg-card backdrop-blur-2xl px-5 py-4 border-b border-brand-secondary/10 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold tracking-tight text-text-primary font-ui">相册</h1>
          <span className="text-xs font-semibold text-text-secondary bg-bg-soft px-3 py-1 rounded-[8px] shrink-0 font-ui">
            {items.length} 张回忆
          </span>
        </div>

        {/* Apple Segmented Control */}
        <div className="flex justify-center">
          <div className="bg-bg-soft p-0.5 rounded-[12px] flex w-full max-w-xs justify-between gap-0.5 text-xs font-ui">
            {(['year', 'month', 'all'] as const).map((seg) => (
              <button
                key={seg}
                onClick={() => setSegment(seg)}
                className={`flex-1 py-1.5 rounded-[10px] font-bold transition-all text-center border-none cursor-pointer font-ui ${
                  segment === seg
                    ? 'bg-bg-card text-brand-primary shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {seg === 'year' ? '年' : seg === 'month' ? '月' : '全部'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Photo streaming Grid block */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {segment === 'all' ? (
          /* Plain grid of photos with custom rounded look */
          <div className="grid grid-cols-3 gap-1.5 animate-fadeIn">
            {items.map((item) => (
              <div
                key={item.key}
                onClick={() => setPreviewItem({
                  url: item.url,
                  title: item.point.title,
                  locationName: item.point.locationName,
                  date: item.point.date,
                  pointId: item.point.id
                })}
                className="relative aspect-square rounded-xl overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer bg-bg-soft border border-brand-secondary/8"
              >
                <img
                  src={item.url}
                  alt={item.point.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        ) : (
          /* Segmented groups list */
          <div className="space-y-6">
            {groupedPhotos?.map(([label, groupItems]) => (
              <div key={label} className="space-y-2.5">
                <div className="px-1 flex items-center justify-between text-[13px]">
                  <span className="font-bold text-brand-secondary">
                    {label}
                  </span>
                  <span className="text-text-muted font-bold text-xs">
                    {groupItems.length} 张
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 animate-fadeIn">
                  {groupItems.map((item) => (
                    <div
                      key={item.key}
                      onClick={() => setPreviewItem({
                        url: item.url,
                        title: item.point.title,
                        locationName: item.point.locationName,
                        date: item.point.date,
                        pointId: item.point.id
                      })}
                      className="relative aspect-square rounded-xl overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer bg-bg-soft border border-brand-secondary/8"
                    >
                      <img
                        src={item.url}
                        alt={item.point.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Immersive Overlay Photo view detail Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[4000] bg-black/98 backdrop-blur-3xl flex flex-col justify-between pointer-events-auto select-none font-ui text-white p-4">
          
          {/* Top closing items */}
          <div className="flex items-center justify-between py-2.5 shrink-0 z-50 font-ui">
            <span className="text-[13px] font-bold text-zinc-300 font-ui">
              {previewItem.date}
            </span>
            <button
              onClick={() => setPreviewItem(null)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-colors cursor-pointer border-none font-ui font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Centered big images viewer */}
          <div className="flex-1 flex items-center justify-center relative p-2 min-h-0">
            <img
              src={previewItem.url}
              alt={previewItem.title}
              className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Bottom card actions & title annotations using iOS standards */}
          <div className="p-4 bg-zinc-900 border border-zinc-800/80 rounded-[18px] md:max-w-md mx-auto w-full space-y-4 shrink-0 z-50 mt-4 shadow-xl font-ui">
            
            <div className="space-y-1 font-ui">
              <span className="text-[13px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5 font-ui">足记回忆</span>
              <h3 className="text-[17px] font-bold text-zinc-100 leading-snug font-ui">
                {previewItem.title}
              </h3>
              
              <div className="flex items-center gap-1.5 text-sm text-zinc-400 font-ui">
                <MapPin className="w-4 h-4 text-brand-accent animate-pulse" />
                <span className="truncate font-ui">{previewItem.locationName}</span>
              </div>
            </div>

            {/* Link to center coordinate map actions */}
            <button
              onClick={() => {
                onSelectPoint(previewItem.pointId);
                setPreviewItem(null);
                onNavigateToTab('map');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold text-sm cursor-pointer border-none transition-all primary-button font-ui"
            >
              <Navigation className="w-4 h-4 fill-[#FFF9EF] shrink-0" />
              <span>在地图上定位此瞬间</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
