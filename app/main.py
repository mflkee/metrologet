from fastapi import FastAPI
from app.database import Base, engine
from app.routers.nodes import router as nodes
from app.routers.instruments import router as instruments
from fastapi.middleware.cors import CORSMiddleware
from app.routers.groups import router as groups

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

app = FastAPI(redirect_slashes=False)  # Отключаем автоматический редирект

app.include_router(nodes)
app.include_router(instruments)
app.include_router(groups)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
