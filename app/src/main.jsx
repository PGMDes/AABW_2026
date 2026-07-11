import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import FullStackApp from './FullStackApp.jsx'

const RootApp = import.meta.env.VITE_APP_RUNTIME_MODE === 'full_stack' ? FullStackApp : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
