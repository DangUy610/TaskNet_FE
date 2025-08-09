# TaskNest Frontend Overview

## 1. Tổng quan dự án
**TaskNest** là một ứng dụng quản lý công việc dạng kanban, lấy cảm hứng từ **Trello**.

Frontend được xây dựng bằng:
- **ReactJS** (SPA)
- **react-router-dom** – Routing
- **styled-components** + **Bootstrap** + CSS thuần – UI
- **@hello-pangea/dnd** – Drag & drop cho list và card
- **Context API** – State management (Auth, Workspace, Modal)
- **Axios** – Kết nối backend (Django REST API)
- **Google OAuth** – Đăng nhập Google
- **Portal** – Render popup/modal

---

## 2. Kiến trúc & Module

### 2.1. API Service Layer
- `apiClient` – Cấu hình axios (token, refresh token, queue request khi refresh)
- API module hóa theo resource:
  - `authApi`
  - `workspaceApi`
  - `boardApi`
  - `listApi`
  - `cardApi`
- `apiRoutes.js` – Centralize toàn bộ endpoint path

### 2.2. Context
- **AuthContext** – Quản lý xác thực, preload user & workspace
- **WorkspaceContext** – Danh sách workspace, workspace hiện tại
- **ModalContext** – Mở/đóng modal toàn app

### 2.3. Layout & Routing
- Layout:
  - `WithHeaderOnlyLayout`
  - `WithHeaderAndSidebarLayout`
- Route guard:
  - `PrivateRoute`
  - `ProtectedRoute`
- Header + Sidebar: Navigation chính (Boards, Templates, Workspace switcher)

### 2.4. Board / List / Card
- `BoardPane` – Render list & card (drag-drop)
- `ListColumn` – 1 list chứa nhiều `CardItem`
- `CardItem` – Card ngắn, click mở `FullCardModal` hoặc `CardEditPopup`
- `FullCardModal` – Chi tiết card
- `CardEditPopup` – Menu edit nhanh card
- API gọi trực tiếp trong component

### 2.5. Popup & Modal
- `ShareBoardPopup`, `LabelPopup`, `BoardFilterPopup`, `FilterPopup`
- Styles chung: `Popup.styles.js`
- Hook filter:
  - `useFilter`
  - `useSimpleFilter`

### 2.6. Filter & Label
- Lọc card: keyword, member, label, status, due date, created date
- UI item filter:
  - `LabelFilterItem`
  - `MemberFilterItem`

---

## 3. Điểm mạnh
- **Kiến trúc module rõ ràng**: API, context, layout, UI tách file hợp lý
- **Context API**: Tránh prop drilling, quản lý state tập trung
- **Base API client chuyên nghiệp**: Refresh token, queue request
- **UI component tái sử dụng**: Modal, popup, spinner, portal
- **Tính năng Trello core gần đủ**: Board, list, card, drag-drop, filter, label, share, member
- **Google OAuth**: Đăng nhập Google, đồng bộ backend
