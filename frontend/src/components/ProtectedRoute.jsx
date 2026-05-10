import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (user === null) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-24 font-handwriting text-2xl text-muted-foreground">
                checking the keychain…
            </div>
        );
    }
    if (!user || user.role !== "admin") {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
}
