from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QTableWidget, QTableWidgetItem, 
    QPushButton, QSpinBox, QLabel, QLineEdit, QDialogButtonBox, QHeaderView
)
from PyQt6.QtCore import Qt

class TableEditorDialog(QDialog):
    def __init__(self, rows=3, cols=3, data=None, caption="", parent=None):
        super().__init__(parent)
        self.setWindowTitle("Chỉnh sửa Bảng")
        self.resize(800, 500)
        self.layout = QVBoxLayout(self)
        
        # Settings area
        settings_layout = QHBoxLayout()
        
        self.caption_edit = QLineEdit(caption)
        self.caption_edit.setPlaceholderText("Tên bảng (Caption)...")
        settings_layout.addWidget(QLabel("Tên bảng:"))
        settings_layout.addWidget(self.caption_edit)
        
        self.rows_spin = QSpinBox()
        self.rows_spin.setRange(1, 100)
        self.rows_spin.setValue(rows)
        self.rows_spin.valueChanged.connect(self.update_table_size)
        settings_layout.addWidget(QLabel("Dòng:"))
        settings_layout.addWidget(self.rows_spin)
        
        self.cols_spin = QSpinBox()
        self.cols_spin.setRange(1, 20)
        self.cols_spin.setValue(cols)
        self.cols_spin.valueChanged.connect(self.update_table_size)
        settings_layout.addWidget(QLabel("Cột:"))
        settings_layout.addWidget(self.cols_spin)
        
        self.layout.addLayout(settings_layout)
        
        # Table Grid
        self.table_widget = QTableWidget(rows, cols)
        self.table_widget.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.layout.addWidget(self.table_widget)
        
        # Load data if provided
        if data:
            self.load_data(data)
        else:
            # Initialize headers
            for j in range(cols):
                self.table_widget.setItem(0, j, QTableWidgetItem(f"Header {j+1}"))
        
        # Buttons
        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        self.layout.addWidget(buttons)
        
    def update_table_size(self):
        current_rows = self.table_widget.rowCount()
        current_cols = self.table_widget.columnCount()
        new_rows = self.rows_spin.value()
        new_cols = self.cols_spin.value()
        
        self.table_widget.setRowCount(new_rows)
        self.table_widget.setColumnCount(new_cols)
        
    def load_data(self, data):
        # data is list of lists
        rows = len(data)
        if rows == 0: return
        cols = len(data[0])
        
        self.rows_spin.setValue(rows)
        self.cols_spin.setValue(cols)
        
        for i in range(rows):
            for j in range(cols):
                if j < len(data[i]):
                    self.table_widget.setItem(i, j, QTableWidgetItem(data[i][j]))
                    
    def get_markdown(self):
        rows = self.table_widget.rowCount()
        cols = self.table_widget.columnCount()
        
        # Get headers (first row)
        headers = []
        for j in range(cols):
            item = self.table_widget.item(0, j)
            headers.append(item.text() if item else "")
            
        # Get body (rest of rows)
        body_rows = []
        for i in range(1, rows):
            row_data = []
            for j in range(cols):
                item = self.table_widget.item(i, j)
                row_data.append(item.text() if item else "")
            body_rows.append(row_data)
            
        # Build Markdown
        md = f"| {' | '.join(headers)} |\n"
        md += f"| {' | '.join(['---'] * cols)} |\n"
        for row in body_rows:
            md += f"| {' | '.join(row)} |\n"
            
        return self.caption_edit.text(), md
