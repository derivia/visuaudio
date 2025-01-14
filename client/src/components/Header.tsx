const Header = () => {
	return (
		<header className="mt-3 p-2 rounded-md w-fit m-auto">
			<div className="mx-auto mb-1 flex gap-2 w-fit">
				<h1 className="text-5xl drop-shadow font-bold bg-rose-400 self-center text-transparent bg-clip-text">
					Visuaudio
				</h1>
			</div>
			<p className="mx-auto text-xl drop-shadow w-fit text-red-400">Minimalist music visualizer</p>
		</header>
	);
};

export default Header;
