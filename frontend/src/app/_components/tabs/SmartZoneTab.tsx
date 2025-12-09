import React, { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Code2, TextCursor } from "lucide-react";
import { Button } from "../ui/Button";

interface SmartZoneTabProps {
    content: string;
    onJumpToLine: (lineIndex: number) => void;
    onFix: (lineIndex: number, matchIndex: number) => void;
}

interface FormatIssue {
    line: number;
    text: string;
    matchIndex: number;
    context: string;
}

interface LatexIssue {
    line: number;
    latex: string;
    pattern: string;
    context: string;
}

// Unsupported LaTeX patterns that matplotlib can't render
const UNSUPPORTED_LATEX_PATTERNS = [
    { pattern: /\\begin\{/, name: "\\begin{...}" },
    { pattern: /\\end\{/, name: "\\end{...}" },
    { pattern: /\\underbrace/, name: "\\underbrace" },
    { pattern: /\\overbrace/, name: "\\overbrace" },
    { pattern: /\\xrightarrow/, name: "\\xrightarrow" },
    { pattern: /\\xleftarrow/, name: "\\xleftarrow" },
    { pattern: /\\substack/, name: "\\substack" },
    { pattern: /\\overset/, name: "\\overset" },
    { pattern: /\\underset/, name: "\\underset" },
    { pattern: /\\stackrel/, name: "\\stackrel" },
    { pattern: /\\binom/, name: "\\binom" },
    { pattern: /\\pmatrix/, name: "\\pmatrix" },
    { pattern: /\\bmatrix/, name: "\\bmatrix" },
];

type TabType = "format" | "latex";

export function SmartZoneTab({ content, onJumpToLine, onFix }: SmartZoneTabProps) {
    const [activeTab, setActiveTab] = useState<TabType>("format");

    const formatIssues = useMemo(() => {
        const lines = content.split("\n");
        const foundIssues: FormatIssue[] = [];

        lines.forEach((line, lineIndex) => {
            // Regex to find period, colon, or closing parenthesis followed immediately by a word character
            const regex = /(\.|:|\))([a-zA-Z])/g;
            let match;
            while ((match = regex.exec(line)) !== null) {
                const start = Math.max(0, match.index - 10);
                const end = Math.min(line.length, match.index + 20);
                const context = "..." + line.substring(start, end) + "...";

                foundIssues.push({
                    line: lineIndex,
                    text: match[0],
                    matchIndex: match.index,
                    context: context
                });
            }
        });
        return foundIssues;
    }, [content]);

    const latexIssues = useMemo(() => {
        const lines = content.split("\n");
        const foundIssues: LatexIssue[] = [];

        lines.forEach((line, lineIndex) => {
            // Find all LaTeX formulas: $...$ or $$...$$
            const latexRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
            let match;
            while ((match = latexRegex.exec(line)) !== null) {
                const latexContent = match[1] || match[2];

                // Check for unsupported patterns
                for (const { pattern, name } of UNSUPPORTED_LATEX_PATTERNS) {
                    if (pattern.test(latexContent)) {
                        const start = Math.max(0, match.index - 5);
                        const end = Math.min(line.length, match.index + 50);
                        const context = (start > 0 ? "..." : "") + line.substring(start, end) + (end < line.length ? "..." : "");

                        foundIssues.push({
                            line: lineIndex,
                            latex: latexContent.substring(0, 40) + (latexContent.length > 40 ? "..." : ""),
                            pattern: name,
                            context: context
                        });
                        break; // Only report first issue per formula
                    }
                }
            }
        });
        return foundIssues;
    }, [content]);

    const totalIssues = formatIssues.length + latexIssues.length;

    return (
        <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl p-8 border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <span className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                        <AlertTriangle size={24} />
                    </span>
                    Khu vực thông minh
                </h2>

                <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                    <p>Hệ thống tự động phát hiện các lỗi định dạng và công thức trong văn bản của bạn.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab("format")}
                        className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${activeTab === "format"
                                ? "text-blue-600 border-blue-600 bg-blue-50"
                                : "text-slate-500 border-transparent hover:text-slate-700"
                            }`}
                    >
                        <TextCursor size={18} />
                        Lỗi định dạng
                        {formatIssues.length > 0 && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-full">
                                {formatIssues.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("latex")}
                        className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${activeTab === "latex"
                                ? "text-purple-600 border-purple-600 bg-purple-50"
                                : "text-slate-500 border-transparent hover:text-slate-700"
                            }`}
                    >
                        <Code2 size={18} />
                        Lỗi LaTeX
                        {latexIssues.length > 0 && (
                            <span className="px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded-full">
                                {latexIssues.length}
                            </span>
                        )}
                    </button>
                </div>

                {totalIssues === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p className="text-lg">Tuyệt vời! Không tìm thấy lỗi nào.</p>
                    </div>
                ) : activeTab === "format" ? (
                    /* Format Issues Tab */
                    formatIssues.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <p>Không có lỗi định dạng.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700">
                                Phát hiện {formatIssues.length} lỗi dính chữ (thiếu khoảng trắng):
                            </h3>
                            {formatIssues.map((issue, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                                Dòng {issue.line + 1}
                                            </span>
                                            <span className="text-slate-500 text-sm">
                                                Lỗi: <span className="font-mono bg-slate-100 px-1 rounded text-red-600">{issue.text}</span>
                                            </span>
                                        </div>
                                        <p className="text-slate-600 font-mono text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                            {issue.context}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onFix(issue.line, issue.matchIndex)}
                                        className="ml-4 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                        Tự động sửa <ArrowRight size={16} className="ml-1" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* LaTeX Issues Tab */
                    latexIssues.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <p>Không có lỗi LaTeX.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700">
                                Phát hiện {latexIssues.length} công thức LaTeX không hỗ trợ:
                            </h3>
                            <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200 mb-4">
                                <strong>Lưu ý:</strong> Các công thức này sử dụng cú pháp LaTeX phức tạp mà hệ thống không thể render tự động.
                                Bạn cần chèn thủ công vào file Word sau khi export bằng Equation Editor hoặc MathType.
                            </div>
                            {latexIssues.map((issue, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                                                Dòng {issue.line + 1}
                                            </span>
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-mono rounded">
                                                {issue.pattern}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 font-mono text-sm bg-slate-50 p-2 rounded border border-slate-100 break-all">
                                            {issue.latex}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onJumpToLine(issue.line)}
                                        className="ml-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                    >
                                        Đi tới <ArrowRight size={16} className="ml-1" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
