from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
import logging
from typing import Optional
from datetime import datetime, date

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

from fastapi import Query


@router.get("/{node_id}/search_instruments/")
def search_and_add_instrument(
    node_id: int,
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    mit_number: Optional[str] = Query(None),
    mi_number: Optional[str] = Query(None),
    year: Optional[str] = Query(None),  # Принимаем строку, чтобы избежать ошибки валидации пустой строки
    result_docnum: Optional[str] = Query(None),
    verification_date: Optional[str] = Query(None),  # Оставляем строкой
    valid_date: Optional[str] = Query(None)            # Оставляем строкой
):
    """
    Поиск прибора в API 'АРШИН' с последующим добавлением в базу данных,
    если найден ровно один прибор.
    """

    # Функция для преобразования строки в дату
    def convert_to_date(date_str: Optional[str]) -> Optional[date]:
        if date_str and date_str.strip():
            for fmt in ("%Y-%m-%d", "%d.%m.%Y"):
                try:
                    return datetime.strptime(date_str, fmt).date()
                except ValueError:
                    continue
            raise HTTPException(status_code=422, detail=f"Неверный формат даты: {date_str}")
        return None

    # Преобразуем даты, если заданы
    verification_date_obj = convert_to_date(verification_date)
    valid_date_obj = convert_to_date(valid_date)

    # Преобразуем год из строки в число, если значение задано
    year_int = None
    if year and year.strip():
        try:
            year_int = int(year)
        except ValueError:
            raise HTTPException(status_code=422, detail=f"Неверный формат года: {year}")

    # Формируем словарь параметров без пустых значений
    params = {}
    if search and search.strip():
        params["search"] = f"*{search.strip()}*"
    if mit_number and mit_number.strip():
        params["mit_number"] = mit_number.strip()
    if mi_number and mi_number.strip():
        params["mi_number"] = mi_number.strip()
    if year_int is not None:
        params["year"] = year_int
    if result_docnum and result_docnum.strip():
        params["result_docnum"] = result_docnum.strip()
    if verification_date_obj:
        params["verification_date"] = verification_date_obj.isoformat()
    if valid_date_obj:
        params["valid_date"] = valid_date_obj.isoformat()

    logger.info(f"Запрос к API 'АРШИН' с параметрами: {params}")

    base_url = "https://fgis.gost.ru/fundmetrology/eapi/vri"
    try:
        import requests
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            data = response.json()
            items = data.get("result", {}).get("items", [])
            if len(items) == 1:
                instrument_data = items[0]
                from app.models import MeasuringInstrument
                # Проверяем, существует ли уже прибор с такими mit_number и mi_number
                existing_instrument = db.query(MeasuringInstrument).filter(
                    MeasuringInstrument.mit_number == instrument_data.get("mit_number"),
                    MeasuringInstrument.mi_number == instrument_data.get("mi_number")
                ).first()
                if existing_instrument:
                    logger.warning(
                        f"Прибор с mit_number={instrument_data.get('mit_number')} и mi_number={instrument_data.get('mi_number')} уже существует."
                    )
                    raise HTTPException(
                        status_code=409,
                        detail="Прибор уже существует в базе данных."
                    )

                # Функция для преобразования даты из данных API
                def parse_date(date_str: Optional[str]) -> Optional[date]:
                    if date_str:
                        for fmt in ("%Y-%m-%d", "%d.%m.%Y"):
                            try:
                                return datetime.strptime(date_str, fmt).date()
                            except ValueError:
                                continue
                        raise HTTPException(status_code=422, detail=f"Неверный формат даты: {date_str}")
                    return None

                verification_date_parsed = parse_date(instrument_data.get("verification_date"))
                valid_date_parsed = parse_date(instrument_data.get("valid_date"))

                instrument_create = schemas.MeasuringInstrumentCreate(
                    vri_id=instrument_data.get("vri_id"),
                    org_title=instrument_data.get("org_title"),
                    mit_number=instrument_data.get("mit_number"),
                    mit_title=instrument_data.get("mit_title"),
                    mit_notation=instrument_data.get("mit_notation"),
                    mi_modification=instrument_data.get("mi_modification"),
                    mi_number=instrument_data.get("mi_number"),
                    verification_date=verification_date_parsed,
                    valid_date=valid_date_parsed,
                    result_docnum=instrument_data.get("result_docnum")
                )
                logger.info(
                    f"Создание прибора с mit_number={instrument_data.get('mit_number')} и mi_number={instrument_data.get('mi_number')}"
                )
                return crud.create_measuring_instrument(db, instrument_create, node_id)
            elif len(items) > 1:
                logger.info("Найдено несколько приборов. Возвращается список для выбора.")
                return {
                    "message": "Найдено несколько средств измерений. Пожалуйста, выберите одно.",
                    "items": items
                }
            else:
                logger.info("Приборы не найдены.")
                return {"message": "Средства измерений не найдены."}
        else:
            logger.error(f"Ошибка API 'АРШИН'. Статус: {response.status_code}")
            raise HTTPException(status_code=response.status_code, detail="Ошибка при запросе к API 'АРШИН'")
    except Exception as e:
        logger.error(f"Ошибка при выполнении запроса к API 'АРШИН': {str(e)}")
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
