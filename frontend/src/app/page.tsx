"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bold, Italic, Underline, Image as ImageIcon, Table as TableIcon, Trash2, Plus, Download, Save, FolderOpen, Settings,
  FileText, Edit3, BookOpen, ChevronRight, FileDown, Quote, Code, List, Sigma, X, Upload, RefreshCw
} from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Popover from "@radix-ui/react-popover";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// --- COMPONENTS ---

function Button({ className, variant = "ghost", size = "icon", ...props }: any) {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-900/90 shadow",
    ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-500",
    outline: "border border-slate-200 bg-transparent shadow-sm hover:bg-slate-100 hover:text-slate-900",
    secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-100/80",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  };
  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  return (
    <button
      className={twMerge(baseStyles, variants[variant as keyof typeof variants], sizes[size as keyof typeof sizes], className)}
      {...props}
    />
  );
}

function Separator() {
  return <div className="w-[1px] h-6 bg-slate-200 mx-2" />;
}

function Dialog({ title, isOpen, onClose, children, maxWidth = "max-w-md" }: { title: string, isOpen: boolean, onClose: () => void, children: React.ReactNode, maxWidth?: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={twMerge("bg-white rounded-lg shadow-lg w-full relative animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col", maxWidth)}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function Home() {
  const [activeTab, setActiveTab] = useState<"editor" | "citations" | "settings">("editor");
  const [content, setContent] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dialog States
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showJsonImportDialog, setShowJsonImportDialog] = useState(false);
  const [jsonImportText, setJsonImportText] = useState("");

  // Data States
  const [settings, setSettings] = useState({
    font_family: "Times New Roman",
    font_size: 13,
    h1_size: 14,
    h2_size: 13,
    h3_size: 13,
    line_spacing: 1.5,
    indent: 1.27,
    margin_top: 2.0,
    margin_bottom: 2.54,
    margin_left: 3.0,
    margin_right: 2.0,
    h1_prefix: "CHƯƠNG",
    auto_numbering: true,
    // Tăng mạnh density để ép xuống dòng sớm hơn
    text_density: 1.15,
    line_height_scale: 1.0,
    // Thu nhỏ trang 6% để trừ hao footer/header ngầm
    page_content_scale: 0.94,
    hard_wrap: false,
    h1_split: false,
    hierarchical_numbering: true
  });

  const [figures, setFigures] = useState<any[]>([]);
  const [citations, setCitations] = useState<any[]>([]);

  // Image Upload State
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState("");
  const [imageScale, setImageScale] = useState<number>(100); // Default 100%
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Table Editor State
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableData, setTableData] = useState<string[][]>([
    ["STT", "Tiêu đề 1", "Tiêu đề 2"],
    ["1", "Dữ liệu A", "Dữ liệu B"],
    ["2", "Dữ liệu C", "Dữ liệu D"]
  ]);
  const [tableCaption, setTableCaption] = useState("");

  // Citation State
  const [newCitation, setNewCitation] = useState({ author: "", year: "", title: "", publisher: "", url: "" });

  // Default content & Load Project
  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/load");
      if (res.ok) {
        const json = await res.json();
        if (json.exists && json.data) {
          setContent(json.data.content);
          // Merge loaded settings with defaults to ensure new fields (like auto_numbering) exist
          setSettings(prev => ({ ...prev, ...json.data.settings }));
          setFigures(json.data.figures);
          setCitations(json.data.citations || []);
          console.log("Loaded project data");
        } else {
          // Set default content if no save file
          setContent(`# CHƯƠNG 1: GIỚI THIỆU

## 1.1.Đặt vấn đề
Viết nội dung đồ án của bạn ở đây...

### 1.1.1.Mục tiêu
  - Mục tiêu 1
    - Mục tiêu 2
`);
        }
      }
    } catch (err) {
      console.error("Failed to load project", err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          settings,
          figures,
          citations
        })
      });

      if (res.ok) {
        alert("Đã lưu dự án thành công!");
      } else {
        throw new Error("Save failed");
      }
    } catch (err) {
      alert("Lỗi lưu dự án: " + err);
    }
  };

  // --- EDITOR HELPERS ---
  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleHeading = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value;
    if (!level) return;
    const prefix = "#".repeat(parseInt(level)) + " ";
    insertText(prefix);
    e.target.value = "";
  };

  // --- KEYBOARD SHORTCUTS ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertText("**", "**");
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertText("*", "*");
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      insertText("<u>", "</u>");
    }
  };

  // --- IMAGE HANDLING ---
  const handleImageUpload = async () => {
    if (!imageFile || !imageCaption) {
      alert("Vui lòng chọn ảnh và nhập tên hình!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      // Calculate width in cm based on scale (100% = 16cm)
      const widthCm = (imageScale / 100) * 16;

      const figNum = `Hình 1.${figures.length + 1} `;
      const newFigure = {
        id: figures.length + 1,
        number: figNum,
        caption: imageCaption,
        path: data.path,
        url: data.url,
        chapter: 1,
        width: widthCm
      };

      setFigures([...figures, newFigure]);
      insertText(`\n[${figNum}: ${imageCaption}]\n`);

      setImageFile(null);
      setImageCaption("");
      setImageScale(100); // Reset
      setImagePreview(null);
      setShowImageDialog(false);

    } catch (err) {
      alert("Lỗi upload: " + err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- TABLE HANDLING ---
  const handleTableInsert = () => {
    if (!tableCaption) {
      alert("Vui lòng nhập tên bảng!");
      return;
    }

    // Header
    let md = "\n| " + tableData[0].join(" | ") + " |\n";
    // Separator
    md += "| " + tableData[0].map(() => "---").join(" | ") + " |\n";
    // Body
    for (let i = 1; i < tableData.length; i++) {
      md += "| " + tableData[i].join(" | ") + " |\n";
    }

    // Caption at the bottom
    // Use a temporary placeholder, renumberAssets will fix it
    md += `Bảng 1.999: ${tableCaption} \n\n`;

    insertText(md);
    setShowTableDialog(false);
    setTableData([["", ""], ["", ""]]);
    setTableCaption("");
  };

  const updateTableData = (row: number, col: number, value: string) => {
    const newData = [...tableData];
    newData[row][col] = value;
    setTableData(newData);
  };

  const resizeTable = (rows: number, cols: number) => {
    const newData = Array(rows).fill("").map((_, r) =>
      Array(cols).fill("").map((_, c) => (tableData[r] && tableData[r][c]) || "")
    );
    setTableData(newData);
    setTableRows(rows);
    setTableCols(cols);
  };

  interface Figure {
    id: number;
    number: string;
    caption: string;
    path: string;
    url: string;
    chapter: number;
    width?: number;
  }

  const renumberAssets = () => {
    let updatedContent = content;
    const newFigures: Figure[] = [];

    // --- FIGURES ---
    let figCounter = 0;

    // Regex global để thay thế tất cả, hỗ trợ khoảng trắng thừa
    // Regex: \[ \s* (Hình \d+\.\d+) \s* : \s* (.*?) \s* \]
    updatedContent = updatedContent.replace(/\[\s*(Hình \d+\.\d+)\s*:\s*(.*?)\s*\]/g, (match, oldNum, caption) => {
      figCounter++;
      const newNum = `Hình 1.${figCounter}`;

      // Tìm dữ liệu hình ảnh tương ứng trong danh sách cũ
      // Ưu tiên tìm theo caption (chính xác nhất)
      let fig = figures.find(f => f.caption.trim() === caption.trim());

      // Nếu không tìm thấy theo caption, thử tìm theo số cũ (nhưng rủi ro nếu số cũ bị trùng)
      if (!fig) {
        const cleanOldNum = oldNum.trim();
        fig = figures.find(f => f.number.trim() === cleanOldNum || f.number.replace(/\s+/g, '') === cleanOldNum.replace(/\s+/g, ''));
      }

      if (fig) {
        // Tạo object hình mới với số mới
        // Kiểm tra xem hình này đã được thêm vào newFigures chưa (tránh duplicate nếu placeholder xuất hiện 2 lần - dù ít gặp)
        // Nhưng ở đây ta muốn mỗi placeholder là 1 hình riêng biệt (trừ khi user copy paste placeholder)
        // Nếu user copy paste, ta vẫn coi là 1 hình (cùng URL) nhưng số khác nhau? 
        // Logic hiện tại: Mỗi placeholder là 1 entry trong figures.

        const newFig = { ...fig, number: newNum, id: figCounter }; // Cập nhật ID theo thứ tự luôn cho sạch
        newFigures.push(newFig);
      }

      return `[${newNum}: ${caption}]`;
    });

    // --- TABLES ---
    let tableCounter = 0;
    updatedContent = updatedContent.replace(/^Bảng \d+\.\d+: (.*)$/gm, (match, caption) => {
      tableCounter++;
      return `Bảng 1.${tableCounter}: ${caption}`;
    });

    setContent(updatedContent);
    setFigures(newFigures);
    alert(`Đã cập nhật: ${figCounter} hình, ${tableCounter} bảng.\n(Danh sách hình ảnh đã được làm mới)`);
  };

  const handleJsonImport = () => {
    try {
      const importedCitations = JSON.parse(jsonImportText);
      if (Array.isArray(importedCitations)) {
        const newCitations = importedCitations.map((c: any) => ({
          id: c.id || Date.now().toString() + Math.random().toString(),
          author: c.author || "",
          year: c.year || "",
          title: c.title || "",
          publisher: c.publisher || "",
          url: c.url || "",
          citation_type: c.citation_type || "other"
        }));
        setCitations(prev => [...prev, ...newCitations]);
        setShowJsonImportDialog(false);
        setJsonImportText("");
        alert(`Đã thêm ${newCitations.length} trích dẫn!`);
      } else {
        alert("JSON phải là một mảng các đối tượng trích dẫn.");
      }
    } catch (e) {
      alert("Lỗi parse JSON: " + e);
    }
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    // Find closest element with data-source-line
    const target = e.target as HTMLElement;
    const sourceElement = target.closest('[data-source-line]');

    if (sourceElement) {
      const line = parseInt(sourceElement.getAttribute('data-source-line') || '0', 10);
      if (!isNaN(line) && textareaRef.current) {
        // Calculate scroll position (approximate)
        // Assuming 24px per line (depends on textarea styling)
        const lineHeight = 24;
        const scrollPos = line * lineHeight;

        textareaRef.current.scrollTo({
          top: scrollPos,
          behavior: 'smooth'
        });

        // Optional: Set cursor position
        const text = content;
        const lines = text.split('\n');
        let charIndex = 0;
        for (let i = 0; i < line; i++) {
          if (i < lines.length) {
            charIndex += lines[i].length + 1; // +1 for newline
          }
        }

        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(charIndex, charIndex);
      }
    }
  };

  // --- CITATION HANDLING ---
  const addCitation = () => {
    if (!newCitation.title) {
      alert("Vui lòng nhập ít nhất Tên bài viết/Sách");
      return;
    }
    setCitations([...citations, { ...newCitation, id: citations.length + 1 }]);
    setNewCitation({ author: "", year: "", title: "", publisher: "", url: "" });
  };

  const deleteCitation = (index: number) => {
    const newCitations = [...citations];
    newCitations.splice(index, 1);
    setCitations(newCitations);
  };

  // --- EXPORT ---
  const handleExport = async () => {
    try {
      let contentToExport = content;

      // Nếu bật Hard Wrap, ta sẽ tái tạo nội dung dựa trên các dòng đã tính toán trong Preview
      if (settings.hard_wrap) {
        // Lưu ý: Đây là giải pháp phức tạp vì ta cần lấy kết quả từ hàm renderPreview.
        // Tuy nhiên, hàm renderPreview đang trả về JSX.
        // Cách đơn giản hơn: Gửi flag hard_wrap xuống backend, và backend sẽ cố gắng mô phỏng (nhưng backend không có canvas).
        // CÁCH TỐT NHẤT: Ta sẽ thực hiện tính toán lại dòng ở đây (sử dụng logic giống renderPreview) để tạo ra text mới.

        // Tạm thời, để đơn giản và hiệu quả, ta sẽ gửi settings xuống backend và backend sẽ xử lý.
        // Nhưng backend Python không thể đo font chính xác như Canvas JS.

        // Do đó, ta sẽ không thay đổi content ở đây mà chỉ gửi flag hard_wrap.
        // NHƯNG, user muốn "Giống hệt Preview".
        // Vậy ta nên cảnh báo user rằng tính năng này đang thử nghiệm.
      }

      const res = await fetch("http://localhost:8080/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          settings,
          figures,
          tables: [],
          citations
        })
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "do-an.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("Lỗi xuất file: " + err);
    }
  };

  // Preview Zoom State
  const [zoomLevel, setZoomLevel] = useState(100);

  // --- PREVIEW RENDERER ---
  const renderPreview = () => {
    const lines = content.split('\n');

    // Helper to parse markdown formatting
    const parseMarkdown = (text: string): React.ReactNode[] => {
      // Regex to split by formatting tokens: **bold**, *italic*, <u>underline</u>, $$display$$, $inline$
      // Priority: $$ first, then $
      const parts = text.split(/(\$\$.*?\$\$|\$.*?\$|\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>)/g);

      return parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Display Math (Block)
          return <div key={index} className="text-center my-2"><Latex>{part}</Latex></div>;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          // Inline Math
          return <Latex key={index}>{part}</Latex>;
        } else if (part.startsWith('**') && part.endsWith('**')) {
          return <b key={index}>{part.slice(2, -2)}</b>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return <i key={index}>{part.slice(1, -1)}</i>;
        } else if (part.startsWith('<u>') && part.endsWith('</u>')) {
          return <u key={index}>{part.slice(3, -4)}</u>;
        }
        return part;
      });
    };

    // Constants
    const PT_TO_CM = 0.03528;
    const CM_TO_PX = 37.7952755906; // 96 DPI
    const PT_TO_PX = 1.333333; // 1pt = 1.333px

    const contentWidthCm = 21 - settings.margin_left - settings.margin_right;
    // Áp dụng Page Scale vào chiều rộng nội dung
    const contentWidthPx = contentWidthCm * CM_TO_PX * (settings.page_content_scale || 1.0);
    const indentPx = settings.indent * CM_TO_PX * (settings.page_content_scale || 1.0);

    // Áp dụng Page Scale vào chiều cao trang
    const pageHeight = (29.7 - settings.margin_top - settings.margin_bottom) * (settings.page_content_scale || 1.0);
    const lineHeightCm = settings.font_size * PT_TO_CM * settings.line_spacing * (settings.line_height_scale || 1.0);
    const paraMarginBottom = 0.3; // cm

    // Setup Canvas for measurement
    let ctx: CanvasRenderingContext2D | null = null;
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      if (ctx) {
        // Set font chính xác để đo
        ctx.font = `${settings.font_size * PT_TO_PX}px "${settings.font_family}"`;
      }
    }

    const pages: React.ReactNode[][] = [];
    let currentPage: React.ReactNode[] = [];
    let currentH = 0;

    // Counters
    let h1_count = 0;
    let h2_count = 0;
    let h3_count = 0;
    let h4_count = 0;
    let h5_count = 0;

    const toRoman = (num: number) => {
      const lookup: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
      let roman = '', i;
      for (i in lookup) {
        while (num >= lookup[i]) {
          roman += i;
          num -= lookup[i];
        }
      }
      return roman;
    }

    const flushPage = () => {
      if (currentPage.length > 0) {
        pages.push([...currentPage]);
        currentPage = [];
        currentH = 0;
      }
    };

    const addToPage = (element: React.ReactNode, heightCm: number, forceNewPage: boolean = false) => {
      if (forceNewPage) {
        flushPage();
      }
      // Buffer cực nhỏ 0.01cm vì đã đo chính xác
      else if (currentH + heightCm > pageHeight - 0.01 && currentPage.length > 0) {
        flushPage();
      }
      currentPage.push(element);
      currentH += heightCm;
    };

    // Hàm tính toán số dòng chính xác của đoạn văn
    const calculateLines = (text: string, isFirstLineIndented: boolean): string[] => {
      if (!ctx) return [text]; // Fallback nếu không có canvas

      const words = text.split(' ');
      if (words.length === 0 || text.trim() === '') return [''];

      const lines: string[] = [];
      let currentLine = words[0];

      // Dòng đầu tiên bị thụt lề nếu isFirstLineIndented là true
      let currentMaxWidth = isFirstLineIndented ? (contentWidthPx - indentPx) : contentWidthPx;
      if (currentMaxWidth <= 0) currentMaxWidth = contentWidthPx; // Fallback for extreme indent

      // Áp dụng hệ số nén/giãn chữ
      const density = settings.text_density || 1.0;

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + " " + word;
        // Nhân độ rộng đo được với hệ số density
        // Nếu density > 1 (tăng độ dày), width sẽ lớn hơn -> xuống dòng sớm hơn
        const width = ctx.measureText(testLine).width * density;

        if (width < currentMaxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
          // Các dòng sau không thụt lề
          currentMaxWidth = contentWidthPx;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Xử lý đoạn văn dựa trên số dòng đã tính
    const processParagraph = (text: string, keyPrefix: string, sourceLine: number) => {
      const lines = calculateLines(text, true); // First line is indented
      const totalLines = lines.length;

      let remainingH = pageHeight - currentH;
      let linesFit = Math.floor(remainingH / lineHeightCm);

      if (linesFit >= totalLines) {
        // Đủ chỗ cho cả đoạn
        const totalH = totalLines * lineHeightCm + paraMarginBottom;
        // Kiểm tra lại lần cuối xem có đủ chỗ cho cả margin không
        if (totalH <= remainingH || remainingH < lineHeightCm) {
          addToPage(
            <div key={`${keyPrefix}-full`} data-source-line={sourceLine} className="mb-0" style={{
              textIndent: `${settings.indent}cm`,
              textAlign: 'justify',
              marginBottom: `${paraMarginBottom}cm`,
              lineHeight: settings.line_spacing
            }}>
              {parseMarkdown(text)}
            </div>,
            totalH,
            remainingH < lineHeightCm
          );
          return;
        }
      }

      // Không đủ chỗ, phải cắt
      // Nếu không còn dòng nào vừa (linesFit <= 0), sang trang mới
      if (linesFit <= 0) {
        flushPage();
        // Gọi lại đệ quy ở trang mới
        processParagraph(text, keyPrefix + "-retry", sourceLine);
        return;
      }

      // Cắt số dòng vừa đủ
      // Lưu ý: Dòng cuối cùng của trang không cần margin bottom (vì nó bị cắt)
      const part1Lines = lines.slice(0, linesFit);
      const part2Lines = lines.slice(linesFit);

      const part1Text = part1Lines.join(' ');
      // const part2Text = part2Lines.join(' '); // Not directly used here

      // Render phần 1
      currentPage.push(
        <div key={`${keyPrefix}-part1`} data-source-line={sourceLine} className="mb-0" style={{
          textIndent: `${settings.indent}cm`,
          textAlign: 'justify',
          lineHeight: settings.line_spacing,
          marginBottom: 0 // Không margin vì bị cắt
        }}>
          {parseMarkdown(part1Text)}
        </div>
      );
      currentH += linesFit * lineHeightCm;

      flushPage();

      // Xử lý phần còn lại (part 2)
      // Phần 2 là tiếp theo của đoạn văn, nên dòng đầu của nó KHÔNG thụt lề
      // Ta cần một hàm phụ hoặc xử lý riêng cho phần tiếp theo.
      processParagraphContinuation(part2Lines.join(' '), keyPrefix + "-part2");
    };

    const processParagraphContinuation = (text: string, keyPrefix: string) => {
      if (text.trim() === '') return;

      const lines = calculateLines(text, false); // No indentation for continuation
      const totalLines = lines.length;

      let remainingH = pageHeight - currentH;
      let linesFit = Math.floor(remainingH / lineHeightCm);

      if (linesFit >= totalLines) {
        const totalH = totalLines * lineHeightCm + paraMarginBottom;
        addToPage(
          <div key={`${keyPrefix}-end`} className="mb-0" style={{
            textIndent: 0, // Không thụt lề
            textAlign: 'justify',
            marginBottom: `${paraMarginBottom}cm`,
            lineHeight: settings.line_spacing
          }}>
            {parseMarkdown(text)}
          </div>,
          totalH
        );
        return;
      }

      if (linesFit <= 0) {
        flushPage();
        processParagraphContinuation(text, keyPrefix + "-retry");
        return;
      }

      const part1Lines = lines.slice(0, linesFit);
      const part2Lines = lines.slice(linesFit);

      currentPage.push(
        <div key={`${keyPrefix}-cont`} className="mb-0" style={{
          textIndent: 0,
          textAlign: 'justify',
          lineHeight: settings.line_spacing,
          marginBottom: 0
        }}>
          {parseMarkdown(part1Lines.join(' '))}
        </div>
      );
      currentH += linesFit * lineHeightCm;
      flushPage();
      processParagraphContinuation(part2Lines.join(' '), keyPrefix + "-next");
    };

    let tableBuffer: string[] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('|')) {
        inTable = true;
        tableBuffer.push(line);
        continue;
      } else if (inTable) {
        inTable = false;
        const tableEl = renderTable(tableBuffer, i);
        if (tableEl) {
          const rows = tableBuffer.length;
          const h = rows * 0.8 + 1;
          addToPage(tableEl, h);
        }
        tableBuffer = [];
      }

      if (line.startsWith('# ')) {
        h1_count++; h2_count = 0; h3_count = 0; h4_count = 0;
        let title = line.substring(2).toUpperCase();
        let displayTitle: React.ReactNode = title;

        if (settings.auto_numbering) {
          const prefixText = settings.h1_prefix ? `${settings.h1_prefix} ${toRoman(h1_count)} ` : `${toRoman(h1_count)} `;

          if (settings.h1_split) {
            // Tách dòng: CHƯƠNG I <br/> TÊN
            displayTitle = (
              <>
                {prefixText}
                <br />
                {title}
              </>
            );
          } else {
            // Cùng dòng: CHƯƠNG I: TÊN
            displayTitle = `${prefixText}: ${title} `;
          }
        }

        // Tính chiều cao: Nếu tách dòng thì cao hơn
        const lines = settings.h1_split ? 2 : 1;
        const h = (settings.h1_size * PT_TO_CM * 1.5 * lines) + 2.0;

        addToPage(<h1 key={i} data-source-line={i} className="text-center font-bold uppercase mt-6 mb-6" style={{ fontSize: `${settings.h1_size}pt` }}>{displayTitle}</h1>, h, h1_count > 1);
      }
      else if (line.startsWith('## ')) {
        h2_count++; h3_count = 0; h4_count = 0;
        let title = line.substring(3);
        if (settings.auto_numbering) {
          // Nếu hierarchical_numbering = true -> 1.1, ngược lại -> 1
          const prefix = settings.hierarchical_numbering ? `${h1_count}.${h2_count}.` : `${h2_count}.`;
          title = `${prefix} ${title} `;
        }
        const h = (settings.h2_size * PT_TO_CM * 1.5) + 1.0;
        addToPage(<h2 key={i} data-source-line={i} className="text-left font-bold mt-4 mb-3" style={{ fontSize: `${settings.h2_size}pt` }}>{title}</h2>, h);
      }
      else if (line.startsWith('### ')) {
        h3_count++; h4_count = 0;
        let title = line.substring(4);
        if (settings.auto_numbering) {
          const prefix = settings.hierarchical_numbering ? `${h1_count}.${h2_count}.${h3_count}.` : `${h2_count}.${h3_count}.`;
          title = `${prefix} ${title} `;
        }
        const h = (settings.h3_size * PT_TO_CM * 1.5) + 1.0;
        addToPage(<h3 key={i} data-source-line={i} className="text-left font-bold italic mt-4 mb-3" style={{ fontSize: `${settings.h3_size}pt` }}>{title}</h3>, h);
      }
      else if (line.startsWith('#### ')) {
        h4_count++; h5_count = 0;
        let title = line.substring(5);
        if (settings.auto_numbering) {
          const prefix = settings.hierarchical_numbering ? `${h1_count}.${h2_count}.${h3_count}.${h4_count}.` : `${h2_count}.${h3_count}.${h4_count}.`;
          title = `${prefix} ${title} `;
        }
        const h = (settings.font_size * PT_TO_CM * 1.5) + 1.0;
        // Chuẩn đồ án: H4 thường là in nghiêng (không đậm)
        addToPage(<h4 key={i} data-source-line={i} className="text-left italic mt-3 mb-2" style={{ fontSize: `${settings.font_size}pt` }}>{title}</h4>, h);
      }
      else if (line.startsWith('##### ')) {
        h5_count++;
        let title = line.substring(6);
        if (settings.auto_numbering) {
          // H5 thường dùng a, b, c hoặc 1.1.1.1.1
          // Để nhất quán, ta dùng số.
          const prefix = settings.hierarchical_numbering ? `${h1_count}.${h2_count}.${h3_count}.${h4_count}.${h5_count}.` : `${h2_count}.${h3_count}.${h4_count}.${h5_count}.`;
          title = `${prefix} ${title} `;
        }
        const h = (settings.font_size * PT_TO_CM * 1.5) + 1.0;
        // Chuẩn đồ án: H5 in nghiêng, có thể thụt đầu dòng
        addToPage(<h5 key={i} data-source-line={i} className="text-left italic mt-2 mb-2 ml-4" style={{ fontSize: `${settings.font_size}pt` }}>{title}</h5>, h);
      }
      else if (line.trim().startsWith('[Hình') && line.trim().endsWith(']')) {
        const match = line.trim().match(/\[\s*(Hình \d+\.\d+)\s*:\s*(.*)\s*\]/);
        if (match) {
          const figNum = match[1].trim(); // Trim số hình lấy được từ regex

          // Tìm kiếm linh hoạt hơn: so sánh sau khi trim và bỏ khoảng trắng thừa
          const fig = figures.find(f => f.number.trim() === figNum || f.number.replace(/\s+/g, '') === figNum.replace(/\s+/g, ''));

          const imgH = (fig && fig.width) ? (fig.width * 0.75) : 8;
          const totalH = imgH + 1.5;

          addToPage(
            <div key={i} data-source-line={i} className="text-center my-6">
              {fig && fig.url ? (
                <img
                  src={fig.url}
                  alt={match[2]}
                  className="mx-auto object-contain"
                  style={{ width: fig.width ? `${fig.width}cm` : '16cm', maxHeight: '15cm' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    console.error("Image load error:", fig.url);
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-slate-200 flex items-center justify-center text-slate-500 italic">
                  Hình ảnh chưa upload hoặc URL lỗi
                </div>
              )}
              <p className="italic mt-3 font-medium text-black">{figNum}: {match[2]}</p>
            </div>,
            totalH
          );
        }
      }
      else if (line.startsWith('Bảng') && line.includes(':')) {
        addToPage(<p key={i} data-source-line={i} className="text-center font-bold my-3">{line}</p>, 1.0);
      }
      else if (line.trim().match(/^(\-{1,3}|\*{1,3})\s/)) {
        // Bullet points with levels: - , -- , ---
        const match = line.trim().match(/^(\-{1,3}|\*{1,3})\s/);
        const prefix = match ? match[1] : '-';
        const level = prefix.length; // 1, 2, or 3
        const content = line.trim().substring(prefix.length).trim();

        // Base indent from settings + extra indent for levels
        // Chuẩn đồ án: Cấp 1 thụt bằng đoạn văn (settings.indent), các cấp sau thụt thêm 0.75cm
        const levelIndent = (level - 1) * 0.75;
        const totalIndent = settings.indent + levelIndent;

        const h = lineHeightCm;
        addToPage(
          <div key={i} data-source-line={i} className="flex" style={{
            paddingLeft: `${totalIndent}cm`,
            marginBottom: '0.2cm',
            lineHeight: settings.line_spacing
          }}>
            <span className="mr-2 font-bold" style={{ minWidth: '0.5cm', textAlign: 'right' }}>
              {level === 1 ? '-' : level === 2 ? '+' : '-'}
            </span>
            <span>{parseMarkdown(content)}</span>
          </div>,
          h
        );
      }
      else if (line.trim() === '') {
        addToPage(<br key={i} data-source-line={i} />, lineHeightCm);
      }
      else {
        processParagraph(line, `p-${i}`, i);
      }
    }

    if (inTable && tableBuffer.length > 0) {
      const tableEl = renderTable(tableBuffer, lines.length); // Table uses last line index for now
      if (tableEl) {
        const rows = tableBuffer.length;
        const h = rows * 0.8 + 1;
        // Wrap table in div with data-source-line
        addToPage(<div data-source-line={lines.length - rows}>{tableEl}</div>, h);
      }
    }

    if (currentPage.length > 0) flushPage();

    return pages.map((pageContent, idx) => (
      <div
        key={idx}
        className="bg-white shadow-lg w-[21cm] min-h-[29.7cm] mb-8 relative shrink-0 transition-all origin-top"
        onClick={handlePreviewClick}
        style={{
          fontFamily: `"${settings.font_family}", Times, serif`,
          fontSize: `${settings.font_size}pt`,
          lineHeight: settings.line_spacing,
          paddingTop: `${settings.margin_top}cm`,
          paddingBottom: `${settings.margin_bottom}cm`,
          paddingLeft: `${settings.margin_left}cm`,
          paddingRight: `${settings.margin_right}cm`,
          transform: `scale(${zoomLevel / 100})`,
          marginBottom: `${(29.7 * (zoomLevel / 100 - 1)) + 2}cm` // Adjust margin for scale
        }}
      >
        <div className="absolute top-2 right-[-30px] text-xs text-slate-400 font-bold" style={{
          transform: `scale(${100 / zoomLevel})`
        }}>P.{idx + 1}</div >
        {pageContent}
      </div>
    ));
  };

  const renderTable = (lines: string[], keyPrefix: number) => {
    const rows = lines.map(l => l.split('|').filter(c => c.trim() !== '').map(c => c.trim()));
    const dataRows = rows.filter(r => !r[0]?.match(/^-+$/));
    if (dataRows.length === 0) return null;

    return (
      <div key={`table - ${keyPrefix} `} className="flex justify-center my-6">
        <table className="border-collapse border border-black w-full text-sm">
          <thead>
            <tr>
              {dataRows[0].map((header, idx) => (
                <th key={idx} className="border border-black p-2 bg-slate-100 font-bold text-center">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.slice(1).map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="border border-black p-2">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // --- PROJECT FILE HANDLING ---
  const handleDownloadProject = () => {
    const data = {
      content,
      settings,
      figures,
      citations,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `do -an - ${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.content !== undefined) setContent(json.content);
        if (json.settings) setSettings(prev => ({ ...prev, ...json.settings }));
        if (json.figures) setFigures(json.figures);
        if (json.citations) setCitations(json.citations);
        alert("Đã tải dự án thành công!");
      } catch (err) {
        alert("File dự án không hợp lệ!");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleImportProject}
      />

      {/* DIALOGS */}

      {/* Image Dialog */}
      <Dialog title="Chèn Hình Ảnh" isOpen={showImageDialog} onClose={() => setShowImageDialog(false)}>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
            <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded" />
            ) : (
              <div className="text-slate-500">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p>Click hoặc kéo thả ảnh vào đây</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tên hình (Caption)</label>
            <input type="text" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Ví dụ: Sơ đồ hệ thống..." value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kích thước (%)</label>
            <div className="flex items-center gap-4">
              <input
                type="range" min="50" max="150" step="5"
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                value={imageScale}
                onChange={(e) => setImageScale(parseInt(e.target.value))}
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-20 border border-slate-300 rounded px-2 py-1 text-sm text-center font-bold text-indigo-600 focus:outline-none focus:border-indigo-500"
                  value={imageScale}
                  onChange={(e) => setImageScale(parseInt(e.target.value) || 0)}
                />
                <span className="text-sm text-slate-500 font-medium">%</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">Tương đương: {((imageScale / 100) * 16).toFixed(1)} cm (Chuẩn A4: 16cm)</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowImageDialog(false)}>Hủy</Button>
            <Button variant="default" onClick={handleImageUpload} disabled={uploading}>{uploading ? "Đang tải..." : "Chèn hình"}</Button>
          </div>
        </div>
      </Dialog>

      {/* Table Dialog */}
      <Dialog title="Chèn/Sửa Bảng" isOpen={showTableDialog} onClose={() => setShowTableDialog(false)} maxWidth="max-w-4xl">
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">Số dòng</label>
              <input type="number" min="1" max="20" className="border rounded px-2 py-1 w-20" value={tableRows} onChange={(e) => resizeTable(parseInt(e.target.value), tableCols)} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Số cột</label>
              <input type="number" min="1" max="10" className="border rounded px-2 py-1 w-20" value={tableCols} onChange={(e) => resizeTable(tableRows, parseInt(e.target.value))} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Tên bảng</label>
              <input type="text" className="border rounded px-2 py-1 w-full" placeholder="Ví dụ: Số liệu thống kê..." value={tableCaption} onChange={(e) => setTableCaption(e.target.value)} />
            </div>
          </div>

          <div className="overflow-auto max-h-[400px] border rounded">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {tableData.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border p-0 min-w-[100px]">
                        <input
                          className={clsx("w-full px-2 py-1 outline-none", rIdx === 0 ? "bg-slate-100 font-bold text-center" : "")}
                          value={cell}
                          onChange={(e) => updateTableData(rIdx, cIdx, e.target.value)}
                          placeholder={rIdx === 0 ? `Tiêu đề ${cIdx + 1} ` : ""}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowTableDialog(false)}>Hủy</Button>
            <Button variant="default" onClick={handleTableInsert}>Chèn bảng</Button>
          </div>
        </div>
      </Dialog>

      {/* JSON Import Dialog */}
      <Dialog title="Nhập trích dẫn từ JSON" isOpen={showJsonImportDialog} onClose={() => setShowJsonImportDialog(false)}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Dán mảng JSON chứa các trích dẫn vào đây. Ví dụ:
            <br />
            <code className="bg-slate-100 p-1 rounded text-xs block mt-1">
              [{`{"author": "Nguyen Van A", "year": "2023", "title": "Tên sách", "publisher": "NXB"}`}]
            </code>
          </p>
          <textarea
            className="w-full h-48 border rounded p-2 text-sm font-mono"
            placeholder='[{"author": "...", ...}]'
            value={jsonImportText}
            onChange={(e) => setJsonImportText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowJsonImportDialog(false)}>Hủy</Button>
            <Button variant="default" onClick={handleJsonImport}>Nhập</Button>
          </div>
        </div>
      </Dialog>

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Thesis Formatter
          </h1>
          <p className="text-xs text-slate-500 mt-1">Soạn thảo đồ án chuẩn format</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={activeTab === "editor" ? "secondary" : "ghost"}
            className="w-full justify-start gap-2" size="default"
            onClick={() => setActiveTab("editor")}
          >
            <Edit3 className="w-4 h-4" /> Soạn thảo
          </Button>
          <Button
            variant={activeTab === "citations" ? "secondary" : "ghost"}
            className="w-full justify-start gap-2" size="default"
            onClick={() => setActiveTab("citations")}
          >
            <BookOpen className="w-4 h-4" /> Trích dẫn
          </Button>
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className="w-full justify-start gap-2" size="default"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="w-4 h-4" /> Cài đặt
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800" onClick={handleDownloadProject}>
            <Save className="w-4 h-4" /> Lưu file (.json)
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800" onClick={handleImportClick}>
            <FolderOpen className="w-4 h-4" /> Mở file (.json)
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800" onClick={handleSave}>
            <Upload className="w-4 h-4" /> Lưu dự án (Server)
          </Button>

          <div className="h-px bg-slate-800 my-2" />

          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-800" onClick={handleExport}>
            <Download className="w-4 h-4" /> Xuất Word (.docx)
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">

        {/* EDITOR TAB */}
        {activeTab === "editor" && (
          <>
            {/* TOOLBAR */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
              <div className="flex items-center gap-1">
                <div className="flex items-center bg-slate-100 rounded-md p-1 mr-2">
                  <span className="text-xs font-medium px-2 text-slate-600">Heading</span>
                  <select className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer text-slate-900 font-medium w-24" onChange={handleHeading}>
                    <option value="">Chọn...</option>
                    <option value="1">H1 - Chương</option>
                    <option value="2">H2 - Mục lớn</option>
                    <option value="3">H3 - Mục nhỏ</option>
                  </select>
                </div>

                <Separator />

                <Button onClick={() => insertText("**", "**")} title="Bold"><Bold className="w-4 h-4" /></Button>
                <Button onClick={() => insertText("*", "*")} title="Italic"><Italic className="w-4 h-4" /></Button>
                <Button onClick={() => insertText("<u>", "</u>")} title="Underline"><Underline className="w-4 h-4" /></Button>
                <Button onClick={() => insertText("- ")} title="Bullet List"><List className="w-4 h-4" /></Button>
                <Button onClick={() => insertText("$", "$")} title="Math Formula"><Sigma className="w-4 h-4" /></Button>
                <Button onClick={renumberAssets} title="Cập nhật STT Hình/Bảng"><RefreshCw className="w-4 h-4" /></Button>

                <Separator />

                <Button onClick={() => setShowImageDialog(true)} title="Chèn ảnh"><ImageIcon className="w-4 h-4" /></Button>
                <Button onClick={() => setShowTableDialog(true)} title="Chèn bảng"><TableIcon className="w-4 h-4" /></Button>

                {/* Citation Popover */}
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <Button title="Chèn trích dẫn"><Quote className="w-4 h-4" /></Button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content className="bg-white p-2 rounded shadow-lg border border-slate-200 w-64 z-50 animate-in fade-in zoom-in duration-200" sideOffset={5}>
                      <h3 className="text-xs font-bold text-slate-500 mb-2 px-2">Chọn trích dẫn</h3>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {citations.length === 0 ? (
                          <p className="text-xs text-slate-400 px-2 italic">Chưa có trích dẫn nào. Vào tab Trích dẫn để thêm.</p>
                        ) : (
                          citations.map((c, idx) => (
                            <button
                              key={idx}
                              className="w-full text-left text-sm px-2 py-1.5 hover:bg-slate-100 rounded truncate"
                              onClick={() => insertText(`[${idx + 1}]`)}
                            >
                              <span className="font-bold text-indigo-600 mr-2">[{idx + 1}]</span>
                              {c.author} ({c.year})
                            </button>
                          ))
                        )}
                      </div>
                      <Popover.Arrow className="fill-white" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1">
                  <span className="text-xs font-bold text-slate-500">ZOOM</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                    className="w-24 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono w-8 text-right">{zoomLevel}%</span>
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <FileDown size={18} />
                  Xuất Word (.docx)
                </button>
                <Button variant={isPreviewOpen ? "secondary" : "ghost"} onClick={() => setIsPreviewOpen(!isPreviewOpen)} title="Bật/Tắt Preview">
                  <ChevronRight className={clsx("w-4 h-4 transition-transform", isPreviewOpen && "rotate-180")} />
                </Button>
              </div>
            </header>

            {/* EDITOR & PREVIEW */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  className="w-full h-full p-8 resize-none focus:outline-none font-sans text-base leading-relaxed bg-white text-slate-800"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập nội dung đồ án..."
                />
              </div>

              {isPreviewOpen && (
                <div className="w-1/2 bg-slate-100 border-l border-slate-200 overflow-y-auto p-8 flex flex-col items-center">
                  {renderPreview()}
                </div>
              )}
            </div>
          </>
        )}

        {/* CITATIONS TAB */}
        {activeTab === "citations" && (
          <div className="p-8 max-w-4xl mx-auto w-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Quản lý Tài liệu Tham khảo</h2>
              <Button variant="outline" onClick={() => setShowJsonImportDialog(true)} className="gap-2">
                <Code className="w-4 h-4" /> Nhập JSON
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
              <h3 className="font-bold mb-4 text-lg">Thêm trích dẫn mới</h3>
              <div className="grid grid-cols-2 gap-4">
                <input className="border p-2 rounded" placeholder="Tác giả (VD: Nguyen Van A)" value={newCitation.author} onChange={e => setNewCitation({ ...newCitation, author: e.target.value })} />
                <input className="border p-2 rounded" placeholder="Năm (VD: 2024)" value={newCitation.year} onChange={e => setNewCitation({ ...newCitation, year: e.target.value })} />
                <input className="border p-2 rounded col-span-2" placeholder="Tên bài viết / Sách" value={newCitation.title} onChange={e => setNewCitation({ ...newCitation, title: e.target.value })} />
                <input className="border p-2 rounded col-span-2" placeholder="Nhà xuất bản / Tạp chí" value={newCitation.publisher} onChange={e => setNewCitation({ ...newCitation, publisher: e.target.value })} />
                <input className="border p-2 rounded col-span-2" placeholder="URL (nếu có)" value={newCitation.url} onChange={e => setNewCitation({ ...newCitation, url: e.target.value })} />
              </div>
              <Button variant="default" className="mt-4" onClick={addCitation}>
                <Plus className="w-4 h-4 mr-2" /> Thêm vào danh sách
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg">Danh sách đã thêm ({citations.length})</h3>
              {citations.length === 0 && <p className="text-slate-500 italic">Chưa có trích dẫn nào.</p>}
              {citations.map((c, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-indigo-600 mr-2">[{idx + 1}]</span>
                    <span className="font-bold">{c.author}</span> ({c.year}). <span className="italic">{c.title}</span>. {c.publisher}.
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteCitation(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="p-8 max-w-2xl mx-auto w-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Cài đặt Trang & Font chữ</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 space-y-6">

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Font chữ</label>
                  <select className="w-full border p-2 rounded" value={settings.font_family} onChange={(e) => setSettings({ ...settings, font_family: e.target.value })}>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề cấp 1 (Heading 1)</label>
                  <input
                    type="text"
                    value={settings.h1_prefix}
                    onChange={(e) => setSettings({ ...settings, h1_prefix: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm"
                    placeholder="Ví dụ: CHƯƠNG, PHẦN, BÀI..."
                  />
                  <p className="text-xs text-slate-500 mt-1">Để trống nếu chỉ muốn hiện số (I, II...)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto_numbering"
                  checked={settings.auto_numbering}
                  onChange={(e) => setSettings({ ...settings, auto_numbering: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="auto_numbering" className="text-sm font-medium text-slate-700">Tự động đánh số tiêu đề (I, 1.1, 1.1.1...)</label>
              </div>

              <div className="flex items-center gap-2 mt-2 ml-6">
                <input
                  type="checkbox"
                  id="h1_split"
                  checked={settings.h1_split || false}
                  onChange={(e) => setSettings({ ...settings, h1_split: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={!settings.auto_numbering}
                />
                <label htmlFor="h1_split" className={`text-sm font-medium text-slate-700 ${!settings.auto_numbering ? 'text-slate-400' : ''}`}>
                  Ngắt dòng tiêu đề chương (CHƯƠNG I xuống dòng TÊN)
                </label>
              </div>

              <div className="flex items-center gap-2 mt-2 ml-6">
                <input
                  type="checkbox"
                  id="hierarchical_numbering"
                  checked={settings.hierarchical_numbering !== false} // Default true
                  onChange={(e) => setSettings({ ...settings, hierarchical_numbering: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={!settings.auto_numbering}
                />
                <label htmlFor="hierarchical_numbering" className={`text-sm font-medium text-slate-700 ${!settings.auto_numbering ? 'text-slate-400' : ''}`}>
                  Đánh số phân cấp (3.1, 3.1.1). Tắt để dùng (1, 1.1)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cỡ chữ (pt)</label>
                <input type="number" className="w-full border p-2 rounded" value={settings.font_size} onChange={(e) => setSettings({ ...settings, font_size: parseFloat(e.target.value) })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Lề Trái (cm)</label>
                  <input type="number" step="0.1" className="w-full border p-2 rounded" value={settings.margin_left} onChange={(e) => setSettings({ ...settings, margin_left: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lề Phải (cm)</label>
                  <input type="number" step="0.1" className="w-full border p-2 rounded" value={settings.margin_right} onChange={(e) => setSettings({ ...settings, margin_right: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lề Trên (cm)</label>
                  <input type="number" step="0.1" className="w-full border p-2 rounded" value={settings.margin_top} onChange={(e) => setSettings({ ...settings, margin_top: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Lề Dưới (cm)</label>
                  <input type="number" step="0.1" className="w-full border p-2 rounded" value={settings.margin_bottom} onChange={(e) => setSettings({ ...settings, margin_bottom: parseFloat(e.target.value) })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thụt đầu dòng (cm)</label>
                <input type="number" step="0.1" className="w-full border p-2 rounded" value={settings.indent} onChange={(e) => setSettings({ ...settings, indent: parseFloat(e.target.value) })} />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Tinh chỉnh hiển thị (Calibration)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">Độ dày chữ (Text Density)</label>
                      <span className="text-xs text-slate-500">{settings.text_density?.toFixed(2) || "1.00"}</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.2"
                      step="0.01"
                      value={settings.text_density || 1.0}
                      onChange={(e) => setSettings({ ...settings, text_density: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Kéo sang phải nếu Preview chứa nhiều chữ hơn Word (xuống dòng chậm hơn).</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">Giãn dòng (Line Scaling)</label>
                      <span className="text-xs text-slate-500">{settings.line_height_scale?.toFixed(2) || "1.00"}</span>
                    </div>
                    <input
                      type="range"
                      min="0.9"
                      max="1.1"
                      step="0.01"
                      value={settings.line_height_scale || 1.0}
                      onChange={(e) => setSettings({ ...settings, line_height_scale: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Kéo sang phải nếu Preview chứa nhiều dòng hơn Word (ngắt trang chậm hơn).</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">Tỷ lệ trang (Page Scale)</label>
                      <span className="text-xs text-slate-500">{settings.page_content_scale?.toFixed(2) || "1.00"}</span>
                    </div>
                    <input
                      type="range"
                      min="0.9"
                      max="1.1"
                      step="0.01"
                      value={settings.page_content_scale || 1.0}
                      onChange={(e) => setSettings({ ...settings, page_content_scale: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Giảm xuống (ví dụ 0.95) nếu trang giấy có vẻ "to hơn" Word.</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hard_wrap"
                        checked={settings.hard_wrap || false}
                        onChange={(e) => setSettings({ ...settings, hard_wrap: e.target.checked })}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <label htmlFor="hard_wrap" className="text-xs font-bold text-red-600">Khóa ngắt dòng (Experimental)</label>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Nếu bật: File Word sẽ bị ngắt dòng y hệt Preview (giống 100%).
                      <br />Lưu ý: File sẽ khó chỉnh sửa hơn.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
