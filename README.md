# PageRank Calculator Web Application

Ứng dụng web tính toán PageRank cho các trang web sử dụng thuật toán của Google.

## 🚀 Hướng dẫn chạy ứng dụng

### Yêu cầu hệ thống
- Python 3.7+
- Node.js 14+
- npm hoặc yarn

### Bước 1: Cài đặt Backend (Python/Flask)

1. **Tạo môi trường ảo Python:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

2. **Cài đặt dependencies:**
```bash
pip install -r requirements.txt
```

3. **Chạy backend server:**
```bash
python app.py
```

Backend sẽ chạy tại: `http://localhost:5000`

### Bước 2: Cài đặt Frontend (React)

1. **Di chuyển vào thư mục frontend:**
```bash
cd frontend
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Chạy frontend development server:**
```bash
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Bước 3: Sử dụng ứng dụng

1. Mở trình duyệt và truy cập: `http://localhost:3000`
2. Nhập các URL cần phân tích (mỗi URL một dòng)
3. Nhấn "Calculate PageRank"
4. Xem kết quả và biểu đồ

## 📁 Cấu trúc dự án

```
PageRank_Web/
├── app.py                 # Backend Flask server
├── requirements.txt       # Python dependencies
├── frontend/             # React frontend
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styles
│   │   └── logo.svg      # Logo
│   ├── package.json      # Node.js dependencies
│   └── public/
└── README.md
```

## 🔧 Tính năng

- **Tính toán PageRank:** Sử dụng thuật toán Google PageRank
- **Giao diện đẹp:** Thiết kế trắng xanh hiện đại
- **Biểu đồ trực quan:** Hiển thị kết quả dạng biểu đồ cột
- **Responsive:** Tương thích mobile và desktop
- **Real-time:** Tính toán trực tuyến

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **Port 5000 đã được sử dụng:**
```bash
# Thay đổi port trong app.py
app.run(debug=True, port=5001)
```

2. **Port 3000 đã được sử dụng:**
```bash
# React sẽ tự động hỏi chuyển sang port khác
# Hoặc dừng process đang sử dụng port 3000
```

3. **Lỗi CORS:**
- Đảm bảo backend đang chạy
- Kiểm tra URL trong frontend có đúng không

4. **Lỗi dependencies:**
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
npm install --force
```

## 📊 Cách sử dụng

1. **Nhập URLs:** Mỗi URL một dòng
   ```
   https://example.com
   https://example.org
   https://example.net
   ```

2. **Tính toán:** Nhấn nút "Calculate PageRank"

3. **Kết quả:** 
   - Bảng xếp hạng PageRank
   - Biểu đồ trực quan
   - Score từ 0-1 (cao hơn = quan trọng hơn)

## 🔍 Thuật toán PageRank

PageRank tính toán tầm quan trọng của trang web dựa trên:
- Số lượng link trỏ đến trang
- Tầm quan trọng của các trang link đến
- Damping factor (thường là 0.85)

Công thức: `PR(A) = (1-d)/N + d∑PR(Ti)/C(Ti)`

## 📝 Ghi chú

- Đảm bảo cả backend và frontend đều đang chạy
- URLs phải có protocol (http:// hoặc https://)
- Một số trang web có thể chặn crawler
- Kết quả phụ thuộc vào cấu trúc link giữa các trang

## 🎨 Giao diện

- **Màu sắc:** Trắng xanh (#2196F3, #1976D2)
- **Logo:** Thiết kế toán học với công thức PageRank
- **Responsive:** Tương thích mọi thiết bị
- **Animations:** Hiệu ứng mượt mà 