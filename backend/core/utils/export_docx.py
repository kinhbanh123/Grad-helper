from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from core.models.data_classes import Settings, Figure, Table, Citation
from core.utils.helpers import format_citation_apa
from typing import List
import os
import re
import traceback
import matplotlib.pyplot as plt
import io

def render_latex_to_image(latex_str):
    """Renders LaTeX string to an image stream using matplotlib."""
    try:
        fig = plt.figure(figsize=(0.1, 0.1)) # Dummy size, will be adjusted
        
        # Clean up: matplotlib expects $...$ for math.
        render_str = latex_str
        if not render_str.startswith('$'):
            render_str = f"${render_str}$"
            
        text = fig.text(0.5, 0.5, render_str, fontsize=12, ha='center', va='center')
        
        # Get the bounding box of the text
        renderer = fig.canvas.get_renderer()
        bbox = text.get_window_extent(renderer=renderer)
        
        # Resize figure to fit text
        # Convert bbox pixels to inches (dpi default is 100)
        dpi = 100
        fig.set_size_inches(bbox.width / dpi + 0.1, bbox.height / dpi + 0.1)
        
        # Re-position text
        text.set_position((0.5, 0.5))
        
        # Save to buffer
        buf = io.BytesIO()
        fig.savefig(buf, format='png', dpi=300, transparent=True, bbox_inches='tight', pad_inches=0.02)
        buf.seek(0)
        plt.close(fig)
        return buf
    except Exception as e:
        print(f"Error rendering LaTeX: {e}")
        plt.close(fig)
        return None

def create_element(name):
    return OxmlElement(name)

def create_attribute(element, name, value):
    element.set(qn(name), value)

def add_toc_field(paragraph, field_code):
    """Insert a Word field (like TOC) into a paragraph"""
    run = paragraph.add_run()
    fldChar = create_element('w:fldChar')
    create_attribute(fldChar, 'w:fldCharType', 'begin')
    run._element.append(fldChar)

    run = paragraph.add_run()
    instrText = create_element('w:instrText')
    create_attribute(instrText, 'xml:space', 'preserve')
    instrText.text = field_code
    run._element.append(instrText)

    run = paragraph.add_run()
    fldChar = create_element('w:fldChar')
    create_attribute(fldChar, 'w:fldCharType', 'separate')
    run._element.append(fldChar)

    run = paragraph.add_run()
    fldChar = create_element('w:fldChar')
    create_attribute(fldChar, 'w:fldCharType', 'end')
    run._element.append(fldChar)

def set_font_complex(font, font_name, font_size=None, bold=False, italic=False, color=None):
    """Set font properties comprehensively for all script types"""
    font.name = font_name
    if font_size:
        font.size = Pt(font_size)
    font.bold = bold
    font.italic = italic
    if color:
        font.color.rgb = color
        
    # Access the underlying XML element to set fonts for all regions
    rPr = font._element.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    rFonts.set(qn('w:ascii'), font_name)
    rFonts.set(qn('w:hAnsi'), font_name)
    rFonts.set(qn('w:eastAsia'), font_name)
    rFonts.set(qn('w:cs'), font_name)

def setup_styles(doc, settings: Settings):
    """Configure document styles to match thesis requirements"""
    styles = doc.styles
    
    # --- STYLES ---
    # --- STYLES ---
    style = doc.styles['Normal']
    # Use set_font_complex to ensure font is applied to all script types (important for Vietnamese)
    set_font_complex(style.font, settings.font_family, settings.font_size, color=RGBColor(0, 0, 0))

    # Paragraph formatting for Normal style
    pf = style.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf.line_spacing = settings.line_spacing
    # Áp dụng thụt đầu dòng từ settings
    pf.first_line_indent = Cm(settings.indent)
    # Áp dụng khoảng cách đoạn
    pf.space_after = Pt(8.5) 
    pf.space_before = Pt(0)

    # Set Paper Size to A4 (Critical for correct margins)
    for section in doc.sections:
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        section.top_margin = Cm(settings.margin_top)
        section.bottom_margin = Cm(settings.margin_bottom)
        section.left_margin = Cm(settings.margin_left)
        section.right_margin = Cm(settings.margin_right)
    
    # Heading 1
    style_h1 = styles['Heading 1']
    set_font_complex(style_h1.font, settings.font_family, settings.h1_size, bold=True, color=RGBColor(0, 0, 0))
    paragraph_format = style_h1.paragraph_format
    paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph_format.space_before = Pt(24)
    paragraph_format.space_after = Pt(18)
    
    # Heading 2
    style_h2 = styles['Heading 2']
    set_font_complex(style_h2.font, settings.font_family, settings.h2_size, bold=True, color=RGBColor(0, 0, 0))
    paragraph_format = style_h2.paragraph_format
    paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    paragraph_format.space_before = Pt(18)
    paragraph_format.space_after = Pt(12)
    
    # Heading 3
    style_h3 = styles['Heading 3']
    set_font_complex(style_h3.font, settings.font_family, settings.h3_size, bold=True, italic=True, color=RGBColor(0, 0, 0))
    paragraph_format = style_h3.paragraph_format
    paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    paragraph_format.space_before = Pt(12)
    paragraph_format.space_after = Pt(6)
    
    # Heading 4
    style_h4 = styles['Heading 4']
    set_font_complex(style_h4.font, settings.font_family, settings.font_size, italic=True, color=RGBColor(0, 0, 0))
    paragraph_format = style_h4.paragraph_format
    paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    paragraph_format.space_before = Pt(6)
    paragraph_format.space_after = Pt(6)
    
    # Heading 5
    try:
        style_h5 = styles.add_style('Heading 5', WD_STYLE_TYPE.PARAGRAPH)
    except:
        style_h5 = styles['Heading 5']
    style_h5.base_style = styles['Normal']
    set_font_complex(style_h5.font, settings.font_family, settings.font_size, italic=True, color=RGBColor(0, 0, 0))
    paragraph_format = style_h5.paragraph_format
    paragraph_format.left_indent = Cm(0.63) # Indent slightly
    paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    paragraph_format.space_before = Pt(6)
    paragraph_format.space_after = Pt(6)
    
    # Front Heading (for TOC, List of Tables, etc. - Looks like H1 but not in TOC)
    try:
        style_front = styles.add_style('Front Heading', WD_STYLE_TYPE.PARAGRAPH)
    except:
        style_front = styles['Front Heading']
    style_front.base_style = styles['Normal']
    set_font_complex(style_front.font, settings.font_family, settings.h1_size, bold=True, color=RGBColor(0, 0, 0))
    style_front.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    style_front.paragraph_format.space_before = Pt(24)
    style_front.paragraph_format.space_after = Pt(18)

    # Figure Caption Style
    try:
        style_fig_cap = styles.add_style('Figure Caption', WD_STYLE_TYPE.PARAGRAPH)
    except:
        style_fig_cap = styles['Figure Caption']
    style_fig_cap.base_style = styles['Normal']
    set_font_complex(style_fig_cap.font, settings.font_family, settings.font_size, italic=True, color=RGBColor(0, 0, 0))
    style_fig_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    style_fig_cap.paragraph_format.space_before = Pt(6)
    style_fig_cap.paragraph_format.space_after = Pt(12)

    # Table Caption Style
    try:
        style_tbl_cap = styles.add_style('Table Caption', WD_STYLE_TYPE.PARAGRAPH)
    except:
        style_tbl_cap = styles['Table Caption']
    style_tbl_cap.base_style = styles['Normal']
    set_font_complex(style_tbl_cap.font, settings.font_family, settings.font_size, bold=True, color=RGBColor(0, 0, 0))
    style_tbl_cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    style_tbl_cap.paragraph_format.space_before = Pt(12)
    style_tbl_cap.paragraph_format.space_after = Pt(6)
    
    # List Bullet
    try:
        style_bullet = styles['List Bullet']
        set_font_complex(style_bullet.font, settings.font_family, settings.font_size, color=RGBColor(0, 0, 0))
    except:
        pass

def export_to_docx(file_path: str, text: str, settings: Settings, 
                   figures: List[Figure], tables: List[Table], citations: List[Citation]):
    try:
        doc = Document()
        setup_styles(doc, settings)
        
        # Set margins
        for section in doc.sections:
            section.top_margin = Cm(settings.margin_top)
            section.bottom_margin = Cm(settings.margin_bottom)
            section.left_margin = Cm(settings.margin_left)
            section.right_margin = Cm(settings.margin_right)
        
        # --- FRONT MATTER ---
        
        # 1. MỤC LỤC
        # Add instruction to update fields
        instr_p = doc.add_paragraph("Lưu ý: Nhấn Ctrl+A rồi nhấn F9 (hoặc chuột phải chọn 'Update Field') để cập nhật Mục lục và Danh mục.")
        instr_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_font_complex(instr_p.runs[0].font, settings.font_family, 11, italic=True, color=RGBColor(255, 0, 0))

        toc_p = doc.add_paragraph("MỤC LỤC", style='Front Heading')
        # Insert TOC Field: \o "1-3" includes Heading 1-3, \h hyperlinks, \z hide page numbers in web, \u outline levels
        p = doc.add_paragraph()
        add_toc_field(p, r'TOC \o "1-3" \h \z \u')
        doc.add_page_break()
        
        # 2. DANH MỤC HÌNH ẢNH
        if figures:
            doc.add_paragraph("DANH MỤC HÌNH ẢNH", style='Front Heading')
            # Insert TOC for Figure Caption style
            p = doc.add_paragraph()
            add_toc_field(p, r'TOC \h \z \t "Figure Caption,1"')
            doc.add_page_break()
            
        # 3. DANH MỤC BẢNG BIỂU
        # Note: We don't have a tables list passed in explicitly with captions usually, 
        # but we detect them in text. However, for the TOC to work, we just need the captions in text to use the style.
        # We'll assume if there are tables in text, we want this list. 
        # Since we don't track tables list perfectly in backend yet, we'll just add it if text contains "Bảng"
        if "Bảng" in text:
            doc.add_paragraph("DANH MỤC BẢNG BIỂU", style='Front Heading')
            p = doc.add_paragraph()
            add_toc_field(p, r'TOC \h \z \t "Table Caption,1"')
            doc.add_page_break()
        
        # --- CONTENT ---
        h1_count = 0
        h2_count = 0
        h3_count = 0
        h4_count = 0
        h5_count = 0
        
        lines = text.split("\n")
        i = 0
        pending_table_caption = None

        while i < len(lines):
            line = lines[i]
            stripped_line = line.strip()
            
            # Table detection
            if stripped_line.startswith("|"):
                table_lines = []
                while i < len(lines) and lines[i].strip().startswith("|"):
                    table_lines.append(lines[i])
                    i += 1
                
                # Process table
                if len(table_lines) >= 2:
                    rows_data = []
                    for tl in table_lines:
                        if "---" in tl: continue
                        cells = [c.strip() for c in tl.split("|")[1:-1]]
                        rows_data.append(cells)
                    
                    if rows_data:
                        # Add spacing before table
                        doc.add_paragraph() 

                        rows = len(rows_data)
                        cols = len(rows_data[0])
                        table = doc.add_table(rows=rows, cols=cols)
                        table.style = 'Table Grid'
                        
                        for r in range(rows):
                            row_cells = table.rows[r].cells
                            for c in range(min(cols, len(rows_data[r]))):
                                cell = row_cells[c]
                                cell.text = rows_data[r][c]
                                for paragraph in cell.paragraphs:
                                    set_font_complex(paragraph.runs[0].font, settings.font_family, settings.font_size, 
                                                     bold=(r==0), color=RGBColor(0, 0, 0))
                                    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER if r == 0 else WD_ALIGN_PARAGRAPH.LEFT
                        
                        # Render Pending Caption BELOW Table
                        if pending_table_caption:
                            # Use Table Caption Style
                            doc.add_paragraph(pending_table_caption, style='Table Caption')
                            pending_table_caption = None
                        
                        # Add spacing after table group
                        doc.add_paragraph()

                continue 
            
            # Flush pending caption if not followed by a table immediately
            if pending_table_caption:
                doc.add_paragraph(pending_table_caption, style='Table Caption')
                pending_table_caption = None

            # Check for Table Captions: Bảng 1.1: Caption
            if stripped_line.startswith("Bảng") and ":" in stripped_line:
                pending_table_caption = stripped_line
                i += 1
                continue

            # Heading 1: CHƯƠNG I
            if line.startswith("# "):
                h1_count += 1
                h2_count = 0
                h3_count = 0
                h4_count = 0
                from core.utils.helpers import to_roman
                roman = to_roman(h1_count)
                raw_title = line[2:].strip()
                
                if settings.auto_numbering:
                    # Logic tách dòng tiêu đề chương
                    if settings.h1_split:
                        # Sử dụng \n để tạo soft break (Shift+Enter) trong Word
                        # Điều này giúp tiêu đề vẫn là 1 paragraph (tốt cho TOC) nhưng hiển thị 2 dòng
                        prefix = f"{settings.h1_prefix} {roman}" if settings.h1_prefix else f"{roman}"
                        full_title = f"{prefix}\n{raw_title.upper()}"
                    else:
                        prefix = f"{settings.h1_prefix} {roman}: " if settings.h1_prefix else f"{roman}. "
                        full_title = f"{prefix}{raw_title.upper()}"
                else:
                    full_title = raw_title.upper()
                
                heading = doc.add_paragraph(full_title, style='Heading 1')
                for run in heading.runs:
                    set_font_complex(run.font, settings.font_family, settings.h1_size, bold=True, color=RGBColor(0, 0, 0))
            
            # Heading 2: 1.1
            elif line.startswith("## "):
                h2_count += 1
                h3_count = 0
                h4_count = 0
                raw_title = line[3:].strip()
                if settings.auto_numbering:
                    # Nếu hierarchical_numbering = True -> 1.1, ngược lại -> 1
                    prefix = f"{h1_count}.{h2_count}." if settings.hierarchical_numbering else f"{h2_count}."
                    full_title = f"{prefix} {raw_title}"
                else:
                    full_title = raw_title
                
                heading = doc.add_paragraph(full_title, style='Heading 2')
                for run in heading.runs:
                    set_font_complex(run.font, settings.font_family, settings.h2_size, bold=True, color=RGBColor(0, 0, 0))
            
            # Heading 3: 1.1.1
            elif line.startswith("### "):
                h3_count += 1
                h4_count = 0
                raw_title = line[4:].strip()
                if settings.auto_numbering:
                    prefix = f"{h1_count}.{h2_count}.{h3_count}." if settings.hierarchical_numbering else f"{h2_count}.{h3_count}."
                    full_title = f"{prefix} {raw_title}"
                else:
                    full_title = raw_title
                
                heading = doc.add_paragraph(full_title, style='Heading 3')
                for run in heading.runs:
                    set_font_complex(run.font, settings.font_family, settings.h3_size, bold=True, italic=True, color=RGBColor(0, 0, 0))

            # Heading 4
            elif line.startswith("#### "):
                h4_count += 1
                h5_count = 0 # Reset h5_count
                raw_title = line[5:].strip()
                
                if settings.auto_numbering:
                    prefix = f"{h1_count}.{h2_count}.{h3_count}.{h4_count}." if settings.hierarchical_numbering else f"{h2_count}.{h3_count}.{h4_count}."
                    full_title = f"{prefix} {raw_title}"
                else:
                    full_title = raw_title
                
                # Word usually doesn't have Heading 4 by default or it's small. We'll use Heading 4 style if exists or Normal bold italic
                try:
                    heading = doc.add_paragraph(full_title, style='Heading 4')
                except:
                    heading = doc.add_paragraph(full_title, style='Normal')
                
                for run in heading.runs:
                    set_font_complex(run.font, settings.font_family, settings.font_size, bold=True, italic=True, color=RGBColor(0, 0, 0))
            
            # Bullet points: - , -- , ---
            elif re.match(r'^(\-{1,3}|\*{1,3})\s', line):
                match = re.match(r'^(\-{1,3}|\*{1,3})\s', line)
                prefix = match.group(1)
                level = len(prefix)
                content = line[len(prefix)+1:].strip()
                
                # Chuẩn đồ án Việt Nam: dùng gạch đầu dòng (-) và dấu cộng (+)
                bullet_char = "-"
                if level == 2:
                    bullet_char = "+"
                elif level == 3:
                    bullet_char = "-"
                
                # Manual bullet implementation using Normal style + Indent
                p = doc.add_paragraph(style='Normal')
                
                # Calculate indent
                # Base indent (e.g. 1.27cm) + Level indent
                base_indent = settings.indent # cm
                level_indent = (level - 1) * 0.75 # cm
                total_indent = base_indent + level_indent
                
                # Hanging indent logic:
                # Left Indent = Total Indent + Hanging Amount
                # First Line Indent = -Hanging Amount
                # This makes the bullet sit at Total Indent, and text wrap nicely.
                hanging = 0.63 # cm (approx 0.25 inch)
                
                p_fmt = p.paragraph_format
                p_fmt.left_indent = Cm(total_indent + hanging)
                p_fmt.first_line_indent = Cm(-hanging)
                p_fmt.tab_stops.add_tab_stop(Cm(total_indent + hanging))
                
                # Add bullet char and tab
                run = p.add_run(f"{bullet_char}\t")
                set_font_complex(run.font, settings.font_family, settings.font_size, color=RGBColor(0, 0, 0))
                
                # Add content
                # We need to process formatting in content as well (bold, italic, latex)
                # Reuse the logic? Or just simple add for now?
                # Let's reuse the simple formatting logic by splitting
                parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|<u>.*?</u>|\$.*?\$)', content)
                for part in parts:
                    if not part: continue
                     # LaTeX handling
                    if part.startswith('$') and part.endswith('$'):
                        latex_content = part
                        # Handle display math inside bullet? usually inline
                        inner_tex = part
                        if part.startswith('$$'): inner_tex = part[2:-2]
                        elif part.startswith('$'): inner_tex = part[1:-1]
                        
                        image_stream = render_latex_to_image(inner_tex)
                        if image_stream:
                            run = p.add_run()
                            run.add_picture(image_stream, height=Cm(0.5))
                        else:
                            run = p.add_run(part)
                            set_font_complex(run.font, settings.font_family, settings.font_size, color=RGBColor(0, 0, 0))
                        continue

                    run = p.add_run()
                    text_content = part
                    is_bold = False
                    is_italic = False
                    is_underline = False
                    
                    if part.startswith('**') and part.endswith('**'):
                        text_content = part[2:-2]
                        is_bold = True
                    elif part.startswith('*') and part.endswith('*'):
                        text_content = part[1:-1]
                        is_italic = True
                    elif part.startswith('<u>') and part.endswith('</u>'):
                        text_content = part[3:-4]
                        is_underline = True
                        
                    run.text = text_content
                    set_font_complex(run.font, settings.font_family, settings.font_size, 
                                     bold=is_bold, italic=is_italic, color=RGBColor(0, 0, 0))
                    if is_underline:
                        run.font.underline = True
            
            elif line.strip():
                stripped_line = line.strip()
                print(f"DEBUG LINE: '{stripped_line}'")
                
                # Check for Figure placeholders: [Hình 1.1: Caption]
                # Relaxed regex to handle potential spaces
                match = re.match(r'\[\s*(Hình \d+\.\d+)\s*:\s*(.*)\s*\]', stripped_line)
                if match:
                    fig_num = match.group(1)
                    caption = match.group(2)
                    print(f"DEBUG: Found placeholder for {fig_num}")
                    
                    # Find figure data
                    # Normalize spaces for comparison
                    fig_data = next((f for f in figures if f.number.replace(" ", "") == fig_num.replace(" ", "")), None)
                    
                    if fig_data:
                        print(f"DEBUG: Found figure data: {fig_data.path}")
                        if fig_data.path:
                            try:
                                # Resolve path if relative
                                img_path = fig_data.path
                                if not os.path.isabs(img_path):
                                    img_path = os.path.abspath(img_path)
                                
                                print(f"DEBUG: Checking image path: {img_path}")
                                if os.path.exists(img_path):
                                    # Add image
                                    # Use width from figure data if available, else default to 16cm
                                    width = Cm(fig_data.width) if hasattr(fig_data, 'width') and fig_data.width else Cm(16)
                                    
                                    # Create a new paragraph for the image
                                    p = doc.add_paragraph()
                                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                                    
                                    # Reset indentation to ensure true center
                                    p.paragraph_format.left_indent = Cm(0)
                                    p.paragraph_format.right_indent = Cm(0)
                                    p.paragraph_format.first_line_indent = Cm(0)
                                    
                                    run = p.add_run()
                                    run.add_picture(img_path, width=width)
                                    print(f"DEBUG: Inserted image {img_path}")
                                    
                                    # Add caption
                                    caption_text = f"{fig_num}: {caption}"
                                    caption_p = doc.add_paragraph(caption_text, style='Caption')
                                    caption_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                                    
                                else:
                                    print(f"DEBUG: Image path not found: {img_path}")
                                    doc.add_paragraph(f"[Hình ảnh không tìm thấy: {img_path}]", style='Normal')
                            except Exception as e:
                                print(f"Error adding image {img_path}: {e}")
                                doc.add_paragraph(f"[Lỗi chèn hình: {fig_num}]", style='Normal')
                        else:
                             print("DEBUG: Figure path is empty")
                    else:
                        print(f"DEBUG: Figure data not found for {fig_num}")
                        doc.add_paragraph(f"[Hình ảnh không tìm thấy dữ liệu: {fig_num}]", style='Normal')
                
                else:
                    # Normal paragraph with formatting support
                    p = doc.add_paragraph(style='Normal')
                    
                    # Regex to split by formatting tokens: **bold**, *italic*, <u>underline</u>, $$display$$, $inline$
                    # Priority: $$ first
                    parts = re.split(r'(\$\$.*?\$\$|\$.*?\$|\*\*.*?\*\*|\*.*?\*|<u>.*?</u>)', stripped_line)
                    
                    for part in parts:
                        if not part: continue
                        
                        # LaTeX handling
                        if part.startswith('$') and part.endswith('$'):
                            latex_content = part
                            # Handle display math $$...$$
                            is_display = part.startswith('$$')
                            if is_display:
                                inner_tex = part[2:-2]
                                latex_content = inner_tex 
                            
                            image_stream = render_latex_to_image(latex_content)
                            if image_stream:
                                if is_display:
                                    run = p.add_run()
                                    run.add_picture(image_stream, height=Cm(0.8))
                                else:
                                    run = p.add_run()
                                    run.add_picture(image_stream, height=Cm(0.5))
                            else:
                                # Fallback
                                run = p.add_run(part)
                                set_font_complex(run.font, settings.font_family, settings.font_size, color=RGBColor(0, 0, 0))
                            continue

                        run = p.add_run()
                        text_content = part
                        is_bold = False
                        is_italic = False
                        is_underline = False
                        
                        if part.startswith('**') and part.endswith('**'):
                            text_content = part[2:-2]
                            is_bold = True
                        elif part.startswith('*') and part.endswith('*'):
                            text_content = part[1:-1]
                            is_italic = True
                        elif part.startswith('<u>') and part.endswith('</u>'):
                            text_content = part[3:-4]
                            is_underline = True
                            
                        run.text = text_content
                        set_font_complex(run.font, settings.font_family, settings.font_size, 
                                         bold=is_bold, italic=is_italic, color=RGBColor(0, 0, 0))
                        if is_underline:
                            run.font.underline = True
                    
                    p.paragraph_format.first_line_indent = Cm(settings.indent)
                    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                    for run in p.runs:
                        set_font_complex(run.font, settings.font_family, settings.font_size, color=RGBColor(0, 0, 0))
            
            i += 1
                
        # --- REFERENCES ---
        if citations:
            doc.add_page_break()
            ref_p = doc.add_paragraph("TÀI LIỆU THAM KHẢO", style='Front Heading')
            for i, c in enumerate(citations, 1):
                p = doc.add_paragraph(f"[{i}] {format_citation_apa(c)}")
                p.paragraph_format.first_line_indent = Cm(0)
                p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                for run in p.runs:
                     set_font_complex(run.font, settings.font_family, settings.font_size, color=RGBColor(0, 0, 0))
        
        doc.save(file_path)
        return True, f"Đã xuất file Word:\n{file_path}"
        
    except Exception as e:
        traceback.print_exc()
        return False, f"Không thể xuất file Word:\n{str(e)}"
