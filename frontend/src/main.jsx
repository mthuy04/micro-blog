import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
// Xóa dòng import BrowserRouter nếu có

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* XÓA BrowserRouter Ở ĐÂY, CHỈ GIỮ LẠI APP */}
    <App />
  </React.StrictMode>,
)