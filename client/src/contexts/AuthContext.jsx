import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const initializeAuth = async () => {
			const token = authService.getToken("token");
			const savedUser = authService.getUser("user");

			if (token && savedUser) {
				try {
					const response = await authService.getProfile();
					setUser(response.user);
				} catch (error) {
					authService.logout();
				}
			}

			setLoading(false);
		};

		initializeAuth();
	}, []);

	const login = async (email, password) => {
		try {
			const response = await authService.login({ email, password });

			if (response.success) {
				localStorage.setItem("token", response.token);
				localStorage.setItem("user", JSON.stringify(response.user));
				setUser(response.user);
				return {
					success: true,
				};
			}
		} catch (error) {
			return {
				success: false,
				message:
					error.response?.data?.message ||
					"Login failed.. (AuthContext)!!",
			};
		}
	};

	const signup = async (userData) => {
		try {
			const response = await authService.signup(userData);
			if (response.success) {
				localStorage.setItem("token", response.token);
				localStorage.setItem("user", JSON.stringify(response.user));
				setUser(response.user);
				return {
					success: true,
				};
			}
		} catch (error) {
			return {
				success: false,
				message:
					error.response?.data?.message ||
					"Signup failed.. (AuthContext)!!",
			};
		}
	};

	const logout = () => {
		authService.logout();
		setUser(null);
	};

	const value = {
		user,
		login,
		signup,
		logout,
		loading,
		isAuthenticated: !!user,
	};

	return (
		<>
			<AuthContext.Provider value={value}>
				{children}
			</AuthContext.Provider>
		</>
	);
};

// https://chat.deepseek.com/a/chat/s/ada0f9ed-3bbb-4d69-a294-bdd93a4f05ad
