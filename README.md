## Mô tả dự án: 
Dự án xây dựng phần mềm giúp người dùng có thể tạo tài khoản, mua hàng và thanh toán Online cho đơn hàng đó. Quản trị viên có thể quản lý các sản phẩm, combo, danh mục, đơn hàng,... Ngoài ra admin có thể quản lý doanh thu qua các dashboard được xây dựng từ dữ liệu DB trả về, duyệt đơn cho khách hàng theo đúng quy trình thực tế
## Thư mục chính:
### src: chứa các api để gọi đến và tương tác với database
  + Sử dụng express để code các API(chuẩn REST) và sử dụng sequelize(ORM) để dễ dàng tương tác (CRUD) với cơ sở dữ liệu (SQL Server)
  + Thư mục Model trong thư mục src đại diện cho các bảng
  + API sẽ được bảo mật bằng 2 cách:
    + Các API như đăng nhập, đăng ký sẽ cần phải được cấp khóa mới có thể gọi
    + Các API của người dùng sử dụng như thêm sản phẩm vào giỏ hàng, tạo đơn hàng, thanh toán,... chỉ được gọi khi kiểm tra đúng token(JWT) của user đó. Khi user đăng ký sẽ trả về token trong token sẽ có các thông tin của người dùng được mã hóa và được lưu lại
### ecommerce-app-frontend: chứa các screen dành cho người dùng
### admin-web: trang web quản trị 
## Database diagram
![Hinh anh 01](picture/database.png)

## Ảnh một số screen nằm trong thư mục picture

## Hướng dẫn chạy dự án
+ Cài đặt nodeJS phiên bản 20, sau khi cài thì chạy lệnh npm install để cài các thư viện, chạy npm install sequelize, npm install tedious để sử dụng sequelize và kết nối nối SQL Server
+ Cài đặt ứng dụng expo trên điện thoại
+ Mở 2 terminal để chạy frontend, backend
+ Ở thư mục backend(src) chạy lệnh npm start để khởi chạy api và kết nối với DB
+ Ở thư mục frontend(ecommerce-app-frontend) chạy lệnh npm start, khi có mã QR sử dụng điện thoại quét để tương tác với giao diện
+ Tải file db và import vào sql server (tài khoản demo: nam209@gmail.com | mk:123456)

## Lý do chọn stack
1. Expo (React Native): 
+ Dễ bắt đầu và phát triển ứng dụng mobile nhanh (có thể chạy trên cả web)
+ Không cần cấu hình Android/iOS phức tạp
+ Có nhiều thư viện hỗ trợ sẵn
+ Dễ xây dựng UI hiện đại
2. Node.js (Express)
+ Xử lý API nhanh
+ Kiến trúc non-blocking phù hợp với ứng dụng realtime và nhiều request
+ JavaScript đồng nhất giữa frontend và backend
+ Dễ tổ chức source code
+ Hỗ trợ middleware mạnh mẽ
3. Sequelize ORM
+ Giúp thao tác database dễ hơn thay vì viết SQL thuần
+ Hỗ trợ migration và model rõ ràng
+ Dễ mapping giữa object và bảng dữ liệu
+ Hỗ trợ tốt cho SQL Server
4. SQL Server
+ Hệ quản trị cơ sở dữ liệu mạnh và ổn định
+ Phù hợp với dữ liệu có cấu trúc rõ ràng
+ Hỗ trợ tốt các quan hệ dữ liệu
+ Dễ quản lý bằng SQL Server Management Studio (SSMS)
5. Cloudinary
+ Lưu trữ ảnh trên cloud
+ Giảm tải cho server backend
+ Tối ưu tốc độ tải ảnh
+ Quản lý ảnh dễ dàng
6. Deploy backend trên render và sử dụng DB của azure
+ Miễn phí và dễ dàng sử dụng
+ Dễ connect và deploy
