from typing import List, Optional, Literal
from datetime import date
from pydantic import BaseModel

class NodeBase(BaseModel):
    name: str
    description: Optional[str] = None

class NodeCreate(NodeBase):
    pass

class NodeResponse(NodeBase):
    id: int
    color: Literal["green", "yellow", "orange", "red", "black"]

    model_config = {
        "from_attributes": True
    }

class MeasuringInstrumentBase(BaseModel):
    vri_id: str
    org_title: str
    mit_number: str
    mit_title: str
    mit_notation: str
    mi_modification: Optional[str] = None
    mi_number: str
    valid_date: Optional[date] = None
    verification_date: Optional[date] = None
    result_docnum: str


class MeasuringInstrumentCreate(MeasuringInstrumentBase):

    pass

class MeasuringInstrumentResponse(BaseModel):
    id: int
    mit_title: str
    mit_number: str
    mi_number: str
    valid_date: Optional[date] = None
    verification_date: Optional[date] = None
    color: Literal["green", "yellow", "orange", "red", "black"]
    index_within_group: Optional[int] = None
    group_id: Optional[int] = None

    model_config = {
        "from_attributes": True
    }
class InstrumentSearchResult(BaseModel):
    vri_id: str
    mit_title: str
    mit_number: str
    mi_number: str
    verification_date: Optional[date]
    valid_date: Optional[date]
    result_docnum: Optional[str]


class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int
    node_id: int
    instrument_ids: List[int]  # Или List[MeasuringInstrumentResponse], если нужна полная информация

    model_config = {
        "from_attributes": True
    }

class InstrumentOrderUpdate(BaseModel):
    instrument_ids: List[int]

class GroupOrderUpdate(BaseModel):
    group_ids: List[int]

