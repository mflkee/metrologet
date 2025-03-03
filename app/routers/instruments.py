from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import get_db
from datetime import date
import requests

router = APIRouter(prefix="/instruments", tags=["instruments"])

@router.post("/{node_id}/", response_model=schemas.MeasuringInstrumentResponse)
def create_instrument(node_id: int, instrument: schemas.MeasuringInstrumentCreate, db: Session = Depends(get_db)):
    return crud.create_measuring_instrument(db, instrument, node_id)

@router.get("/{node_id}/", response_model=list[schemas.MeasuringInstrumentResponse])
def read_instruments_for_node(node_id: int, db: Session = Depends(get_db)):
    instruments = crud.get_instruments_by_node(db, node_id)
    if not instruments:
        raise HTTPException(status_code=404, detail="Instruments not found for this node")
    return instruments

@router.delete("/{instrument_id}/{node_id}")
def delete_instrument(instrument_id: int, node_id: int, db: Session = Depends(get_db)):
    deleted_instrument = crud.delete_measuring_instrument(db, instrument_id, node_id)
    if not deleted_instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return {"message": "Instrument deleted successfully"}
