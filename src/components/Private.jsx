import React from 'react'
import { Navigate, Outlet } from 'react-router'

export default function Private() {
    const isAuth = true
    return isAuth ? <Outlet /> : <Navigate to="/home" replace />

}
