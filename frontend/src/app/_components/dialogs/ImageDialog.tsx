import { Upload } from "lucide-react";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

interface ImageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    imagePreview: string | null;
    imageCaption: string;
    setImageCaption: (value: string) => void;
    imageScale: number;
    setImageScale: (value: number) => void;
    uploading: boolean;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageUpload: () => void;
}

export function ImageDialog({
    isOpen,
    onClose,
    imagePreview,
    imageCaption,
    setImageCaption,
    imageScale,
    setImageScale,
    uploading,
    handleFileSelect,
    handleImageUpload,
}: ImageDialogProps) {
    return (
        <Dialog title="Chèn Hình Ảnh" isOpen={isOpen} onClose={onClose}>
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
                    <Button variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button variant="default" onClick={handleImageUpload} disabled={uploading}>{uploading ? "Đang tải..." : "Chèn hình"}</Button>
                </div>
            </div>
        </Dialog>
    );
}
