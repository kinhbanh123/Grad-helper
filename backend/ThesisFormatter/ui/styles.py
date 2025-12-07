
DARK_THEME = """
/* GLOBAL */
QMainWindow {
    background-color: #1e1e2e;
}
QWidget {
    background-color: #1e1e2e;
    color: #cdd6f4;
    font-family: 'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif;
    font-size: 14px;
}

/* SIDEBAR */
QWidget#sidebar {
    background-color: #11111b;
    border-right: 1px solid #313244;
}
QLabel#sidebarTitle {
    color: #cba6f7;
    font-weight: bold;
    font-size: 18px;
    padding: 20px 10px;
    background-color: transparent;
}
QPushButton#sidebarBtn {
    text-align: left;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    background-color: transparent;
    color: #a6adc8;
    font-weight: 600;
    margin: 4px 8px;
}
QPushButton#sidebarBtn:hover {
    background-color: #313244;
    color: #ffffff;
}
QPushButton#sidebarBtn:checked {
    background-color: #45475a; /* Surface0 */
    color: #89b4fa;
    border-left: 3px solid #89b4fa;
}

/* TABS */
QTabWidget::pane {
    border: 1px solid #313244;
    background-color: #1e1e2e;
    border-radius: 8px;
    margin-top: -1px;
}
QTabBar::tab {
    background: #181825;
    color: #a6adc8;
    padding: 10px 20px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    margin-right: 4px;
    font-weight: bold;
}
QTabBar::tab:selected {
    background: #1e1e2e;
    color: #89b4fa;
    border-bottom: 2px solid #89b4fa;
}
QTabBar::tab:hover {
    background: #313244;
}

/* EDITOR & INPUTS */
QTextEdit, QPlainTextEdit, QLineEdit {
    background-color: #181825;
    border: 1px solid #313244;
    border-radius: 6px;
    padding: 8px;
    color: #cdd6f4;
    selection-background-color: #585b70;
}
QTextEdit:focus, QLineEdit:focus {
    border: 1px solid #89b4fa;
}

/* COMBOBOX */
QComboBox {
    background-color: #181825;
    border: 1px solid #313244;
    border-radius: 6px;
    padding: 6px 10px;
    min-width: 6em;
}
QComboBox:hover {
    border: 1px solid #585b70;
}
QComboBox::drop-down {
    subcontrol-origin: padding;
    subcontrol-position: top right;
    width: 20px;
    border-left-width: 0px;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
}

/* BUTTONS (General) */
QPushButton {
    background-color: #313244;
    color: #cdd6f4;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 600;
}
QPushButton:hover {
    background-color: #45475a;
}
QPushButton:pressed {
    background-color: #585b70;
}
QPushButton#actionBtn {
    background-color: #89b4fa;
    color: #11111b;
}
QPushButton#actionBtn:hover {
    background-color: #b4befe;
}

/* SCROLLBAR */
QScrollBar:vertical {
    border: none;
    background: #181825;
    width: 10px;
    margin: 0px 0px 0px 0px;
}
QScrollBar::handle:vertical {
    background: #45475a;
    min-height: 20px;
    border-radius: 5px;
}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}

/* TOOLBAR FRAMES */
QFrame#toolbar {
    background-color: #181825;
    border-radius: 8px;
    border: 1px solid #313244;
}
"""

PREVIEW_CSS = """
<style>
    body { 
        background-color: #585b70; /* Darker background for contrast with paper */
        color: #000000;
        font-family: 'Times New Roman', Times, serif;
        margin: 0;
        padding: 20px;
        display: flex;
        justify-content: center;
    }
    .page {
        background-color: white;
        width: 21cm;
        min-height: 29.7cm;
        padding: 2.54cm 2.54cm 2.54cm 3cm; /* Top, Right, Bottom, Left (Standard Thesis) */
        margin: 0 auto 20px auto;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        box-sizing: border-box;
    }
    p {
        text-align: justify;
        line-height: 1.5;
        margin-bottom: 10pt;
        text-indent: 1.27cm;
    }
    h1 {
        text-align: center;
        text-transform: uppercase;
        font-size: 14pt;
        font-weight: bold;
        margin-top: 12pt;
        margin-bottom: 12pt;
        color: black;
    }
    h2 {
        text-align: left;
        font-size: 13pt;
        font-weight: bold;
        margin-top: 12pt;
        margin-bottom: 6pt;
        color: black;
    }
    h3 {
        text-align: left;
        font-size: 13pt;
        font-weight: bold;
        font-style: italic;
        margin-top: 12pt;
        margin-bottom: 6pt;
        color: black;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 12pt 0;
    }
    th, td {
        border: 1px solid black;
        padding: 5pt;
        text-align: left;
        vertical-align: top;
    }
    th {
        font-weight: bold;
        text-align: center;
    }
    .toc-item {
        margin-bottom: 5px;
    }
    .placeholder {
        text-align: center;
        font-style: italic;
        color: #555;
        margin: 10px 0;
    }
</style>
"""
