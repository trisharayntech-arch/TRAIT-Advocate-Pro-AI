import sys
import os
import time
import threading
import httpx
import uvicorn

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.main import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8002, log_level="warning")

if __name__ == "__main__":
    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    time.sleep(2)
    try:
        res = httpx.get("http://127.0.0.1:8002/health", timeout=5.0)
        print("STATUS:", res.status_code)
        print("BODY:", res.json())
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"
        print("SUCCESS: FastAPI backend starts and responds healthy!")
    except Exception as e:
        print("FAILED:", str(e))
        sys.exit(1)
