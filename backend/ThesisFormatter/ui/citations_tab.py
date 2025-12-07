from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QGroupBox, QFormLayout, 
    QLineEdit, QComboBox, QPushButton, QTextEdit, QMessageBox
)
from ThesisFormatter.models.data_classes import Citation
from ThesisFormatter.utils.helpers import format_citation_apa

class CitationsTab(QWidget):
    def __init__(self, citations_list, parent=None):
        super().__init__(parent)
        self.citations = citations_list
        self.setup_ui()
        
    def setup_ui(self):
        layout = QHBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        
        # Form
        form_group = QGroupBox("Thêm trích dẫn mới")
        form_layout = QFormLayout(form_group)
        
        self.citation_type = QComboBox()
        self.citation_type.addItems(["Sách", "Bài báo", "Trang web", "Luận văn"])
        form_layout.addRow("Loại:", self.citation_type)
        
        self.citation_author = QLineEdit()
        form_layout.addRow("Tác giả:", self.citation_author)
        
        self.citation_year = QLineEdit()
        form_layout.addRow("Năm:", self.citation_year)
        
        self.citation_title = QLineEdit()
        form_layout.addRow("Tiêu đề:", self.citation_title)
        
        self.citation_publisher = QLineEdit()
        form_layout.addRow("Nhà xuất bản:", self.citation_publisher)
        
        self.citation_url = QLineEdit()
        form_layout.addRow("URL:", self.citation_url)
        
        add_btn = QPushButton("➕ Thêm trích dẫn")
        add_btn.clicked.connect(self.add_citation)
        form_layout.addRow(add_btn)
        
        layout.addWidget(form_group)
        
        # Citations list
        list_group = QGroupBox("Danh sách trích dẫn")
        list_layout = QVBoxLayout(list_group)
        
        self.citations_display = QTextEdit()
        self.citations_display.setReadOnly(True)
        list_layout.addWidget(self.citations_display)
        
        layout.addWidget(list_group)
        
    def add_citation(self):
        citation = Citation(
            id=len(self.citations) + 1,
            author=self.citation_author.text(),
            year=self.citation_year.text(),
            title=self.citation_title.text(),
            publisher=self.citation_publisher.text(),
            url=self.citation_url.text(),
            citation_type=self.citation_type.currentText()
        )
        
        if not citation.author or not citation.title:
            QMessageBox.warning(self, "Lỗi", "Vui lòng nhập tác giả và tiêu đề!")
            return
            
        self.citations.append(citation)
        self.update_citations_display()
        
        # Clear form
        self.citation_author.clear()
        self.citation_year.clear()
        self.citation_title.clear()
        self.citation_publisher.clear()
        self.citation_url.clear()
        
    def update_citations_display(self):
        html = ""
        for i, c in enumerate(self.citations, 1):
            html += f"<p><b>[{i}]</b> {format_citation_apa(c)}</p>"
        self.citations_display.setHtml(html)
