from core.models.data_classes import Citation

def format_citation_apa(c: Citation) -> str:
    """Format a citation in APA style"""
    # APA: Author (Year). Title. Publisher. Retrieved from URL
    parts = []
    
    # Author (Year).
    year = c.year if c.year else "n.d."
    if c.author:
        parts.append(f"{c.author} ({year})")
    else:
        parts.append(f"({year})")
        
    # Title.
    if c.title:
        parts.append(f"{c.title}")
        
    # Publisher.
    if c.publisher:
        parts.append(f"{c.publisher}")
        
    # URL
    if c.url:
        parts.append(f"Retrieved from {c.url}")
        
    return ". ".join(parts) + "."

def to_roman(n: int) -> str:
    """Convert integer to Roman numeral"""
    val = [
        1000, 900, 500, 400,
        100, 90, 50, 40,
        10, 9, 5, 4,
        1
    ]
    syb = [
        "M", "CM", "D", "CD",
        "C", "XC", "L", "XL",
        "X", "IX", "V", "IV",
        "I"
    ]
    roman_num = ''
    i = 0
    while  n > 0:
        for _ in range(n // val[i]):
            roman_num += syb[i]
            n -= val[i]
        i += 1
    return roman_num
