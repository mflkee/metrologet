from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date

class NodeBase(BaseModel):
    name: str
    description: Optional[str] = None

class NodeCreate(NodeBase):
    pass

class NodeResponse(NodeBase):
    id: int
    color: Literal["green", "yellow", "orange", "red", "black"]

    class Config:
        from_attributes = True 

class MeasuringInstrumentBase(BaseModel):
    vri_id: str
    org_title: str
    mit_number: str
    mit_title: str
    mit_notation: str
    mi_modification: Optional[str] = None
    mi_number: str
    verification_date: Optional[date] = None
    valid_date: Optional[date] = None
    result_docnum: str

class MeasuringInstrumentCreate(MeasuringInstrumentBase):
    pass

class MeasuringInstrumentResponse(MeasuringInstrumentBase):
    id: int
    node_id: int
    group_id: Optional[int] = None  # новое поле для группы
    color: Literal["green", "yellow", "orange", "red", "black"]

    class Config:
        from_attributes = True


#===groups===#

class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    pass

class GroupResponse(GroupBase):
    id: int
    node_id: int

    model_config = {
        "from_attributes": True
    }
