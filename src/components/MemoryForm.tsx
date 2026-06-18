/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { MemoryPoint, TravelCategory } from '../types';
import { TRAVEL_CATEGORIES } from '../data';
import { 
  X, 
  MapPin, 
  Tag, 
  Calendar, 
  Lock, 
  Trash2, 
  Camera, 
  RefreshCw,
  Globe,
  FileText
} from 'lucide-react';

interface MemoryFormProps {
  pointToEdit: MemoryPoint | null; // Null means Add mode
  initialCoords: { lat: number; lng: number; locationName: string } | null;
  onSave: (point: Omit<MemoryPoint, 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

const MOOD_OPTIONS = [
  { emoji: '😊', label: '开心' },
  { emoji: '😌', label: '平静' },
  { emoji: '🧗', label: '踏实' },
  { emoji: '🍜', label: '满足' },
  { emoji: '🌧️', label: '怀旧' },
  { emoji: '🌊', label: '忘忧' },
  { emoji: '💖', label: '感动' },
];

const WEATHER_OPTIONS = [
  { emoji: '☀️', label: '晴朗' },
  { emoji: '☁️', label: '多云' },
  { emoji: '🌧️', label: '细雨' },
  { emoji: '❄️', label: '瑞雪' },
  { emoji: '💨', label: '有风' },
  { emoji: '🌫️', label: '薄雾' },
];

export default function MemoryForm({
  pointToEdit,
  initialCoords,
  onSave,
  onDelete,
  onCancel,
}: MemoryFormProps) {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lat, setLat] = useState(30.0);
  const [lng, setLng] = useState(120.0);
  const [category, setCategory] = useState<TravelCategory>('other');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<string[]>([]);
  const [mood, setMood] = useState('😊');
  const [weather, setWeather] = useState('☀️');
  const [privacyStatus, setPrivacyStatus] = useState<'private' | 'public'>('private'); // Always private by default
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state on load/change
  useEffect(() => {
    if (pointToEdit) {
      setTitle(pointToEdit.title);
      setLocationName(pointToEdit.locationName);
      setDate(pointToEdit.date);
      setLat(pointToEdit.lat);
      setLng(pointToEdit.lng);
      setCategory(pointToEdit.category);
      setNotes(pointToEdit.notes);
      setTags(pointToEdit.tags);
      setRating(pointToEdit.rating);
      setImages(pointToEdit.images);
      setMood(pointToEdit.mood || '😊');
      setWeather(pointToEdit.weather || '☀️');
      setPrivacyStatus(pointToEdit.privacyStatus || 'private');
    } else if (initialCoords) {
      setTitle('');
      setLocationName(initialCoords.locationName);
      setDate(new Date().toISOString().split('T')[0]);
      setLat(initialCoords.lat);
      setLng(initialCoords.lng);
      setCategory('other');
      setNotes('');
      setTags([]);
      setRating(5);
      setImages([]);
      setMood('😊');
      setWeather('☀️');
      setPrivacyStatus('private');
    }
  }, [pointToEdit, initialCoords]);

  // Image Upload compressor helper
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    const loadedBase64s: string[] = [];
    let processedCount = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Standard quality JPEG mapping
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          loadedBase64s.push(compressedBase64);
          processedCount++;

          if (processedCount === files.length) {
            setImages((prev) => [...prev, ...loadedBase64s]);
            setIsCompressing(false);
          }
        };
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  // Tag helper
  const handleAddTag = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanedTag = tagInput.trim().replace(/^#/, '');
      if (cleanedTag && !tags.includes(cleanedTag)) {
        setTags((prev) => [...prev, cleanedTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入此次回忆的简短标题');
      return;
    }
    if (!locationName.trim()) {
      alert('请输入所属地点');
      return;
    }

    onSave({
      id: pointToEdit ? pointToEdit.id : Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      locationName: locationName.trim(),
      date,
      lat: Number(lat),
      lng: Number(lng),
      category,
      notes: notes.trim(),
      tags,
      images,
      rating,
      mood,
      weather,
      privacyStatus,
    });
  };

  return (
    <div className="bg-bg-page text-text-primary rounded-t-[24px] max-h-full overflow-y-auto flex flex-col font-ui select-none border-0">
      
      {/* 1. iOS Translucent Header bar */}
      <div className="bg-bg-card p-4 shrink-0 border-b border-brand-secondary/10 flex items-center justify-between font-ui">
        <div className="flex items-center gap-2 font-ui">
          <FileText className="w-5 h-5 text-brand-primary" />
          <div className="font-ui">
            <h1 className="text-[17px] font-bold tracking-tight text-text-primary leading-tight font-ui">
              记录此刻
            </h1>
            <p className="text-[13px] text-text-secondary mt-0.5 font-ui">今天在这里发生了什么？</p>
          </div>
        </div>
        
        <button
          onClick={onCancel}
          className="text-text-secondary hover:opacity-85 p-1.5 bg-bg-soft rounded-full hover:scale-103 cursor-pointer border-none font-ui font-bold"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        
        {/* 2. Apple Maps Styled Location Card */}
        <div className="p-3 bg-bg-card border border-brand-secondary/8 rounded-[12px] flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-bold text-text-muted block mb-0.5">记录地点</span>
            <input
              type="text"
              required
              placeholder="西湖边长椅"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full text-[15px] font-bold bg-transparent outline-none border-none text-text-primary p-0"
            />
          </div>
        </div>

        {/* 3. Lined Notebook Title Entry */}
        <div className="space-y-1.5">
          <span className="text-[13px] font-bold text-text-muted tracking-wide pl-0.5">日记标题</span>
          <input
            type="text"
            required
            placeholder="今天发生了什么故事？"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-[17px] font-bold bg-transparent border-b border-brand-secondary/15 focus:border-brand-primary outline-none py-1 transition-colors placeholder:text-text-muted text-text-primary"
          />
        </div>

        {/* 4. Elegant Date and category picks */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[13px] font-semibold text-text-muted tracking-wide pl-0.5">纪念日</span>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-[13px] bg-bg-soft border border-transparent rounded-[10px] outline-none text-text-primary cursor-pointer hover:bg-bg-soft/80"
              />
              <Calendar className="absolute left-2.5 top-2.5 w-4.5 h-4.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[13px] font-semibold text-text-muted tracking-wide pl-0.5">分类属性</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TravelCategory)}
              className="w-full px-3 py-2 text-[13px] bg-bg-soft border border-transparent rounded-[10px] outline-none text-text-primary cursor-pointer hover:bg-bg-soft/80"
            >
              {TRAVEL_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5. Mood Selector pills */}
        <div className="space-y-1.5">
          <span className="text-[13px] font-semibold text-text-muted tracking-wide pl-0.5">心中情绪</span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {MOOD_OPTIONS.map((opt) => {
              const isSelected = mood === opt.emoji;
              return (
                <button
                  key={opt.emoji}
                  type="button"
                  onClick={() => setMood(opt.emoji)}
                  className={`px-3 py-1.5 rounded-[10px] border text-[13px] shrink-0 font-bold flex items-center gap-1 transition-all snap-center cursor-pointer ${
                    isSelected
                      ? 'bg-brand-primary/10 border-transparent text-brand-primary shadow-xs'
                      : 'bg-bg-soft border-transparent text-text-secondary hover:bg-opacity-80'
                  }`}
                >
                  <span className="text-sm">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Weather options */}
        <div className="space-y-1.5">
          <span className="text-[13px] font-semibold text-text-muted tracking-wide pl-0.5">晴雨天气</span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {WEATHER_OPTIONS.map((opt) => {
              const isSelected = weather === opt.emoji;
              return (
                <button
                  key={opt.emoji}
                  type="button"
                  onClick={() => setWeather(opt.emoji)}
                  className={`px-3 py-1.5 rounded-[10px] border text-[13px] shrink-0 font-bold flex items-center gap-1 transition-all snap-center cursor-pointer ${
                    isSelected
                      ? 'bg-brand-accent/10 border-transparent text-brand-accent'
                      : 'bg-bg-soft border-transparent text-text-secondary hover:bg-opacity-80'
                  }`}
                >
                  <span className="text-sm">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Privacy status selection toggler */}
        <div className="space-y-1.5">
          <span className="text-[13px] font-semibold text-text-muted tracking-wide pl-0.5">可见性选择</span>
          <div className="flex items-center justify-between p-3 bg-bg-card border border-brand-secondary/8 rounded-[12px]">
            <div className="flex items-center gap-2.5">
              {privacyStatus === 'private' ? (
                <>
                  <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold text-text-primary">仅自己可见 (Private)</div>
                    <p className="text-[11px] text-text-muted mt-0.5">独存的私人日记</p>
                  </div>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-brand-primary shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold text-text-primary">公开可见 (Public)</div>
                    <p className="text-[11px] text-text-muted mt-0.5">展示在足迹墙中</p>
                  </div>
                </>
              )}
            </div>

            {/* iOS Toggler Switch button */}
            <button
              type="button"
              onClick={() => setPrivacyStatus(p => p === 'private' ? 'public' : 'private')}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none border-none cursor-pointer ${
                privacyStatus === 'private' ? 'bg-brand-primary' : 'bg-bg-soft'
              }`}
            >
              <div 
                className={`w-5 h-5 bg-[#FFF9EF] rounded-full shadow-md transition-transform duration-200 ${
                  privacyStatus === 'private' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 8. Expansive beautiful Dairy Journal Note block with 1.85 line height */}
        <div className="space-y-1.5 font-ui font-bold">
          <span className="text-[13px] font-bold text-text-muted tracking-wide pl-0.5 font-ui">岁月笔记</span>
          <div className="rounded-[12px] border border-brand-secondary/12 p-4 bg-bg-soft/40 focus-within:ring-1 focus-within:ring-brand-primary/25 transition-all">
            <textarea
              placeholder="今天在这里，发生了什么温暖的故事？在这个专属的地方，记起当时的微风和心声吧..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="w-full text-[15px] leading-[1.85] bg-transparent outline-none border-none text-text-primary resize-none placeholder:text-text-muted font-light font-serif tracking-wide"
            />
          </div>
        </div>

        {/* 9. Tags entry */}
        <div className="space-y-1.5">
          <span className="text-[13px] font-semibold text-text-muted tracking-wide pl-0.5">记事书签 (按 Enter 完成)</span>
          <div className="flex flex-wrap gap-1.5 p-2 bg-bg-soft border border-transparent rounded-[12px] min-h-12 items-center">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-brand-secondary/10 text-brand-secondary px-2.5 py-0.5 rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="hover:scale-110 text-brand-secondary rounded-full p-0.5 transition-transform cursor-pointer border-none bg-transparent"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            <div className="flex-1 flex min-w-[100px] items-center">
              <span className="text-xs text-text-muted pl-1">#</span>
              <input
                type="text"
                placeholder="增加书签"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full text-xs bg-transparent outline-none py-0.5 text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* 10. Apple Photos insert uploader */}
        <div className="space-y-1.5">
          <span className="text-[13px] font-semibold text-text-muted tracking-wide pl-0.5">媒体备忘相册 (最多 8 张)</span>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-[10px] overflow-hidden group border border-brand-secondary/8 bg-bg-soft">
                <img
                  src={img}
                  alt={`mem-img-${idx}`}
                  className="w-full h-full object-cover group-hover:scale-103 duration-200 transition-all"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-650/95 text-[#FFF9EF] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {images.length < 8 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="aspect-square rounded-[10px] border-2 border-dashed border-brand-secondary/25 hover:border-brand-primary flex flex-col items-center justify-center gap-1 bg-bg-soft text-text-muted hover:text-brand-primary transition-all cursor-pointer disabled:opacity-50"
              >
                {isCompressing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5.5 h-5.5 opacity-70" />
                    <span className="text-[8px] font-bold">加图 ({images.length}/8)</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Quick coordinates alignment labels */}
        <div className="flex justify-between items-center text-[10px] text-text-muted font-mono px-1">
          <span>十进制纬度: {lat.toFixed(5)}°</span>
          <span>十进制经度: {lng.toFixed(5)}°</span>
        </div>

        {/* Save/delete controls bar */}
        <div className="flex items-center gap-3 pt-3.5 border-t border-brand-secondary/10">
          {pointToEdit && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('您确定要彻底删除这段心爱的日记记忆吗？删除之后将无处寻找。')) {
                  onDelete(pointToEdit.id);
                }
              }}
              className="flex items-center gap-1 px-4 py-3 bg-red-50 hover:bg-red-100/10 text-red-650 rounded-full text-xs font-bold transition-colors shrink-0 border-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>整编销毁</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full text-xs py-3 font-bold cursor-pointer border-none transition-all secondary-chip text-center"
          >
            返回
          </button>

          <button
            type="submit"
            className="flex-1 rounded-full text-xs py-3 font-bold cursor-pointer border-none transition-all primary-button text-center shadow-md"
          >
            保存记录
          </button>
        </div>

      </form>
    </div>
  );
}
