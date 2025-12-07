from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QLabel, QLineEdit, QDialogButtonBox, 
    QFileDialog, QFrame, QPushButton
)
from PyQt6.QtGui import QPixmap, QImage
from PyQt6.QtCore import Qt, QDateTime
import os

class ImageDialog(QDialog):
    def __init__(self, default_number="Hình X.Y", parent=None):
        super().__init__(parent)
        self.setWindowTitle("Chèn Hình Ảnh")
        self.resize(500, 400)
        self.image_path = None
        self.setup_ui(default_number)
        
    def setup_ui(self, default_number):
        layout = QVBoxLayout(self)
        
        # Image Drop/Paste Zone
        self.image_label = QLabel("Click để chọn ảnh\nhoặc\nNhấn Cmd+V để dán")
        self.image_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.image_label.setStyleSheet("""
            QLabel {
                border: 2px dashed #aaa;
                border-radius: 10px;
                background-color: #f0f0f0;
                color: #555;
                font-size: 14px;
            }
            QLabel:hover {
                border-color: #6c5ce7;
                background-color: #e0e0ff;
            }
        """)
        self.image_label.setFixedHeight(200)
        self.image_label.mousePressEvent = self.select_image_file
        layout.addWidget(self.image_label)
        
        # Paste Button
        paste_btn = QPushButton("📋 Dán từ Clipboard")
        paste_btn.clicked.connect(self.paste_from_clipboard)
        layout.addWidget(paste_btn)
        
        # Caption Inputs
        self.number_edit = QLineEdit(default_number)
        self.number_edit.setReadOnly(True)
        layout.addWidget(QLabel("Số thứ tự:"))
        layout.addWidget(self.number_edit)
        
        self.caption_edit = QLineEdit()
        self.caption_edit.setPlaceholderText("Nhập tên hình ảnh...")
        layout.addWidget(QLabel("Tên hình:"))
        layout.addWidget(self.caption_edit)
        
        # Buttons
        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
        
    def select_image_file(self, event):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Chọn hình ảnh", "",
            "Images (*.png *.jpg *.jpeg *.gif *.bmp)"
        )
        if file_path:
            self.set_image(file_path)
            
    def keyPressEvent(self, event):
        # Check for Ctrl+V or Cmd+V (Meta)
        is_paste = (event.key() == Qt.Key.Key_V) and (
            (event.modifiers() & Qt.KeyboardModifier.ControlModifier) or 
            (event.modifiers() & Qt.KeyboardModifier.MetaModifier)
        )
        
        if is_paste:
            self.paste_from_clipboard()
        else:
            super().keyPressEvent(event)
            
    def paste_from_clipboard(self):
        from PyQt6.QtWidgets import QApplication
        clipboard = QApplication.clipboard()
        mime_data = clipboard.mimeData()
        
        if mime_data.hasImage():
            image = mime_data.imageData()
            self.save_and_set_image(image)
        else:
            # Try to read urls if image is copied from file system
            if mime_data.hasUrls():
                url = mime_data.urls()[0]
                if url.isLocalFile():
                    self.set_image(url.toLocalFile())
            
    def save_and_set_image(self, image):
        if not os.path.exists("images"):
            os.makedirs("images")
        timestamp = QDateTime.currentDateTime().toString("yyyyMMdd_HHmmss_zzz")
        filename = f"images/pasted_{timestamp}.png"
        image.save(filename)
        self.set_image(os.path.abspath(filename))
        
    def set_image(self, path):
        self.image_path = path
        pixmap = QPixmap(path)
        self.image_label.setPixmap(pixmap.scaled(
            self.image_label.size(), 
            Qt.AspectRatioMode.KeepAspectRatio, 
            Qt.TransformationMode.SmoothTransformation
        ))
        
    def get_data(self):
        return self.image_path, self.caption_edit.text()
