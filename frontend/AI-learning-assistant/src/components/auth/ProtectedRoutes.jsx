import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoutes = () => {
    const { isAuthenticated, loading } = useAuth()

    if(loading){
        return(
            <div>Loading...</div>
        )
    }

    return isAuthenticated ? (
        <AppLayout>
            <Outlet/>  
            {/* ender whatever child route matched here */}
        </AppLayout>
    ) : (
        <Navigate to="/login" replace/>
    );
}

export default ProtectedRoutes
