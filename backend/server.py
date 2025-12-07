from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import uvicorn
import uuid
from ThesisFormatter.models.data_classes import Settings, Figure, Table, Citation
from ThesisFormatter.utils.export_docx import export_to_docx

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create images directory
if not os.path.exists("images"):
    os.makedirs("images")

# Mount images for preview
app.mount("/images", StaticFiles(directory="images"), name="images")

class ExportRequest(BaseModel):
    content: str
    settings: dict
    figures: List[dict]
    tables: List[dict]
    citations: List[dict]

class ProjectData(BaseModel):
    content: str
    settings: dict
    figures: List[dict]
    citations: List[dict]

PROJECT_FILE = "saved_project.json"

@app.post("/api/save")
async def save_project(data: ProjectData):
    try:
        import json
        with open(PROJECT_FILE, "w", encoding="utf-8") as f:
            json.dump(data.dict(), f, ensure_ascii=False, indent=2)
        return {"status": "success", "message": "Đã lưu dự án thành công!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/load")
async def load_project():
    try:
        import json
        if not os.path.exists(PROJECT_FILE):
            return {"exists": False}
            
        with open(PROJECT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {"exists": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join("images", filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {
            "url": f"http://localhost:8080/images/{filename}",
            "path": os.path.abspath(file_path),
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export/docx")
async def export_docx_endpoint(req: ExportRequest):
    # ... (giữ nguyên logic export cũ)
    try:
        # Convert dicts back to data classes
        settings = Settings(**req.settings)
        # Fix figures path: Ensure we use absolute paths from the request
        figures = []
        for f in req.figures:
            # If path is a URL (http...), we need to resolve it to local path
            # But for simplicity, the frontend should send the 'path' returned by upload API
            figures.append(Figure(**f))
            
        tables = [Table(**t) for t in req.tables]
        citations = [Citation(**c) for c in req.citations]
        
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
            output_path = tmp.name
            
        success, msg = export_to_docx(output_path, req.content, settings, figures, tables, citations)
        
        if not success:
            raise HTTPException(status_code=500, detail=msg)
            
        return FileResponse(output_path, filename="thesis.docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        
    except Exception as e:
        import traceback
        traceback.print_exc() # Print full stack trace to console
        print(f"EXPORT ERROR: {str(e)}") # Print error message
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
