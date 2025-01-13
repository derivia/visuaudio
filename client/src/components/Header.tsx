import GitHub from "./GitHub";

const Header = () => {
	return (
		<header className="mt-3 p-2 rounded-md shadow-md bg-white w-fit m-auto">
			<div className="mx-auto flex gap-2 w-fit">
				<h1 className="text-xl font-bold bg-rose-400 self-center text-transparent bg-clip-text">
					Visuaudio
				</h1>
				<GitHub />
			</div>
		</header>
	);
};

export default Header;
