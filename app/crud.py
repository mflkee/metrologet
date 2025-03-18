from sqlalchemy import func, label, over
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app import models  # Явный импорт моделей
from app.schemas import GroupCreate, MeasuringInstrumentCreate, NodeCreate
from app import schemas
from app.models import MeasuringInstrument

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


import traceback

def get_instruments_by_node(db: Session, node_id: int):
    from sqlalchemy.sql import func, over, select

    try:
        stmt = (
            select(
                MeasuringInstrument,
                over(
                    func.row_number(),
                    partition_by=MeasuringInstrument.group_id,
                    order_by=MeasuringInstrument.id
                ).label("index_within_group")
            )
            .where(MeasuringInstrument.node_id == node_id)
        )

        result = db.execute(stmt).all()
        print("RAW RESULT:", result)  # Логируем результат запроса
        
        instruments = [
            {
                **row[0].__dict__,
                "index_within_group": row[1],
                "group_id": row[0].group_id  # Явно добавляем поле group_id
            }
            for row in result
        ]

        print("INSTRUMENTS:", instruments)  # Логируем готовые данные
        return instruments

    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()  # Выводим полный стек ошибки
        return {"error": "Internal Server Error"}, 500


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
    
    instrument.groups_id = group_id  # ✅ Теперь линтер понимает, что это колонка
    db.commit()
    db.refresh(instrument)
    return instrument

def remove_instrument_from_group(db: Session, instrument_id: int):
    instrument = db.query(models.MeasuringInstrument).filter(
        models.MeasuringInstrument.id == instrument_id
    ).first()
    if instrument:
        instrument.groups_id = None  # ✅ Корректное присваивание
        db.commit()
        db.refresh(instrument)
        return instrument
    return None
