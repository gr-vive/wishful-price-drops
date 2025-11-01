from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import engine, get_db
from models import Base, Product
from services.agent import (
    fetch_product_from_link,
    fetch_price_from_link,
)

# -------------------------------------------------
# ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
# -------------------------------------------------
app = FastAPI()

# CORS для Lovable
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # потом можно сузить на домен lovable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# создаём таблицы в БД
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print("DB is not available right now:", e)


# -------------------------------------------------
# Pydantic-схемы
# -------------------------------------------------
class ProductCreate(BaseModel):
    link: str
    country: str
    title: str | None = None


class ProductOut(BaseModel):
    id: str
    title: str
    input_link: str
    country: str
    input_price: float
    best_price: float | None = None
    best_price_link: str | None = None
    status: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True  # можно возвращать SQLAlchemy-объекты


# -------------------------------------------------
# ЭНДПОИНТЫ
# -------------------------------------------------

@app.get("/")
def root():
    return {"status": "ok"}


# 1. СОЗДАТЬ ПРОДУКТ
@app.post("/products", response_model=ProductOut)
async def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """
    2 сценария:
    1) link + country → идём в агент, тянем title и price
    2) link + country + title → идём в агент, тянем только price
    """
    link = payload.link
    country = payload.country
    title = payload.title

    # сценарий 1: нет title → достаём и title, и price
    if title is None:
        data = await fetch_product_from_link(link)
        if not data or "title" not in data or "price" not in data:
            raise HTTPException(status_code=500, detail="Agent did not return title/price")
        title = data["title"]
        price = data["price"]
    else:
        # сценарий 2: title есть → только price
        price = await fetch_price_from_link(link)

    product = Product(
        title=title,
        input_link=link,
        country=country,
        input_price=price,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


# 2. СПИСОК ПРОДУКТОВ (для Lovable)
@app.get("/products", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .order_by(Product.created_at.desc())
        .limit(100)
        .all()
    )
    return products


# 3. ОДИН ПРОДУКТ ПО ID
@app.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# 4. ТЕСТОВЫЙ (можно оставить)
@app.post("/products/test", response_model=ProductOut)
def create_test_product(db: Session = Depends(get_db)):
    product = Product(
        title="Test product",
        input_link="https://example.com",
        country="UK",
        input_price=100.00,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# 5. РУЧНОЙ ПЕРЕСЧЁТ ЛУЧШЕЙ ЦЕНЫ (для крона/планировщика)
@app.post("/internal/reprice")
async def reprice_all(db: Session = Depends(get_db)):
    from services.agent import search_offers

    products = db.query(Product).filter(Product.status == "active").all()
    updated = 0

    for p in products:
        offers = await search_offers(p.title, p.country)
        if not offers:
            continue

        # выбираем минимальный оффер
        best = min(offers, key=lambda o: o["price"])

        p.best_price = best["price"]
        p.best_price_link = best["link"]

        db.add(p)
        updated += 1

    db.commit()
    return {"updated": updated}


# 6. ОТКЛЮЧИТЬ ТРЕКИНГ
@app.patch("/products/{product_id}/disable", response_model=ProductOut)
def disable_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.status = "disabled"
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# 7. ВКЛЮЧИТЬ ТРЕКИНГ ОБРАТНО
@app.patch("/products/{product_id}/enable", response_model=ProductOut)
def enable_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.status = "active"
    db.add(product)
    db.commit()
    db.refresh(product)
    return product
