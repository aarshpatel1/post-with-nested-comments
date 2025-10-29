I'll help you create a complete MERN project with authentication and the features you requested. Here's the complete project structure:

## Project Structure

```
mern-auth-project/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── context/
│   │   ├── styles/
│   │   └── App.js
│   └── package.json
└── package.json
```

## Backend Implementation

### backend/package.json

```json
{
	"name": "mern-auth-backend",
	"version": "1.0.0",
	"type": "module",
	"scripts": {
		"start": "node server.js",
		"dev": "nodemon server.js"
	},
	"dependencies": {
		"express": "^4.18.2",
		"mongoose": "^7.5.0",
		"bcryptjs": "^2.4.3",
		"jsonwebtoken": "^9.0.2",
		"passport": "^0.6.0",
		"passport-jwt": "^4.0.1",
		"passport-local": "^1.0.0",
		"cors": "^2.8.5",
		"dotenv": "^16.3.1",
		"multer": "^1.4.5"
	},
	"devDependencies": {
		"nodemon": "^3.0.1"
	}
}
```

### backend/config/database.js

```javascript
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error("Database connection error:", error);
		process.exit(1);
	}
};

export default connectDB;
```

### backend/models/User.js

```javascript
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		profilePhoto: {
			type: String,
			default: "",
		},
	},
	{
		timestamps: true,
	}
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Generate profile photo
userSchema.methods.generateProfilePhoto = function () {
	const firstChar = this.firstName.charAt(0).toUpperCase();
	const lastChar = this.lastName.charAt(0).toUpperCase();
	const initials = firstChar + lastChar;

	// Generate random color
	const colors = [
		"#FF6B6B",
		"#4ECDC4",
		"#45B7D1",
		"#96CEB4",
		"#FFEAA7",
		"#DDA0DD",
		"#98D8C8",
		"#F7DC6F",
		"#BB8FCE",
		"#85C1E9",
	];
	const randomColor = colors[Math.floor(Math.random() * colors.length)];

	return {
		initials,
		color: randomColor,
	};
};

export default mongoose.model("User", userSchema);
```

### backend/utils/jwtUtils.js

```javascript
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (payload) => {
	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

export const verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};
```

### backend/middleware/passport.js

```javascript
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_SECRET,
};

export const configurePassport = (passport) => {
	// JWT Strategy
	passport.use(
		new JwtStrategy(opts, async (jwt_payload, done) => {
			try {
				const user = await User.findById(jwt_payload.id).select(
					"-password"
				);
				if (user) {
					return done(null, user);
				}
				return done(null, false);
			} catch (error) {
				return done(error, false);
			}
		})
	);

	// Local Strategy for login
	passport.use(
		new LocalStrategy(
			{
				usernameField: "email",
			},
			async (email, password, done) => {
				try {
					const user = await User.findOne({ email });
					if (!user) {
						return done(null, false, { message: "User not found" });
					}

					const isMatch = await user.comparePassword(password);
					if (!isMatch) {
						return done(null, false, {
							message: "Invalid credentials",
						});
					}

					return done(null, user);
				} catch (error) {
					return done(error);
				}
			}
		)
	);
};
```

### backend/middleware/auth.js

```javascript
import passport from "passport";

export const auth = passport.authenticate("jwt", { session: false });
```

### backend/controllers/authController.js

```javascript
import User from "../models/User.js";
import { generateToken } from "../utils/jwtUtils.js";

export const register = async (req, res) => {
	try {
		const { firstName, lastName, email, password } = req.body;

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists with this email",
			});
		}

		// Create new user
		const user = new User({
			firstName,
			lastName,
			email,
			password,
		});

		// Generate profile photo
		const profilePhoto = user.generateProfilePhoto();
		user.profilePhoto = JSON.stringify(profilePhoto);

		await user.save();

		// Generate token
		const token = generateToken({ id: user._id });

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			token,
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				profilePhoto: user.profilePhoto,
			},
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during registration",
		});
	}
};

export const login = async (req, res, next) => {
	passport.authenticate("local", { session: false }, (err, user, info) => {
		if (err) {
			return res.status(500).json({
				success: false,
				message: "Server error during login",
			});
		}

		if (!user) {
			return res.status(401).json({
				success: false,
				message: info?.message || "Invalid credentials",
			});
		}

		// Generate token
		const token = generateToken({ id: user._id });

		res.json({
			success: true,
			message: "Login successful",
			token,
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				profilePhoto: user.profilePhoto,
			},
		});
	})(req, res, next);
};

export const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		res.json({
			success: true,
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				profilePhoto: user.profilePhoto,
			},
		});
	} catch (error) {
		console.error("Profile fetch error:", error);
		res.status(500).json({
			success: false,
			message: "Server error fetching profile",
		});
	}
};
```

### backend/routes/authRoutes.js

```javascript
import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, getProfile);

export default router;
```

### backend/server.js

```javascript
import express from "express";
import cors from "cors";
import passport from "passport";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import { configurePassport } from "./middleware/passport.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());
configurePassport(passport);

// Routes
app.use("/api/auth", authRoutes);

// Basic route
app.get("/", (req, res) => {
	res.json({ message: "MERN Auth API is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		message: "Something went wrong!",
	});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
```

### backend/.env

```env
MONGODB_URI=mongodb://localhost:27017/mern_auth
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
```

## Frontend Implementation

### frontend/package.json

```json
{
	"name": "mern-auth-frontend",
	"version": "1.0.0",
	"type": "module",
	"scripts": {
		"start": "react-scripts start",
		"build": "react-scripts build",
		"dev": "react-scripts start"
	},
	"dependencies": {
		"react": "^18.2.0",
		"react-dom": "^18.2.0",
		"react-scripts": "5.0.1",
		"react-router-dom": "^6.15.0",
		"axios": "^1.5.0",
		"primereact": "^9.6.2",
		"primeicons": "^6.0.1",
		"primeflex": "^3.3.0"
	},
	"browserslist": {
		"production": [">0.2%", "not dead", "not op_mini all"],
		"development": [
			"last 1 chrome version",
			"last 1 firefox version",
			"last 1 safari version"
		]
	}
}
```

### frontend/src/services/api.js

```javascript
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add token to requests
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Handle token expiration
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	}
);

export default api;
```

### frontend/src/services/authService.js

```javascript
import api from "./api.js";

export const authService = {
	async register(userData) {
		const response = await api.post("/auth/register", userData);
		return response.data;
	},

	async login(credentials) {
		const response = await api.post("/auth/login", credentials);
		return response.data;
	},

	async getProfile() {
		const response = await api.get("/auth/profile");
		return response.data;
	},

	logout() {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},

	isAuthenticated() {
		return !!localStorage.getItem("token");
	},

	getToken() {
		return localStorage.getItem("token");
	},

	getUser() {
		const user = localStorage.getItem("user");
		return user ? JSON.parse(user) : null;
	},
};
```

### frontend/src/context/AuthContext.js

```javascript
import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService.js";

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
			const token = authService.getToken();
			const savedUser = authService.getUser();

			if (token && savedUser) {
				try {
					// Verify token is still valid
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
				return { success: true };
			}
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Login failed",
			};
		}
	};

	const register = async (userData) => {
		try {
			const response = await authService.register(userData);

			if (response.success) {
				localStorage.setItem("token", response.token);
				localStorage.setItem("user", JSON.stringify(response.user));
				setUser(response.user);
				return { success: true };
			}
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Registration failed",
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
		register,
		logout,
		loading,
		isAuthenticated: !!user,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
```

### frontend/src/utils/profileUtils.js

```javascript
export const getProfilePhoto = (profilePhotoString, firstName, lastName) => {
	if (profilePhotoString) {
		try {
			const photoData = JSON.parse(profilePhotoString);
			return photoData;
		} catch (error) {
			console.error("Error parsing profile photo:", error);
		}
	}

	// Fallback: generate from name
	const firstChar = firstName?.charAt(0)?.toUpperCase() || "";
	const lastChar = lastName?.charAt(0)?.toUpperCase() || "";
	const initials = firstChar + lastChar;

	const colors = [
		"#FF6B6B",
		"#4ECDC4",
		"#45B7D1",
		"#96CEB4",
		"#FFEAA7",
		"#DDA0DD",
		"#98D8C8",
		"#F7DC6F",
		"#BB8FCE",
		"#85C1E9",
	];
	const randomColor = colors[Math.floor(Math.random() * colors.length)];

	return {
		initials,
		color: randomColor,
	};
};
```

### frontend/src/components/ProfileAvatar.js

```javascript
import React from "react";
import { getProfilePhoto } from "../utils/profileUtils.js";

const ProfileAvatar = ({ user, size = "large", className = "" }) => {
	const photoData = getProfilePhoto(
		user?.profilePhoto,
		user?.firstName,
		user?.lastName
	);

	const sizeClasses = {
		small: "w-2rem h-2rem",
		normal: "w-3rem h-3rem",
		large: "w-4rem h-4rem",
		xlarge: "w-6rem h-6rem",
	};

	return (
		<div
			className={`flex align-items-center justify-content-center border-circle ${sizeClasses[size]} ${className}`}
			style={{
				backgroundColor: photoData.color,
				color: "white",
				fontSize: size === "xlarge" ? "1.5rem" : "1rem",
				fontWeight: "bold",
			}}
		>
			{photoData.initials}
		</div>
	);
};

export default ProfileAvatar;
```

### frontend/src/pages/Login.js

```javascript
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { login } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const result = await login(formData.email, formData.password);

		if (result.success) {
			navigate("/dashboard");
		} else {
			setError(result.message);
		}

		setLoading(false);
	};

	return (
		<div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
			<Card className="w-full md:w-4 lg:w-3" title="Login">
				<form onSubmit={handleSubmit} className="p-fluid">
					{error && (
						<Message
							severity="error"
							text={error}
							className="mb-3"
						/>
					)}

					<div className="field mb-4">
						<label
							htmlFor="email"
							className="block text-900 font-medium mb-2"
						>
							Email
						</label>
						<InputText
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Enter your email"
							required
							className="w-full"
						/>
					</div>

					<div className="field mb-4">
						<label
							htmlFor="password"
							className="block text-900 font-medium mb-2"
						>
							Password
						</label>
						<Password
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Enter your password"
							feedback={false}
							toggleMask
							className="w-full"
							inputClassName="w-full"
							required
						/>
					</div>

					<Button
						type="submit"
						label="Login"
						loading={loading}
						className="w-full mb-3"
					/>

					<div className="text-center">
						<span className="text-600 font-medium">
							Don't have an account?{" "}
						</span>
						<Link
							to="/register"
							className="font-medium no-underline text-blue-500"
						>
							Sign up
						</Link>
					</div>
				</form>
			</Card>
		</div>
	);
};

export default Login;
```

### frontend/src/pages/Register.js

```javascript
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

const Register = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const { register } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		const { confirmPassword, ...userData } = formData;
		const result = await register(userData);

		if (result.success) {
			navigate("/dashboard");
		} else {
			setError(result.message);
		}

		setLoading(false);
	};

	return (
		<div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
			<Card className="w-full md:w-4 lg:w-3" title="Create Account">
				<form onSubmit={handleSubmit} className="p-fluid">
					{error && (
						<Message
							severity="error"
							text={error}
							className="mb-3"
						/>
					)}

					<div className="grid">
						<div className="col-12 md:col-6 mb-4">
							<label
								htmlFor="firstName"
								className="block text-900 font-medium mb-2"
							>
								First Name
							</label>
							<InputText
								id="firstName"
								name="firstName"
								value={formData.firstName}
								onChange={handleChange}
								placeholder="First Name"
								required
								className="w-full"
							/>
						</div>

						<div className="col-12 md:col-6 mb-4">
							<label
								htmlFor="lastName"
								className="block text-900 font-medium mb-2"
							>
								Last Name
							</label>
							<InputText
								id="lastName"
								name="lastName"
								value={formData.lastName}
								onChange={handleChange}
								placeholder="Last Name"
								required
								className="w-full"
							/>
						</div>
					</div>

					<div className="field mb-4">
						<label
							htmlFor="email"
							className="block text-900 font-medium mb-2"
						>
							Email
						</label>
						<InputText
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Enter your email"
							required
							className="w-full"
						/>
					</div>

					<div className="field mb-4">
						<label
							htmlFor="password"
							className="block text-900 font-medium mb-2"
						>
							Password
						</label>
						<Password
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Enter your password"
							toggleMask
							className="w-full"
							inputClassName="w-full"
							required
						/>
					</div>

					<div className="field mb-4">
						<label
							htmlFor="confirmPassword"
							className="block text-900 font-medium mb-2"
						>
							Confirm Password
						</label>
						<Password
							id="confirmPassword"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							placeholder="Confirm your password"
							toggleMask
							className="w-full"
							inputClassName="w-full"
							required
						/>
					</div>

					<Button
						type="submit"
						label="Create Account"
						loading={loading}
						className="w-full mb-3"
					/>

					<div className="text-center">
						<span className="text-600 font-medium">
							Already have an account?{" "}
						</span>
						<Link
							to="/login"
							className="font-medium no-underline text-blue-500"
						>
							Sign in
						</Link>
					</div>
				</form>
			</Card>
		</div>
	);
};

export default Register;
```

### frontend/src/pages/Dashboard.js

```javascript
import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useAuth } from "../context/AuthContext.js";
import ProfileAvatar from "../components/ProfileAvatar.js";

const Dashboard = () => {
	const { user, logout } = useAuth();

	const header = (
		<div className="flex align-items-center justify-content-between">
			<h2>Dashboard</h2>
			<Button
				label="Logout"
				icon="pi pi-sign-out"
				className="p-button-outlined"
				onClick={logout}
			/>
		</div>
	);

	return (
		<div className="p-4">
			<Card header={header} className="max-w-4 mx-auto">
				<div className="flex flex-column align-items-center text-center mb-4">
					<ProfileAvatar user={user} size="xlarge" className="mb-3" />
					<h3 className="mb-1">
						{user?.firstName} {user?.lastName}
					</h3>
					<p className="text-600 mb-3">{user?.email}</p>
				</div>

				<div className="grid">
					<div className="col-12 md:col-4">
						<Card className="text-center">
							<i className="pi pi-user text-4xl text-blue-500 mb-3"></i>
							<h4>Profile</h4>
							<p className="text-600">Manage your account</p>
						</Card>
					</div>
					<div className="col-12 md:col-4">
						<Card className="text-center">
							<i className="pi pi-cog text-4xl text-green-500 mb-3"></i>
							<h4>Settings</h4>
							<p className="text-600">Update preferences</p>
						</Card>
					</div>
					<div className="col-12 md:col-4">
						<Card className="text-center">
							<i className="pi pi-shield text-4xl text-purple-500 mb-3"></i>
							<h4>Security</h4>
							<p className="text-600">Protect your account</p>
						</Card>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default Dashboard;
```

### frontend/src/components/ProtectedRoute.js

```javascript
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return (
			<div className="flex align-items-center justify-content-center min-h-screen">
				<i className="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
			</div>
		);
	}

	return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
```

### frontend/src/App.js

```javascript
import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import ProtectedRoute from "./components/ProtectedRoute.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

function App() {
	return (
		<AuthProvider>
			<Router>
				<div className="App">
					<Routes>
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/"
							element={<Navigate to="/dashboard" />}
						/>
					</Routes>
				</div>
			</Router>
		</AuthProvider>
	);
}

export default App;
```

### frontend/src/index.js

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
```

### frontend/public/index.html

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="theme-color" content="#000000" />
		<meta name="description" content="MERN Auth App" />
		<title>MERN Auth App</title>
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
	</body>
</html>
```

## Root package.json (Optional - for running both frontend and backend)

```json
{
	"name": "mern-auth-project",
	"version": "1.0.0",
	"scripts": {
		"dev": "concurrently \"npm run server\" \"npm run client\"",
		"server": "cd backend && npm run dev",
		"client": "cd frontend && npm start",
		"build": "cd frontend && npm run build",
		"install-server": "cd backend && npm install",
		"install-client": "cd frontend && npm install",
		"install-all": "npm run install-server && npm run install-client"
	},
	"devDependencies": {
		"concurrently": "^8.2.0"
	}
}
```

## Setup Instructions

1. **Install dependencies:**

    ```bash
    # Install root dependencies
    npm install

    # Install backend dependencies
    cd backend && npm install

    # Install frontend dependencies
    cd ../frontend && npm install
    ```

2. **Set up environment variables:**

    - Create `.env` file in backend directory
    - Add your MongoDB connection string and JWT secret

3. **Start the application:**

    ```bash
    # From root directory
    npm run dev

    # Or start separately
    # Terminal 1: cd backend && npm run dev
    # Terminal 2: cd frontend && npm start
    ```

This complete MERN project includes:

-   ✅ Module-based syntax throughout
-   ✅ JWT authentication with Passport
-   ✅ Profile photo generation with initials
-   ✅ PrimeReact and PrimeFlex styling
-   ✅ Proper folder structure
-   ✅ Error handling
-   ✅ Protected routes
-   ✅ Responsive design

The application provides a complete authentication system with login, registration, and a protected dashboard showing user information with dynamically generated profile avatars.
