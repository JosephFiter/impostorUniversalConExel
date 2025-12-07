// src/main.jsx (o index.jsx)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import Menu from './pages/Menu.jsx'
import Juegocompetitivo from './pages/Juegocompetitivo.jsx'
import Fiesta from './pages/Fiesta.jsx'  // ← NUEVA IMPORTACIÓN

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Menu />
      },
      {
        path: "/juegocompetitivo",
        element: <Juegocompetitivo />
      },
      {
        path: "/juegofiesta",        // ← NUEVA RUTA
        element: <Fiesta />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)