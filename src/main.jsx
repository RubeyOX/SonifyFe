import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { AuthenticationProvider } from './utils/AuthenticationUtils'
import Router from './App'

createRoot(document.getElementById('root')).render(
  <AuthenticationProvider>
    <RouterProvider router={Router} />
  </AuthenticationProvider>
)
