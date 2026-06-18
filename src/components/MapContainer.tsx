/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, FormEvent } from 'react';
import L from 'leaflet';
import { MemoryPoint } from '../types';
import { TRAVEL_CATEGORIES } from '../data';
import { Search, MapPin, Compass, Plus, EyeOff, Check, X, Navigation } from 'lucide-react';

interface MapContainerProps {
  points: MemoryPoint[];
  selectedPointId: string | null;
  onSelectPoint: (id: string | null) => void;
  onCreatePointAtCoords: (lat: number, lng: number, locationName: string) => void;
  onAddTrigger: () => void;
  darkMode: boolean;
}

type MapProviderType = 'positron' | 'dark';

const TILE_LAYERS = {
  positron: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO',
  },
};

export default function MapContainer({
  points,
  selectedPointId,
  onSelectPoint,
  onCreatePointAtCoords,
  onAddTrigger,
  darkMode,
}: MapContainerProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Keep track of markers and trails
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const trailLineRef = useRef<L.Polyline | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  const [showChronologicalTrail, setShowChronologicalTrail] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [clickActiveCoords, setClickActiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [clickLocationName, setClickLocationName] = useState('');

  // Determine current style based on props
  const mapStyle: MapProviderType = darkMode ? 'dark' : 'positron';

  // 1. Map Initialization
  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) return;

    // Patch Leaflet asset configurations
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapElementRef.current, {
      center: [30.2741, 120.1551], // Center at wonderful West Lake Hangzhou
      zoom: 6,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Load initial map tile layer style
    const layerConf = TILE_LAYERS[mapStyle];
    tileLayerRef.current = L.tileLayer(layerConf.url, { attribution: layerConf.attribution }).addTo(map);

    // Map Single-Click for Coordinates Tagging
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setClickActiveCoords({ lat, lng });
      setClickLocationName('正在解析地址...');

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' }
      })
        .then(res => res.json())
        .then(data => {
          const mainName = data.name || data.address?.scenic_spot || data.address?.attraction || data.address?.village || data.address?.town || data.address?.suburb || data.address?.city || '未命名的地点';
          setClickLocationName(mainName);
        })
        .catch(() => {
          setClickLocationName(`标注点 (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Change Tile layer dynamically to match system dark mode!
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);
    const layerConf = TILE_LAYERS[mapStyle];
    tileLayerRef.current = L.tileLayer(layerConf.url, { attribution: layerConf.attribution }).addTo(map);
  }, [mapStyle]);

  // 3. Render Memory Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove legacy markers that are no longer in DB
    const currentPointIds = new Set(points.map(p => p.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentPointIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Draw active markers
    points.forEach(point => {
      const isSelected = selectedPointId === point.id;
      const categoryConfig = TRAVEL_CATEGORIES.find(c => c.value === point.category) || TRAVEL_CATEGORIES[TRAVEL_CATEGORIES.length - 1];
      const brandColor = darkMode ? '#4F7D82' : '#2F5D62';

      // Build customized beautiful marker html
      const imageUri = point.images && point.images.length > 0 ? point.images[0] : null;
      const emojiBadge = point.mood || categoryConfig.icon;
      let markerHtml = '';

      if (imageUri) {
        markerHtml = `
          <div class="relative flex items-center justify-center animate-fadeIn">
            <div class="w-11 h-11 rounded-full border-[2.5px] bg-white flex items-center justify-center overflow-hidden shadow-md transition-transform ${
              isSelected ? 'border-brand-primary scale-115 ring-4 ring-brand-primary/25' : 'border-white hover:scale-105'
            }">
              <img src="${imageUri}" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
            </div>
            <!-- Absolute floating emoji badge in corner -->
            <div class="absolute -top-1.5 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#2C2C2E] border border-slate-200/50 dark:border-zinc-700 shadow flex items-center justify-center text-[10px]">
              ${emojiBadge}
            </div>
            <!-- Triangle pin arrow -->
            <div class="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-r border-b bg-white ${
              isSelected ? 'border-brand-primary' : 'border-white'
            }"></div>
          </div>
        `;
      } else {
        markerHtml = `
          <div class="relative flex items-center justify-center animate-fadeIn">
            <div class="w-9 h-9 rounded-full text-white shadow-md flex items-center justify-center border-2 border-white transition-transform ${
              isSelected ? 'scale-115 ring-4 ring-brand-primary/25' : 'hover:scale-105'
            }" style="background: ${categoryConfig.markerColor}; border-color: ${isSelected ? brandColor : '#ffffff'};">
              <span class="text-sm font-sans" style="transform: translateY(-0.5px);">${emojiBadge}</span>
            </div>
            <!-- Triangle pin arrow -->
            <div class="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border-r border-b" style="background: ${categoryConfig.markerColor}; border-color: ${isSelected ? brandColor : '#ffffff'};"></div>
          </div>
        `;
      }

      const divIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-map-marker-div',
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });

      if (markersRef.current[point.id]) {
        // Update positions
        const marker = markersRef.current[point.id];
        marker.setLatLng([point.lat, point.lng]);
        marker.setIcon(divIcon);
      } else {
        // Create marker
        const marker = L.marker([point.lat, point.lng], { icon: divIcon })
          .addTo(map)
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectPoint(point.id);
            map.panTo([point.lat, point.lng], { animate: true, duration: 0.5 });
          });
        markersRef.current[point.id] = marker;
      }
    });

  }, [points, selectedPointId, darkMode]);

  // 4. Chronological flight trajectories
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (trailLineRef.current) {
      trailLineRef.current.remove();
      trailLineRef.current = null;
    }

    if (!showChronologicalTrail || points.length < 2) return;

    const sortedPoints = [...points]
      .filter(p => !isNaN(p.lat) && !isNaN(p.lng))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sortedPoints.length < 2) return;

    const latlngs = sortedPoints.map(p => new L.LatLng(p.lat, p.lng));

    const brandSecondaryColor = darkMode ? '#A0835B' : '#8B6F47';

    const polyline = L.polyline(latlngs, {
      color: brandSecondaryColor, // Warm secondary travel color
      weight: 3,
      opacity: 0.65,
      dashArray: '6, 10',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    polyline.bindTooltip('<div class="text-[9px] font-sans font-bold">⏱️ 岁月留痕路线轨联</div>', {
      sticky: true,
    });

    trailLineRef.current = polyline;
  }, [points, showChronologicalTrail, darkMode]);

  // 5. Temporary location pin overlay on empty clicks
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }

    if (clickActiveCoords) {
      const activeBrandColor = darkMode ? '#4F7D82' : '#2F5D62';
      const tempIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center animate-bounceSlow font-ui">
            <div class="outline outline-4 outline-white text-white rounded-full p-2 hover:opacity-95 shadow-xl" style="background: ${activeBrandColor};">
              <span class="text-xs">📌</span>
            </div>
          </div>
        `,
        className: 'temp-marker-div',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([clickActiveCoords.lat, clickActiveCoords.lng], { icon: tempIcon })
        .addTo(map)
        .bindPopup(
          L.popup({
            maxWidth: 240,
            closeButton: false,
          }).setContent(() => {
            const container = document.createElement('div');
            container.className = 'font-ui p-2 text-center bg-bg-card backdrop-blur-md rounded-xl border border-brand-secondary/10';
            container.innerHTML = `
              <p class="font-extrabold text-xs mb-1" style="color: ${activeBrandColor};">在这里记事足迹？</p>
              <p class="text-[10px] text-text-secondary mb-2 truncate">${clickLocationName}</p>
              <div class="flex justify-center gap-1.5">
                <button id="add-marker-popup-btn" class="inline-flex items-center text-[10px] text-white px-3.5 py-1.5 rounded-full font-bold shadow-sm cursor-pointer border-none outline-none font-ui" style="background: linear-gradient(135deg, ${darkMode ? '#2F5D62' : '#223E4C'}, ${darkMode ? '#6F8D92' : '#4F7D82'});">
                  开始写日记
                </button>
                <button id="close-marker-popup-btn" class="inline-flex items-center text-[10px] text-text-secondary bg-bg-soft px-2.5 py-1.5 rounded-full cursor-pointer border-none outline-none font-ui font-bold">
                  取消
                </button>
              </div>
            `;
            
            setTimeout(() => {
              const btn = container.querySelector('#add-marker-popup-btn');
              const cancelBtn = container.querySelector('#close-marker-popup-btn');
              if (btn) {
                btn.addEventListener('click', () => {
                  onCreatePointAtCoords(clickActiveCoords.lat, clickActiveCoords.lng, clickLocationName);
                  setClickActiveCoords(null);
                  marker.remove();
                });
              }
              if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                  setClickActiveCoords(null);
                  marker.remove();
                });
              }
            }, 60);
            return container;
          })
        );

      marker.openPopup();
      tempMarkerRef.current = marker;
      map.panTo([clickActiveCoords.lat, clickActiveCoords.lng], { animate: true, duration: 0.4 });
    }
  }, [clickActiveCoords, clickLocationName]);

  // Can search local memory points + Geocoder address
  const handleGeocodeSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchResults([]);

    // Step 1: Scan local memory points to provide high priority matches
    const matchedPoints = points.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    const localList = matchedPoints.map(p => ({
      isLocalPoint: true,
      id: p.id,
      name: p.title,
      display_name: `📔 记忆: ${p.locationName} (${p.date})`,
      lat: p.lat.toString(),
      lon: p.lng.toString()
    }));

    // Step 2: Query OpenStreetMap Nominatim for geocode
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=4&addressdetails=1`,
        { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' } }
      );
      const data = await response.json();
      const onlineList = data.map((item: any) => ({
        ...item,
        isLocalPoint: false,
        name: item.name || item.display_name.split(',')[0]
      }));

      setSearchResults([...localList, ...onlineList]);
    } catch (err) {
      console.error('Geocoder geo search failed:', err);
      setSearchResults(localList);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setSearchResults([]);
    setSearchQuery(result.name);

    if (result.isLocalPoint) {
      onSelectPoint(result.id);
    } else {
      setClickActiveCoords({ lat, lng });
      setClickLocationName(result.name || result.display_name.split(',')[0]);
    }
    
    map.setView([lat, lng], 12, { animate: true, duration: 0.8 });
  };

  // Locate functionality
  const handleGPSLocate = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (points.length > 0) {
      // Find latest memory and center map to it
      const sorted = [...points].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sorted[0];
      map.setView([latest.lat, latest.lng], 10, { animate: true, duration: 0.8 });
      onSelectPoint(latest.id);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 12, { animate: true, duration: 0.8 });
          setClickActiveCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setClickLocationName('当前我的位置');
        },
        () => {
          // Fallback to center West Lake
          map.setView([30.2741, 120.1551], 12, { animate: true, duration: 0.8 });
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full bg-bg-page flex flex-col overflow-hidden font-ui">
      
      {/* 1. Cupertino Top Translucent Search Bar Overlay */}
      <div className="absolute top-4 inset-x-4 z-[1000] flex items-start justify-center pointer-events-none font-ui">
        
        <div className="w-full max-w-md pointer-events-auto flex flex-col font-ui">
          <form 
            onSubmit={handleGeocodeSearch} 
            className="flex items-center bg-bg-card backdrop-blur-2xl px-3.5 py-2 rounded-2xl border border-brand-secondary/10 shadow-lg shadow-black/5 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all font-ui"
          >
            <Search className="w-4 h-4 text-[#8E8E93] mr-2 shrink-0 font-ui" />
            <input
              type="text"
              placeholder="搜索地点、标签或回忆"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs bg-transparent outline-none text-text-primary placeholder-[#8E8E93] font-bold font-ui"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-1 mr-1.5 hover:bg-bg-soft rounded-full text-text-secondary cursor-pointer border-none bg-transparent outline-none font-ui"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-brand-primary text-white rounded-full font-bold text-[10px] tracking-wide shadow-sm hover:opacity-95 cursor-pointer flex items-center justify-center shrink-0 border-none outline-none font-ui"
            >
              {searchLoading ? '寻觅中..' : '搜索'}
            </button>
          </form>

          {/* Search Result Overlay Dropdown card */}
          {searchResults.length > 0 && (
            <div className="mt-2.5 bg-bg-card/94 backdrop-blur-2xl border border-brand-secondary/15 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100/60 dark:divide-zinc-800 p-1">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <MapPin className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${result.isLocalPoint ? 'text-brand-primary' : 'text-rose-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-text-primary truncate">{result.name}</div>
                    <div className="text-[10px] text-text-secondary truncate mt-0.5">{result.display_name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 2. Top-Right Micro layer control buttons */}
      <div className="absolute top-20 right-4 z-[1000] pointer-events-auto flex flex-col gap-2">
        <button
          onClick={() => setShowChronologicalTrail(p => !p)}
          className={`w-9 h-9 flex items-center justify-center rounded-full bg-bg-card backdrop-blur-xl border border-brand-secondary/15 shadow-md ${
            showChronologicalTrail ? 'text-brand-primary' : 'text-[#8E8E93]'
          }`}
          title={showChronologicalTrail ? '隐藏时间轨迹' : '显示时间轨迹'}
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Floating Controls in the bottom-right corner */}
      <div className="absolute bottom-24 right-4 z-[1000] pointer-events-auto flex flex-col gap-2.5">
        {/* GPS Locate Compass */}
        <button
          onClick={handleGPSLocate}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-bg-card backdrop-blur-xl border border-brand-secondary/15 text-brand-primary shadow-lg hover:scale-105 active:scale-95 duration-100 transition-all cursor-pointer"
          title="定位回忆点"
        >
          <Navigation className="w-5 h-5 fill-brand-primary" />
        </button>

        {/* Dynamic Add button */}
        <button
          onClick={onAddTrigger}
          className="w-11 h-11 flex items-center justify-center rounded-full floating-action-button duration-100 transition-all cursor-pointer border-none outline-none font-ui"
          title="在此刻创建足印记忆"
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Map actual canvas container element */}
      <div ref={mapElementRef} className="w-full h-full z-[100]" />
      
    </div>
  );
}
