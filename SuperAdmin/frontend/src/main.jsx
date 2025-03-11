
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import SuperAdminContextProvider from './context/superAdminContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <SuperAdminContextProvider>
      <App />
    </SuperAdminContextProvider>
  </BrowserRouter>,
)
