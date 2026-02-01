import { useState } from 'react';
import { Prefecture, Visit } from '../types';

interface PrefectureCardProps {
  prefecture: Prefecture;
  visits: Visit[];
  onClose: () => void;
  onAddVisit: (prefectureId: number, visitedAt: string, memo: string) => Promise<boolean>;
  onDeleteVisit: (visitId: number) => Promise<boolean>;
}

export default function PrefectureCard({
  prefecture,
  visits,
  onClose,
  onAddVisit,
  onDeleteVisit,
}: PrefectureCardProps) {
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onAddVisit(prefecture.id, visitDate, memo);
    if (success) {
      setMemo('');
    }
    setIsSubmitting(false);
  };

  const prefectureVisits = visits.filter(v => v.prefecture_id === prefecture.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{prefecture.name}</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          {prefecture.name_en} / {prefecture.region}地方
        </p>

        <div className="stats" style={{ justifyContent: 'flex-start', gap: '40px' }}>
          <div className="stat-item">
            <div className="stat-value">{prefecture.visit_count}</div>
            <div className="stat-label">訪問回数</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>訪問を記録</h3>
          <div className="form-group">
            <label>訪問日</label>
            <input
              type="date"
              value={visitDate}
              onChange={e => setVisitDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>メモ（任意）</label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              rows={3}
              placeholder="旅行の思い出など..."
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? '記録中...' : '訪問を記録'}
          </button>
        </form>

        {prefectureVisits.length > 0 && (
          <>
            <h3 style={{ marginBottom: '15px' }}>訪問履歴</h3>
            <div className="visit-list">
              {prefectureVisits.map(visit => (
                <div key={visit.id} className="visit-item">
                  <div className="visit-info">
                    <div className="visit-date">{visit.visited_at}</div>
                    {visit.memo && <div className="visit-memo">{visit.memo}</div>}
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                    onClick={() => onDeleteVisit(visit.id)}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
