from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QScrollArea, QFrame, QLabel, QTextBrowser
)
from PyQt6.QtCore import Qt
from ThesisFormatter.models.data_classes import Settings, Figure, Table, Citation
from ThesisFormatter.utils.helpers import format_citation_apa
from typing import List

class PreviewTab(QWidget):
    def __init__(self, settings: Settings, parent=None):
        super().__init__(parent)
        self.settings = settings
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Background for the preview area (darker to contrast with white pages)
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("background-color: #2e2e3e; border: none;")
        
        self.preview_container = QWidget()
        self.preview_container.setStyleSheet("background-color: #2e2e3e;")
        self.preview_layout = QVBoxLayout(self.preview_container)
        self.preview_layout.setAlignment(Qt.AlignmentFlag.AlignHCenter)
        self.preview_layout.setSpacing(30)
        self.preview_layout.setContentsMargins(40, 40, 40, 40)
        
        scroll.setWidget(self.preview_container)
        layout.addWidget(scroll)
        
    def update_preview(self, text: str, figures: List[Figure], tables: List[Table], citations: List[Citation]):
        # Clear old preview
        while self.preview_layout.count():
            child = self.preview_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
        
        if not text.strip():
            return
            
        # Generate pages with numbering type
        # Returns list of tuples: (content, page_number_str)
        pages_data = self.generate_pages_data(text, figures, tables, citations)
        
        for content, page_num_str in pages_data:
            page_widget = self.create_preview_page(content, page_num_str)
            self.preview_layout.addWidget(page_widget)
            
    def create_preview_page(self, content: str, page_num_str: str):
        from ThesisFormatter.ui.styles import PREVIEW_CSS
        
        # A4 size: 210mm x 297mm. At 96 DPI (screen), that's ~794px x 1123px
        PAGE_WIDTH = 794
        PAGE_HEIGHT = 1123
        
        page = QFrame()
        page.setObjectName("previewPage")
        page.setFixedSize(PAGE_WIDTH, PAGE_HEIGHT)
        
        layout = QVBoxLayout(page)
        layout.setSpacing(0)
        # Margins converted from cm to px (approx 1cm = 37.8px)
        margin_top = int(self.settings.margin_top * 37.8)
        margin_bottom = int(self.settings.margin_bottom * 37.8)
        margin_left = int(self.settings.margin_left * 37.8)
        margin_right = int(self.settings.margin_right * 37.8)
        
        layout.setContentsMargins(margin_left, margin_top, margin_right, margin_bottom)
        
        # Content Area using QTextBrowser for better HTML rendering
        content_browser = QTextBrowser()
        content_browser.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        content_browser.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        
        # Force white background and black text specifically for the browser widget
        content_browser.setStyleSheet("background-color: white; border: none; color: black;")
        
        # Dynamic CSS for settings
        dynamic_css = f"""
        <style>
            body {{
                font-size: {self.settings.font_size}pt;
                line-height: {self.settings.line_spacing};
            }}
            h1 {{ font-size: {self.settings.h1_size}pt; }}
            h2 {{ font-size: {self.settings.h2_size}pt; }}
            h3 {{ font-size: {self.settings.h3_size}pt; }}
            p {{ text-indent: {self.settings.indent}cm; }}
        </style>
        """
        
        full_html = f"""
        <html>
        <head>
            {PREVIEW_CSS}
            {dynamic_css}
        </head>
        <body>
            <div class="page-content">
                {content}
            </div>
        </body>
        </html>
        """
        
        content_browser.setHtml(full_html)
        layout.addWidget(content_browser, 1)
        
        # Footer with page number
        page_footer = QLabel(page_num_str)
        page_footer.setObjectName("previewPageNumber")
        page_footer.setAlignment(Qt.AlignmentFlag.AlignCenter)
        page_footer.setFixedHeight(30)
        # Force black color for page number
        page_footer.setStyleSheet("color: black; background-color: transparent; font-family: 'Times New Roman'; font-size: 12pt;")
        layout.addWidget(page_footer)
        
        return page
        
    def generate_pages_data(self, text: str, figures: List[Figure], tables: List[Table], citations: List[Citation]) -> List[tuple]:
        from ThesisFormatter.utils.helpers import to_roman
        import markdown
        import re
        
        # --- PRE-PROCESS TEXT FOR NUMBERING ---
        processed_lines = []
        h1_count = 0
        h2_count = 0
        h3_count = 0
        
        lines = text.split("\n")
        for line in lines:
            if line.startswith("# "):
                h1_count += 1
                h2_count = 0
                h3_count = 0
                roman = to_roman(h1_count)
                raw_title = line[2:].strip()
                processed_lines.append(f"# CHƯƠNG {roman}: {raw_title.upper()}")
            elif line.startswith("## "):
                h2_count += 1
                h3_count = 0
                raw_title = line[3:].strip()
                processed_lines.append(f"## {h1_count}.{h2_count}. {raw_title}")
            elif line.startswith("### "):
                h3_count += 1
                raw_title = line[4:].strip()
                processed_lines.append(f"### {h1_count}.{h2_count}.{h3_count}. {raw_title}")
            else:
                processed_lines.append(line)
                
        processed_text = "\n".join(processed_lines)
        
        pages_data = []
        
        # --- FRONT MATTER (Roman Numerals) ---
        front_page_num = 1
        
        # Page 1: TOC
        toc = self.generate_toc_content(processed_text)
        pages_data.append((f"<h1>MỤC LỤC</h1>\n{toc}", to_roman(front_page_num)))
        front_page_num += 1
        
        # Page 2: Figures (if any)
        if figures:
            figures_content = "<br>".join([f"<div class='toc-item'>{f.number}: {f.caption}</div>" for f in figures])
            pages_data.append((f"<h1>DANH MỤC HÌNH ẢNH</h1>\n{figures_content}", to_roman(front_page_num)))
            front_page_num += 1
        
        # Page 3: Tables (if any)
        if tables:
            tables_content = "<br>".join([f"<div class='toc-item'>{t.number}: {t.caption}</div>" for t in tables])
            pages_data.append((f"<h1>DANH MỤC BẢNG BIỂU</h1>\n{tables_content}", to_roman(front_page_num)))
            front_page_num += 1
            
        # --- MAIN BODY (Arabic Numerals) ---
        content_page_num = 1
        
        # Split content by H1 (# )
        # Regex to split but keep the delimiter (Heading 1)
        # We look for lines starting with # (but not ##)
        chapters = re.split(r'(^# [^\n]+)', processed_text, flags=re.MULTILINE)
        
        # The first element might be empty or pre-chapter text
        if chapters and not chapters[0].strip():
            chapters.pop(0)
            
        # Process chapters
        current_content = ""
        
        # If text doesn't start with H1, treat beginning as a chapter
        if processed_text.strip() and not processed_text.strip().startswith("# "):
             # Just render the whole text if no H1
             html = markdown.markdown(processed_text, extensions=['tables'])
             pages_data.append((self.post_process_html(html), str(content_page_num)))
             content_page_num += 1
        else:
            # Iterate through parts
            i = 0
            while i < len(chapters):
                part = chapters[i]
                if part.startswith("# "):
                    # This is a heading
                    heading_text = part[2:].strip()
                    heading_html = f"<h1>{heading_text}</h1>"
                    
                    # Get the content following this heading
                    content_md = ""
                    if i + 1 < len(chapters):
                        content_md = chapters[i+1]
                        i += 1
                    
                    # Convert markdown content to HTML
                    body_html = markdown.markdown(content_md, extensions=['tables'])
                    full_html = heading_html + self.post_process_html(body_html)
                    
                    pages_data.append((full_html, str(content_page_num)))
                    content_page_num += 1
                i += 1
            
        # References page (if any)
        if citations:
            refs = "<br>".join([f"<div style='text-indent: 0; margin-bottom: 10pt;'>[{i+1}] {format_citation_apa(c)}</div>" for i, c in enumerate(citations)])
            pages_data.append((f"<h1>TÀI LIỆU THAM KHẢO</h1>\n{refs}", str(content_page_num)))
            content_page_num += 1
        
        return pages_data
        
    def post_process_html(self, html: str) -> str:
        """Apply custom classes or styles to generated HTML"""
        # Fix <p> wrapping around placeholders
        html = html.replace("<p>[", "<p class='placeholder'>[")
        return html

    def generate_toc_content(self, text: str) -> str:
        toc = []
        for line in text.split("\n"):
            if line.startswith("# "):
                title = line[2:] # Already upper and numbered
                toc.append(f"<div class='toc-item' style='font-weight: bold;'>{title}</div>")
            elif line.startswith("## "):
                toc.append(f"<div class='toc-item' style='margin-left: 1cm;'>{line[3:]}</div>")
            elif line.startswith("### "):
                toc.append(f"<div class='toc-item' style='margin-left: 2cm; font-style: italic;'>{line[4:]}</div>")
        return "\n".join(toc)

