import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import Router from './App'

createRoot(document.getElementById('root')).render(
  <RouterProvider router={Router} />
)
