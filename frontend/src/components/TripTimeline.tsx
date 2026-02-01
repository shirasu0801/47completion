import { TripItem, Prefecture } from '../types';

interface TripTimelineProps {
  items: TripItem[];
  prefectures: Prefecture[];
  onDeleteItem: (itemId: number) => Promise<boolean>;
  onReorder: (itemId: number, newOrder: number) => Promise<boolean>;
}

const ITEM_ICONS: Record<string, string> = {
  transport: '🚗',
  hotel: '🏨',
  spot: '📍',
};

const ITEM_LABELS: Record<string, string> = {
  transport: '移動',
  hotel: '宿泊',
  spot: '観光',
};

export default function TripTimeline({
  items,
  prefectures,
  onDeleteItem,
}: TripTimelineProps) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const prefectureMap = new Map(prefectures.map(p => [p.id, p]));

  const formatDateTime = (datetime: string | null) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>まだアイテムがありません</p>
        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
          下のボタンから移動・宿泊・観光スポットを追加してください
        </p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {sortedItems.map(item => (
        <div key={item.id} className={`timeline-item ${item.item_type}`}>
          <div className="timeline-item-header">
            <span className="timeline-item-type">
              {ITEM_ICONS[item.item_type] || '📌'}
            </span>
            <span className="timeline-item-name">{item.name}</span>
            <span style={{
              fontSize: '0.75rem',
              background: '#f0f0f0',
              padding: '2px 8px',
              borderRadius: '10px'
            }}>
              {ITEM_LABELS[item.item_type] || item.item_type}
            </span>
          </div>

          {item.datetime && (
            <div className="timeline-item-time">
              {formatDateTime(item.datetime)}
            </div>
          )}

          {item.prefecture_id && (
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
              {prefectureMap.get(item.prefecture_id)?.name}
            </div>
          )}

          {item.details && Object.keys(item.details).length > 0 && (
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '8px' }}>
              {Object.entries(item.details).map(([key, value]) => (
                <div key={key}>{key}: {String(value)}</div>
              ))}
            </div>
          )}

          <div className="timeline-item-actions">
            <button
              className="btn btn-danger"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={() => onDeleteItem(item.id)}
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
