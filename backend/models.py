from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base


class Prefecture(Base):
    __tablename__ = "prefectures"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(10), nullable=False)
    name_en = Column(String(50), nullable=False)
    region = Column(String(10), nullable=False)

    visits = relationship("Visit", back_populates="prefecture")
    trip_items = relationship("TripItem", back_populates="prefecture")


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    prefecture_id = Column(Integer, ForeignKey("prefectures.id"), nullable=False)
    visited_at = Column(Date, nullable=False)
    memo = Column(Text, nullable=True)

    prefecture = relationship("Prefecture", back_populates="visits")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    items = relationship("TripItem", back_populates="trip", cascade="all, delete-orphan")


class TripItem(Base):
    __tablename__ = "trip_items"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    item_type = Column(String(20), nullable=False)  # transport/hotel/spot
    name = Column(String(200), nullable=False)
    datetime = Column(DateTime, nullable=True)
    prefecture_id = Column(Integer, ForeignKey("prefectures.id"), nullable=True)
    details = Column(JSON, nullable=True)
    order = Column(Integer, nullable=False, default=0)

    trip = relationship("Trip", back_populates="items")
    prefecture = relationship("Prefecture", back_populates="trip_items")
