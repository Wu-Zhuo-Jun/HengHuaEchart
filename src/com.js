import React from 'react';
import ReactDOM from 'react-dom/client';

// 创建一个简单的 React 组件
function App() {
    return <h1>Hello, React 18!</h1>;
}

// 获取 id 为 "example" 的 DOM 容器，并创建一个 React 根节点
const root = ReactDOM.createRoot(document.getElementById("example"));

// 渲染 React 组件到 DOM 中的根节点
root.render(<App />);