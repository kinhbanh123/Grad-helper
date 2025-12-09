import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

interface JsonImportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    jsonImportText: string;
    setJsonImportText: (value: string) => void;
    handleJsonImport: () => void;
}

export function JsonImportDialog({
    isOpen,
    onClose,
    jsonImportText,
    setJsonImportText,
    handleJsonImport,
}: JsonImportDialogProps) {
    return (
        <Dialog title="Nhập trích dẫn từ JSON" isOpen={isOpen} onClose={onClose}>
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
                    <Button variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button variant="default" onClick={handleJsonImport}>Nhập</Button>
                </div>
            </div>
        </Dialog>
    );
}
