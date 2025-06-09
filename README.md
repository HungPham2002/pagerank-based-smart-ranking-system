# PageRank Web Application

Ứng dụng web tính toán PageRank cho các trang web được chỉ định.

## Tính năng

- Nhập danh sách URL để phân tích
- Tự động crawl các liên kết giữa các trang web
- Tính toán PageRank cho mỗi trang web
- Hiển thị kết quả xếp hạng theo thứ tự

## Cài đặt

### Backend (Python/Flask)

1. Cài đặt các dependencies:
```bash
pip install -r requirements.txt
```

2. Chạy server:
```bash
python app.py
```

Server sẽ chạy tại http://localhost:5000

### Frontend (React)

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy ứng dụng:
```bash
npm start
```

Ứng dụng sẽ chạy tại http://localhost:3000

## Cách sử dụng

1. Mở trình duyệt và truy cập http://localhost:3000
2. Nhập danh sách URL cần phân tích (mỗi URL một dòng)
3. Nhấn nút "Calculate PageRank"
4. Xem kết quả xếp hạng trong bảng hiển thị

## Lưu ý

- Đảm bảo các URL được nhập vào là hợp lệ và có thể truy cập được
- Quá trình tính toán có thể mất một chút thời gian tùy thuộc vào số lượng URL và độ phức tạp của các liên kết
- Hệ số damping factor mặc định là 0.85, có thể điều chỉnh trong code backend 