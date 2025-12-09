import { Bold, Italic, Underline, List, Sigma, RefreshCw, Image as ImageIcon, Table as TableIcon, Quote, FileDown, ChevronRight } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { Button } from "../ui/Button";
import { Separator } from "../ui/Separator";

interface EditorToolbarProps {
    handleHeading: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    insertText: (before: string, after?: string) => void;
    renumberAssets: () => void;
    setShowImageDialog: (value: boolean) => void;
    setShowTableDialog: (value: boolean) => void;
    citations: any[];
    zoomLevel: number;
    setZoomLevel: (value: number) => void;
    handleExport: () => void;
    isPreviewOpen: boolean;
    setIsPreviewOpen: (value: boolean) => void;
}

export function EditorToolbar({
    handleHeading,
    insertText,
    renumberAssets,
    setShowImageDialog,
    setShowTableDialog,
    citations,
    zoomLevel,
    setZoomLevel,
    handleExport,
    isPreviewOpen,
    setIsPreviewOpen,
}: EditorToolbarProps) {
    return (
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
    );
}
