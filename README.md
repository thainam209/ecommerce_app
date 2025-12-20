# Thành viên nhóm:
### Lê Thái Nam - 22810310397
### Cao Thành Đại - 22810310392

## Souce code demo tấn công ở branch "production-demo-attack"
## Souce code demo fix ở branch "production-demo-fix": giống branch trên nhưng thêm các file cấu hình và kết nối docker, Kong

# Phân chia công việc: 
### + Cả 2 call meet để đưa ra cách tấn công, sử dụng docker và kong để giới hạn số lần gọi api trong một khoảng thời gian nhất định.
### Minh chứng:
<img width="411" height="502" alt="minh chứng" src="https://github.com/user-attachments/assets/2c7c09ed-6338-435d-90c1-47f1dca1766a" />
 
### + Với trường hợp api key leakage: đưa ra phương pháp là không hardcode ở cả backend lẫn frontend mà nên để trong env, không trả các về các thông tin như api key, production ở log, errol, debugmode, res dưới mọi hình thức để tránh các rủi ro đã nêu trong báo cáo. Cách tốt hơn là quản lý api key bằng Kong(chưa thực hiện tới và sẽ phát triển trong tương lai)

# Hướng dẫn sử dụng và ảnh kết quả:
### Đã cap màn hình chi tiết hướng dẫn sử dụng và kết quả demo trong báo cáo, đã quay video thực hiện chi tiết các bước tấn công và fix

## video demo brute-force rate limit & api key leakage: https://youtu.be/yK3Cpi_g8uk
## video demo fix với API Gateway(Kong): https://www.youtube.com/watch?v=99sZXtoPJ34
