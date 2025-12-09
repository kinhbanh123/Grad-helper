import { clsx } from "clsx";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

interface TableDialogProps {
    isOpen: boolean;
    onClose: () => void;
    tableRows: number;
    tableCols: number;
    tableData: string[][];
    tableCaption: string;
    setTableCaption: (value: string) => void;
    resizeTable: (rows: number, cols: number) => void;
    updateTableData: (row: number, col: number, value: string) => void;
    handleTableInsert: () => void;
}

export function TableDialog({
    isOpen,
    onClose,
    tableRows,
    tableCols,
    tableData,
    tableCaption,
    setTableCaption,
    resizeTable,
    updateTableData,
    handleTableInsert,
}: TableDialogProps) {
    return (
        <Dialog title="Chèn/Sửa Bảng" isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
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
                    <Button variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button variant="default" onClick={handleTableInsert}>Chèn bảng</Button>
                </div>
            </div>
        </Dialog>
    );
}
