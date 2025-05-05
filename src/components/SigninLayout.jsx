import React from 'react'
import { Navigate, Outlet } from 'react-router'

export default function SigninLayout() {
    const isAuth=true
  return isAuth ? <Navigate to="/home"/> : <Outlet/>
}
