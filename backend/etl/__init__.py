# etl/__init__.py
from .extract   import extract_all
from .transform import transform_all
from .load      import load_all

def run_etl(db_path: str = "instance/database.db") -> dict:
    raw    = extract_all(db_path)
    kpis   = transform_all(raw)
    result = load_all(kpis, db_path)
    return result