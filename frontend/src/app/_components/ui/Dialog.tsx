import { twMerge } from "tailwind-merge";
import { X } from "lucide-react";

interface DialogProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
}

export function Dialog({ title, isOpen, onClose, children, maxWidth = "max-w-md" }: DialogProps) {
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
