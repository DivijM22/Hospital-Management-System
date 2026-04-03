import { useOutletContext, Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    const context = useOutletContext();

    if (!context) return null;

    const { accessToken,loading } = context;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-xl font-semibold text-gray-600 animate-pulse">
                    Verifying session...
                </div>
            </div>
        );
    }
    if (!accessToken) 
        return <Navigate to="/" replace />;
    return <Outlet context={context} />; 
}