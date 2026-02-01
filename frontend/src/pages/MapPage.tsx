import { useState } from 'react';
import JapanMapGoogle from '../components/JapanMapGoogle';
import PrefectureCard from '../components/PrefectureCard';
import { usePrefectures, useVisits } from '../hooks/useApi';
import { Prefecture } from '../types';

export default function MapPage() {
  const { prefectures, loading: prefLoading, refetch: refetchPrefectures } = usePrefectures();
  const { visits, loading: visitLoading, createVisit, deleteVisit } = useVisits();
  const [selectedPrefecture, setSelectedPrefecture] = useState<Prefecture | null>(null);

  const visitedCount = prefectures.filter(p => p.visit_count > 0).length;
  const totalVisits = visits.length;

  const handleAddVisit = async (prefectureId: number, visitedAt: string, memo: string) => {
    const success = await createVisit({
      prefecture_id: prefectureId,
      visited_at: visitedAt,
      memo: memo || null,
    });
    if (success) {
      await refetchPrefectures();
      // 選択中の都道府県情報を更新
      const updated = prefectures.find(p => p.id === prefectureId);
      if (updated) {
        setSelectedPrefecture({
          ...updated,
          visit_count: updated.visit_count + 1,
        });
      }
    }
    return success;
  };

  const handleDeleteVisit = async (visitId: number) => {
    const success = await deleteVisit(visitId);
    if (success) {
      await refetchPrefectures();
    }
    return success;
  };

  if (prefLoading || visitLoading) {
    return <div className="empty-state">読み込み中...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="stats">
          <div className="stat-item">
            <div className="stat-value">{visitedCount}</div>
            <div className="stat-label">訪問都道府県</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{47 - visitedCount}</div>
            <div className="stat-label">未訪問</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalVisits}</div>
            <div className="stat-label">総訪問回数</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {Math.round((visitedCount / 47) * 100)}%
            </div>
            <div className="stat-label">制覇率</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>日本地図</h2>
        <JapanMapGoogle
          prefectures={prefectures}
          onPrefectureClick={setSelectedPrefecture}
        />
      </div>

      {selectedPrefecture && (
        <PrefectureCard
          prefecture={selectedPrefecture}
          visits={visits}
          onClose={() => setSelectedPrefecture(null)}
          onAddVisit={handleAddVisit}
          onDeleteVisit={handleDeleteVisit}
        />
      )}
    </div>
  );
}
