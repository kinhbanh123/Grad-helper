import { FileText, Edit3, BookOpen, Settings, Save, FolderOpen, Upload, Download, AlertTriangle, List } from "lucide-react";
import { Button } from "../ui/Button";

interface SidebarProps {
    activeTab: "editor" | "citations" | "settings" | "smart-zone" | "abbreviations";
    setActiveTab: (tab: "editor" | "citations" | "settings" | "smart-zone" | "abbreviations") => void;
    handleDownloadProject: () => void;
    handleImportClick: () => void;
    handleSave: () => void;
    handleExport: () => void;
}

export function Sidebar({
    activeTab,
    setActiveTab,
    handleDownloadProject,
    handleImportClick,
    handleSave,
    handleExport,
}: SidebarProps) {
    return (
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
                    variant={activeTab === "smart-zone" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2" size="default"
                    onClick={() => setActiveTab("smart-zone")}
                >
                    <AlertTriangle className="w-4 h-4" /> Check lỗi
                </Button>
                <Button
                    variant={activeTab === "citations" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2" size="default"
                    onClick={() => setActiveTab("citations")}
                >
                    <BookOpen className="w-4 h-4" /> Trích dẫn
                </Button>
                <Button
                    variant={activeTab === "abbreviations" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2" size="default"
                    onClick={() => setActiveTab("abbreviations")}
                >
                    <List className="w-4 h-4" /> Viết tắt & Ký hiệu
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
    );
}

