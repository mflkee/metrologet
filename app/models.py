from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import date
from dateutil.relativedelta import relativedelta
from .database import Base

class Node(Base):
    __tablename__ = "nodes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)

    instruments = relationship("MeasuringInstrument", back_populates="node", cascade="all, delete-orphan")

    @property
    def color(self) -> str:
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
        worst_severity = color_severity[worst_color]

        for instrument in self.instruments:
            instrument_color = instrument.color
            current_severity = color_severity.get(instrument_color, 5)
            if current_severity < worst_severity:
                worst_severity = current_severity
                worst_color = instrument_color

        return worst_color

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

    node = relationship("Node", back_populates="instruments")

    @property
    def color(self) -> str:
        if isinstance(self.valid_date, date):
            today = date.today()

            if self.valid_date < today:
                return "black"

            delta = relativedelta(self.valid_date, today)
            months_remaining = delta.years * 12 + delta.months

            return self._get_color_by_months(months_remaining)

        return "black"

    def _get_color_by_months(self, months: int) -> str:
        if months >= 4:
            return "green"
        elif months == 3:
            return "yellow"
        elif months == 2:
            return "orange"
        elif months == 1:
            return "red"
        else:
            return "black"
