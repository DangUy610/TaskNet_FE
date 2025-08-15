// src/api/index.js

// Dòng này import tất cả các hàm đã export từ file apiClient.js
// và export chúng ra lại. `default` export sẽ được export với tên `apiClient`.
export { default as apiClient } from './apiClient'; 

// Dùng `export *` để export tất cả các named export từ các file còn lại.
// Đây là cách viết gọn và hiệu quả nhất.

export * from './authApi';
export * from './boardApi';
export * from './cardApi';
export * from './listApi';
export * from './mockApi'; // Nếu bạn vẫn còn dùng mock