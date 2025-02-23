from fastapi import FastAPI
from app.database import Base, engine
from app.routers.nodes import router as nodes
from app.routers.instruments import router as instruments
from fastapi.middleware.cors import CORSMiddleware

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(nodes)
app.include_router(instruments)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Адрес фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
