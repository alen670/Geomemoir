/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MemoryPoint, TravelCategory } from '../types';
import { TRAVEL_CATEGORIES } from '../data';
import { Search, Calendar, Tag, Lock, ArrowUpDown, MapPin, Inbox } from 'lucide-react';

interface TimelineViewProps {
  points: MemoryPoint[];
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  onEditPoint: (point: MemoryPoint) => void;
  onNavigateToTab: (tab: 'map' | 'timeline' | 'gallery' | 'statistics' | 'profile') => void;
}

type SortOrder = 'newest' | 'oldest';

export default function TimelineView({
  points,
  selectedPointId,
  onSelectPoint,
  onEditPoint,
  onNavigateToTab,
}: TimelineViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TravelCategory | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Filter & sort points
  const sortedPoints = [...points]
    .filter((point) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = point.title.toLowerCase().includes(query);
        const matchesLocation = point.locationName.toLowerCase().includes(query);
        const matchesNotes = point.notes.toLowerCase().includes(query);
        const matchesTags = point.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesLocation && !matchesNotes && !matchesTags) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && point.category !== selectedCategory) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  // Group by month
  const groupMemoriesByMonth = () => {
    const groups: { [key: string]: MemoryPoint[] } = {};
    sortedPoints.forEach((point) => {
      const dateObj = new Date(point.date);
      if (isNaN(dateObj.getTime())) {
        const yearMonth = '未知日期';
        if (!groups[yearMonth]) groups[yearMonth] = [];
        groups[yearMonth].push(point);
      } else {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yearMonth = `${year}年 ${month}月`;
        if (!groups[yearMonth]) groups[yearMonth] = [];
        groups[yearMonth].push(point);
      }
    });
    return Object.entries(groups);
  };

  const groupedTimeline = groupMemoriesByMonth();

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-page overflow-hidden font-ui text-text-primary select-none">
      
      {/* 1. Cupertino iOS Search & Header Segment (Clean off-white padding background) */}
      <div className="bg-bg-card backdrop-blur-2xl px-4 pt-4 pb-0 items-center border-b border-brand-secondary/10 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-[28px] font-bold tracking-tight text-text-primary font-ui">时间轴</h1>
          
          <button
            onClick={() => setSortOrder((p) => (p === 'newest' ? 'oldest' : 'newest'))}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-brand-primary cursor-pointer shrink-0 border-none bg-transparent"
            title={sortOrder === 'newest' ? '最旧优先' : '最新优先'}
          >
            <ArrowUpDown className="w-5 h-5 animate-scale" />
          </button>
        </div>

        {/* Apple Style search block */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="搜索回忆内容、地标或 #标签"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-bg-soft border-none rounded-xl outline-none focus:ring-1 focus:ring-brand-primary/25 text-text-primary placeholder-[#9A948C] font-bold font-ui"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
        </div>

        {/* Categories Chips bar */}
        <div className="flex gap-2 pb-3 w-full overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 cursor-pointer transition-all secondary-chip font-ui ${
              selectedCategory === 'all' ? 'active' : ''
            }`}
          >
            全部 ({points.length})
          </button>
          
          {TRAVEL_CATEGORIES.map((cat) => {
            const count = points.filter((p) => p.category === cat.value).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 cursor-pointer transition-all flex items-center gap-1.5 secondary-chip font-ui ${
                  selectedCategory === cat.value ? 'active' : ''
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Primary Page Content Area */}
      <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide font-ui">
        {groupedTimeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[55vh] text-[#8E8E93] px-4 font-ui">
            <Inbox className="w-10 h-10 text-text-muted/40 mb-3" />
            <p className="text-[15px] font-bold text-text-secondary">还没有记忆点</p>
            <p className="text-[13px] mt-1 text-text-muted max-w-xs leading-relaxed font-ui">
              在地图上点一下，记录你来过的地方。
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedTimeline.map(([monthLabel, memories]) => (
              <div key={monthLabel} className="space-y-[12px] font-ui">
                
                {/* Year/Month Divider (Apple Standard header block) */}
                <div className="sticky top-0 bg-bg-page/95 backdrop-blur-md py-2 z-10 flex items-center gap-1.5 px-4 transition-all font-ui">
                  <span className="text-[13px] font-extrabold text-brand-secondary uppercase tracking-wider font-ui">
                    {monthLabel}
                  </span>
                  <div className="h-px bg-brand-secondary/10 flex-1 ml-1" />
                  <span className="text-[11px] font-bold text-text-muted font-ui">
                    {memories.length} 篇回忆
                  </span>
                </div>

                {/* Sub-list of memories with strictly balanced spaces */}
                <div className="space-y-4 px-4 font-ui">
                  {memories.map((point) => {
                    const firstImage = point.images && point.images.length > 0 ? point.images[0] : null;
                    const catConfig = TRAVEL_CATEGORIES.find(c => c.value === point.category) || TRAVEL_CATEGORIES[TRAVEL_CATEGORIES.length - 1];
                    const isSelected = selectedPointId === point.id;

                    return (
                      <div
                        key={point.id}
                        onClick={() => {
                          onSelectPoint(point.id);
                          onNavigateToTab('map');
                        }}
                        className={`bg-bg-card rounded-[18px] p-4.5 border border-brand-secondary/10 hover:border-brand-secondary/20 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col md:flex-row gap-4 justify-between font-ui ${
                          isSelected ? 'ring-2 ring-brand-primary/45 shadow-lg shadow-brand-primary/10' : ''
                        }`}
                      >
                        {/* Summary side */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between font-ui">
                          <div className="space-y-2.5">
                            {/* Metadata labels */}
                            <div className="flex items-center gap-1.5 flex-wrap text-xs font-ui">
                              <span className="font-bold text-text-secondary bg-bg-soft px-2.5 py-0.5 rounded-lg font-ui">
                                {point.date}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-brand-secondary/20" />
                              <span className="text-brand-primary font-bold flex items-center gap-1 bg-brand-primary/5 px-2.5 py-0.5 rounded-lg font-ui">
                                <MapPin className="w-3 h-3 text-brand-accent animate-pulse" />
                                {point.locationName}
                              </span>
                              {point.privacyStatus === 'private' && (
                                <Lock className="w-3.5 h-3.5 text-text-muted" />
                              )}
                            </div>

                            {/* Crisp Titles with specified 17px size */}
                            <h3 className="text-[17px] font-bold text-text-primary leading-snug tracking-tight truncate font-ui">
                              {point.title}
                            </h3>

                            {/* Cozy lines of descriptions with 15px size */}
                            {point.notes && (
                              <p className="text-[14px] text-text-secondary/90 leading-[1.85] tracking-wide line-clamp-2 md:line-clamp-3 font-light font-serif">
                                {point.notes}
                              </p>
                            )}
                          </div>

                          {/* Chips Section with 13px captions */}
                          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2 border-t border-brand-secondary/10 text-[13px] font-ui">
                            {point.mood && (
                              <span className="font-bold text-text-secondary bg-bg-soft px-2.5 py-0.5 rounded-full font-ui">
                                心情: {point.mood} {point.weather && `| ${point.weather}`}
                              </span>
                            )}
                            
                            {point.tags && point.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="font-bold text-brand-secondary bg-brand-secondary/8 px-2.5 py-0.5 rounded-full flex items-center gap-0.5 font-ui">
                                <Tag className="w-3 h-3 shrink-0" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Elegant Photos sidebar if relevant */}
                        {firstImage && (
                          <div className="w-full md:w-28 h-24 rounded-[12px] overflow-hidden shrink-0 bg-bg-soft border border-brand-secondary/5 shadow-inner">
                            <img
                              src={firstImage}
                              alt={point.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
