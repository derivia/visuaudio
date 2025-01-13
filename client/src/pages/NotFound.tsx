import { Link } from "react-router-dom";

/*
 * Requires: react, react-router-dom, typescript & tailwindcss
 * Default 404 - Not found page.
 */
const NotFound = () => {
	return (
		<div className="self-center text-[2rem] flex flex-col items-center">
			<p>404 - Not found</p>
			<Link className="flex flex-col justify-center" to="/">
				<span className="rounded w-fit shadow self-center bg-white p-2">
					🏠 Go Home
				</span>
			</Link>
		</div>
	);
};

export default NotFound;
