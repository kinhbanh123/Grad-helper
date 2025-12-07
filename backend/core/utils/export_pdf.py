from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from ThesisFormatter.models.data_classes import Settings, Citation
from ThesisFormatter.utils.helpers import format_citation_apa
from typing import List

def export_to_pdf(file_path: str, text: str, settings: Settings, citations: List[Citation]):
    try:
        doc = SimpleDocTemplate(
            file_path,
            pagesize=A4,
            topMargin=settings.margin_top * cm,
            bottomMargin=settings.margin_bottom * cm,
            leftMargin=settings.margin_left * cm,
            rightMargin=settings.margin_right * cm
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        heading1 = ParagraphStyle(
            'Heading1Custom',
            parent=styles['Heading1'],
            fontSize=settings.h1_size,
            alignment=1,  # Center
            spaceAfter=20
        )
        
        normal = ParagraphStyle(
            'NormalCustom',
            parent=styles['Normal'],
            fontSize=settings.font_size,
            firstLineIndent=settings.indent * cm,
            alignment=4  # Justify
        )
        
        story = []
        
        # TOC
        story.append(Paragraph("MỤC LỤC", heading1))
        story.append(Spacer(1, 20))
        for line in text.split("\n"):
            if line.startswith("# "):
                title = line[2:].upper() if settings.h1_uppercase else line[2:]
                story.append(Paragraph(f"<b>{title}</b>", styles['Normal']))
            elif line.startswith("## "):
                story.append(Paragraph(f"    {line[3:]}", styles['Normal']))
        story.append(PageBreak())
        
        # Content
        for line in text.split("\n"):
            if line.startswith("# "):
                title = line[2:].upper() if settings.h1_uppercase else line[2:]
                story.append(Paragraph(title, heading1))
            elif line.startswith("## "):
                story.append(Paragraph(line[3:], styles['Heading2']))
            elif line.startswith("### "):
                story.append(Paragraph(f"<i>{line[4:]}</i>", styles['Heading3']))
            elif line.strip():
                story.append(Paragraph(line, normal))
                
        # References
        if citations:
            story.append(PageBreak())
            story.append(Paragraph("TÀI LIỆU THAM KHẢO", heading1))
            for i, c in enumerate(citations, 1):
                story.append(Paragraph(f"[{i}] {format_citation_apa(c)}", styles['Normal']))
        
        doc.build(story)
        return True, f"Đã xuất file PDF:\n{file_path}"
        
    except Exception as e:
        return False, f"Không thể xuất file PDF:\n{str(e)}"
