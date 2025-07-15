import React from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../utils/AuthenticationUtils'

export default function SigninLayout() {
  const {token,user}=useAuth()
  let isAuth=false
  if(token || user){
    isAuth=true
  }else{
    isAuth=false
  }
  
  return isAuth ? <Navigate to="/home"/> : <Outlet/>
}