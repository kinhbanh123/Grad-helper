interface SettingsTabProps {
    settings: any;
    setSettings: (value: any) => void;
}

export function SettingsTab({ settings, setSettings }: SettingsTabProps) {
    return (
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề cấp 1 (Heading 1)</label>
                        <input
                            type="text"
                            value={settings.h1_prefix}
                            onChange={(e) => setSettings({ ...settings, h1_prefix: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-md text-sm"
                            placeholder="Ví dụ: CHƯƠNG, PHẦN, BÀI..."
                        />
                        <p className="text-xs text-slate-500 mt-1">Để trống nếu chỉ muốn hiện số (I, II...)</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="auto_numbering"
                        checked={settings.auto_numbering}
                        onChange={(e) => setSettings({ ...settings, auto_numbering: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="auto_numbering" className="text-sm font-medium text-slate-700">Tự động đánh số tiêu đề (I, 1.1, 1.1.1...)</label>
                </div>

                <div className="flex items-center gap-2 mt-2 ml-6">
                    <input
                        type="checkbox"
                        id="h1_split"
                        checked={settings.h1_split || false}
                        onChange={(e) => setSettings({ ...settings, h1_split: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={!settings.auto_numbering}
                    />
                    <label htmlFor="h1_split" className={`text-sm font-medium text-slate-700 ${!settings.auto_numbering ? 'text-slate-400' : ''}`}>
                        Ngắt dòng tiêu đề chương (CHƯƠNG I xuống dòng TÊN)
                    </label>
                </div>

                <div className="flex items-center gap-2 mt-2 ml-6">
                    <input
                        type="checkbox"
                        id="hierarchical_numbering"
                        checked={settings.hierarchical_numbering !== false} // Default true
                        onChange={(e) => setSettings({ ...settings, hierarchical_numbering: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={!settings.auto_numbering}
                    />
                    <label htmlFor="hierarchical_numbering" className={`text-sm font-medium text-slate-700 ${!settings.auto_numbering ? 'text-slate-400' : ''}`}>
                        Đánh số phân cấp (3.1, 3.1.1). Tắt để dùng (1, 1.1)
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Cỡ chữ (pt)</label>
                    <input type="number" className="w-full border p-2 rounded" value={settings.font_size} onChange={(e) => setSettings({ ...settings, font_size: parseFloat(e.target.value) })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                <div>
                    <label className="block text-sm font-medium mb-2">Thụt đầu dòng (cm)</label>
                    <input type="number" step="0.1" className="w-full border p-2 rounded" value={settings.indent} onChange={(e) => setSettings({ ...settings, indent: parseFloat(e.target.value) })} />
                </div>

                <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Tinh chỉnh hiển thị (Calibration)</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-xs font-medium text-slate-600">Độ dày chữ (Text Density)</label>
                                <span className="text-xs text-slate-500">{settings.text_density?.toFixed(2) || "1.00"}</span>
                            </div>
                            <input
                                type="range"
                                min="0.8"
                                max="1.2"
                                step="0.01"
                                value={settings.text_density || 1.0}
                                onChange={(e) => setSettings({ ...settings, text_density: parseFloat(e.target.value) })}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Kéo sang phải nếu Preview chứa nhiều chữ hơn Word (xuống dòng chậm hơn).</p>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-xs font-medium text-slate-600">Giãn dòng (Line Scaling)</label>
                                <span className="text-xs text-slate-500">{settings.line_height_scale?.toFixed(2) || "1.00"}</span>
                            </div>
                            <input
                                type="range"
                                min="0.9"
                                max="1.1"
                                step="0.01"
                                value={settings.line_height_scale || 1.0}
                                onChange={(e) => setSettings({ ...settings, line_height_scale: parseFloat(e.target.value) })}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Kéo sang phải nếu Preview chứa nhiều dòng hơn Word (ngắt trang chậm hơn).</p>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-xs font-medium text-slate-600">Tỷ lệ trang (Page Scale)</label>
                                <span className="text-xs text-slate-500">{settings.page_content_scale?.toFixed(2) || "1.00"}</span>
                            </div>
                            <input
                                type="range"
                                min="0.9"
                                max="1.1"
                                step="0.01"
                                value={settings.page_content_scale || 1.0}
                                onChange={(e) => setSettings({ ...settings, page_content_scale: parseFloat(e.target.value) })}
                                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Giảm xuống (ví dụ 0.95) nếu trang giấy có vẻ "to hơn" Word.</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hard_wrap"
                                    checked={settings.hard_wrap || false}
                                    onChange={(e) => setSettings({ ...settings, hard_wrap: e.target.checked })}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <label htmlFor="hard_wrap" className="text-xs font-bold text-red-600">Khóa ngắt dòng (Experimental)</label>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                                Nếu bật: File Word sẽ bị ngắt dòng y hệt Preview (giống 100%).
                                <br />Lưu ý: File sẽ khó chỉnh sửa hơn.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
