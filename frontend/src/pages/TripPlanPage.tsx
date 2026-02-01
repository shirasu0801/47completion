import { useState } from 'react';
import TripTimeline from '../components/TripTimeline';
import TripPlanForm from '../components/TripPlanForm';
import { useTrips, useTripDetail, usePrefectures } from '../hooks/useApi';
import { TripItem } from '../types';

export default function TripPlanPage() {
  const { trips, loading: tripsLoading, createTrip, deleteTrip } = useTrips();
  const { prefectures } = usePrefectures();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const { trip, addItem, deleteItem, updateItem } = useTripDetail(selectedTripId);

  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [newTripStart, setNewTripStart] = useState('');
  const [newTripEnd, setNewTripEnd] = useState('');

  const [addingItemType, setAddingItemType] = useState<'transport' | 'hotel' | 'spot' | null>(null);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createTrip({
      title: newTripTitle,
      start_date: newTripStart,
      end_date: newTripEnd,
    });
    if (created) {
      setShowNewTripForm(false);
      setNewTripTitle('');
      setNewTripStart('');
      setNewTripEnd('');
      setSelectedTripId(created.id);
    }
  };

  const handleAddItem = async (item: Omit<TripItem, 'id' | 'trip_id'>) => {
    return await addItem(item);
  };

  const handleReorder = async (itemId: number, newOrder: number) => {
    return await updateItem(itemId, { order: newOrder });
  };

  if (tripsLoading) {
    return <div className="empty-state">読み込み中...</div>;
  }

  return (
    <div className="grid grid-2">
      <div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>旅行計画一覧</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowNewTripForm(true)}
            >
              + 新規作成
            </button>
          </div>

          {trips.length === 0 ? (
            <div className="empty-state">
              <p>旅行計画がありません</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
                「新規作成」ボタンで計画を作成しましょう
              </p>
            </div>
          ) : (
            <div className="trip-list">
              {trips.map(t => (
                <div
                  key={t.id}
                  className="trip-card"
                  style={{
                    border: selectedTripId === t.id ? '2px solid #667eea' : '2px solid transparent',
                  }}
                  onClick={() => setSelectedTripId(t.id)}
                >
                  <div>
                    <div className="trip-title">{t.title}</div>
                    <div className="trip-dates">
                      {t.start_date} ~ {t.end_date}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('この旅行計画を削除しますか？')) {
                        deleteTrip(t.id);
                        if (selectedTripId === t.id) {
                          setSelectedTripId(null);
                        }
                      }
                    }}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        {trip ? (
          <div className="card">
            <h2 style={{ marginBottom: '5px' }}>{trip.title}</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {trip.start_date} ~ {trip.end_date}
            </p>

            <TripTimeline
              items={trip.items || []}
              prefectures={prefectures}
              onDeleteItem={deleteItem}
              onReorder={handleReorder}
            />

            <div className="add-item-buttons">
              <button
                className="btn btn-primary"
                onClick={() => setAddingItemType('transport')}
              >
                🚗 移動を追加
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setAddingItemType('hotel')}
              >
                🏨 宿泊を追加
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setAddingItemType('spot')}
              >
                📍 観光を追加
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <p>左の一覧から旅行計画を選択してください</p>
            </div>
          </div>
        )}
      </div>

      {showNewTripForm && (
        <div className="modal-overlay" onClick={() => setShowNewTripForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>新しい旅行計画</h2>
            <form onSubmit={handleCreateTrip}>
              <div className="form-group">
                <label>タイトル *</label>
                <input
                  type="text"
                  value={newTripTitle}
                  onChange={e => setNewTripTitle(e.target.value)}
                  placeholder="例: 京都・奈良旅行"
                  required
                />
              </div>
              <div className="form-group">
                <label>開始日 *</label>
                <input
                  type="date"
                  value={newTripStart}
                  onChange={e => setNewTripStart(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>終了日 *</label>
                <input
                  type="date"
                  value={newTripEnd}
                  onChange={e => setNewTripEnd(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowNewTripForm(false)}
                >
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary">
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addingItemType && trip && (
        <TripPlanForm
          prefectures={prefectures}
          onClose={() => setAddingItemType(null)}
          onSubmit={handleAddItem}
          itemType={addingItemType}
          existingItemsCount={trip.items?.length || 0}
        />
      )}
    </div>
  );
}
