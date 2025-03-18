from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.models import Group, MeasuringInstrument  # Явный импорт моделей
from app.database import get_db

router = APIRouter(prefix="/groups", tags=["groups"])

# Создание группы
@router.post("/{node_id}/", response_model=schemas.GroupResponse)
def create_new_group(node_id: int, group: schemas.GroupCreate, db: Session = Depends(get_db)):
    node = crud.get_node_by_id(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return crud.create_group(db, group, node_id)

# Получение групп для узла
@router.get("/{node_id}/", response_model=list[schemas.GroupResponse])
def get_all_groups(node_id: int, db: Session = Depends(get_db)):
    groups = crud.get_groups_by_node(db, node_id)
    if not groups:
        raise HTTPException(status_code=404, detail="Groups not found for this node")
    return [schemas.GroupResponse.model_validate(group) for group in groups]

# Удаление группы
@router.delete("/{group_id}")
def delete_group_api(group_id: int, db: Session = Depends(get_db)):
    deleted_group = crud.delete_group(db, group_id)
    if not deleted_group:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"message": "Group deleted successfully"}

# Добавление СИ в группу
@router.put("/assign/{instrument_id}/{group_id}", response_model=schemas.MeasuringInstrumentResponse)
def assign_instrument_to_group_api(
    instrument_id: int, 
    group_id: int, 
    db: Session = Depends(get_db)
):
    # Проверяем существование группы
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Проверяем существование прибора и его принадлежность к узлу группы
    instrument = db.query(MeasuringInstrument).filter(
        MeasuringInstrument.id == instrument_id,
        MeasuringInstrument.node_id == group.node_id  # Группа и СИ должны быть в одном узле
    ).first()
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found or not in the same node")
    
    instrument.groups_id = group_id
    db.commit()
    db.refresh(instrument)
    return schemas.MeasuringInstrumentResponse.model_validate(instrument)

# Удаление СИ из группы
@router.put("/remove/{instrument_id}", response_model=schemas.MeasuringInstrumentResponse)
def remove_instrument_from_group_api(
    instrument_id: int, 
    db: Session = Depends(get_db)
):
    instrument = crud.remove_instrument_from_group(db, instrument_id)
    if not instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return schemas.MeasuringInstrumentResponse.model_validate(instrument)
