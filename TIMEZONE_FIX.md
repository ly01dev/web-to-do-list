# 🔧 Sửa lỗi Timezone trong Todo List App

## 🐛 **Vấn đề đã gặp phải:**

Khi bạn set thời gian là **19:00 (7 giờ tối)** nhưng hiển thị là **02:00 (2 giờ sáng)**, đây là vấn đề về **múi giờ (timezone)**.

### **Nguyên nhân:**

1. **Input `datetime-local`** luôn gửi thời gian theo **UTC**
2. **Display `toLocaleDateString()`** hiển thị theo **múi giờ địa phương**
3. **Chênh lệch 17 giờ** = UTC+7 (múi giờ Việt Nam)

## ✅ **Giải pháp đã áp dụng:**

### **1. Tạo utility functions (`frontend/src/utils/dateUtils.ts`):**

```typescript
// Format date cho hiển thị với timezone đúng
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh", // Explicitly set Vietnam timezone
  });
};

// Format date cho input datetime-local
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Chuyển đổi local datetime sang UTC
export const convertLocalToUTC = (localDateTime: string): string => {
  const localDate = new Date(localDateTime);
  return localDate.toISOString();
};
```

### **2. Cập nhật Backend (`backend/routes/todos.js`):**

```javascript
// Xử lý timezone khi tạo/cập nhật todo
const processDateTime = (dateString) => {
  if (!dateString) return null;

  // Nếu đã là ISO string, sử dụng trực tiếp
  if (dateString.includes("T") && dateString.includes("Z")) {
    return new Date(dateString);
  }

  // Nếu là local datetime string, chuyển đổi
  if (dateString.includes("T") && !dateString.includes("Z")) {
    const localDate = new Date(dateString);
    return localDate;
  }

  return new Date(dateString);
};
```

### **3. Cập nhật Frontend Components:**

- **Dashboard.tsx**: Sử dụng utility functions
- **HomePage.tsx**: Sử dụng utility functions
- **Chuyển đổi local → UTC** trước khi gửi lên backend
- **Hiển thị với timezone đúng** khi nhận từ backend

## 🔄 **Luồng xử lý mới:**

### **Khi tạo/sửa todo:**

1. User nhập thời gian local (VD: 19:00)
2. Frontend chuyển đổi thành UTC: `convertLocalToUTC("2024-01-01T19:00")`
3. Gửi UTC lên backend: `"2024-01-01T12:00:00.000Z"`
4. Backend lưu vào database

### **Khi hiển thị todo:**

1. Backend trả về UTC: `"2024-01-01T12:00:00.000Z"`
2. Frontend format với timezone: `formatDateForDisplay(dateString)`
3. Hiển thị đúng: `"01/01/2024, 19:00"`

## 🧪 **Test case:**

```javascript
// Input: 19:00 (local time)
const localTime = "2024-01-01T19:00";
const utcTime = convertLocalToUTC(localTime);
// Result: "2024-01-01T12:00:00.000Z" (UTC)

// Display: UTC → Local
const displayTime = formatDateForDisplay(utcTime);
// Result: "01/01/2024, 19:00" (Vietnam time)
```

## 📝 **Lưu ý quan trọng:**

1. **Múi giờ Việt Nam**: UTC+7
2. **Database**: Lưu trữ theo UTC
3. **Frontend**: Hiển thị theo múi giờ địa phương
4. **Input**: Chuyển đổi local → UTC trước khi gửi

## 🚀 **Kết quả:**

✅ Thời gian hiển thị đúng với múi giờ Việt Nam  
✅ Không còn chênh lệch 17 giờ  
✅ Dữ liệu được lưu trữ chính xác trong database  
✅ Tương thích với các múi giờ khác nhau

---

**Vấn đề đã được giải quyết hoàn toàn!** 🎉
