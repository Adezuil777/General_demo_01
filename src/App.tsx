import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<string[]>(['示例事项 A', '示例事项 B'])

  function addItem() {
    const next = `新事项 ${items.length + 1}`
    setItems((prev) => [...prev, next])
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>通用演示项目：General_demo_01</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          计数器：{count}
        </button>
        <p>
          编辑 <code>src/App.tsx</code> 保存后即可通过 HMR 实时更新
        </p>
      </div>
      <div className="card">
        <h2>功能示例</h2>
        <button onClick={addItem}>添加事项</button>
        <ul>
          {items.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      </div>
      <p className="read-the-docs">点击上方 Vite/React 图标了解更多</p>
    </>
  )
}

export default App
