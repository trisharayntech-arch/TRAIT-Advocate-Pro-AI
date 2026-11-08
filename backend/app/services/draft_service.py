import os
import io
from docx import Document as DocxDocument
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def create_docx_file(title: str, content: str, draft_type: str = "Legal Document") -> io.BytesIO:
    """Generates an elegant formatted DOCX file with legal typography."""
    doc = DocxDocument()
    
    # Page setup
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Document Header
    p_header = doc.add_paragraph()
    p_header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_hdr = p_header.add_run("TRAIT ADVOCATE PRO AI — LEGAL WORKSPACE")
    r_hdr.font.size = Pt(8.5)
    r_hdr.font.color.rgb = RGBColor(130, 144, 165)

    # Document Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run(title.upper())
    r_title.bold = True
    r_title.font.size = Pt(16)
    r_title.font.color.rgb = RGBColor(16, 26, 44)  # Midnight Navy

    # Sub-badge
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run(f"[{draft_type.upper()}]")
    r_sub.font.size = Pt(10)
    r_sub.font.color.rgb = RGBColor(37, 99, 235)  # Electric Blue

    doc.add_paragraph()  # Spacer

    # Body Content
    lines = content.split("\n")
    for line in lines:
        stripped = line.strip()
        if not stripped:
            doc.add_paragraph()
            continue
        
        p = doc.add_paragraph()
        if stripped.startswith("### ") or stripped.startswith("## ") or stripped.startswith("# "):
            text = stripped.lstrip("#").strip()
            run = p.add_run(text)
            run.bold = True
            run.font.size = Pt(12)
            run.font.color.rgb = RGBColor(16, 26, 44)
        elif stripped.startswith("**") and stripped.endswith("**"):
            text = stripped.strip("*")
            run = p.add_run(text)
            run.bold = True
            run.font.size = Pt(11)
        else:
            run = p.add_run(stripped)
            run.font.size = Pt(11)
            p.paragraph_format.line_spacing = 1.25

    # Footer Disclaimer
    doc.add_paragraph()
    p_footer = doc.add_paragraph()
    p_footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_foot = p_footer.add_run(
        "CONFIDENTIAL & PRIVILEGED LEGAL WORK PRODUCT — Generated with TRAIT Advocate Pro AI.\n"
        "Notice: This draft is provided for professional review and revision by an Advocate/Lawyer prior to filing or execution."
    )
    r_foot.font.size = Pt(8)
    r_foot.italic = True
    r_foot.font.color.rgb = RGBColor(130, 144, 165)

    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer
