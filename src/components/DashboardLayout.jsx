import React from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../utils/AuthenticationUtils'
import Loading from './common/Loading'

export default function DashboardLayout() {
    let isAuth=true
    const {token,user,isLoading}=useAuth()
    // if(!token || user?.role=='user'){
    // if(!token){
    //     isAuth=false
    // }else{
    //     isAuth=true
    // }
    if(isLoading){
        return <Loading/>
    }
  return isAuth ? <Outlet/> : <Navigate to='/home'/>
}
