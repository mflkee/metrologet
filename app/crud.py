from sqlalchemy.orm import Session
from sqlalchemy import or_
from app import models  # Явный импорт моделей
from app.schemas import GroupCreate, MeasuringInstrumentCreate, NodeCreate
from app import schemas

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


def get_instruments_by_node(db: Session, node_id: int):
    return db.query(models.MeasuringInstrument).filter(models.MeasuringInstrument.node_id == node_id).all()

def search_nodes(db: Session, query: str):
    return db.query(models.Node).filter(
        or_(
            models.Node.name.ilike(f"%{query}%"),  # Поиск по названию
            models.Node.description.ilike(f"%{query}%")  # Поиск по описанию
        )
    ).all()


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
    
    instrument.group_id = group_id  # ✅ Теперь линтер понимает, что это колонка
    db.commit()
    db.refresh(instrument)
    return instrument

def remove_instrument_from_group(db: Session, instrument_id: int):
    instrument = db.query(models.MeasuringInstrument).filter(
        models.MeasuringInstrument.id == instrument_id
    ).first()
    if instrument:
        instrument.group_id = None  # ✅ Корректное присваивание
        db.commit()
        db.refresh(instrument)
        return instrument
    return None
