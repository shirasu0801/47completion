import { useState } from 'react';
import { Prefecture, TripItem } from '../types';

interface TripPlanFormProps {
  prefectures: Prefecture[];
  onClose: () => void;
  onSubmit: (item: Omit<TripItem, 'id' | 'trip_id'>) => Promise<boolean>;
  itemType: 'transport' | 'hotel' | 'spot';
  existingItemsCount: number;
}

const TYPE_CONFIG = {
  transport: {
    title: '移動を追加',
    namePlaceholder: '例: 新幹線（東京→京都）',
    icon: '🚗',
  },
  hotel: {
    title: '宿泊先を追加',
    namePlaceholder: '例: ○○ホテル',
    icon: '🏨',
  },
  spot: {
    title: '観光スポットを追加',
    namePlaceholder: '例: 金閣寺',
    icon: '📍',
  },
};

export default function TripPlanForm({
  prefectures,
  onClose,
  onSubmit,
  itemType,
  existingItemsCount,
}: TripPlanFormProps) {
  const config = TYPE_CONFIG[itemType];
  const [name, setName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [prefectureId, setPrefectureId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // datetime-localの値をISO形式に変換（空の場合はnull）
      let datetimeValue: string | null = null;
      if (datetime) {
        // datetime-local形式(2024-01-15T10:30)をISO形式に変換
        datetimeValue = new Date(datetime).toISOString();
      }

      const item: Omit<TripItem, 'id' | 'trip_id'> = {
        item_type: itemType,
        name,
        datetime: datetimeValue,
        prefecture_id: prefectureId === '' ? null : prefectureId,
        details: null,
        order: existingItemsCount,
      };

      console.log('Submitting item:', item);
      const success = await onSubmit(item);
      console.log('Submit result:', success);

      if (success) {
        onClose();
      } else {
        setError('アイテムの追加に失敗しました');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>
          {config.icon} {config.title}
        </h2>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>名称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={config.namePlaceholder}
              required
            />
          </div>

          <div className="form-group">
            <label>日時</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={e => setDatetime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>都道府県</label>
            <select
              value={prefectureId}
              onChange={e => setPrefectureId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">選択してください</option>
              {prefectures.map(pref => (
                <option key={pref.id} value={pref.id}>
                  {pref.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? '追加中...' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
