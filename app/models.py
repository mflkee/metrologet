from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
import math
from .database import Base
from datetime import date


class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)

    instruments = relationship("MeasuringInstrument", back_populates="node", cascade="all, delete-orphan")
    groups = relationship("Group", back_populates="node", cascade="all, delete-orphan")

    @property
    def color(self) -> str:
        """ Возвращает цвет узла на основе самого критичного прибора """
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
    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(Integer, ForeignKey("nodes.id"))
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    vri_id = Column(String, index=True)
    org_title = Column(String)
    mit_number = Column(String)
    mit_title = Column(String)
    mit_notation = Column(String)
    mi_modification = Column(String)
    mi_number = Column(String)
    verification_date = Column(Date)
    valid_date = Column(Date)
    result_docnum = Column(String)

    node = relationship("Node", back_populates="instruments")
    group = relationship("Group", back_populates="instruments")
    @property
    def color(self) -> str:
        """Возвращает цвет прибора на основе даты поверки"""
        today = date.today()
        if self.valid_date < today:
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


#===groups===#

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(Integer, ForeignKey("nodes.id"))
    name = Column(String, index=True)
    
    # Связь с приборами
    instruments = relationship("MeasuringInstrument", back_populates="group")  # Добавьте эту строку
    node = relationship("Node", back_populates="groups")
