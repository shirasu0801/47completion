from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Visit, Prefecture
from schemas import VisitCreate, VisitResponse

router = APIRouter(prefix="/api/visits", tags=["visits"])


@router.get("", response_model=list[VisitResponse])
def get_visits(db: Session = Depends(get_db)):
    """訪問記録一覧を取得"""
    visits = db.query(Visit).order_by(Visit.visited_at.desc()).all()

    result = []
    for v in visits:
        prefecture = db.query(Prefecture).filter(Prefecture.id == v.prefecture_id).first()
        result.append(VisitResponse(
            id=v.id,
            prefecture_id=v.prefecture_id,
            visited_at=v.visited_at,
            memo=v.memo,
            prefecture_name=prefecture.name if prefecture else None
        ))

    return result


@router.post("", response_model=VisitResponse)
def create_visit(visit: VisitCreate, db: Session = Depends(get_db)):
    """訪問記録を作成"""
    # 都道府県の存在確認
    prefecture = db.query(Prefecture).filter(Prefecture.id == visit.prefecture_id).first()
    if not prefecture:
        raise HTTPException(status_code=404, detail="Prefecture not found")

    db_visit = Visit(
        prefecture_id=visit.prefecture_id,
        visited_at=visit.visited_at,
        memo=visit.memo
    )
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)

    return VisitResponse(
        id=db_visit.id,
        prefecture_id=db_visit.prefecture_id,
        visited_at=db_visit.visited_at,
        memo=db_visit.memo,
        prefecture_name=prefecture.name
    )


@router.delete("/{visit_id}")
def delete_visit(visit_id: int, db: Session = Depends(get_db)):
    """訪問記録を削除"""
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    db.delete(visit)
    db.commit()

    return {"message": "Visit deleted successfully"}
