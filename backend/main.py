from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
from models import Prefecture
from routers import prefectures, visits, trips

# テーブル作成
Base.metadata.create_all(bind=engine)

app = FastAPI(title="47都道府県 旅行記録&計画API")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(prefectures.router)
app.include_router(visits.router)
app.include_router(trips.router)


# 都道府県マスタデータ
PREFECTURES_DATA = [
    {"id": 1, "name": "北海道", "name_en": "Hokkaido", "region": "北海道"},
    {"id": 2, "name": "青森県", "name_en": "Aomori", "region": "東北"},
    {"id": 3, "name": "岩手県", "name_en": "Iwate", "region": "東北"},
    {"id": 4, "name": "宮城県", "name_en": "Miyagi", "region": "東北"},
    {"id": 5, "name": "秋田県", "name_en": "Akita", "region": "東北"},
    {"id": 6, "name": "山形県", "name_en": "Yamagata", "region": "東北"},
    {"id": 7, "name": "福島県", "name_en": "Fukushima", "region": "東北"},
    {"id": 8, "name": "茨城県", "name_en": "Ibaraki", "region": "関東"},
    {"id": 9, "name": "栃木県", "name_en": "Tochigi", "region": "関東"},
    {"id": 10, "name": "群馬県", "name_en": "Gunma", "region": "関東"},
    {"id": 11, "name": "埼玉県", "name_en": "Saitama", "region": "関東"},
    {"id": 12, "name": "千葉県", "name_en": "Chiba", "region": "関東"},
    {"id": 13, "name": "東京都", "name_en": "Tokyo", "region": "関東"},
    {"id": 14, "name": "神奈川県", "name_en": "Kanagawa", "region": "関東"},
    {"id": 15, "name": "新潟県", "name_en": "Niigata", "region": "中部"},
    {"id": 16, "name": "富山県", "name_en": "Toyama", "region": "中部"},
    {"id": 17, "name": "石川県", "name_en": "Ishikawa", "region": "中部"},
    {"id": 18, "name": "福井県", "name_en": "Fukui", "region": "中部"},
    {"id": 19, "name": "山梨県", "name_en": "Yamanashi", "region": "中部"},
    {"id": 20, "name": "長野県", "name_en": "Nagano", "region": "中部"},
    {"id": 21, "name": "岐阜県", "name_en": "Gifu", "region": "中部"},
    {"id": 22, "name": "静岡県", "name_en": "Shizuoka", "region": "中部"},
    {"id": 23, "name": "愛知県", "name_en": "Aichi", "region": "中部"},
    {"id": 24, "name": "三重県", "name_en": "Mie", "region": "近畿"},
    {"id": 25, "name": "滋賀県", "name_en": "Shiga", "region": "近畿"},
    {"id": 26, "name": "京都府", "name_en": "Kyoto", "region": "近畿"},
    {"id": 27, "name": "大阪府", "name_en": "Osaka", "region": "近畿"},
    {"id": 28, "name": "兵庫県", "name_en": "Hyogo", "region": "近畿"},
    {"id": 29, "name": "奈良県", "name_en": "Nara", "region": "近畿"},
    {"id": 30, "name": "和歌山県", "name_en": "Wakayama", "region": "近畿"},
    {"id": 31, "name": "鳥取県", "name_en": "Tottori", "region": "中国"},
    {"id": 32, "name": "島根県", "name_en": "Shimane", "region": "中国"},
    {"id": 33, "name": "岡山県", "name_en": "Okayama", "region": "中国"},
    {"id": 34, "name": "広島県", "name_en": "Hiroshima", "region": "中国"},
    {"id": 35, "name": "山口県", "name_en": "Yamaguchi", "region": "中国"},
    {"id": 36, "name": "徳島県", "name_en": "Tokushima", "region": "四国"},
    {"id": 37, "name": "香川県", "name_en": "Kagawa", "region": "四国"},
    {"id": 38, "name": "愛媛県", "name_en": "Ehime", "region": "四国"},
    {"id": 39, "name": "高知県", "name_en": "Kochi", "region": "四国"},
    {"id": 40, "name": "福岡県", "name_en": "Fukuoka", "region": "九州"},
    {"id": 41, "name": "佐賀県", "name_en": "Saga", "region": "九州"},
    {"id": 42, "name": "長崎県", "name_en": "Nagasaki", "region": "九州"},
    {"id": 43, "name": "熊本県", "name_en": "Kumamoto", "region": "九州"},
    {"id": 44, "name": "大分県", "name_en": "Oita", "region": "九州"},
    {"id": 45, "name": "宮崎県", "name_en": "Miyazaki", "region": "九州"},
    {"id": 46, "name": "鹿児島県", "name_en": "Kagoshima", "region": "九州"},
    {"id": 47, "name": "沖縄県", "name_en": "Okinawa", "region": "九州"},
]


@app.on_event("startup")
def init_prefectures():
    """アプリ起動時に都道府県マスタデータを投入"""
    db = SessionLocal()
    try:
        # すでにデータがあれば何もしない
        if db.query(Prefecture).count() > 0:
            return

        for pref_data in PREFECTURES_DATA:
            pref = Prefecture(**pref_data)
            db.add(pref)
        db.commit()
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "47都道府県 旅行記録&計画API", "docs": "/docs"}
