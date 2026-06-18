/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MemoryPoint, TravelCategory } from './types';

export interface CategoryOption {
  value: TravelCategory;
  label: string;
  icon: string;
  color: string; // Tailwind class
  markerColor: string; // Hex code for Map marker
}

export const TRAVEL_CATEGORIES: CategoryOption[] = [
  {
    value: 'culture',
    label: '日常琐碎',
    icon: '☕',
    color: 'bg-white dark:bg-zinc-90 w-full hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/50 dark:border-zinc-800',
    markerColor: '#007AFF', // Clean iOS blue
  },
  {
    value: 'food',
    label: '吃喝记录',
    icon: '🍜',
    color: 'bg-white dark:bg-zinc-900 w-full hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/50 dark:border-zinc-800',
    markerColor: '#FF9500', // iOS Orange
  },
  {
    value: 'nature',
    label: '风物景色',
    icon: '🌿',
    color: 'bg-white dark:bg-zinc-900 w-full hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/50 dark:border-zinc-800',
    markerColor: '#34C759', // iOS Green
  },
  {
    value: 'sightseeing',
    label: '走走停停',
    icon: '🚶',
    color: 'bg-white dark:bg-zinc-900 w-full hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/50 dark:border-zinc-800',
    markerColor: '#AF52DE', // iOS Purple
  },
  {
    value: 'hotel',
    label: '起居落脚',
    icon: '🏠',
    color: 'bg-white dark:bg-zinc-900 w-full hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/50 dark:border-zinc-800',
    markerColor: '#5856D6', // Indigo
  },
  {
    value: 'transit',
    label: '在旅途中',
    icon: '🚃',
    color: 'bg-white dark:bg-zinc-900 w-full hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/50 dark:border-zinc-800',
    markerColor: '#8E8E93', // Cool grey
  },
  {
    value: 'other',
    label: '漫漫随笔',
    icon: '📝',
    color: 'bg-white dark:bg-zinc-900 w-full hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200/50 dark:border-zinc-800',
    markerColor: '#30B0C7', // Teal
  },
];

export const INITIAL_POINTS: MemoryPoint[] = [
  {
    id: 'mem-1',
    title: '雨后的西湖',
    date: '2026-04-12',
    lat: 30.2524,
    lng: 120.1491,
    locationName: '西湖边长椅',
    notes: '下班时忽然下起大雨，好消息是在西湖边散步时刚好雨停了。躲在梧桐树下的长椅上数着波光。空气里都是泥土和湖水微带清凉的香气，那一刻觉得活着真踏实。',
    category: 'nature',
    tags: ['雨后', '散步', '安宁'],
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=600',
    ],
    rating: 5,
    createdAt: 1773356400000,
    mood: '😌',
    weather: '🌧️',
    privacyStatus: 'private',
  },
  {
    id: 'mem-2',
    title: '凌晨的便利店',
    date: '2026-04-18',
    lat: 30.2731,
    lng: 120.1565,
    locationName: '罗森便利店 (延安路店)',
    notes: '加班到深夜，在熟悉的十字路口转进罗森。点了一碗冒着热气的关东煮，汤底微微有些烫口。收银员礼貌地微笑，看着玻璃窗外偶尔经过的出租车，这一天的疲惫突然就被温饱治愈了。',
    category: 'food',
    tags: ['温饱', '深夜', '平静'],
    images: [
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600',
    ],
    rating: 5,
    createdAt: 1773874800000,
    mood: '😊',
    weather: '☁️',
    privacyStatus: 'private',
  },
  {
    id: 'mem-3',
    title: '第一次一个人看海',
    date: '2026-05-02',
    lat: 31.2211,
    lng: 121.5552,
    locationName: '海角灯塔碎石滩',
    notes: '独自坐了两个小时的城际列车来到海岸。坐在青灰色的礁石滩上听浪声一层层拍打上来。没有别人，海风直直灌进风衣里，纸杯里的温水开始变凉。天地很开阔，一瞬间想通了许多困扰很久的琐事。',
    category: 'sightseeing',
    tags: ['望远', '疗愈', '独处'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    ],
    rating: 5,
    createdAt: 1775084400000,
    mood: '🌊',
    weather: '💨',
    privacyStatus: 'private',
  },
  {
    id: 'mem-4',
    title: '周五晚上的烧烤摊',
    date: '2026-05-15',
    lat: 31.2304,
    lng: 121.4737,
    locationName: '街角无名炭火烧烤',
    notes: '和老朋友在老弄堂口的红塑料板凳上坐下。炭火青烟徐徐上升，撒落的孜然和红椒粉在烤肉上滋滋作响。大家都说着那些无关痛痒却足够纯粹的学生笑谈，笑声在夏夜的微风里被吹得很远。',
    category: 'food',
    tags: ['欢聚', '市井', '满足'],
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    ],
    rating: 5,
    createdAt: 1776207600000,
    mood: '🍜',
    weather: '☀️',
    privacyStatus: 'private',
  },
  {
    id: 'mem-5',
    title: '秋叶落满地的林荫道',
    date: '2026-05-20',
    lat: 39.9042,
    lng: 116.4074,
    locationName: '武康路绿荫过道',
    notes: '微风袭过，两旁的法国梧桐落叶宛如起舞的白碟。踩在干瘪干燥的叶片堆上，发出的沙沙声连绵不断。阳光穿透繁茂的叶网照在肩膀，秋意微凉而厚重，散步变成写意的定格。',
    category: 'nature',
    tags: ['梧桐', '行进', '静思'],
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600',
    ],
    rating: 4,
    createdAt: 1776639600000,
    mood: '🍃',
    weather: '☀️',
    privacyStatus: 'private',
  },
  {
    id: 'mem-6',
    title: '偶然避雨买完咖啡',
    date: '2026-05-28',
    lat: 39.9234,
    lng: 116.3654,
    locationName: '窄巷街角手冲咖啡馆',
    notes: '为了躲过头顶阴沉的骤雨，急匆匆钻进斑驳木门后的小咖啡馆。店主正专心吹着黑胶唱片。点了一杯略带酸橙芳香的热手冲坐在临街的窄窗边，看着大颗雨滴顺着旧瓦片流落，心完全静了下来。',
    category: 'culture',
    tags: ['温暖', '避雨', '香醇'],
    images: [
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=600',
    ],
    rating: 4,
    createdAt: 1777330800000,
    mood: '😌',
    weather: '🌧️',
    privacyStatus: 'private',
  },
];
