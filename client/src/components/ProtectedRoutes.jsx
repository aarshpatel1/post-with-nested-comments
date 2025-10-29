import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./common/Loader";

export default function ProtectedRoutes({ children }) {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return <Loader />;
	}

	return isAuthenticated ? children : <Navigate to="/login" />;
}
