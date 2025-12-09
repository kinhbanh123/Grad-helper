"use client";

import { useState, useEffect, useRef } from "react";
import { ImageDialog } from "./_components/dialogs/ImageDialog";
import { TableDialog } from "./_components/dialogs/TableDialog";
import { JsonImportDialog } from "./_components/dialogs/JsonImportDialog";
import { Sidebar } from "./_components/layout/Sidebar";
import { EditorToolbar } from "./_components/editor/EditorToolbar";
import { CitationsTab } from "./_components/tabs/CitationsTab";
import { SettingsTab } from "./_components/tabs/SettingsTab";
import { SmartZoneTab } from "./_components/tabs/SmartZoneTab";
import { PreviewRenderer } from "./_components/preview/PreviewRenderer";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"editor" | "citations" | "settings" | "smart-zone">("editor");
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

  const jumpToLine = (line: number) => {
    if (textareaRef.current) {
      // Calculate scroll position (approximate)
      // Assuming 24px per line (depends on textarea styling)
      const lineHeight = 24;
      const scrollPos = line * lineHeight;

      textareaRef.current.scrollTo({
        top: scrollPos,
        behavior: 'smooth'
      });

      // Set cursor position to start of the line
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
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    // Find closest element with data-source-line
    const target = e.target as HTMLElement;
    const sourceElement = target.closest('[data-source-line]');

    if (sourceElement) {
      const line = parseInt(sourceElement.getAttribute('data-source-line') || '0', 10);
      if (!isNaN(line)) {
        jumpToLine(line);
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

  const handleAutoFix = (lineIndex: number, matchIndex: number) => {
    const lines = content.split('\n');
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      // Insert newline after the matchIndex (which points to the punctuation)
      // The regex matches (\.|:|\))([a-zA-Z])
      // matchIndex is the start of the match (the punctuation)
      // We want to insert newline AFTER the punctuation (index + 1)
      const newLine = line.slice(0, matchIndex + 1) + '\n' + line.slice(matchIndex + 1);
      lines[lineIndex] = newLine;
      setContent(lines.join('\n'));
    }
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
      <ImageDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        imagePreview={imagePreview}
        imageCaption={imageCaption}
        setImageCaption={setImageCaption}
        imageScale={imageScale}
        setImageScale={setImageScale}
        uploading={uploading}
        handleFileSelect={handleFileSelect}
        handleImageUpload={handleImageUpload}
      />

      <TableDialog
        isOpen={showTableDialog}
        onClose={() => setShowTableDialog(false)}
        tableRows={tableRows}
        tableCols={tableCols}
        tableData={tableData}
        tableCaption={tableCaption}
        setTableCaption={setTableCaption}
        resizeTable={resizeTable}
        updateTableData={updateTableData}
        handleTableInsert={handleTableInsert}
      />

      <JsonImportDialog
        isOpen={showJsonImportDialog}
        onClose={() => setShowJsonImportDialog(false)}
        jsonImportText={jsonImportText}
        setJsonImportText={setJsonImportText}
        handleJsonImport={handleJsonImport}
      />

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleDownloadProject={handleDownloadProject}
        handleImportClick={handleImportClick}
        handleSave={handleSave}
        handleExport={handleExport}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">

        {/* EDITOR TAB */}
        {activeTab === "editor" && (
          <>
            {/* TOOLBAR */}
            <EditorToolbar
              handleHeading={handleHeading}
              insertText={insertText}
              renumberAssets={renumberAssets}
              setShowImageDialog={setShowImageDialog}
              setShowTableDialog={setShowTableDialog}
              citations={citations}
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
              handleExport={handleExport}
              isPreviewOpen={isPreviewOpen}
              setIsPreviewOpen={setIsPreviewOpen}
            />

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
                  <PreviewRenderer
                    content={content}
                    settings={settings}
                    figures={figures}
                    zoomLevel={zoomLevel}
                    handlePreviewClick={handlePreviewClick}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* CITATIONS TAB */}
        {activeTab === "citations" && (
          <CitationsTab
            citations={citations}
            newCitation={newCitation}
            setNewCitation={setNewCitation}
            addCitation={addCitation}
            deleteCitation={deleteCitation}
            setShowJsonImportDialog={setShowJsonImportDialog}
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <SettingsTab
            settings={settings}
            setSettings={setSettings}
          />
        )}

        {/* SMART ZONE TAB */}
        {activeTab === "smart-zone" && (
          <SmartZoneTab
            content={content}
            onJumpToLine={(line) => {
              setActiveTab("editor");
              // Timeout to allow tab switch to render editor before focusing
              setTimeout(() => jumpToLine(line), 100);
            }}
            onFix={handleAutoFix}
          />
        )}
      </main>
    </div>
  );
}
