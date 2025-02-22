import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppStoreProvider, { useApp } from './components/Store'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  </StrictMode>,
)