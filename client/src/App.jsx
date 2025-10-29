import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import Navbar from "./components/common/Navbar";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoutes from "./components/ProtectedRoutes";

export default function App() {
	return (
		<>
			<AuthProvider>
				{/* <h1>Welcome to my home page</h1> */}
				{/* <Login /> */}
				{/* <Signup /> */}
				{/* <Dashboard /> */}
				<BrowserRouter>
					<Navbar />
					<Routes>
						<Route
							path="/"
							element={<Navigate to="/dashboard" />}
						/>
						<Route
							path="/dashboard"
							element={
								<ProtectedRoutes>
									<Dashboard />
								</ProtectedRoutes>
							}
						/>
						<Route path="/signup" element={<Signup />} />
						<Route path="/login" element={<Login />} />
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</>
	);
}
