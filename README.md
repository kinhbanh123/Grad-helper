# Thesis Formatter - Web Version

Ứng dụng hỗ trợ soạn thảo và định dạng đồ án tốt nghiệp tự động, chuyển đổi từ Markdown sang Word (.docx) chuẩn format.

## 🚀 Tính năng chính
- **Soạn thảo Markdown**: Hỗ trợ Heading, Bold, Italic, List...
- **Quản lý Trích dẫn**: Thêm, sửa, xóa và chèn trích dẫn chuẩn APA.
- **Chèn Ảnh & Bảng**: Upload ảnh thật, tạo bảng trực quan (Grid Editor).
- **Preview Thời gian thực**: Xem trước trang A4 với font chữ, lề chuẩn.
- **Xuất Word (.docx)**: Tự động đánh số hình, bảng, tạo mục lục và danh sách tài liệu tham khảo.
- **Lưu/Tải Dự án**: Tự động lưu trạng thái làm việc.

## 🛠️ Yêu cầu hệ thống
- **Python** (3.8 trở lên)
- **Node.js** (18 trở lên)

## 📦 Cài đặt

### 1. Backend (Python)
Di chuyển vào thư mục `backend` và cài đặt thư viện:
```bash
cd backend
pip install fastapi uvicorn python-multipart python-docx
```

### 2. Frontend (Next.js)
Di chuyển vào thư mục `frontend` và cài đặt dependencies:
```bash
cd frontend
npm install
```

## ▶️ Hướng dẫn chạy

Bạn cần chạy song song cả Backend và Frontend (mở 2 terminal).

### Terminal 1: Chạy Backend
```bash
cd backend
python3 server.py
```
*Server sẽ chạy tại: `http://localhost:8080`*

### Terminal 2: Chạy Frontend
```bash
cd frontend
npm run dev
```
*Web App sẽ chạy tại: `http://localhost:3002`*

## 📂 Cấu trúc dự án
- `backend/`: Chứa mã nguồn Python (Server & Logic xử lý Word).
  - `server.py`: API Server.
  - `ThesisFormatter/`: Thư viện lõi.
  - `images/`: Ảnh upload.
- `frontend/`: Chứa mã nguồn Website (Next.js).
