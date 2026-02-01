from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Prefecture, Visit
from schemas import PrefectureResponse, PrefectureDetail, VisitResponse

router = APIRouter(prefix="/api/prefectures", tags=["prefectures"])


@router.get("", response_model=list[PrefectureResponse])
def get_prefectures(db: Session = Depends(get_db)):
    """都道府県一覧を訪問回数付きで取得"""
    prefectures = db.query(Prefecture).all()

    # 訪問回数を集計
    visit_counts = dict(
        db.query(Visit.prefecture_id, func.count(Visit.id))
        .group_by(Visit.prefecture_id)
        .all()
    )

    result = []
    for pref in prefectures:
        result.append(PrefectureResponse(
            id=pref.id,
            name=pref.name,
            name_en=pref.name_en,
            region=pref.region,
            visit_count=visit_counts.get(pref.id, 0)
        ))

    return result


@router.get("/{prefecture_id}", response_model=PrefectureDetail)
def get_prefecture(prefecture_id: int, db: Session = Depends(get_db)):
    """都道府県詳細を取得"""
    prefecture = db.query(Prefecture).filter(Prefecture.id == prefecture_id).first()
    if not prefecture:
        raise HTTPException(status_code=404, detail="Prefecture not found")

    visits = db.query(Visit).filter(Visit.prefecture_id == prefecture_id).order_by(Visit.visited_at.desc()).all()

    return PrefectureDetail(
        id=prefecture.id,
        name=prefecture.name,
        name_en=prefecture.name_en,
        region=prefecture.region,
        visit_count=len(visits),
        visits=[VisitResponse(
            id=v.id,
            prefecture_id=v.prefecture_id,
            visited_at=v.visited_at,
            memo=v.memo
        ) for v in visits]
    )
