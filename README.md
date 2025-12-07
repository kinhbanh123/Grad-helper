# Thesis Formatter

Ứng dụng hỗ trợ định dạng đồ án tốt nghiệp chuẩn, bao gồm:
- Soạn thảo Markdown với Live Preview.
- Quản lý Hình ảnh, Bảng biểu, Tài liệu tham khảo.
- Xuất file Word (.docx) chuẩn format (Mục lục tự động, Danh mục hình/bảng tự động).

## Cấu trúc dự án

Dự án được tổ chức thành 2 phần:
- **frontend/**: Giao diện người dùng (Next.js, TailwindCSS).
- **backend/**: Server xử lý logic và xuất file (FastAPI, Python).

## Hướng dẫn cài đặt & Chạy

### 1. Yêu cầu
- Node.js (v18+)
- Python (v3.8+)

### 2. Cài đặt dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
pip install fastapi uvicorn python-docx python-multipart
```

### 3. Chạy ứng dụng (Khuyên dùng)

Tại thư mục `grad-helper`, chạy lệnh sau để khởi động cả Frontend và Backend:

```bash
npm run dev:all
```

Truy cập ứng dụng tại: [http://localhost:3000](http://localhost:3000) (hoặc port khác tùy Next.js hiển thị).

---

### Chạy thủ công từng phần (Nếu cần debug)

**Terminal 1 (Backend):**
```bash
cd backend
python3 server.py
```
*Backend chạy tại: http://localhost:8080*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*Frontend chạy tại: http://localhost:3000*
