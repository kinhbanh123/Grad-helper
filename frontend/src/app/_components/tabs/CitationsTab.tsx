import { Code, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

interface CitationsTabProps {
    citations: any[];
    newCitation: any;
    setNewCitation: (value: any) => void;
    addCitation: () => void;
    deleteCitation: (index: number) => void;
    setShowJsonImportDialog: (value: boolean) => void;
}

export function CitationsTab({
    citations,
    newCitation,
    setNewCitation,
    addCitation,
    deleteCitation,
    setShowJsonImportDialog,
}: CitationsTabProps) {
    return (
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
    );
}
