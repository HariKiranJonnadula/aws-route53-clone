from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, SessionLocal
from .seed import seed_database
from .routers import auth, hosted_zones, records, export_import


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    # Seed default data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="AWS Route 53 Clone API",
    description="Backend API for AWS Route 53 Clone supporting Hosted Zones, DNS Records, and BIND Import/Export.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev & demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(hosted_zones.router)
app.include_router(records.router)
app.include_router(export_import.router)


@app.get("/")
def root():
    return {
        "service": "AWS Route 53 API Clone",
        "status": "online",
        "documentation": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}
