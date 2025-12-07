
import sys
from PyQt6.QtWidgets import QApplication
from ThesisFormatter.ui.main_window import MainWindow
from ThesisFormatter.ui.styles import DARK_THEME

def main():
    app = QApplication(sys.argv)
    app.setStyleSheet(DARK_THEME)
    
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
