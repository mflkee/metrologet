from sqlalchemy import ForeignKey, UniqueConstraint, String, Integer, Date,Column
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
import math
from .database import Base
from datetime import date
from typing import Literal

class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String)

    instruments = relationship("MeasuringInstrument", back_populates="node", cascade="all, delete-orphan")
    groups = relationship("Group", back_populates="node", cascade="all, delete-orphan")

    @property
    def color(self) -> str:
        """Возвращает цвет узла на основе самого критичного прибора"""
        if not self.instruments:
            return "green"

        color_severity = {
            "green": 5,
            "yellow": 4,
            "orange": 3,
            "red": 2,
            "black": 1
        }
        
        worst_color = "green"
        worst_severity = 5
        
        for instrument in self.instruments:
            instrument_color = instrument.color
            if color_severity[instrument_color] < worst_severity:
                worst_severity = color_severity[instrument_color]
                worst_color = instrument_color

        return worst_color

class MeasuringInstrument(Base):
    __tablename__ = "measuring_instruments"
    __table_args__ = (
        UniqueConstraint('mit_number', 'mi_number', name='uix_mit_mi'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    node_id: Mapped[int] = mapped_column(Integer, ForeignKey("nodes.id"))
    group_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("groups.id"), nullable=True)
    vri_id: Mapped[str] = mapped_column(String, index=True)
    org_title: Mapped[str] = mapped_column(String)
    mit_number: Mapped[str] = mapped_column(String)
    mit_title: Mapped[str] = mapped_column(String)
    mit_notation: Mapped[str] = mapped_column(String)
    mi_modification: Mapped[Optional[str]] = mapped_column(String)
    mi_number: Mapped[str] = mapped_column(String)
    verification_date: Mapped[Optional[date]] = mapped_column(Date)
    valid_date: Mapped[Optional[date]] = mapped_column(Date)
    result_docnum: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    index_within_group = Column(Integer, nullable=True)  # Добавление атрибута

    node = relationship("Node", back_populates="instruments")
    group = relationship("Group", back_populates="instruments")

    @property
    def color(self) -> Literal["green", "yellow", "orange", "red", "black"]:
        today = date.today()
        if self.valid_date is None or self.valid_date < today:
            return "black"

        delta_days = (self.valid_date - today).days
        months_remaining = delta_days / 30.0
        rounded_months = math.ceil(months_remaining)

        if rounded_months >= 4:
            return "green"
        elif rounded_months == 3:
            return "yellow"
        elif rounded_months == 2:
            return "orange"
        elif rounded_months == 1:
            return "red"
        else:
            return "black"

class Group(Base):
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    node_id: Mapped[int] = mapped_column(Integer, ForeignKey("nodes.id"))
    name: Mapped[str] = mapped_column(String, index=True)
    order: Mapped[int] = mapped_column(Integer, default=0)

    instruments = relationship("MeasuringInstrument", back_populates="group")
    node = relationship("Node", back_populates="groups")

    @property
    def instrument_ids(self) -> list[int]:
        return [instrument.id for instrument in self.instruments]
