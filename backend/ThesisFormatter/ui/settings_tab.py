from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QFormLayout, QGroupBox, QDoubleSpinBox, 
    QComboBox, QSpinBox, QScrollArea, QLabel
)
from ThesisFormatter.models.data_classes import Settings

class SettingsTab(QWidget):
    def __init__(self, settings: Settings, parent=None):
        super().__init__(parent)
        self.settings = settings
        self.setup_ui()
        
    def setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("background-color: transparent; border: none;")
        
        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        
        # Page Settings
        page_group = QGroupBox("📄 Cài đặt trang (cm)")
        page_layout = QFormLayout(page_group)
        
        self.margin_top = self.create_double_spinbox(self.settings.margin_top)
        self.margin_top.valueChanged.connect(lambda v: setattr(self.settings, 'margin_top', v))
        page_layout.addRow("Lề trên:", self.margin_top)
        
        self.margin_bottom = self.create_double_spinbox(self.settings.margin_bottom)
        self.margin_bottom.valueChanged.connect(lambda v: setattr(self.settings, 'margin_bottom', v))
        page_layout.addRow("Lề dưới:", self.margin_bottom)
        
        self.margin_left = self.create_double_spinbox(self.settings.margin_left)
        self.margin_left.valueChanged.connect(lambda v: setattr(self.settings, 'margin_left', v))
        page_layout.addRow("Lề trái:", self.margin_left)
        
        self.margin_right = self.create_double_spinbox(self.settings.margin_right)
        self.margin_right.valueChanged.connect(lambda v: setattr(self.settings, 'margin_right', v))
        page_layout.addRow("Lề phải:", self.margin_right)
        
        content_layout.addWidget(page_group)
        
        # Font Settings
        font_group = QGroupBox("🔤 Phông chữ & Định dạng")
        font_layout = QFormLayout(font_group)
        
        self.font_family = QComboBox()
        self.font_family.addItems(["Times New Roman", "Arial", "Calibri", "Segoe UI"])
        self.font_family.setCurrentText(self.settings.font_family)
        self.font_family.currentTextChanged.connect(lambda v: setattr(self.settings, 'font_family', v))
        font_layout.addRow("Phông chữ:", self.font_family)
        
        self.font_size = QSpinBox()
        self.font_size.setRange(10, 24)
        self.font_size.setValue(self.settings.font_size)
        self.font_size.valueChanged.connect(lambda v: setattr(self.settings, 'font_size', v))
        font_layout.addRow("Cỡ chữ (pt):", self.font_size)
        
        self.line_spacing = QDoubleSpinBox()
        self.line_spacing.setRange(1.0, 3.0)
        self.line_spacing.setSingleStep(0.1)
        self.line_spacing.setValue(self.settings.line_spacing)
        self.line_spacing.valueChanged.connect(lambda v: setattr(self.settings, 'line_spacing', v))
        font_layout.addRow("Giãn dòng:", self.line_spacing)
        
        self.indent = QDoubleSpinBox()
        self.indent.setRange(0.0, 5.0)
        self.indent.setSingleStep(0.1)
        self.indent.setValue(self.settings.indent)
        self.indent.valueChanged.connect(lambda v: setattr(self.settings, 'indent', v))
        font_layout.addRow("Thụt đầu dòng (cm):", self.indent)
        
        content_layout.addWidget(font_group)
        
        # Heading Settings
        heading_group = QGroupBox("📑 Tiêu đề (Headings)")
        heading_layout = QFormLayout(heading_group)
        
        self.h1_size = QSpinBox()
        self.h1_size.setValue(self.settings.h1_size)
        self.h1_size.valueChanged.connect(lambda v: setattr(self.settings, 'h1_size', v))
        heading_layout.addRow("H1 Size:", self.h1_size)
        
        self.h2_size = QSpinBox()
        self.h2_size.setValue(self.settings.h2_size)
        self.h2_size.valueChanged.connect(lambda v: setattr(self.settings, 'h2_size', v))
        heading_layout.addRow("H2 Size:", self.h2_size)
        
        self.h3_size = QSpinBox()
        self.h3_size.setValue(self.settings.h3_size)
        self.h3_size.valueChanged.connect(lambda v: setattr(self.settings, 'h3_size', v))
        heading_layout.addRow("H3 Size:", self.h3_size)
        
        content_layout.addWidget(heading_group)
        content_layout.addStretch()
        
        scroll.setWidget(content_widget)
        layout.addWidget(scroll)
        
    def create_double_spinbox(self, value):
        sb = QDoubleSpinBox()
        sb.setRange(0.0, 10.0)
        sb.setSingleStep(0.1)
        sb.setValue(value)
        return sb
