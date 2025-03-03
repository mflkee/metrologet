from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/nodes", tags=["nodes"])

@router.post("/", response_model=schemas.NodeResponse)
def create_node(node: schemas.NodeCreate, db: Session = Depends(get_db)):
    return crud.create_node(db, node)

@router.get("/", response_model=list[schemas.NodeResponse])
def read_nodes(db: Session = Depends(get_db)):
    return crud.get_nodes(db)

@router.get("/{node_id}", response_model=schemas.NodeResponse)
def read_node(node_id: int, db: Session = Depends(get_db)):
    node = crud.get_node_by_id(db, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

@router.get("/search/", response_model=list[schemas.NodeResponse])
def search_nodes(query: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    return crud.search_nodes(db, query)

@router.delete("/{node_id}", response_model=schemas.NodeResponse)
def delete_node(node_id: int, db: Session = Depends(get_db)):
    deleted_node = crud.delete_node(db, node_id)
    if not deleted_node:
        raise HTTPException(status_code=404, detail="Node not found")
    return deleted_node
