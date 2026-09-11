import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.config import get_settings
from app.core.exceptions import register_error_handlers
from app.core.redis import close_redis
from app.services.connection_manager import manager

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    subscriber = asyncio.create_task(manager.start_subscriber())
    try:
        yield
    finally:
        subscriber.cancel()
        try:
            await subscriber
        except asyncio.CancelledError:
            pass
        await close_redis()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)
app.include_router(api_router)


@app.get("/health")
async def health() -> dict:
    return {
        "status": "healthy",
        "version": settings.app_version,
        "timestamp": __import__("datetime").datetime.now().isoformat(),
    }