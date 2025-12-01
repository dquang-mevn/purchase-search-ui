# Tài liệu Hệ thống Tìm kiếm Sản phẩm Demo

## Tổng quan Hệ thống

Hệ thống tìm kiếm sản phẩm demo được xây dựng để minh họa khả năng tìm kiếm động với nhiều tham số phức tạp. Hệ thống cho phép người dùng tạo các truy vấn tìm kiếm linh hoạt thông qua giao diện trực quan và tự động tạo chuỗi query parameters tương thích với MODX CMS.

## Công nghệ Sử dụng

### Frontend
- **Framework**: Next.js 15.5.4 với App Router
- **Ngôn ngữ**: TypeScript
- **UI Library**: shadcn/ui với Radix UI
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Forms**: React Hook Form với Zod validation

### Backend
- **Database**: SQLite với Better SQLite3
- **ORM**: Drizzle ORM v0.44.6
- **Package Manager**: Bun

## Cấu trúc Dữ liệu

Hệ thống quản lý dữ liệu sản phẩm với các thông tin sau:

### Thông tin Cơ bản
- **ID**: Mã định danh duy nhất
- **Tên sản phẩm** (name): Tên của sản phẩm
- **Danh mục** (category): Loại sản phẩm (electronics, camera, drone, v.v.)
- **Từ khóa** (keywords): Các từ khóa liên quan, phân cách bằng dấu phẩy

### Thông tin Giá cả
- **Giá bán** (price): Giá bán hiện tại
- **Giá mua vào** (bought_price): Giá mua ban đầu
- **Lợi nhuận** (profit): Lợi nhuận gộp

### Thông tin Trạng thái
- **Đã bán** (is_sold): 1 = đã bán, 0 = chưa bán
- **Tình trạng** (fixed_condition): Tình trạng sản phẩm
  - `n`: Mới (新品)
  - `s`: Chưa sử dụng (未使用品)
  - `a`: Hàng đẹp (美品)
  - `b`: Tốt (程度良好)
  - `c`: Thường (一般中古)
  - `d`: Kém (程度不良)
  - `j`: Hỏng (ジャンク)
  - `v`: Đồ cổ (アンティーク)
- **Trạng thái bán hàng** (sales_status): delivered, pending, cancelled
- **Trạng thái kho** (inventory_status): in_stock, out_of_stock
- **Kênh bán** (sold_exit_service): Kênh bán hàng (直販, v.v.)

### Thông tin Địa lý
- **Thành phố** (city): Thành phố
- **Tỉnh/Thành phố** (pref): Tỉnh hoặc thành phố (tại Nhật Bản)

## Tính năng Tìm kiếm

### 1. Tham số Tìm kiếm Động

Người dùng có thể thêm tối đa 10 tham số tìm kiếm, mỗi tham số gồm:
- **Trường dữ liệu**: Chọn từ danh sách các trường có sẵn
- **Toán tử**: Chọn loại so sánh/tìm kiếm
- **Giá trị**: Nhập giá trị cần tìm

### 2. Các Toán tử Hỗ trợ

#### Toán tử Chuỗi văn bản
- **Equals (=)**: So sánh chính xác (không phân biệt hoa thường)
- **Not Equals (≠)**: Khác với giá trị
- **Contains - Case Sensitive**: Chứa chuỗi con (phân biệt hoa thường)
- **Contains - Case Insensitive**: Chứa chuỗi con (không phân biệt hoa thường)
- **Not Contains**: Không chứa chuỗi con
- **Starts With**: Bắt đầu bằng
- **Ends With**: Kết thúc bằng
- **Exact Match**: So sánh chính xác (phân biệt hoa thường)

#### Toán tử Số học
- **Greater Than (>)**: Lớn hơn
- **Less Than (<)**: Nhỏ hơn
- **Greater or Equal (≥)**: Lớn hơn hoặc bằng
- **Less or Equal (≤)**: Nhỏ hơn hoặc bằng
- **Between (range)**: Trong khoảng (định dạng: "min,max")
- **Not Between**: Ngoài khoảng

#### Toán tử Danh sách
- **In List**: Nằm trong danh sách (phân cách bằng dấu phẩy)
- **Not In List**: Không nằm trong danh sách

#### Kiểm tra Giá trị rỗng
- **Is Null/Empty**: Trường rỗng hoặc null
- **Is Not Null/Empty**: Trường có giá trị

#### Biểu thức Chính quy
- **Regex Pattern**: Tìm kiếm theo regex pattern
- **Not Regex Pattern**: Không khớp với regex pattern

#### Tìm kiếm Mờ
- **Fuzzy Match (~)**: Tìm kiếm với độ tương tự (Levenshtein distance)
- **Wildcard (*?)**: Tìm kiếm với ký tự đại diện (* và ?)

#### Tìm kiếm Ngữ nghĩa
- **Semantic Search (AI)**: Tìm kiếm theo ngữ nghĩa với AI (demo implementation)

### 3. Sắp xếp và Giới hạn

#### Sắp xếp
- **Sắp xếp theo**: Chọn trường để sắp xếp
- **Thứ tự**: Tăng dần (Ascending) hoặc Giảm dần (Descending)

#### Giới hạn kết quả
- **Limit**: Nhập số lượng kết quả tối đa (mặc định: 12)
- **Phạm vi**: 1 - 1000 kết quả

## Giao diện Người dùng

### Bố cục
- **Panel trái (1/3)**: Form cấu hình tìm kiếm
- **Panel phải (2/3)**: Bảng kết quả tìm kiếm

### Form Tìm kiếm
- **Thêm tham số**: Nút "Add Parameter" để thêm điều kiện mới
- **Xóa tham số**: Nút X để xóa điều kiện (tối thiểu 1 tham số)
- **Cấu hình sắp xếp**: Dropdown chọn trường và thứ tự
- **Nhập giới hạn**: Input số để nhập limit
- **Nút tìm kiếm**: Thực hiện tìm kiếm

### Bảng Kết quả
- **Responsive**: Tự động điều chỉnh theo kích thước màn hình
- **Phân trang**: Scroll để xem nhiều kết quả
- **Định dạng**: Giá tiền theo định dạng Yen Nhật, badges cho trạng thái
- **Thông tin**: Hiển thị số lượng kết quả và thời gian tìm kiếm

## Query Parameters

### Định dạng Suffix

Hệ thống sử dụng định dạng suffix theo chuẩn Django/DRF:

```
field__suffix=value
```

### Ví dụ Query Strings

#### Tìm kiếm Cơ bản
```
name__contains=iPhone&price__gte=1000
```

#### Tìm kiếm Phức tạp
```
name__icontains=phone&category__in=electronics,camera&price__gte=500&price__lte=2000&sort_by=profit&order=desc&limit=20
```

#### Tìm kiếm với Loại trừ
```
category=electronics&fixed_condition__notin=d,j&is_sold=1&pref=東京
```

### Tham số Đặc biệt

- **sort_by**: Trường sắp xếp
- **order**: Thứ tự sắp xếp (asc/desc)
- **limit**: Số lượng kết quả tối đa

## Tích hợp MODX CMS

### Chuỗi Query Parameters

Hệ thống tự động tạo chuỗi query parameters tương thích với MODX CMS:

```
https://your-modx-site.com/api/search?name__contains=iPhone&price__gte=1000&sort_by=price&order=desc&limit=20
```

### Xử lý trong MODX

```php
// Ví dụ xử lý trong MODX
$searchParams = $_GET;
$filters = [];

foreach ($searchParams as $key => $value) {
    if (strpos($key, '__') !== false) {
        list($field, $operator) = explode('__', $key, 2);
        $filters[] = [
            'field' => $field,
            'operator' => $operator,
            'value' => $value
        ];
    }
}
```

### Copy Functions

Giao diện cung cấp 2 nút copy:
- **Copy Query String**: Copy chỉ phần query parameters
- **Copy Full URL**: Copy URL đầy đủ với base URL mẫu

## Dữ liệu Demo

Hệ thống sử dụng file `seed-data.json` chứa 100 sản phẩm mẫu bao gồm:
- Điện tử tiêu dùng (smartphones, laptops, tablets)
- Camera và phụ kiện
- Drone
- Gaming gear
- Thiết bị âm thanh

Dữ liệu bao gồm thông tin địa lý Nhật Bản với các thành phố như Tokyo, Osaka, Kyoto, v.v.

## Hiệu năng

- **Tìm kiếm nhanh**: In-memory filtering với độ phức tạp O(n)
- **Hiển thị thời gian**: Báo cáo thời gian tìm kiếm tính bằng milliseconds
- **Fuzzy search**: Sử dụng Levenshtein distance với ngưỡng 20%
- **Semantic search**: Demo implementation với từ điển từ đồng nghĩa

## Bảo mật

- **Input validation**: Kiểm tra tất cả input từ người dùng
- **XSS protection**: Escape HTML trong hiển thị kết quả
- **SQL injection**: Sử dụng parameterized queries (Drizzle ORM)
- **Rate limiting**: Có thể thêm trong production

## Phát triển Tương lai

### Tính năng Có thể Thêm
- **Vector search**: Tìm kiếm ngữ nghĩa thực sự với AI embeddings
- **Real-time search**: Tìm kiếm khi người dùng gõ
- **Search history**: Lưu lịch sử tìm kiếm
- **Export results**: Xuất kết quả ra CSV/Excel
- **Advanced filters**: Filter theo khoảng ngày, geo-location
- **Search suggestions**: Gợi ý từ khóa khi gõ

### Tối ưu hóa
- **Database indexing**: Tạo index cho các trường thường tìm kiếm
- **Caching**: Cache kết quả tìm kiếm phổ biến
- **Pagination**: Phân trang thay vì limit đơn giản
- **Lazy loading**: Load kết quả theo batch

## Hướng dẫn Demo

### Cho Product Owner
1. **Tìm kiếm Cơ bản**: Nhập "iPhone" trong trường Product Name với toán tử "Contains"
2. **Tìm kiếm Giá**: Thêm điều kiện Price "Greater Than" 1000
3. **Sắp xếp**: Sắp xếp theo Price, thứ tự Descending
4. **Giới hạn**: Đặt limit = 10
5. **Xem Query**: Kiểm tra chuỗi query parameters được tạo tự động
6. **Copy URL**: Sử dụng để test với MODX CMS

### Kịch bản Demo Nâng cao
- **Multi-condition**: Tìm electronics AND camera với giá từ 500-2000
- **Exclusion**: Tìm sản phẩm NOT in condition (d,j)
- **Fuzzy search**: Tìm "iPhon" (có lỗi chính tả)
- **Semantic search**: Tìm "điện thoại chụp ảnh đẹp"
- **Location-based**: Tìm sản phẩm tại Tokyo và Osaka

Hệ thống này cung cấp một giải pháp tìm kiếm toàn diện, linh hoạt và dễ tích hợp với các hệ thống CMS hiện có.