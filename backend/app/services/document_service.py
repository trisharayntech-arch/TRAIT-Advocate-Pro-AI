import os
import re
from typing import List, Tuple
from app.config import settings

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt'}

def is_allowed_file(filename: str) -> bool:
    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def extract_text_from_file(file_path: str, ext: str) -> str:
    ext = ext.lower()
    extracted_text = ""
    try:
        if ext == ".pdf":
            # Try PyMuPDF first
            try:
                import fitz
                doc = fitz.open(file_path)
                for page in doc:
                    t = page.get_text()
                    if t:
                        extracted_text += t + "\n"
                doc.close()
            except ImportError:
                # Fallback to pypdf
                try:
                    import pypdf
                    reader = pypdf.PdfReader(file_path)
                    for page in reader.pages:
                        t = page.extract_text()
                        if t:
                            extracted_text += t + "\n"
                except Exception as pe:
                    extracted_text = f"[PDF Reader Notice: {str(pe)}]"

        elif ext == ".docx":
            from docx import Document as DocxDocument
            doc = DocxDocument(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            extracted_text = "\n".join(paragraphs)

        elif ext == ".txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                extracted_text = f.read()

    except Exception as e:
        extracted_text = f"[Extraction Notice: Could not extract full text: {str(e)}]"
    
    return extracted_text.strip()

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
    """Splits text into overlapping chunks based on words/sentences."""
    if not text:
        return []
    
    words = text.split()
    if len(words) <= chunk_size:
        return [text]
    
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def search_chunks(query: str, chunks: List[str], top_k: int = 3) -> List[Tuple[str, float]]:
    """Safe fallback keyword scoring search for RAG when vector embedding API is unavailable."""
    if not chunks:
        return []
    
    query_tokens = set(re.findall(r'\w+', query.lower()))
    if not query_tokens:
        return [(c, 0.0) for c in chunks[:top_k]]
    
    scored_chunks = []
    for c in chunks:
        chunk_tokens = re.findall(r'\w+', c.lower())
        if not chunk_tokens:
            continue
        matches = sum(1 for t in chunk_tokens if t in query_tokens)
        score = matches / (len(query_tokens) + 1)
        scored_chunks.append((c, score))
    
    scored_chunks.sort(key=lambda x: x[1], reverse=True)
    return scored_chunks[:top_k]
