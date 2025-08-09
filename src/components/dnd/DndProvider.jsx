// src/components/dnd/DndProvider.jsx
import React, { createContext } from 'react';
import { Provider } from 'react-redux';

// Tạo ra một store Redux giả, nó không làm gì cả.
const mockStore = {
  getState: () => ({}),
  dispatch: () => {},
  subscribe: () => {},
};

// Tạo ra một context giả
const MockContext = createContext(null);

// Component wrapper của chúng ta
const DndProvider = ({ children }) => {
  return (
    // Cung cấp store giả thông qua Provider của react-redux
    <Provider context={MockContext} store={mockStore}>
      {children}
    </Provider>
  );
};

export default DndProvider;