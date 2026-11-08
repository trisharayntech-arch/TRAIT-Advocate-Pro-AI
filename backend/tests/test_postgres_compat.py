import pytest
from sqlalchemy import create_engine
from app.database import db_url

def test_postgres_driver_and_dialect():
    engine_v3 = create_engine("postgresql+psycopg://user:pass@localhost:5432/testdb", pool_pre_ping=True)
    assert engine_v3.dialect.name == "postgresql"
    assert engine_v3.dialect.driver == "psycopg"

    engine_v2 = create_engine("postgresql+psycopg2://user:pass@localhost:5432/testdb", pool_pre_ping=True)
    assert engine_v2.dialect.name == "postgresql"
    assert engine_v2.dialect.driver == "psycopg2"

def test_neon_postgres_url_normalization():
    neon_raw_url = "postgres://neondb_owner:npg_sample123@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
    normalized = neon_raw_url.replace("postgres://", "postgresql+psycopg://", 1)
    assert normalized.startswith("postgresql+psycopg://")
    engine = create_engine(normalized, pool_pre_ping=True)
    assert engine.dialect.name == "postgresql"
