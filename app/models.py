from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from .database import Base

class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)

    # Отношение один-ко-многим с MeasuringInstrument
    instruments = relationship("MeasuringInstrument", back_populates="node", cascade="all, delete-orphan")


class MeasuringInstrument(Base):
    __tablename__ = "measuring_instruments"

    id = Column(Integer, primary_key=True, index=True)
    node_id = Column(Integer, ForeignKey("nodes.id"))
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

    # Отношение многие-к-одному с Node
    node = relationship("Node", back_populates="instruments")
