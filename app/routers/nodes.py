from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import crud, schemas
from .. database import get_db

# Создаем роутер для nodes
router = APIRouter(prefix="/nodes", tags=["nodes"])

# Маршрут для создания узла
@router.post("/", response_model=schemas.NodeResponse)
def create_node(node: schemas.NodeCreate, db: Session = Depends(get_db)):
    return crud.create_node(db, node)

# Маршрут для получения всех узлов
@router.get("/", response_model=list[schemas.NodeResponse])
def read_nodes(db: Session = Depends(get_db)):
    return crud.get_nodes(db)

# В файле app/routers/nodes.py
@router.get("/{node_id}", response_model=schemas.NodeResponse)
def read_node(node_id: int, db: Session = Depends(get_db)):
    node = crud.get_node_by_id(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

# маршрут для поиска и фильтрации узлов
# В файле app/routers/nodes.py
@router.get("/search/", response_model=list[schemas.NodeResponse])
def search_nodes(
    query: str = Query(..., min_length=1),  # Обязательный параметр
    db: Session = Depends(get_db)
):
    nodes = crud.search_nodes(db, query)
    return nodes

# Маршрут для получения всех средств измерений для конкретного узла
@router.get("/{node_id}/instruments/", response_model=list[schemas.MeasuringInstrumentResponse])
def read_instruments_for_node(node_id: int, db: Session = Depends(get_db)):
    instruments = crud.get_instruments_by_node(db, node_id)
    if not instruments:
        raise HTTPException(status_code=404, detail="Instruments not found for this node")
    return instruments

# Маршрут для удаления узла
@router.delete("/{node_id}", response_model=schemas.Node)
def delete_node(node_id: int, db: Session = Depends(get_db)):
    deleted_node = crud.delete_node(db, node_id)
    if not deleted_node:
        raise HTTPException(status_code=404, detail="Node not found")
    return deleted_node
