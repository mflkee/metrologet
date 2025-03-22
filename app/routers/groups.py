from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/groups", tags=["groups"])

# Создание группы
@router.post("/{node_id}/", response_model=schemas.GroupResponse)
def create_new_group(node_id: int, group: schemas.GroupCreate, db: Session = Depends(get_db)):
    node = crud.get_node_by_id(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return crud.create_group(db, group, node_id)

# Получение групп
@router.get("/{node_id}/", response_model=List[schemas.GroupResponse])
def get_all_groups(node_id: int, db: Session = Depends(get_db)):
    groups = crud.get_groups_by_node(db, node_id)
    return [schemas.GroupResponse.model_validate(group) for group in groups]

# Удаление группы
@router.delete("/{group_id}")
def delete_group_api(group_id: int, db: Session = Depends(get_db)):
    deleted_group = crud.delete_group(db, group_id)
    if not deleted_group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group deleted successfully"}

# Удаление СИ из группы
@router.put("/remove/{instrument_id}", response_model=schemas.MeasuringInstrumentResponse)
def remove_instrument_from_group_api(instrument_id: int, db: Session = Depends(get_db)):
    return crud.remove_instrument_from_group(db, instrument_id)

# Привязка СИ к группе
@router.put("/assign/{instrument_id}/{group_id}", response_model=schemas.MeasuringInstrumentResponse)
def assign_instrument_to_group_api(instrument_id: int, group_id: int, db: Session = Depends(get_db)):
    return crud.add_instrument_to_group(db, instrument_id, group_id)

# Обновление порядка групп
@router.put("/{node_id}/order", response_model=dict)
def update_group_order_api(node_id: int, order_update: schemas.GroupOrderUpdate, db: Session = Depends(get_db)):
    crud.update_groups_order(db, node_id, order_update.group_ids)
    return {"status": "success"}
