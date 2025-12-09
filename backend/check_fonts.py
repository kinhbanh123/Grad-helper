import matplotlib.font_manager
fonts = [f.name for f in matplotlib.font_manager.fontManager.ttflist]
print("Times New Roman" in fonts)
print("STIXGeneral" in fonts)
