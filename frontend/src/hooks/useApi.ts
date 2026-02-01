import { useState, useEffect, useCallback } from 'react';
import { Prefecture, Visit, Trip, TripItem } from '../types';

const API_BASE = '/api';

export function usePrefectures() {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrefectures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/prefectures`);
      if (res.ok) {
        const data = await res.json();
        setPrefectures(data);
      }
    } catch (err) {
      console.error('Failed to fetch prefectures:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefectures();
  }, [fetchPrefectures]);

  return { prefectures, loading, refetch: fetchPrefectures };
}

export function useVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/visits`);
      if (res.ok) {
        const data = await res.json();
        setVisits(data);
      }
    } catch (err) {
      console.error('Failed to fetch visits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const createVisit = async (visit: Omit<Visit, 'id' | 'prefecture_name'>) => {
    try {
      const res = await fetch(`${API_BASE}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visit),
      });
      if (res.ok) {
        await fetchVisits();
        return true;
      }
      console.error('Failed to create visit:', await res.text());
      return false;
    } catch (err) {
      console.error('Failed to create visit:', err);
      return false;
    }
  };

  const deleteVisit = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/visits/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchVisits();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete visit:', err);
      return false;
    }
  };

  return { visits, loading, createVisit, deleteVisit, refetch: fetchVisits };
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trips`);
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      console.error('Failed to fetch trips:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const createTrip = async (trip: Omit<Trip, 'id' | 'items'>) => {
    try {
      const res = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      if (res.ok) {
        const created = await res.json();
        await fetchTrips();
        return created;
      }
      console.error('Failed to create trip:', await res.text());
      return null;
    } catch (err) {
      console.error('Failed to create trip:', err);
      return null;
    }
  };

  const deleteTrip = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/trips/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchTrips();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete trip:', err);
      return false;
    }
  };

  return { trips, loading, createTrip, deleteTrip, refetch: fetchTrips };
}

export function useTripDetail(tripId: number | null) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTrip = useCallback(async () => {
    if (tripId === null) {
      setTrip(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}`);
      if (res.ok) {
        const data = await res.json();
        setTrip(data);
      } else {
        console.error('Failed to fetch trip:', await res.text());
      }
    } catch (err) {
      console.error('Failed to fetch trip:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const addItem = async (item: Omit<TripItem, 'id' | 'trip_id'>) => {
    if (!tripId) {
      console.error('No tripId for addItem');
      return false;
    }
    try {
      console.log('Adding item to trip', tripId, ':', item);
      const res = await fetch(`${API_BASE}/trips/${tripId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        console.log('Item added successfully');
        await fetchTrip();
        return true;
      }
      const errorText = await res.text();
      console.error('Failed to add item:', res.status, errorText);
      return false;
    } catch (err) {
      console.error('Failed to add item:', err);
      return false;
    }
  };

  const updateItem = async (itemId: number, item: Partial<TripItem>) => {
    if (!tripId) return false;
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        await fetchTrip();
        return true;
      }
      console.error('Failed to update item:', await res.text());
      return false;
    } catch (err) {
      console.error('Failed to update item:', err);
      return false;
    }
  };

  const deleteItem = async (itemId: number) => {
    if (!tripId) return false;
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchTrip();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete item:', err);
      return false;
    }
  };

  return { trip, loading, addItem, updateItem, deleteItem, refetch: fetchTrip };
}
