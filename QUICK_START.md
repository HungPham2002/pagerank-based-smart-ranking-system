# 🚀 Hướng dẫn chạy nhanh PageRank Web App

## ⚡ Cách chạy nhanh nhất (Windows)

### Phương pháp 1: Sử dụng script tự động
```bash
# Chỉ cần double-click file này
start_app.bat
```

### Phương pháp 2: Chạy thủ công

**Bước 1: Chạy Backend**
```bash
# Tạo môi trường ảo
python -m venv venv
venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server
python app.py
```

**Bước 2: Chạy Frontend (Terminal mới)**
```bash
cd frontend
npm install
npm start
```

## 🌐 Truy cập ứng dụng

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 📝 Ví dụ sử dụng

1. Mở http://localhost:3000
2. Nhập URLs:
```
https://google.com
https://facebook.com
https://youtube.com
```
3. Nhấn "Calculate PageRank"
4. Xem kết quả!

## 🔧 Nếu gặp lỗi

### Lỗi port đã được sử dụng:
- Đóng các ứng dụng đang chạy trên port 5000 và 3000
- Hoặc thay đổi port trong code

### Lỗi dependencies:
```bash
# Backend
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
npm install --force
```

### Lỗi CORS:
- Đảm bảo backend đang chạy trước khi chạy frontend
- Kiểm tra URL trong frontend/App.js có đúng không

## 📱 Tính năng

✅ Giao diện đẹp trắng xanh  
✅ Logo toán học PageRank  
✅ Biểu đồ trực quan  
✅ Responsive design  
✅ Real-time calculation  
✅ Error handling  

## 🎯 Kết quả

- **PageRank Score:** 0-1 (cao hơn = quan trọng hơn)
- **Xếp hạng:** Theo thứ tự quan trọng
- **Biểu đồ:** So sánh trực quan
- **Links:** Click để mở trang web 