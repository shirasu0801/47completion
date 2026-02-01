from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Trip, TripItem
from schemas import (
    TripCreate, TripUpdate, TripResponse, TripDetail,
    TripItemCreate, TripItemUpdate, TripItemResponse
)

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.get("", response_model=list[TripResponse])
def get_trips(db: Session = Depends(get_db)):
    """旅行計画一覧を取得"""
    trips = db.query(Trip).order_by(Trip.start_date.desc()).all()
    return trips


@router.post("", response_model=TripResponse)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    """旅行計画を作成"""
    db_trip = Trip(
        title=trip.title,
        start_date=trip.start_date,
        end_date=trip.end_date
    )
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip


@router.get("/{trip_id}", response_model=TripDetail)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """旅行計画詳細を取得"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    items = db.query(TripItem).filter(TripItem.trip_id == trip_id).order_by(TripItem.order).all()

    return TripDetail(
        id=trip.id,
        title=trip.title,
        start_date=trip.start_date,
        end_date=trip.end_date,
        items=[TripItemResponse(
            id=item.id,
            trip_id=item.trip_id,
            item_type=item.item_type,
            name=item.name,
            datetime=item.datetime,
            prefecture_id=item.prefecture_id,
            details=item.details,
            order=item.order
        ) for item in items]
    )


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, trip_update: TripUpdate, db: Session = Depends(get_db)):
    """旅行計画を更新"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip_update.title is not None:
        trip.title = trip_update.title
    if trip_update.start_date is not None:
        trip.start_date = trip_update.start_date
    if trip_update.end_date is not None:
        trip.end_date = trip_update.end_date

    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    """旅行計画を削除"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}


# Trip Items
@router.post("/{trip_id}/items", response_model=TripItemResponse)
def create_trip_item(trip_id: int, item: TripItemCreate, db: Session = Depends(get_db)):
    """旅行計画アイテムを追加"""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db_item = TripItem(
        trip_id=trip_id,
        item_type=item.item_type,
        name=item.name,
        datetime=item.datetime,
        prefecture_id=item.prefecture_id,
        details=item.details,
        order=item.order
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.put("/{trip_id}/items/{item_id}", response_model=TripItemResponse)
def update_trip_item(trip_id: int, item_id: int, item_update: TripItemUpdate, db: Session = Depends(get_db)):
    """旅行計画アイテムを更新"""
    item = db.query(TripItem).filter(TripItem.id == item_id, TripItem.trip_id == trip_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Trip item not found")

    if item_update.item_type is not None:
        item.item_type = item_update.item_type
    if item_update.name is not None:
        item.name = item_update.name
    if item_update.datetime is not None:
        item.datetime = item_update.datetime
    if item_update.prefecture_id is not None:
        item.prefecture_id = item_update.prefecture_id
    if item_update.details is not None:
        item.details = item_update.details
    if item_update.order is not None:
        item.order = item_update.order

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{trip_id}/items/{item_id}")
def delete_trip_item(trip_id: int, item_id: int, db: Session = Depends(get_db)):
    """旅行計画アイテムを削除"""
    item = db.query(TripItem).filter(TripItem.id == item_id, TripItem.trip_id == trip_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Trip item not found")

    db.delete(item)
    db.commit()
    return {"message": "Trip item deleted successfully"}
