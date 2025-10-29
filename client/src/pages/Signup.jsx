import { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Messages } from "primereact/messages";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";

export default function Signup() {
	const [user, setUser] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { signup } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value });
	};

	const handleReset = (e) => {
		e.preventDefault();
		setUser({});
		setLoading(false);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			setError("");

			if (user.password !== user.confirmPassword) {
				setError("Password should be match..!!");
				setLoading(false);
				return;
			}

			const { confirmPassword, ...userData } = user;
			const result = await signup(userData);

			if (result.success) {
				navigate("/dashboard");
			} else {
				setError("Signup again..!!");
			}
		} catch (error) {
			setError("Failed to signup..!!");
		} finally {
			setUser({});
			setLoading(false);
		}
	};

	return (
		<form className="flex flex-column min-h-screen align-items-center justify-content-center">
			<h1 className="text-center mt-0">Signup</h1>
			<div className="card flex justify-content-center mb-3">
				<div className="flex flex-column gap-2">
					<label htmlFor="email">Email</label>
					<InputText
						id="email"
						name="email"
						value={user.email || ""}
						onChange={handleChange}
					/>
				</div>
			</div>
			<div className="card flex justify-content-center mb-3">
				<div className="flex flex-column gap-2">
					<label htmlFor="password">Password</label>
					<InputText
						type="password"
						id="password"
						name="password"
						value={user.password || ""}
						onChange={handleChange}
					/>
				</div>
			</div>
			<div className="card flex justify-content-center mb-3">
				<div className="flex flex-column gap-2">
					<label htmlFor="confirmPassword">Confirm Password</label>
					<InputText
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						value={user.confirmPassword || ""}
						onChange={handleChange}
					/>
				</div>
			</div>
			<div className="card flex gap-2 justify-content-center">
				<Button
					label="Reset"
					onClick={handleReset}
					outlined
					size="small"
				/>
				<Button
					label="Submit"
					icon="pi pi-check"
					loading={loading}
					type="submit"
					size="small"
				/>
			</div>

			{error && (
				<Messages severity="error" text={error} className="my-3" />
			)}
		</form>
	);
}
