from dataclasses import dataclass

@dataclass
class Citation:
    id: int
    author: str
    year: str
    title: str
    publisher: str = ""
    url: str = ""
    citation_type: str = "book"

@dataclass
class Figure:
    id: int
    path: str
    caption: str
    chapter: int
    number: str
    width: float = None
    url: str = ""

@dataclass
class Table:
    id: int
    caption: str
    chapter: int
    number: str

@dataclass
class Settings:
    paper_size: str = "A4"
    margin_top: float = 2.5
    margin_bottom: float = 2.5
    margin_left: float = 3.5
    margin_right: float = 2.0
    font_family: str = "Times New Roman"
    font_size: int = 13
    line_spacing: float = 1.5
    indent: float = 1.27
    h1_prefix: str = "CHƯƠNG"
    auto_numbering: bool = True
    h1_size: int = 16
    h2_size: int = 14
    h3_size: int = 13
    # Calibration
    text_density: float = 1.0
    line_height_scale: float = 1.0
    page_content_scale: float = 1.0
    hard_wrap: bool = False
    h1_split: bool = False
    hierarchical_numbering: bool = True
    h1_uppercase: bool = True
