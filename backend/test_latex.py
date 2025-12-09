import matplotlib.pyplot as plt
import io

def test_render(latex_str):
    try:
        plt.rcParams['mathtext.fontset'] = 'stix'
        plt.rcParams['font.family'] = 'Times New Roman'
        
        fig = plt.figure(figsize=(1, 1), dpi=600)
        
        if not latex_str.startswith('$'):
            latex_str = f"${latex_str}$"
            
        text = fig.text(0.5, 0.5, latex_str, fontsize=12, ha='center', va='baseline')
        
        renderer = fig.canvas.get_renderer()
        bbox = text.get_window_extent(renderer=renderer)
        
        print(f"Success: {latex_str}")
        plt.close(fig)
    except Exception as e:
        print(f"Failed: {latex_str} - Error: {e}")

test_render(r"N \ge 1")
test_render(r"N \geq 1")
