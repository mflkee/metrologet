from sqlalchemy.sql import func, select
from sqlalchemy.orm import Session
from app import models
from app.schemas import MeasuringInstrumentCreate, NodeCreate
from app import schemas
from app.models import MeasuringInstrument, Group
from fastapi import HTTPException

# CRUD для узлов
def create_node(db: Session, node: NodeCreate):
    db_node = models.Node(name=node.name, description=node.description)
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

def get_node_by_id(db: Session, node_id: int):
    return db.query(models.Node).filter(models.Node.id == node_id).first()

# CRUD для средств измерений
def create_measuring_instrument(db: Session, instrument: MeasuringInstrumentCreate, node_id: int):
    # Проверка на существующий прибор
    existing = db.query(MeasuringInstrument).filter(
        MeasuringInstrument.mit_number == instrument.mit_number,
        MeasuringInstrument.mi_number == instrument.mi_number
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=409,
            detail="Instrument with this MIT and MI numbers already exists"
        )
    
    db_instrument = models.MeasuringInstrument(**instrument.model_dump(), node_id=node_id)
    db.add(db_instrument)
    db.commit()
    db.refresh(db_instrument)
    return db_instrument

def delete_node(db: Session, node_id: int):
    node = db.query(models.Node).filter(models.Node.id == node_id).first()
    if node:
        db.delete(node)
        db.commit()
        return node
    
    return None

def delete_measuring_instrument(db: Session, instrument_id: int, node_id: int):
    # Находим СИ по его ID и проверяем, что оно принадлежит указанному узлу
    instrument = db.query(models.MeasuringInstrument).filter(
        models.MeasuringInstrument.id == instrument_id,
        models.MeasuringInstrument.node_id == node_id
    ).first()

    if instrument:
        db.delete(instrument)
        db.commit()
        return instrument  # Возвращаем удаленный объект для подтверждения

    return None  # Если СИ не найдено, возвращаем None

def get_nodes(db: Session):
    return db.query(models.Node).all()

def search_nodes(db: Session, query: str):
    # Поиск узлов по имени, используя ILIKE для регистронезависимого поиска
    return db.query(models.Node).filter(models.Node.name.ilike(f"%{query}%")).all()

import traceback

def get_instruments_by_node(db: Session, node_id: int):
    try:
        stmt = (
            select(
                MeasuringInstrument,
                MeasuringInstrument.index_within_group  # Используем сохранённое значение
            )
            .join(Group, Group.id == MeasuringInstrument.group_id, isouter=True)
            .where(MeasuringInstrument.node_id == node_id)
            .order_by(Group.order, MeasuringInstrument.group_id, MeasuringInstrument.index_within_group)
        )

        result = db.execute(stmt).all()
        print("RAW RESULT:", result)
        
        instruments = [
            {
                "id": row[0].id,
                "mit_title": row[0].mit_title,
                "mit_number": row[0].mit_number,
                "mi_number": row[0].mi_number,
                "valid_date": row[0].valid_date,
                "verification_date": row[0].verification_date,
                "color": row[0].color,
                "index_within_group": row[0].index_within_group,
                "group_id": row[0].group_id
            }
            for row in result
        ]

        print("INSTRUMENTS:", instruments)
        return instruments

    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()
        # Вместо возврата кортежа выбрасываем HTTPException
        raise HTTPException(status_code=500, detail="Internal Server Error")


#===groups===#
# === ГРУППЫ ===
def create_group(db: Session, group: schemas.GroupCreate, node_id: int):
    db_group = models.Group(name=group.name, node_id=node_id)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def get_groups_by_node(db: Session, node_id: int):
    return db.query(models.Group).filter(models.Group.node_id == node_id).all()

def delete_group(db: Session, group_id: int):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if group:
        db.delete(group)
        db.commit()
        return group
    return None

def add_instrument_to_group(db: Session, instrument_id: int, group_id: int):
    # Получаем прибор и группу
    instrument = db.query(models.MeasuringInstrument).filter(
        models.MeasuringInstrument.id == instrument_id
    ).first()
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    
    if not instrument or not group:
        return None
    
    # Проверяем, что группа и прибор принадлежат одному узлу
    if instrument.node_id != group.node_id:
        return None
    
    instrument.group_id = group_id
    db.commit()
    db.refresh(instrument)
    return instrument

def remove_instrument_from_group(db: Session, instrument_id: int):
    instrument = db.query(models.MeasuringInstrument).filter(
        models.MeasuringInstrument.id == instrument_id
    ).first()
    if instrument:
        instrument.group_id = None
        db.commit()
        db.refresh(instrument)
        # Если нужно, можно здесь установить index_within_group в 0 или другой индекс,
        # либо выполнить повторный запрос для получения обновлённого значения.
        return instrument
    return None

def update_groups_order(db: Session, node_id: int, group_ids: list[int]):
    # Проверяем принадлежность групп узлу
    groups = db.query(Group).filter(Group.id.in_(group_ids)).all()
    for group in groups:
        if group.node_id != node_id:
            raise ValueError(f"Группа {group.id} не принадлежит узлу {node_id}")
    
    # Обновляем порядок
    for index, group_id in enumerate(group_ids):
        db.query(Group).filter(Group.id == group_id).update({"order": index})
    db.commit()


def get_instruments_count_in_group(db: Session, group_id: int) -> int:
    return db.query(func.count(MeasuringInstrument.id)).filter(
        MeasuringInstrument.group_id == group_id
    ).scalar()

def update_instruments_order(db: Session, instrument_ids: list[int]):
    print("Получен новый порядок:", instrument_ids)
    for index, instrument_id in enumerate(instrument_ids):
        db.query(MeasuringInstrument).filter(MeasuringInstrument.id == instrument_id).update(
            {"index_within_group": index + 1}, synchronize_session="fetch"
        )
    db.commit()
