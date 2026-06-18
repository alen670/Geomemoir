/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MemoryPoint {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  lat: number;
  lng: number;
  locationName: string; // human-readable name of site
  notes: string;
  category: TravelCategory;
  tags: string[];
  images: string[]; // Base64 data URLs or online image URLs
  rating: number; // 1 to 5 stars
  createdAt: number;
  mood?: string; // Emoji character representing mood
  weather?: string; // Emoji character representing weather
  privacyStatus?: 'private' | 'public'; // 'private' by default
}

export type TravelCategory = 'sightseeing' | 'food' | 'culture' | 'nature' | 'hotel' | 'transit' | 'other';

export interface JourneyRoute {
  id: string;
  title: string;
  description: string;
  color: string; // Hex color for drawing path
  pointIds: string[]; // Ordered list of MemoryPoint IDs in this route
  createdAt: number;
}

export interface TravelBackup {
  points: MemoryPoint[];
  routes: JourneyRoute[];
  version: string;
  exportedAt: number;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatarUrl?: string;
  account?: string;
  isLoggedIn: boolean;
}

