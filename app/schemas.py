from typing import List, Optional, Literal
from pydantic import BaseModel, model_validator
from datetime import date
import math

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

class MeasuringInstrumentResponse(BaseModel):
    id: int
    mit_title: str
    mit_number: str
    mi_number: str
    valid_date: date
    verification_date: Optional[date] = None
    color: str
    index_within_group: int
    group_id: Optional[int]

@model_validator(mode='before')
def calculate_color(cls, values):
    # Получаем объект MeasuringInstrument, а не словарь
    valid_date = values.valid_date if hasattr(values, 'valid_date') else None
    today = date.today()

    if valid_date and valid_date < today:
        values.color = "black"
    else:
        delta_days = (valid_date - today).days if valid_date else 0
        months_remaining = delta_days / 30.0
        rounded_months = math.ceil(months_remaining)

        # Устанавливаем цвет напрямую в объект
        if rounded_months >= 4:
            values.color = "green"
        elif rounded_months == 3:
            values.color = "yellow"
        elif rounded_months == 2:
            values.color = "orange"
        elif rounded_months == 1:
            values.color = "red"
        else:
            values.color = "black"
    
    return values

class Config:
    from_attributes = True

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

class GroupOrderUpdate(BaseModel):
    group_id: List[int]
