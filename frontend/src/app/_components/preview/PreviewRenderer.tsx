import React from "react";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

interface PreviewRendererProps {
    content: string;
    settings: any;
    figures: any[];
    zoomLevel: number;
    handlePreviewClick: (e: React.MouseEvent) => void;
}

export function PreviewRenderer({
    content,
    settings,
    figures,
    zoomLevel,
    handlePreviewClick,
}: PreviewRendererProps) {
    const lines = content.split('\n');

    // Helper to parse markdown formatting
    const parseMarkdown = (text: string): React.ReactNode[] => {
        // Regex to split by formatting tokens: **bold**, *italic*, <u>underline</u>, $$display$$, $inline$
        // Priority: $$ first, then $
        const parts = text.split(/(\$\$.*?\$\$|\$.*?\$|\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>)/g);

        return parts.map((part, index) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                // Display Math (Block)
                return <div key={index} className="text-center my-2"><Latex>{part}</Latex></div>;
            } else if (part.startsWith('$') && part.endsWith('$')) {
                // Inline Math
                return <Latex key={index}>{part}</Latex>;
            } else if (part.startsWith('**') && part.endsWith('**')) {
                return <b key={index}>{part.slice(2, -2)}</b>;
            } else if (part.startsWith('*') && part.endsWith('*')) {
                return <i key={index}>{part.slice(1, -1)}</i>;
            } else if (part.startsWith('<u>') && part.endsWith('</u>')) {
                return <u key={index}>{part.slice(3, -4)}</u>;
            }
            return part;
        });
    };

    // Constants
    const PT_TO_CM = 0.03528;
    const CM_TO_PX = 37.7952755906; // 96 DPI
    const PT_TO_PX = 1.333333; // 1pt = 1.333px

    const contentWidthCm = 21 - settings.margin_left - settings.margin_right;
    // Áp dụng Page Scale vào chiều rộng nội dung
    const contentWidthPx = contentWidthCm * CM_TO_PX * (settings.page_content_scale || 1.0);
    const indentPx = settings.indent * CM_TO_PX * (settings.page_content_scale || 1.0);

    // Áp dụng Page Scale vào chiều cao trang
    const pageHeight = (29.7 - settings.margin_top - settings.margin_bottom) * (settings.page_content_scale || 1.0);
    const lineHeightCm = settings.font_size * PT_TO_CM * settings.line_spacing * (settings.line_height_scale || 1.0);
    const paraMarginBottom = 0.3; // cm

    // Setup Canvas for measurement
    let ctx: CanvasRenderingContext2D | null = null;
    if (typeof window !== 'undefined') {
        const canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        if (ctx) {
            // Set font chính xác để đo
            ctx.font = `${settings.font_size * PT_TO_PX}px "${settings.font_family}"`;
        }
    }

    const pages: React.ReactNode[][] = [];
    let currentPage: React.ReactNode[] = [];
    let currentH = 0;

    // Counters
    let h1_count = 0;
    let h2_count = 0;
    let h3_count = 0;
    let h4_count = 0;
    let h5_count = 0;

    const toRoman = (num: number) => {
        const lookup: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
        let roman = '', i;
        for (i in lookup) {
            while (num >= lookup[i]) {
                roman += i;
                num -= lookup[i];
            }
        }
        return roman;
    }

    const flushPage = () => {
        if (currentPage.length > 0) {
            pages.push([...currentPage]);
            currentPage = [];
            currentH = 0;
        }
    };

    const addToPage = (element: React.ReactNode, heightCm: number, forceNewPage: boolean = false) => {
        if (forceNewPage) {
            flushPage();
        }
        // Buffer cực nhỏ 0.01cm vì đã đo chính xác
        else if (currentH + heightCm > pageHeight - 0.01 && currentPage.length > 0) {
            flushPage();
        }
        currentPage.push(element);
        currentH += heightCm;
    };

    // Hàm tính toán số dòng chính xác của đoạn văn
    const calculateLines = (text: string, isFirstLineIndented: boolean): string[] => {
        if (!ctx) return [text]; // Fallback nếu không có canvas

        const words = text.split(' ');
        if (words.length === 0 || text.trim() === '') return [''];

        const lines: string[] = [];
        let currentLine = words[0];

        // Dòng đầu tiên bị thụt lề nếu isFirstLineIndented là true
        let currentMaxWidth = isFirstLineIndented ? (contentWidthPx - indentPx) : contentWidthPx;
        if (currentMaxWidth <= 0) currentMaxWidth = contentWidthPx; // Fallback for extreme indent

        // Áp dụng hệ số nén/giãn chữ
        const density = settings.text_density || 1.0;

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + " " + word;
            // Nhân độ rộng đo được với hệ số density
            // Nếu density > 1 (tăng độ dày), width sẽ lớn hơn -> xuống dòng sớm hơn
            const width = ctx.measureText(testLine).width * density;

            if (width < currentMaxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
                // Các dòng sau không thụt lề
                currentMaxWidth = contentWidthPx;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    // Xử lý đoạn văn dựa trên số dòng đã tính
    const processParagraph = (text: string, keyPrefix: string, sourceLine: number) => {
        const lines = calculateLines(text, true); // First line is indented
        const totalLines = lines.length;

        let remainingH = pageHeight - currentH;
        let linesFit = Math.floor(remainingH / lineHeightCm);

        if (linesFit >= totalLines) {
            // Đủ chỗ cho cả đoạn
            const totalH = totalLines * lineHeightCm + paraMarginBottom;
            // Kiểm tra lại lần cuối xem có đủ chỗ cho cả margin không
            if (totalH <= remainingH || remainingH < lineHeightCm) {
                addToPage(
                    <div key={`${keyPrefix}-full`} data-source-line={sourceLine} className="mb-0" style={{
                        textIndent: `${settings.indent}cm`,
                        textAlign: 'justify',
                        marginBottom: `${paraMarginBottom}cm`,
                        lineHeight: settings.line_spacing
                    }}>
                        {parseMarkdown(text)}
                    </div>,
                    totalH,
                    remainingH < lineHeightCm
                );
                return;
            }
        }

        // Không đủ chỗ, phải cắt
        // Nếu không còn dòng nào vừa (linesFit <= 0), sang trang mới
        if (linesFit <= 0) {
            flushPage();
            // Gọi lại đệ quy ở trang mới
            processParagraph(text, keyPrefix + "-retry", sourceLine);
            return;
        }

        // Cắt số dòng vừa đủ
        // Lưu ý: Dòng cuối cùng của trang không cần margin bottom (vì nó bị cắt)
        const part1Lines = lines.slice(0, linesFit);
        const part2Lines = lines.slice(linesFit);

        const part1Text = part1Lines.join(' ');
        // const part2Text = part2Lines.join(' '); // Not directly used here

        // Render phần 1
        currentPage.push(
            <div key={`${keyPrefix}-part1`} data-source-line={sourceLine} className="mb-0" style={{
                textIndent: `${settings.indent}cm`,
                textAlign: 'justify',
                lineHeight: settings.line_spacing,
                marginBottom: 0 // Không margin vì bị cắt
            }}>
                {parseMarkdown(part1Text)}
            </div>
        );
        currentH += linesFit * lineHeightCm;

        flushPage();

        // Xử lý phần còn lại (part 2)
        // Phần 2 là tiếp theo của đoạn văn, nên dòng đầu của nó KHÔNG thụt lề
        // Ta cần một hàm phụ hoặc xử lý riêng cho phần tiếp theo.
        processParagraphContinuation(part2Lines.join(' '), keyPrefix + "-part2");
    };

    const processParagraphContinuation = (text: string, keyPrefix: string) => {
        if (text.trim() === '') return;

        const lines = calculateLines(text, false); // No indentation for continuation
        const totalLines = lines.length;

        let remainingH = pageHeight - currentH;
        let linesFit = Math.floor(remainingH / lineHeightCm);

        if (linesFit >= totalLines) {
            const totalH = totalLines * lineHeightCm + paraMarginBottom;
            addToPage(
                <div key={`${keyPrefix}-end`} className="mb-0" style={{
                    textIndent: 0, // Không thụt lề
                    textAlign: 'justify',
                    marginBottom: `${paraMarginBottom}cm`,
                    lineHeight: settings.line_spacing
                }}>
                    {parseMarkdown(text)}
                </div>,
                totalH
            );
            return;
        }

        if (linesFit <= 0) {
            flushPage();
            processParagraphContinuation(text, keyPrefix + "-retry");
            return;
        }

        const part1Lines = lines.slice(0, linesFit);
        const part2Lines = lines.slice(linesFit);

        currentPage.push(
            <div key={`${keyPrefix}-cont`} className="mb-0" style={{
                textIndent: 0,
                textAlign: 'justify',
                lineHeight: settings.line_spacing,
                marginBottom: 0
            }}>
                {parseMarkdown(part1Lines.join(' '))}
            </div>
        );
        currentH += linesFit * lineHeightCm;
        flushPage();
        processParagraphContinuation(part2Lines.join(' '), keyPrefix + "-next");
    };

    const renderTable = (lines: string[], keyPrefix: number) => {
        const rows = lines.map(l => l.split('|').filter(c => c.trim() !== '').map(c => c.trim()));
        const dataRows = rows.filter(r => !r[0]?.match(/^-+$/));
        if (dataRows.length === 0) return null;

        return (
            <div key={`table - ${keyPrefix} `} className="flex justify-center my-6">
                <table className="border-collapse border border-black w-full text-sm">
                    <thead>
                        <tr>
                            {dataRows[0].map((header, idx) => (
                                <th key={idx} className="border border-black p-2 bg-slate-100 font-bold text-center">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataRows.slice(1).map((row, rIdx) => (
                            <tr key={rIdx}>
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="border border-black p-2">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    let tableBuffer: string[] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim().startsWith('|')) {
            inTable = true;
            tableBuffer.push(line);
            continue;
        } else if (inTable) {
            inTable = false;
            const tableEl = renderTable(tableBuffer, i);
            if (tableEl) {
                const rows = tableBuffer.length;
                const h = rows * 0.8 + 1;
                addToPage(tableEl, h);
            }
            tableBuffer = [];
        }

        if (line.startsWith('# ')) {
            h1_count++; h2_count = 0; h3_count = 0; h4_count = 0;
            let title = line.substring(2).toUpperCase();
            let displayTitle: React.ReactNode = title;

            if (settings.auto_numbering) {
                const prefixText = settings.h1_prefix ? `${settings.h1_prefix} ${toRoman(h1_count)} ` : `${toRoman(h1_count)} `;

                if (settings.h1_split) {
                    // Tách dòng: CHƯƠNG I <br/> TÊN
                    displayTitle = (
                        <>
                            {prefixText}
                            <br />
                            {title}
                        </>
                    );
                } else {
                    // Cùng dòng: CHƯƠNG I: TÊN
                    displayTitle = `${prefixText}: ${title} `;
                }
            }

            // Tính chiều cao: Nếu tách dòng thì cao hơn
            const lines = settings.h1_split ? 2 : 1;
            const h = (settings.h1_size * PT_TO_CM * 1.5 * lines) + 2.0;

            addToPage(<h1 key={i} data-source-line={i} className="text-center font-bold uppercase mt-6 mb-6" style={{ fontSize: `${settings.h1_size}pt` }}>{displayTitle}</h1>, h, h1_count > 1);
        }
        else if (line.startsWith('## ')) {
            h2_count++; h3_count = 0; h4_count = 0;
            let title = line.substring(3);
            if (settings.auto_numbering) {
                // Nếu hierarchical_numbering = true -> 1.1, ngược lại -> 1
                const prefix = settings.hierarchical_numbering ? `${h1_count}.${h2_count}.` : `${h2_count}.`;
                title = `${prefix} ${title} `;
            }
            const h = (settings.h2_size * PT_TO_CM * 1.5) + 1.0;
            addToPage(<h2 key={i} data-source-line={i} className="text-left font-bold mt-4 mb-3" style={{ fontSize: `${settings.h2_size}pt` }}>{title}</h2>, h);
        }
        else if (line.startsWith('### ')) {
            h3_count++; h4_count = 0;
            let title = line.substring(4);
            if (settings.auto_numbering) {
                const prefix = settings.hierarchical_numbering ? `${h1_count}.${h2_count}.${h3_count}.` : `${h2_count}.${h3_count}.`;
                title = `${prefix} ${title} `;
            }
            const h = (settings.h3_size * PT_TO_CM * 1.5) + 1.0;
            addToPage(<h3 key={i} data-source-line={i} className="text-left font-bold italic mt-4 mb-3" style={{ fontSize: `${settings.h3_size}pt` }}>{title}</h3>, h);
        }
        else if (line.startsWith('#### ')) {
            h4_count++; h5_count = 0;
            let title = line.substring(5);
            if (settings.auto_numbering) {
                const prefix = settings.hierarchical_numbering ? `${h1_count}.${h2_count}.${h3_count}.${h4_count}.` : `${h2_count}.${h3_count}.${h4_count}.`;
                title = `${prefix} ${title} `;
            }
            const h = (settings.font_size * PT_TO_CM * 1.5) + 1.0;
            // Chuẩn đồ án: H4 thường là in nghiêng (không đậm)
            addToPage(<h4 key={i} data-source-line={i} className="text-left italic mt-3 mb-2" style={{ fontSize: `${settings.font_size}pt` }}>{title}</h4>, h);
        }
        else if (line.startsWith('##### ')) {
            h5_count++;
            let title = line.substring(6);
            if (settings.auto_numbering) {
                // H5 thường dùng a, b, c hoặc 1.1.1.1.1
                // Để nhất quán, ta dùng số.
                const prefix = settings.hierarchical_numbering ? `${h1_count}.${h2_count}.${h3_count}.${h4_count}.${h5_count}.` : `${h2_count}.${h3_count}.${h4_count}.${h5_count}.`;
                title = `${prefix} ${title} `;
            }
            const h = (settings.font_size * PT_TO_CM * 1.5) + 1.0;
            // Chuẩn đồ án: H5 in nghiêng, có thể thụt đầu dòng
            addToPage(<h5 key={i} data-source-line={i} className="text-left italic mt-2 mb-2 ml-4" style={{ fontSize: `${settings.font_size}pt` }}>{title}</h5>, h);
        }
        else if (line.trim().startsWith('[Hình') && line.trim().endsWith(']')) {
            const match = line.trim().match(/\[\s*(Hình \d+\.\d+)\s*:\s*(.*)\s*\]/);
            if (match) {
                const figNum = match[1].trim(); // Trim số hình lấy được từ regex

                // Tìm kiếm linh hoạt hơn: so sánh sau khi trim và bỏ khoảng trắng thừa
                const fig = figures.find(f => f.number.trim() === figNum || f.number.replace(/\s+/g, '') === figNum.replace(/\s+/g, ''));

                const imgH = (fig && fig.width) ? (fig.width * 0.75) : 8;
                const totalH = imgH + 1.5;

                addToPage(
                    <div key={i} data-source-line={i} className="text-center my-6">
                        {fig && fig.url ? (
                            <img
                                src={fig.url}
                                alt={match[2]}
                                className="mx-auto object-contain"
                                style={{ width: fig.width ? `${fig.width}cm` : '16cm', maxHeight: '15cm' }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    console.error("Image load error:", fig.url);
                                }}
                            />
                        ) : (
                            <div className="w-full h-32 bg-slate-200 flex items-center justify-center text-slate-500 italic">
                                Hình ảnh chưa upload hoặc URL lỗi
                            </div>
                        )}
                        <p className="italic mt-3 font-medium text-black">{figNum}: {match[2]}</p>
                    </div>,
                    totalH
                );
            }
        }
        else if (line.startsWith('Bảng') && line.includes(':')) {
            addToPage(<p key={i} data-source-line={i} className="text-center font-bold my-3">{line}</p>, 1.0);
        }
        else if (line.trim().match(/^(\-{1,3}|\*{1,3})\s/)) {
            // Bullet points with levels: - , -- , ---
            const match = line.trim().match(/^(\-{1,3}|\*{1,3})\s/);
            const prefix = match ? match[1] : '-';
            const level = prefix.length; // 1, 2, or 3
            const content = line.trim().substring(prefix.length).trim();

            // Base indent from settings + extra indent for levels
            // Chuẩn đồ án: Cấp 1 thụt bằng đoạn văn (settings.indent), các cấp sau thụt thêm 0.75cm
            const levelIndent = (level - 1) * 0.75;
            const totalIndent = settings.indent + levelIndent;

            const h = lineHeightCm;
            addToPage(
                <div key={i} data-source-line={i} className="flex" style={{
                    paddingLeft: `${totalIndent}cm`,
                    marginBottom: '0.2cm',
                    lineHeight: settings.line_spacing
                }}>
                    <span className="mr-2 font-bold" style={{ minWidth: '0.5cm', textAlign: 'right' }}>
                        {level === 1 ? '-' : level === 2 ? '+' : '-'}
                    </span>
                    <span>{parseMarkdown(content)}</span>
                </div>,
                h
            );
        }
        else if (line.trim() === '') {
            addToPage(<br key={i} data-source-line={i} />, lineHeightCm);
        }
        else {
            processParagraph(line, `p-${i}`, i);
        }
    }

    if (inTable && tableBuffer.length > 0) {
        const tableEl = renderTable(tableBuffer, lines.length); // Table uses last line index for now
        if (tableEl) {
            const rows = tableBuffer.length;
            const h = rows * 0.8 + 1;
            // Wrap table in div with data-source-line
            addToPage(<div data-source-line={lines.length - rows}>{tableEl}</div>, h);
        }
    }

    if (currentPage.length > 0) flushPage();

    return (
        <>
            {pages.map((pageContent, idx) => (
                <div
                    key={idx}
                    className="bg-white shadow-lg w-[21cm] min-h-[29.7cm] mb-8 relative shrink-0 transition-all origin-top"
                    onClick={handlePreviewClick}
                    style={{
                        fontFamily: `"${settings.font_family}", Times, serif`,
                        fontSize: `${settings.font_size}pt`,
                        lineHeight: settings.line_spacing,
                        paddingTop: `${settings.margin_top}cm`,
                        paddingBottom: `${settings.margin_bottom}cm`,
                        paddingLeft: `${settings.margin_left}cm`,
                        paddingRight: `${settings.margin_right}cm`,
                        transform: `scale(${zoomLevel / 100})`,
                        marginBottom: `${(29.7 * (zoomLevel / 100 - 1)) + 2}cm` // Adjust margin for scale
                    }}
                >
                    <div className="absolute top-2 right-[-30px] text-xs text-slate-400 font-bold" style={{
                        transform: `scale(${100 / zoomLevel})`
                    }}>P.{idx + 1}</div >
                    {pageContent}
                </div>
            ))}
        </>
    );
}
