from pydantic import BaseModel
from datetime import date
from datetime import datetime as dt
from typing import Optional, Any


# Prefecture schemas
class PrefectureBase(BaseModel):
    name: str
    name_en: str
    region: str


class PrefectureResponse(PrefectureBase):
    id: int
    visit_count: int = 0

    class Config:
        from_attributes = True


class PrefectureDetail(PrefectureResponse):
    visits: list["VisitResponse"] = []


# Visit schemas
class VisitCreate(BaseModel):
    prefecture_id: int
    visited_at: date
    memo: Optional[str] = None


class VisitResponse(BaseModel):
    id: int
    prefecture_id: int
    visited_at: date
    memo: Optional[str] = None
    prefecture_name: Optional[str] = None

    class Config:
        from_attributes = True


# Trip schemas
class TripItemCreate(BaseModel):
    item_type: str
    name: str
    datetime: Optional[dt] = None
    prefecture_id: Optional[int] = None
    details: Optional[dict[str, Any]] = None
    order: int = 0


class TripItemUpdate(BaseModel):
    item_type: Optional[str] = None
    name: Optional[str] = None
    datetime: Optional[dt] = None
    prefecture_id: Optional[int] = None
    details: Optional[dict[str, Any]] = None
    order: Optional[int] = None


class TripItemResponse(BaseModel):
    id: int
    trip_id: int
    item_type: str
    name: str
    datetime: Optional[dt] = None
    prefecture_id: Optional[int] = None
    details: Optional[dict[str, Any]] = None
    order: int

    class Config:
        from_attributes = True


class TripCreate(BaseModel):
    title: str
    start_date: date
    end_date: date


class TripUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TripResponse(BaseModel):
    id: int
    title: str
    start_date: date
    end_date: date

    class Config:
        from_attributes = True


class TripDetail(TripResponse):
    items: list[TripItemResponse] = []
