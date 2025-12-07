"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bold, Italic, Underline, Image as ImageIcon, Table as TableIcon,
  FileText, Download, Settings, ChevronRight, Type, Quote, X, Upload, Plus, Trash2, BookOpen, Edit3, Save, FolderOpen
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Popover from '@radix-ui/react-popover';

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
    margin_bottom: 2.0,
    margin_left: 3.0,
    margin_right: 2.0
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
          setSettings(json.data.settings);
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
    md += `Bảng 1.${Math.floor(Math.random() * 100)}: ${tableCaption} \n\n`;

    insertText(md);
    setShowTableDialog(false);
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

  // --- PREVIEW RENDERER ---
  const renderPreview = () => {
    const lines = content.split('\n');
    const elements = [];
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
        elements.push(renderTable(tableBuffer, i));
        tableBuffer = [];
      }

      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-center font-bold uppercase mt-6 mb-6" style={{ fontSize: `${settings.h1_size} pt` }}>{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-left font-bold mt-4 mb-3" style={{ fontSize: `${settings.h2_size} pt` }}>{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-left font-bold italic mt-4 mb-3" style={{ fontSize: `${settings.h3_size} pt` }}>{line.substring(4)}</h3>);
      }
      else if (line.startsWith('[Hình') && line.endsWith(']')) {
        const match = line.match(/\[(Hình \d+\.\d+): (.*)\]/);
        if (match) {
          const figNum = match[1];
          const fig = figures.find(f => f.number === figNum);
          elements.push(
            <div key={i} className="text-center my-6">
              {fig && fig.url ? (
                <img
                  src={fig.url}
                  alt={match[2]}
                  className="mx-auto object-contain"
                  style={{ width: fig.width ? `${fig.width} cm` : '16cm', maxHeight: '15cm' }}
                />
              ) : (
                <div className="w-full h-32 bg-slate-200 flex items-center justify-center text-slate-500 italic">Hình ảnh chưa upload</div>
              )}
              <p className="italic mt-3 font-medium">{figNum}: {match[2]}</p>
            </div>
          );
        }
      }
      else if (line.startsWith('Bảng') && line.includes(':')) {
        elements.push(<p key={i} className="text-center font-bold my-3">{line}</p>);
      }
      else if (line.trim() === '') {
        elements.push(<br key={i} />);
      }
      else {
        elements.push(<p key={i} className="mb-2" style={{ textIndent: `${settings.indent} cm` }}>{line}</p>);
      }
    }

    if (inTable && tableBuffer.length > 0) {
      elements.push(renderTable(tableBuffer, lines.length));
    }

    return elements;
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
        if (json.settings) setSettings(json.settings);
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

              <div className="flex items-center gap-2">
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
                  className="w-full h-full p-8 resize-none focus:outline-none font-mono text-base leading-relaxed bg-white text-slate-800"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung đồ án..."
                />
              </div>

              {isPreviewOpen && (
                <div className="w-1/2 bg-slate-100 border-l border-slate-200 overflow-y-auto p-8 flex justify-center">
                  <div
                    className="bg-white shadow-lg min-h-[29.7cm] w-[21cm] p-[2.54cm] text-justify"
                    style={{
                      fontFamily: `"${settings.font_family}", Times, serif`,
                      fontSize: `${settings.font_size} pt`,
                      lineHeight: settings.line_spacing,
                      paddingTop: `${settings.margin_top} cm`,
                      paddingBottom: `${settings.margin_bottom} cm`,
                      paddingLeft: `${settings.margin_left} cm`,
                      paddingRight: `${settings.margin_right} cm`,
                    }}
                  >
                    {renderPreview()}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* CITATIONS TAB */}
        {activeTab === "citations" && (
          <div className="p-8 max-w-4xl mx-auto w-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Quản lý Tài liệu Tham khảo</h2>

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
                  <label className="block text-sm font-medium mb-2">Cỡ chữ (pt)</label>
                  <input type="number" className="w-full border p-2 rounded" value={settings.font_size} onChange={(e) => setSettings({ ...settings, font_size: parseFloat(e.target.value) })} />
                </div>
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
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
