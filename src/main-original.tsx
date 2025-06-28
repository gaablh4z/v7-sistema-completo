import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { WeatherProvider } from './contexts/WeatherContext'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/toaster'
import '../styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <NotificationProvider>
            <WeatherProvider>
              <App />
              <Toaster />
            </WeatherProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
