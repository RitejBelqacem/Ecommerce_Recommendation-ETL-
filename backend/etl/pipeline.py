
from etl.extract import extract_all
from etl.transform import transform_all
from etl.load import load_all
DB_PATH = "instance/database.db"

def run_etl():
    print("🚀 ETL START")

    # 1. EXTRACT
    raw_data = extract_all(DB_PATH)

    # 2. TRANSFORM
    kpis = transform_all(raw_data)

    # 3. LOAD
    result = load_all(kpis, DB_PATH)

    print("✅ ETL DONE")
    print(result)

if __name__ == "__main__":
    run_etl()