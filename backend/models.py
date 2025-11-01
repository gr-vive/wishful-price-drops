from sqlalchemy import Column, Text, String, Numeric, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
import uuid

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    input_link = Column(Text, nullable=False)
    country = Column(String(10), nullable=False)
    input_price = Column(Numeric(12, 2), nullable=False)
    best_price = Column(Numeric(12, 2), nullable=True)
    best_price_link = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, server_default="active")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
