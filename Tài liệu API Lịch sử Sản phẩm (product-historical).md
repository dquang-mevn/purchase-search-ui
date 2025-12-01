# **Tài liệu API Lịch sử Sản phẩm (product-historical)**

API này dùng để truy vấn lịch sử các sản phẩm đã được thu mua, với nhiều bộ lọc chi tiết để tùy chỉnh kết quả. Tài liệu này phản ánh trạng thái hiện tại của API và các yêu cầu phát triển trong tương lai dựa trên đặc tả từ PO.

## **Endpoint**

***TODO: Not implemented***

**Phương thức (Method):** GET

## **Tham số đầu vào (Input Params)**

Các tham số được truyền dưới dạng query string trong URL.

### **1\. Tham số đã triển khai (Trạng thái: Implemented)**

Đây là các tham số hiện đang hoạt động trong code.

| Tên tham số | Kiểu dữ liệu | Bắt buộc? | Mô tả | Ví dụ |
| :---- | :---- | :---- | :---- | :---- |
| is\_sold | Integer | Có | Lọc các sản phẩm đã được bán. Thường được đặt là 1\. | 1 |
| distinct | Integer | Có | Trả về các kết quả duy nhất. Thường được đặt là 1\. | 1 |
| disable\_rere\_sell\_history\_\_not | Integer | Có | Loại bỏ các sản phẩm có lịch sử bán lại. Thường được đặt là 1\. | 1 |
| limit | Integer | Không | Giới hạn số lượng kết quả trả về. **Mặc định là 12\.** | 20 |
| within\_flow\_sold | Integer | Không | Lọc sản phẩm được bán trong vòng X ngày gần nhất. **Mặc định là 365\.** | 90 |
| sold\_exit\_service\_\_notin | String | Không | **LOẠI TRỪ** các sản phẩm có kênh bán hàng được chỉ định. | 直販 |
| bought\_price\_\_gte | Integer | Không | Lọc sản phẩm có giá mua vào **lớn hơn hoặc bằng** (gte) giá trị này. | 5000 |
| profit\_\_gt | Integer | Không | Lọc sản phẩm có lợi nhuận gộp **lớn hơn** (gt) giá trị này. | 5000 |
| fixed\_condition\_\_notin | String | Không | **LOẠI TRỪ** các sản phẩm có tình trạng nằm trong danh sách. Hỗ trợ nhiều giá trị cách nhau bởi dấu phẩy. | n,d,j |
| keywords | String | Không | Tìm kiếm sản phẩm theo từ khóa chính xác. Có thể hỗ trợ nhiều từ khóa cách nhau bởi dấu phẩy. | iphone%2014 |
| category | String | Không | Lọc sản phẩm theo danh mục. Có thể hỗ trợ nhiều danh mục cách nhau bởi dấu phẩy. | electronics |
| pref | String | Không | Lọc theo tỉnh/thành phố. Hỗ trợ nhiều giá trị cách nhau bởi dấu phẩy. | 東京 |

### **2\. Tham số tiềm năng trong tương lai (dựa trên tài liệu PO)**

| Tên tham số (dự kiến) | Kiểu dữ liệu | Trạng thái | Mô tả |
| :---- | :---- | :---- | :---- |
| sales\_status | String | Required | Lọc theo trạng thái bán hàng (ví dụ: chỉ hiển thị các sản phẩm "Đã giao hàng"). |
| keywords\_\_semantic | String | Nice-to-have | Tìm kiếm theo ngữ nghĩa. Sử dụng AI và vector search để tìm các sản phẩm liên quan về mặt ý nghĩa, thay vì chỉ khớp từ khóa. |
| city | String | Nice-to-have | Lọc sản phẩm theo quận/huyện/thành phố (市区町村). |
| bought\_price\_\_lte | Integer | Nice-to-have | Đặt giới hạn **trên** cho giá mua vào (nhỏ hơn hoặc bằng). |
| profit\_\_lte | Integer | Nice-to-have | Đặt giới hạn **trên** cho lợi nhuận gộp thu mua (nhỏ hơn hoặc bằng). |
| sales\_profit\_\_gte | Integer | Nice-to-have | Đặt giới hạn **dưới** cho lợi nhuận gộp bán hàng. |
| sales\_profit\_\_lte | Integer | Nice-to-have | Đặt giới hạn **trên** cho lợi nhuận gộp bán hàng. |
| inventory\_status | String | Nice-to-have | Lọc theo trạng thái tồn kho. |
| sort\_by | String | Nice-to-have | Sắp xếp kết quả theo một trường nhất định (ví dụ: bought\_price). |
| order | String | Nice-to-have | Thứ tự sắp xếp: asc (tăng dần) hoặc desc (giảm dần). |
| fixed\_condition\_\_in | String | Nice-to-have | **LỌC THEO** tình trạng sản phẩm (thay vì loại trừ). |
| sold\_exit\_service\_\_in | String | Nice-to-have | **LỌC THEO** kênh bán hàng (thay vì loại trừ). |

## **Dữ liệu trả về (Output)**

Cấu trúc dữ liệu trả về không thay đổi.

### **Cấu trúc tổng quan**

{  
    "count": 1234,  
    "next": "URL\_trang\_tiep\_theo",  
    "previous": null,  
    "results": \[  
        // Mảng chứa các đối tượng sản phẩm  
    \]  
}

### **Chi tiết mã tình trạng sản phẩm (fixed\_condition)**

| Mã | Tiếng Nhật | Mô tả tiếng Việt |
| :---- | :---- | :---- |
| n | 新品 | **Mới:** Hàng mới 100%, chưa qua sử dụng. |
| s | 未使用品 | **Chưa sử dụng:** Hàng đã mở hộp nhưng chưa được sử dụng. |
| a | 美品 | **Hàng đẹp:** Đã qua sử dụng nhưng còn rất mới, ít trầy xước. |
| b | 程度良好 | **Tốt:** Tình trạng tốt, có dấu hiệu sử dụng nhưng không đáng kể. |
| c | 一般中古 | **Thường:** Hàng đã qua sử dụng, có trầy xước, hao mòn thông thường. |
| d | 程度不良 | **Kém:** Tình trạng kém, có nhiều khuyết điểm, trầy xước nặng. |
| j | ジャンク | **Hỏng:** Hàng hỏng, không hoạt động hoặc thiếu linh kiện. |
| v | アンティーク | **Đồ cổ:** Hàng cổ, có giá trị sưu tầm. |

## **Phụ lục: Các hậu tố (suffix) lọc dữ liệu phổ biến**

Phần này mô tả các hậu tố (suffix) phổ biến dùng để lọc dữ liệu nâng cao, dự kiến sẽ được triển khai trong tương lai để tăng cường khả năng của API.

### **1\. So sánh chuỗi (Text Comparison)**

| Hậu tố | Ý nghĩa |
| :---- | :---- |
| \_\_contains | Chứa chuỗi con (phân biệt chữ hoa/thường). |
| \_\_icontains | Chứa chuỗi con (KHÔNG phân biệt chữ hoa/thường). |

### **2\. So sánh chính xác (Exact Matching)**

| Hậu tố | Ý nghĩa |
| :---- | :---- |
| \_\_exact | Khớp chính xác (phân biệt chữ hoa/thường). |
| \_\_iexact | Khớp chính xác (KHÔNG phân biệt chữ hoa/thường). |

### **3\. So sánh số và ngày tháng (Numeric & Date Comparison)**

| Hậu tố | Ý nghĩa |
| :---- | :---- |
| \_\_lt | Nhỏ hơn (\<). |
| \_\_gt | Lớn hơn (\>). |
| \_\_lte | Nhỏ hơn hoặc bằng (≤). |
| \_\_gte | Lớn hơn hoặc bằng (≥). |

### **4\. Lọc theo danh sách (List Filtering)**

| Hậu tố | Ý nghĩa |
| :---- | :---- |
| \_\_in | Giá trị nằm trong một danh sách. |
| \_\_notin | Giá trị KHÔNG nằm trong một danh sách. |

### **5\. Kiểm tra giá trị rỗng (Null Check)**

| Hậu tố | Ý nghĩa |
| :---- | :---- |
| \_\_isnull | Kiểm tra xem một trường có giá trị là rỗng (null) hay không. |

### **6\. Lọc theo ngữ nghĩa (Semantic Filtering)**

| Hậu tố | Ý nghĩa | Ví dụ |
| :---- | :---- | :---- |
| \_\_semantic | Tìm kiếm theo ngữ nghĩa, sử dụng AI và vector search. Thay vì khớp từ khóa, nó sẽ tìm các kết quả có ý nghĩa liên quan. | keywords\_\_semantic=điện thoại chụp ảnh đẹp |

## **Phụ lục: Logic kết hợp tham số (Parameter Combination Logic)** 

API này tuân theo các quy tắc logic sau khi bạn kết hợp nhiều tham số hoặc nhiều giá trị trong một tham số.

### **1\. Logic AND giữa các tham số khác nhau** 

Khi bạn cung cấp nhiều tham số khác nhau trong một truy vấn, chúng sẽ được kết hợp bằng logic AND. Kết quả trả về phải thỏa mãn tất cả các điều kiện.

* Ví dụ: ?keywords=iphone\&pref=東京  
* Ý nghĩa: Tìm các sản phẩm có từ khóa "iphone" VÀ được mua tại "Tokyo".

### **2\. Logic OR bên trong một tham số (Sử dụng dấu phẩy ,)**

Đối với các tham số hỗ trợ nhiều giá trị (keywords, category, pref), bạn có thể cung cấp một danh sách các giá trị cách nhau bởi dấu phẩy. Chúng sẽ được kết hợp bằng logic OR. Kết quả trả về chỉ cần thỏa mãn một trong các điều kiện.

* Ví dụ: **?category=electronics,camera**  
* Ý nghĩa: Tìm các sản phẩm thuộc danh mục "electronics" HOẶC "camera".

### **3\. Logic AND bên trong một tham số (Lặp lại tham số)**

Để lọc các kết quả phải thỏa mãn nhiều điều kiện trên cùng một trường (ví dụ: một sản phẩm phải chứa cả hai từ khóa), bạn có thể lặp lại tên tham số trong URL.

* Ví dụ: **?keywords=iphone\&keywords=pro**  
* Ý nghĩa: Tìm các sản phẩm trong mô tả có chứa từ "iphone" VÀ cũng chứa từ "pro".

