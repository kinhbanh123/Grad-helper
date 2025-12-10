import React, { useState } from "react";
import { List, Plus, Trash2, Edit2, Check, X, Upload, Download } from "lucide-react";
import { Button } from "../ui/Button";

export interface Abbreviation {
    id: string;
    abbreviation: string;
    fullForm: string;  // Diễn giải đầy đủ (có thể bao gồm cả tiếng Anh và tiếng Việt)
    type: "abbreviation" | "symbol";
}

interface AbbreviationsTabProps {
    abbreviations: Abbreviation[];
    setAbbreviations: React.Dispatch<React.SetStateAction<Abbreviation[]>>;
}

export function AbbreviationsTab({ abbreviations, setAbbreviations }: AbbreviationsTabProps) {
    const [newAbbr, setNewAbbr] = useState("");
    const [newFull, setNewFull] = useState("");
    const [newType, setNewType] = useState<"abbreviation" | "symbol">("abbreviation");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAbbr, setEditAbbr] = useState("");
    const [editFull, setEditFull] = useState("");
    const [editType, setEditType] = useState<"abbreviation" | "symbol">("abbreviation");

    const [filterType, setFilterType] = useState<"all" | "abbreviation" | "symbol">("all");
    const [showJsonHelp, setShowJsonHelp] = useState(false);
    const [jsonInput, setJsonInput] = useState("");

    const addAbbreviation = () => {
        if (!newAbbr.trim() || !newFull.trim()) {
            alert("Vui lòng nhập đầy đủ chữ viết tắt và diễn giải!");
            return;
        }

        const newItem: Abbreviation = {
            id: Date.now().toString(),
            abbreviation: newAbbr.trim(),
            fullForm: newFull.trim(),
            type: newType
        };

        setAbbreviations(prev => [...prev, newItem].sort((a, b) =>
            a.abbreviation.localeCompare(b.abbreviation)
        ));
        setNewAbbr("");
        setNewFull("");
    };

    const deleteAbbreviation = (id: string) => {
        setAbbreviations(prev => prev.filter(item => item.id !== id));
    };

    const startEdit = (item: Abbreviation) => {
        setEditingId(item.id);
        setEditAbbr(item.abbreviation);
        setEditFull(item.fullForm || "");
        setEditType(item.type);
    };

    const saveEdit = () => {
        if (!editAbbr.trim() || !editFull.trim()) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setAbbreviations(prev =>
            prev.map(item =>
                item.id === editingId
                    ? { ...item, abbreviation: editAbbr.trim(), fullForm: editFull.trim(), type: editType }
                    : item
            ).sort((a, b) => a.abbreviation.localeCompare(b.abbreviation))
        );
        setEditingId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    // Import JSON from textarea
    const handleJsonImport = () => {
        if (!jsonInput.trim()) return;

        try {
            const json = JSON.parse(jsonInput);
            let importedItems: Abbreviation[] = [];

            // Support multiple formats
            if (Array.isArray(json)) {
                // Direct array format
                importedItems = json.map((item: any, idx: number) => ({
                    id: Date.now().toString() + idx,
                    abbreviation: item.abbreviation || item.abbr || item.viettatt || "",
                    fullForm: item.fullForm || item.full || item.diengiai || item.meaning || "",
                    type: item.type === "symbol" ? "symbol" : "abbreviation"
                }));
            } else if (json.abbreviations && Array.isArray(json.abbreviations)) {
                // Object with abbreviations key
                importedItems = json.abbreviations.map((item: any, idx: number) => ({
                    id: Date.now().toString() + idx,
                    abbreviation: item.abbreviation || item.abbr || item.viettatt || "",
                    fullForm: item.fullForm || item.full || item.diengiai || item.meaning || "",
                    type: item.type === "symbol" ? "symbol" : "abbreviation"
                }));
            }

            // Filter valid items
            importedItems = importedItems.filter(item => item.abbreviation && item.fullForm);

            if (importedItems.length === 0) {
                alert("Không tìm thấy dữ liệu hợp lệ trong JSON!");
                return;
            }

            // Add to existing or replace
            const shouldAdd = confirm(`Tìm thấy ${importedItems.length} mục.\n\nNhấn OK để THÊM vào danh sách hiện tại.\nNhấn Cancel để THAY THẾ toàn bộ.`);

            if (shouldAdd) {
                setAbbreviations(prev => [...prev, ...importedItems].sort((a, b) =>
                    a.abbreviation.localeCompare(b.abbreviation)
                ));
            } else {
                setAbbreviations(importedItems.sort((a, b) =>
                    a.abbreviation.localeCompare(b.abbreviation)
                ));
            }

            alert(`Đã import ${importedItems.length} mục thành công!`);
            setJsonInput("");
            setShowJsonHelp(false);
        } catch (err) {
            alert("JSON không hợp lệ: " + err);
        }
    };

    // Export JSON
    const handleExport = () => {
        const data = abbreviations.map(({ id, ...rest }) => rest); // Remove id for cleaner export
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "abbreviations.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredItems = filterType === "all"
        ? abbreviations
        : abbreviations.filter(item => item.type === filterType);

    const abbreviationCount = abbreviations.filter(a => a.type === "abbreviation").length;
    const symbolCount = abbreviations.filter(a => a.type === "symbol").length;

    const sampleJson = `[
  { "abbreviation": "AI", "fullForm": "Trí tuệ nhân tạo (Artificial Intelligence)" },
  { "abbreviation": "LLM", "fullForm": "Mô hình ngôn ngữ lớn (Large Language Model)" },
  { "abbreviation": "BĐKH", "fullForm": "Biến đổi khí hậu" }
]`;

    return (
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl p-8 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <List size={24} />
                        </span>
                        Danh mục viết tắt & Ký hiệu
                    </h2>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowJsonHelp(!showJsonHelp)}
                            className="text-blue-600 hover:bg-blue-50"
                        >
                            <Upload size={18} className="mr-1" />
                            Import JSON
                        </Button>
                        {abbreviations.length > 0 && (
                            <Button
                                variant="ghost"
                                onClick={handleExport}
                                className="text-green-600 hover:bg-green-50"
                            >
                                <Download size={18} className="mr-1" />
                                Export JSON
                            </Button>
                        )}
                    </div>
                </div>

                {/* JSON Import Panel */}
                {showJsonHelp && (
                    <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                        <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                            <Upload size={18} />
                            Import từ JSON
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-indigo-700 mb-2">Dán JSON vào đây:</p>
                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    placeholder={sampleJson}
                                    className="w-full h-40 px-3 py-2 border border-indigo-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        variant="default"
                                        onClick={handleJsonImport}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        disabled={!jsonInput.trim()}
                                    >
                                        Import
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => { setShowJsonHelp(false); setJsonInput(""); }}
                                        className="text-slate-600"
                                    >
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-indigo-700 mb-2">Mẫu JSON:</p>
                                <pre className="text-xs bg-slate-800 text-green-400 p-3 rounded h-40 overflow-auto">{sampleJson}</pre>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                    <p><strong>Chuẩn VN:</strong> Ghi diễn giải đầy đủ, ví dụ: "Trí tuệ nhân tạo (Artificial Intelligence)"</p>
                </div>

                {/* Add New Form */}
                <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-green-600" />
                        Thêm mới
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Loại</label>
                            <select
                                value={newType}
                                onChange={(e) => setNewType(e.target.value as "abbreviation" | "symbol")}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="abbreviation">Chữ viết tắt</option>
                                <option value="symbol">Ký hiệu</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">
                                {newType === "abbreviation" ? "Viết tắt" : "Ký hiệu"}
                            </label>
                            <input
                                type="text"
                                value={newAbbr}
                                onChange={(e) => setNewAbbr(e.target.value)}
                                placeholder="VD: AI, BĐKH, α..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600 mb-1">Diễn giải đầy đủ</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newFull}
                                    onChange={(e) => setNewFull(e.target.value)}
                                    placeholder="VD: Trí tuệ nhân tạo (Artificial Intelligence)"
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    onKeyDown={(e) => e.key === "Enter" && addAbbreviation()}
                                />
                                <Button
                                    variant="default"
                                    onClick={addAbbreviation}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Plus size={18} className="mr-1" />
                                    Thêm
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilterType("all")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === "all"
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                    >
                        Tất cả ({abbreviations.length})
                    </button>
                    <button
                        onClick={() => setFilterType("abbreviation")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === "abbreviation"
                            ? "bg-indigo-600 text-white"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                            }`}
                    >
                        Viết tắt ({abbreviationCount})
                    </button>
                    <button
                        onClick={() => setFilterType("symbol")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterType === "symbol"
                            ? "bg-purple-600 text-white"
                            : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                            }`}
                    >
                        Ký hiệu ({symbolCount})
                    </button>
                </div>

                {/* List */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <List size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Chưa có mục nào. Hãy thêm viết tắt hoặc ký hiệu ở trên.</p>
                    </div>
                ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-12">STT</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-20">Loại</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 w-28">Viết tắt</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Diễn giải đầy đủ</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 w-20">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, index) => (
                                    <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500 text-sm">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            {editingId === item.id ? (
                                                <select
                                                    value={editType}
                                                    onChange={(e) => setEditType(e.target.value as "abbreviation" | "symbol")}
                                                    className="px-2 py-1 border border-slate-200 rounded text-xs w-full"
                                                >
                                                    <option value="abbreviation">Viết tắt</option>
                                                    <option value="symbol">Ký hiệu</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === "abbreviation"
                                                    ? "bg-indigo-100 text-indigo-700"
                                                    : "bg-purple-100 text-purple-700"
                                                    }`}>
                                                    {item.type === "abbreviation" ? "Viết tắt" : "Ký hiệu"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                                            {editingId === item.id ? (
                                                <input
                                                    type="text"
                                                    value={editAbbr}
                                                    onChange={(e) => setEditAbbr(e.target.value)}
                                                    className="px-2 py-1 border border-slate-200 rounded w-full text-sm"
                                                />
                                            ) : (
                                                item.abbreviation
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {editingId === item.id ? (
                                                <input
                                                    type="text"
                                                    value={editFull}
                                                    onChange={(e) => setEditFull(e.target.value)}
                                                    className="px-2 py-1 border border-slate-200 rounded w-full text-sm"
                                                />
                                            ) : (
                                                item.fullForm
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {editingId === item.id ? (
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={saveEdit}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                        title="Lưu"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"
                                                        title="Hủy"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => startEdit(item)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Sửa"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteAbbreviation(item.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
