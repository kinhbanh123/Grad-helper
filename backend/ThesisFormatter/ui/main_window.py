
from PyQt6.QtWidgets import (
    QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, QTabWidget, 
    QStatusBar, QLabel, QFrame, QPushButton, QMessageBox, QFileDialog
)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QAction, QKeySequence

from ThesisFormatter.models.data_classes import Settings
from ThesisFormatter.ui.editor_tab import EditorTab
from ThesisFormatter.ui.preview_tab import PreviewTab
from ThesisFormatter.ui.settings_tab import SettingsTab
from ThesisFormatter.ui.citations_tab import CitationsTab
from ThesisFormatter.utils.export_docx import export_to_docx
from ThesisFormatter.utils.export_pdf import export_to_pdf

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.settings = Settings()
        self.citations = []
        self.setup_ui()
        self.setup_menus()
        self.setWindowTitle("Thesis Formatter - Định dạng Đồ án/Luận văn")
        self.setMinimumSize(1400, 900)
        self.showMaximized()
        
    def setup_ui(self):
        # Main Layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # --- SIDEBAR ---
        sidebar = QWidget()
        sidebar.setObjectName("sidebar")
        sidebar.setFixedWidth(250)
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(10, 20, 10, 20)
        sidebar_layout.setSpacing(10)
        
        # App Title
        app_title = QLabel("📄 Thesis Formatter")
        app_title.setObjectName("sidebarTitle")
        app_title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sidebar_layout.addWidget(app_title)
        
        sidebar_layout.addSpacing(20)
        
        # Export Buttons
        export_docx_btn = QPushButton("Xuất Word (.docx)")
        export_docx_btn.setObjectName("sidebarBtn")
        export_docx_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        export_docx_btn.clicked.connect(self.export_word)
        sidebar_layout.addWidget(export_docx_btn)
        
        export_pdf_btn = QPushButton("Xuất PDF (.pdf)")
        export_pdf_btn.setObjectName("sidebarBtn")
        export_pdf_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        export_pdf_btn.clicked.connect(self.export_pdf)
        sidebar_layout.addWidget(export_pdf_btn)
        
        sidebar_layout.addStretch()
        
        # Info
        version_label = QLabel("v1.0.0")
        version_label.setStyleSheet("color: #6c7086; font-size: 12px;")
        version_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        sidebar_layout.addWidget(version_label)
        
        main_layout.addWidget(sidebar)
        
        # --- MAIN CONTENT AREA ---
        content_area = QWidget()
        content_layout = QVBoxLayout(content_area)
        content_layout.setContentsMargins(20, 20, 20, 20)
        content_layout.setSpacing(20)
        
        # Tabs
        self.tabs = QTabWidget()
        self.tabs.setDocumentMode(False) # Use standard tabs for better styling
        
        self.editor_tab = EditorTab()
        self.editor_tab.set_citations(self.citations)
        self.editor_tab.textChanged.connect(self.on_text_changed)
        self.tabs.addTab(self.editor_tab, "📝 Soạn thảo")
        
        self.preview_tab = PreviewTab(self.settings)
        self.tabs.addTab(self.preview_tab, "👁️ Xem trước")
        
        self.citations_tab = CitationsTab(self.citations)
        self.tabs.addTab(self.citations_tab, "📚 Trích dẫn")
        
        self.settings_tab = SettingsTab(self.settings)
        self.tabs.addTab(self.settings_tab, "⚙️ Cài đặt")
        
        content_layout.addWidget(self.tabs)
        
        main_layout.addWidget(content_area)

        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.word_count_label = QLabel("Số từ: 0")
        self.status_bar.addPermanentWidget(self.word_count_label)
        

        
    def setup_menus(self):
        menubar = self.menuBar()
        file_menu = menubar.addMenu("Tệp")
        
        new_action = QAction("Mới", self)
        new_action.setShortcut(QKeySequence.StandardKey.New)
        new_action.triggered.connect(self.new_document)
        file_menu.addAction(new_action)
        
        open_action = QAction("Mở...", self)
        open_action.setShortcut(QKeySequence.StandardKey.Open)
        open_action.triggered.connect(self.open_document)
        file_menu.addAction(open_action)
        
        save_action = QAction("Lưu", self)
        save_action.setShortcut(QKeySequence.StandardKey.Save)
        save_action.triggered.connect(self.save_document)
        file_menu.addAction(save_action)
        
    def on_text_changed(self):
        text = self.editor_tab.editor.toPlainText()
        word_count = len(text.split())
        self.word_count_label.setText(f"Số từ: {word_count}")
        
        QTimer.singleShot(500, lambda: self.preview_tab.update_preview(
            text, 
            self.editor_tab.figures, 
            self.editor_tab.tables, 
            self.citations
        ))
        
    def new_document(self):
        self.editor_tab.editor.clear()
        self.editor_tab.figures.clear()
        self.editor_tab.tables.clear()
        self.citations.clear()
        self.citations_tab.update_citations_display()
        
    def open_document(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Mở tài liệu", "", "Text Files (*.txt *.md)")
        if file_path:
            with open(file_path, 'r', encoding='utf-8') as f:
                self.editor_tab.editor.setText(f.read())
                
    def save_document(self):
        file_path, _ = QFileDialog.getSaveFileName(self, "Lưu tài liệu", "document.md", "Markdown (*.md)")
        if file_path:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(self.editor_tab.editor.toPlainText())
            self.status_bar.showMessage(f"Đã lưu: {file_path}", 3000)
            
    def export_word(self):
        file_path, _ = QFileDialog.getSaveFileName(self, "Xuất Word", "do-an.docx", "Word Document (*.docx)")
        if file_path:
            success, msg = export_to_docx(
                file_path, 
                self.editor_tab.editor.toPlainText(), 
                self.settings,
                self.editor_tab.figures,
                self.editor_tab.tables,
                self.citations
            )
            if success:
                QMessageBox.information(self, "Thành công", msg)
            else:
                QMessageBox.critical(self, "Lỗi", msg)
                
    def export_pdf(self):
        file_path, _ = QFileDialog.getSaveFileName(self, "Xuất PDF", "do-an.pdf", "PDF Document (*.pdf)")
        if file_path:
            success, msg = export_to_pdf(
                file_path, 
                self.editor_tab.editor.toPlainText(), 
                self.settings,
                self.citations
            )
            if success:
                QMessageBox.information(self, "Thành công", msg)
            else:
                QMessageBox.critical(self, "Lỗi", msg)
