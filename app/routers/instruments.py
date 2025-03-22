from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
import logging
from datetime import date

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/instruments", tags=["instruments"])

@router.post("/{node_id}/", response_model=schemas.MeasuringInstrumentResponse)
def create_instrument(node_id: int, instrument: schemas.MeasuringInstrumentCreate, db: Session = Depends(get_db)):
    """
    Создание нового средства измерения для узла.
    """
    logger.info(f"Создание нового средства измерения для узла с ID={node_id}")
    return crud.create_measuring_instrument(db, instrument, node_id)

@router.get("/{node_id}/", response_model=list[schemas.MeasuringInstrumentResponse])
def read_instruments_for_node(node_id: int, db: Session = Depends(get_db)):
    """
    Получение всех средств измерений для узла.
    """
    logger.info(f"Получение средств измерений для узла с ID={node_id}")
    instruments = crud.get_instruments_by_node(db, node_id)
    if not instruments:
        raise HTTPException(status_code=404, detail="Instruments not found for this node")
    return instruments

@router.delete("/{instrument_id}/{node_id}")
def delete_instrument(instrument_id: int, node_id: int, db: Session = Depends(get_db)):
    """
    Удаление средства измерения.
    """
    logger.info(f"Удаление средства измерения с ID={instrument_id} для узла с ID={node_id}")
    deleted_instrument = crud.delete_measuring_instrument(db, instrument_id, node_id)
    if not deleted_instrument:
        raise HTTPException(status_code=404, detail="Instrument not found")
    return {"message": "Instrument deleted successfully"}

@router.get("/{node_id}/search_instruments/")
def search_and_add_instrument(
    node_id: int,
    db: Session = Depends(get_db),
    search: str | None = None,
    mit_number: str | None = None,
    mi_number: str | None = None,
    year: int | None = None
):
    """
    Поиск и добавление средства измерений через API "АРШИН".
    """
    logger.info(f"Начат поиск и добавление средства измерений для узла с ID={node_id}. Параметры поиска: search={search}, mit_number={mit_number}, mi_number={mi_number}, year={year}")
    base_url = "https://fgis.gost.ru/fundmetrology/eapi/vri"
    params = {}
    if search:
        params["search"] = f"*{search}*"
    if mit_number:
        params["mit_number"] = mit_number
    if mi_number:
        params["mi_number"] = mi_number
    if year:
        params["year"] = year

    try:
        logger.info(f"Выполняется GET-запрос к API 'АРШИН' с параметрами: {params}")
        import requests
        response = requests.get(base_url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get("result", {}).get("items", [])
            
            if len(items) == 1:
                instrument_data = items[0]
                
                # Проверка существования прибора
                from app.models import MeasuringInstrument
                existing_instrument = db.query(MeasuringInstrument).filter(
                    MeasuringInstrument.mit_number == instrument_data.get("mit_number"),
                    MeasuringInstrument.mi_number == instrument_data.get("mi_number")
                ).first()
                
                if existing_instrument:
                    logger.warning(f"Попытка добавить уже существующий прибор с mit_number={instrument_data.get('mit_number')} и mi_number={instrument_data.get('mi_number')}")
                    raise HTTPException(
                        status_code=409,
                        detail="Прибор уже существует в базе данных."
                    )
                
                from datetime import datetime
                def parse_date(date_str: str | None) -> date | None:
                    if date_str:
                        try:
                            return datetime.strptime(date_str, "%Y-%m-%d").date()
                        except ValueError:
                            try:
                                return datetime.strptime(date_str, "%d.%m.%Y").date()
                            except ValueError:
                                raise ValueError(f"Invalid date format: {date_str}. Expected format: YYYY-MM-DD or DD.MM.YYYY")
                    return None

                verification_date = parse_date(instrument_data.get("verification_date"))
                valid_date = parse_date(instrument_data.get("valid_date"))
                
                instrument_create = schemas.MeasuringInstrumentCreate(
                    vri_id=instrument_data.get("vri_id"),
                    org_title=instrument_data.get("org_title"),
                    mit_number=instrument_data.get("mit_number"),
                    mit_title=instrument_data.get("mit_title"),
                    mit_notation=instrument_data.get("mit_notation"),
                    mi_modification=instrument_data.get("mi_modification"),
                    mi_number=instrument_data.get("mi_number"),
                    verification_date=verification_date,
                    valid_date=valid_date,
                    result_docnum=instrument_data.get("result_docnum")
                )
                
                logger.info(f"Создание нового средства измерений с mit_number={instrument_data.get('mit_number')} и mi_number={instrument_data.get('mi_number')}")
                return crud.create_measuring_instrument(db, instrument_create, node_id)
            elif len(items) > 1:
                logger.info("Найдено несколько средств измерений. Возвращается список для выбора.")
                return {
                    "message": "Найдено несколько средств измерений. Пожалуйста, выберите одно.",
                    "items": items
                }
            else:
                logger.info("Средства измерений не найдены.")
                return {"message": "Средства измерений не найдены."}
        else:
            logger.error(f"Ошибка при запросе к API 'АРШИН'. Статус код: {response.status_code}")
            raise HTTPException(status_code=response.status_code, detail="Ошибка при запросе к API 'АРШИН'")
    except Exception as e:
        logger.error(f"Произошла ошибка при выполнении запроса к API 'АРШИН': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Произошла ошибка: {str(e)}")

@router.put("/order", response_model=dict)
def update_instruments_order(
    order_update: schemas.InstrumentOrderUpdate,
    db: Session = Depends(get_db)
):
    """
    Обновление порядка средств измерений в базе данных.
    """
    crud.update_instruments_order(db, order_update.instrument_ids)
    return {"status": "success"}
