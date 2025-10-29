import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
	const { user, logout } = useAuth();

	return (
		<>
			<h1 className="text-center starting-content">Dashboard</h1>{" "}
			<Button
				label="Logout"
				icon="pi pi-sign-out"
				className="p-button-outlined"
				onClick={logout}
			/>
		</>
	);
}
