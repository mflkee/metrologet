from pydantic import BaseModel
from typing import Optional
from pydantic import BaseModel
from datetime import date

class NodeBase(BaseModel):
    name: str
    description: str | None = None

class Node(NodeBase):
    id: int

    class Config:
        orm_mode = True

class NodeCreate(BaseModel):
    name: str
    description: str

class NodeResponse(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        orm_mode = True

class MeasuringInstrumentCreate(BaseModel):
    vri_id: str
    org_title: str
    mit_number: str
    mit_title: str
    mit_notation: str
    mi_modification: Optional[str] = None
    mi_number: str
    verification_date: Optional[date]  # Allow None
    valid_date: Optional[date]  
    result_docnum: str


class MeasuringInstrumentResponse(BaseModel):
    id: int
    vri_id: str
    org_title: str
    mit_number: str
    mit_title: str
    mit_notation: str
    mi_modification: Optional[str]
    mi_number: str
    verification_date: Optional[date]  # Allow None
    valid_date: Optional[date]  
    result_docnum: str

    class Config:
        orm_mode = True
