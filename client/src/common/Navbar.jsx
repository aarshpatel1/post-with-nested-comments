import { Link } from "react-router";
import "./Navbar.css";
import logo from "../assets/react.svg";
import { Button } from "primereact/button";

export default function Navbar() {
	return (
		<>
			<nav className="flex flex-wrap justify-content-center align-items-center">
				<ul className="flex flex-wrap justify-content-center align-items-center p-0 p-3 shadow-3 border-round-xl">
					<li className="navbar-logo">
						<Link to={"/"}>
							<img src={logo} alt="Logo" />
						</Link>
					</li>
					<li className="ml-4 mr-7">
						<Link to={"/dashboard"}>Dashboard</Link>
					</li>
					<li className="ms-3">
						<Link to={"/signup"} className="mr-2">
							<Button size="small" outlined>
								Signup
							</Button>
						</Link>
						<Link to={"/login"}>
							<Button size="small">Login</Button>
						</Link>
					</li>
				</ul>
			</nav>
		</>
	);
}
