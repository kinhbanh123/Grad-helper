from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QFrame, QLabel, QComboBox, 
    QPushButton, QTextEdit, QFileDialog, QDialog, QFormLayout, 
    QLineEdit, QDialogButtonBox, QSpinBox, QListWidget
)
from PyQt6.QtGui import QFont, QImage, QTextCursor
from PyQt6.QtCore import pyqtSignal, QDateTime
from ThesisFormatter.models.data_classes import Figure, Table
from ThesisFormatter.ui.table_dialog import TableEditorDialog
from ThesisFormatter.ui.image_dialog import ImageDialog
import os

class ThesisTextEdit(QTextEdit):
    def __init__(self, parent_tab):
        super().__init__()
        self.parent_tab = parent_tab

    def insertFromMimeData(self, source):
        if source.hasImage():
            image = source.imageData()
            if image:
                self.parent_tab.handle_pasted_image(image)
                return
        super().insertFromMimeData(source)
        
    def mouseDoubleClickEvent(self, event):
        # Get text under cursor
        cursor = self.cursorForPosition(event.pos())
        line_text = cursor.block().text().strip()
        
        # Check for Figure: [Hình 1.1: Caption]
        if line_text.startswith("[") and line_text.endswith("]"):
            import re
            match = re.search(r"\[(Hình \d+\.\d+):", line_text)
            if match:
                fig_num = match.group(1)
                self.parent_tab.edit_image(fig_num, cursor.block())
                return

        # Check for Table: Bảng 1.1: Caption OR Table content (| ... |)
        # If clicked on table content, we need to find the caption or the table object
        # This is harder because we need to look around. 
        # For now, let's support clicking on the Caption line: Bảng 1.1: ...
        if line_text.startswith("Bảng") and ":" in line_text:
             parts = line_text.split(":")
             if len(parts) > 0:
                 table_num = parts[0].strip()
                 self.parent_tab.edit_table(table_num, cursor.block())
                 return
                 
        super().mouseDoubleClickEvent(event)

class EditorTab(QWidget):
    textChanged = pyqtSignal()
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.figures = []
        self.tables = []
        self.citations = [] # Reference to main citations list
        self.current_chapter = 1
        self.setup_ui()
        
        # Create images directory
        if not os.path.exists("images"):
            os.makedirs("images")
            
    def set_citations(self, citations_list):
        self.citations = citations_list
        
    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(10)
        
        # --- TOOLBAR ---
        toolbar = QFrame()
        toolbar.setObjectName("toolbar")
        toolbar_layout = QHBoxLayout(toolbar)
        toolbar_layout.setContentsMargins(10, 5, 10, 5)
        toolbar_layout.setSpacing(10)
        
        # Heading Controls
        toolbar_layout.addWidget(QLabel("Cấp độ:"))
        self.level_combo = QComboBox()
        self.level_combo.addItems(["H1 - Chương", "H2 - Mục", "H3 - Tiểu mục", "H4", "H5", "H6"])
        self.level_combo.setFixedWidth(120)
        toolbar_layout.addWidget(self.level_combo)
        
        add_title_btn = QPushButton("➕ Thêm tiêu đề")
        add_title_btn.setObjectName("actionBtn")
        add_title_btn.clicked.connect(self.add_title)
        toolbar_layout.addWidget(add_title_btn)
        
        toolbar_layout.addWidget(self.create_separator())
        
        # Formatting
        bold_btn = QPushButton("B")
        bold_btn.setFixedWidth(30)
        bold_btn.setToolTip("In đậm (Ctrl+B)")
        bold_btn.setStyleSheet("font-weight: bold;")
        bold_btn.clicked.connect(lambda: self.format_text("bold"))
        toolbar_layout.addWidget(bold_btn)
        
        italic_btn = QPushButton("I")
        italic_btn.setFixedWidth(30)
        italic_btn.setToolTip("In nghiêng (Ctrl+I)")
        italic_btn.setStyleSheet("font-style: italic;")
        italic_btn.clicked.connect(lambda: self.format_text("italic"))
        toolbar_layout.addWidget(italic_btn)
        
        underline_btn = QPushButton("U")
        underline_btn.setFixedWidth(30)
        underline_btn.setToolTip("Gạch chân (Ctrl+U)")
        underline_btn.setStyleSheet("text-decoration: underline;")
        underline_btn.clicked.connect(lambda: self.format_text("underline"))
        toolbar_layout.addWidget(underline_btn)
        
        toolbar_layout.addWidget(self.create_separator())
        
        # Inserts
        image_btn = QPushButton("🖼️ Ảnh")
        image_btn.clicked.connect(self.insert_image)
        toolbar_layout.addWidget(image_btn)
        
        table_btn = QPushButton("📊 Bảng")
        table_btn.clicked.connect(self.insert_table)
        toolbar_layout.addWidget(table_btn)
        
        citation_btn = QPushButton("📚 Trích dẫn")
        citation_btn.clicked.connect(self.select_citation)
        toolbar_layout.addWidget(citation_btn)
        
        toolbar_layout.addStretch()
        
        # Undo/Redo
        undo_btn = QPushButton("↶")
        undo_btn.setFixedWidth(30)
        undo_btn.clicked.connect(lambda: self.editor.undo())
        toolbar_layout.addWidget(undo_btn)
        
        redo_btn = QPushButton("↷")
        redo_btn.setFixedWidth(30)
        redo_btn.clicked.connect(lambda: self.editor.redo())
        toolbar_layout.addWidget(redo_btn)
        
        layout.addWidget(toolbar)
        
        # --- EDITOR ---
        self.editor = ThesisTextEdit(self)
        self.editor.setPlaceholderText("Bắt đầu soạn thảo nội dung đồ án của bạn...\n\n"
                                        "• Click đúp vào [Hình...] để sửa ảnh\n"
                                        "• Click đúp vào dòng 'Bảng...' để sửa bảng\n"
                                        "• Paste hình ảnh trực tiếp (Cmd+V)\n"
                                        "• Shift+Enter: Thêm tiêu đề")
        self.editor.setFont(QFont("Consolas", 14))
        self.editor.textChanged.connect(self.textChanged.emit)
        layout.addWidget(self.editor)
        
    def create_separator(self):
        sep = QFrame()
        sep.setFrameShape(QFrame.Shape.VLine)
        sep.setStyleSheet("background-color: #45475a;")
        return sep
        
    def add_title(self):
        level = self.level_combo.currentIndex() + 1
        prefix = "#" * level + " "
        cursor = self.editor.textCursor()
        # Move to start of line if not already
        if cursor.positionInBlock() > 0:
            cursor.insertText("\n")
        cursor.insertText(f"{prefix}")
        self.editor.setFocus()
        
    def set_heading_level(self, level):
        self.level_combo.setCurrentIndex(level - 1)
        self.add_title()
        
    def format_text(self, format_type):
        cursor = self.editor.textCursor()
        if not cursor.hasSelection():
            return
        selected = cursor.selectedText()
        if format_type == "bold":
            cursor.insertText(f"**{selected}**")
        elif format_type == "italic":
            cursor.insertText(f"*{selected}*")
        elif format_type == "underline":
            cursor.insertText(f"<u>{selected}</u>")
            
    def handle_pasted_image(self, image):
        # Save image to file
        timestamp = QDateTime.currentDateTime().toString("yyyyMMdd_HHmmss_zzz")
        filename = f"images/pasted_{timestamp}.png"
        image.save(filename)
        
        self.add_figure_from_path(os.path.abspath(filename))

    def insert_image(self):
        fig_num = len([f for f in self.figures if f.chapter == self.current_chapter]) + 1
        dialog = ImageDialog(default_number=f"Hình {self.current_chapter}.{fig_num}", parent=self)
        
        if dialog.exec() == QDialog.DialogCode.Accepted:
            image_path, caption = dialog.get_data()
            if image_path:
                self.add_figure_from_path(image_path, caption)
            
    def add_figure_from_path(self, file_path, caption=None):
        fig_num = len([f for f in self.figures if f.chapter == self.current_chapter]) + 1
        
        if not caption:
            caption, ok = self.get_caption_dialog("Hình ảnh", f"Hình {self.current_chapter}.{fig_num}")
            if not ok: return
            
        figure = Figure(
            id=len(self.figures) + 1,
            path=file_path,
            caption=caption,
            chapter=self.current_chapter,
            number=f"Hình {self.current_chapter}.{fig_num}"
        )
        self.figures.append(figure)
        cursor = self.editor.textCursor()
        if cursor.positionInBlock() > 0:
            cursor.insertText("\n")
        cursor.insertText(f"\n[{figure.number}: {caption}]\n")
        self.textChanged.emit()
    
    def edit_image(self, fig_num, block):
        # Find figure
        figure = next((f for f in self.figures if f.number == fig_num), None)
        if not figure:
            return
            
        dialog = ImageDialog(default_number=fig_num, parent=self)
        dialog.caption_edit.setText(figure.caption)
        if figure.path and os.path.exists(figure.path):
            dialog.set_image(figure.path)
            
        if dialog.exec() == QDialog.DialogCode.Accepted:
            new_path, new_caption = dialog.get_data()
            
            # Update object
            if new_path: figure.path = new_path
            figure.caption = new_caption
            
            # Update text in editor
            cursor = QTextCursor(block)
            cursor.select(QTextCursor.SelectionType.BlockUnderCursor)
            cursor.removeSelectedText()
            cursor.insertText(f"[{figure.number}: {new_caption}]\n")
            self.textChanged.emit()

    def edit_table(self, table_num, block):
        # Find table
        table = next((t for t in self.tables if t.number == table_num), None)
        # Even if not found, we can try to parse or just open new
        
        dialog = TableEditorDialog(rows=3, cols=3, caption=table.caption if table else "", parent=self)
        # TODO: Load existing data from markdown if possible. For now just open editor.
        
        if dialog.exec() == QDialog.DialogCode.Accepted:
            caption, md_content = dialog.get_markdown()
            
            if table:
                table.caption = caption
            
            # We need to replace the whole table block. 
            # This is tricky because table spans multiple lines.
            # For now, let's just update the caption line and insert new table below, 
            # user has to delete old one. Or we just append.
            # Improving this requires better block parsing.
            
            # Simple approach: Just insert new version at cursor
            cursor = self.editor.textCursor()
            cursor.insertText(f"\n{md_content}\n{table_num}: {caption}\n")
            self.textChanged.emit()
                
    def insert_table(self):
        table_num = len([t for t in self.tables if t.chapter == self.current_chapter]) + 1
        
        # Open Table Editor Dialog
        dialog = TableEditorDialog(rows=3, cols=3, caption=f"Bảng {self.current_chapter}.{table_num}", parent=self)
        
        if dialog.exec() == QDialog.DialogCode.Accepted:
            caption, md_content = dialog.get_markdown()
            
            table = Table(
                id=len(self.tables) + 1,
                caption=caption,
                chapter=self.current_chapter,
                number=f"Bảng {self.current_chapter}.{table_num}"
            )
            self.tables.append(table)
            
            cursor = self.editor.textCursor()
            if cursor.positionInBlock() > 0:
                cursor.insertText("\n")
            # Caption BELOW table as requested
            cursor.insertText(f"\n{md_content}\n{table.number}: {caption}\n")
            self.textChanged.emit()
            
    def select_citation(self):
        if not self.citations:
            # Show message if no citations
            from PyQt6.QtWidgets import QMessageBox
            QMessageBox.information(self, "Thông báo", "Bạn chưa có trích dẫn nào. Hãy thêm trong tab 'Trích dẫn' trước.")
            return
            
        dialog = QDialog(self)
        dialog.setWindowTitle("Chọn trích dẫn")
        layout = QVBoxLayout(dialog)
        
        list_widget = QListWidget()
        for i, c in enumerate(self.citations, 1):
            list_widget.addItem(f"[{i}] {c.author} - {c.title}")
            
        layout.addWidget(list_widget)
        
        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(dialog.accept)
        buttons.rejected.connect(dialog.reject)
        layout.addWidget(buttons)
        
        if dialog.exec() == QDialog.DialogCode.Accepted:
            selected_row = list_widget.currentRow()
            if selected_row >= 0:
                cursor = self.editor.textCursor()
                cursor.insertText(f"[{selected_row + 1}]")
        
    def get_caption_dialog(self, item_type, default_number):
        dialog = QDialog(self)
        dialog.setWindowTitle(f"Thêm {item_type}")
        dialog.setModal(True)
        layout = QFormLayout(dialog)
        number_edit = QLineEdit(default_number)
        number_edit.setReadOnly(True)
        layout.addRow("Số thứ tự:", number_edit)
        caption_edit = QLineEdit()
        caption_edit.setPlaceholderText(f"Nhập mô tả {item_type.lower()}...")
        layout.addRow("Mô tả:", caption_edit)
        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(dialog.accept)
        buttons.rejected.connect(dialog.reject)
        layout.addRow(buttons)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            return caption_edit.text() or item_type, True
        return "", False
