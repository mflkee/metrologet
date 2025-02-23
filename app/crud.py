from sqlalchemy.orm import Session
from app import models, schemas

# CRUD для узлов
def create_node(db: Session, node: schemas.NodeCreate):
    db_node = models.Node(name=node.name, description=node.description)
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

# CRUD для средств измерений
def create_measuring_instrument(db: Session, instrument: schemas.MeasuringInstrumentCreate, node_id: int):
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

