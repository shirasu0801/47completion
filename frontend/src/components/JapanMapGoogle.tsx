import { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Prefecture } from '../types';

interface JapanMapGoogleProps {
  prefectures: Prefecture[];
  onPrefectureClick: (prefecture: Prefecture) => void;
}

const containerStyle = {
  width: '100%',
  height: '70vh',
  maxHeight: '600px',
  borderRadius: '8px',
};

// 日本の中心座標
const center = {
  lat: 36.5,
  lng: 138.0,
};

const mapOptions: google.maps.MapOptions = {
  zoom: 5,
  mapTypeId: 'roadmap',
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e8f4fc' }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      featureType: 'administrative.province',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#ffffff' }, { weight: 1 }],
    },
  ],
};

// 都道府県名から都道府県IDへのマッピング
const PREFECTURE_NAME_TO_ID: Record<string, number> = {
  '北海道': 1, '青森県': 2, '岩手県': 3, '宮城県': 4, '秋田県': 5,
  '山形県': 6, '福島県': 7, '茨城県': 8, '栃木県': 9, '群馬県': 10,
  '埼玉県': 11, '千葉県': 12, '東京都': 13, '神奈川県': 14, '新潟県': 15,
  '富山県': 16, '石川県': 17, '福井県': 18, '山梨県': 19, '長野県': 20,
  '岐阜県': 21, '静岡県': 22, '愛知県': 23, '三重県': 24, '滋賀県': 25,
  '京都府': 26, '大阪府': 27, '兵庫県': 28, '奈良県': 29, '和歌山県': 30,
  '鳥取県': 31, '島根県': 32, '岡山県': 33, '広島県': 34, '山口県': 35,
  '徳島県': 36, '香川県': 37, '愛媛県': 38, '高知県': 39, '福岡県': 40,
  '佐賀県': 41, '長崎県': 42, '熊本県': 43, '大分県': 44, '宮崎県': 45,
  '鹿児島県': 46, '沖縄県': 47,
};

const getColor = (visitCount: number): string => {
  if (visitCount === 0) return '#e8e8e8';
  if (visitCount === 1) return '#b3d9f2';
  if (visitCount <= 3) return '#5cb3e0';
  return '#1a7fc4';
};

export default function JapanMapGoogle({ prefectures, onPrefectureClick }: JapanMapGoogleProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<object | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const prefectureMap = new Map(prefectures.map(p => [p.id, p]));
  const prefectureByName = new Map(prefectures.map(p => [p.name, p]));

  // GeoJSONデータを読み込む
  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        // 日本の都道府県GeoJSONデータを取得
        const response = await fetch(
          'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson'
        );
        if (response.ok) {
          const data = await response.json();
          setGeoJsonData(data);
        }
      } catch (error) {
        console.error('Failed to load GeoJSON:', error);
      }
    };
    loadGeoJson();
  }, []);

  // マップにGeoJSONを追加してスタイルを設定
  useEffect(() => {
    if (!map || !geoJsonData) return;

    // 既存のデータレイヤーをクリア
    map.data.forEach((feature) => {
      map.data.remove(feature);
    });

    // GeoJSONを追加
    map.data.addGeoJson(geoJsonData);

    // スタイルを設定
    map.data.setStyle((feature) => {
      const rawName = feature.getProperty('nam_ja') || feature.getProperty('name');
      const name = typeof rawName === 'string' ? rawName : '';
      const prefId = PREFECTURE_NAME_TO_ID[name];
      const pref = prefId ? prefectureMap.get(prefId) : null;
      const visitCount = pref?.visit_count || 0;

      return {
        fillColor: getColor(visitCount),
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 1.5,
        cursor: 'pointer',
      };
    });

    // クリックイベント
    const clickListener = map.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
      const rawName = event.feature.getProperty('nam_ja') || event.feature.getProperty('name');
      const name = typeof rawName === 'string' ? rawName : '';
      const pref = prefectureByName.get(name);
      if (pref) {
        onPrefectureClick(pref);
      }
    });

    // ホバーイベント
    const mouseoverListener = map.data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
      map.data.overrideStyle(event.feature, {
        fillOpacity: 1,
        strokeWeight: 2.5,
        strokeColor: '#333',
      });
    });

    const mouseoutListener = map.data.addListener('mouseout', (event: google.maps.Data.MouseEvent) => {
      map.data.revertStyle(event.feature);
    });

    return () => {
      google.maps.event.removeListener(clickListener);
      google.maps.event.removeListener(mouseoverListener);
      google.maps.event.removeListener(mouseoutListener);
    };
  }, [map, geoJsonData, prefectures, onPrefectureClick, prefectureMap, prefectureByName]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="empty-state">
        <p>Google Mapsの読み込みに失敗しました</p>
        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
          APIキーが正しく設定されているか確認してください
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="empty-state">地図を読み込み中...</div>;
  }

  return (
    <div className="map-container" style={{ maxWidth: '100%' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#e8e8e8' }}></div>
          <span>未訪問</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#b3d9f2' }}></div>
          <span>1回</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#5cb3e0' }}></div>
          <span>2-3回</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#1a7fc4' }}></div>
          <span>4回以上</span>
        </div>
      </div>
    </div>
  );
}
