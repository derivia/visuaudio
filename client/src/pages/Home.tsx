import { useState, useEffect, useRef } from "react";
import FileDropper from "../components/FileDropper";
import Header from "../components/Header";
import Visualization from "../components/Visualization";

const Home = () => {
	const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
	const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
	const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(
		null,
	);
	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolume] = useState(1);
	const gainNodeRef = useRef<GainNode | null>(null);

	useEffect(() => {
		const ctx = new AudioContext();
		const analyserNode = ctx.createAnalyser();
		analyserNode.fftSize = 256;
		setAudioContext(ctx);
		setAnalyser(analyserNode);

		gainNodeRef.current = ctx.createGain();
		gainNodeRef.current.gain.value = volume;
	}, []);

	useEffect(() => {
		if (gainNodeRef.current) {
			gainNodeRef.current.gain.value = volume;
		}
	}, [volume]);

	const handleFileUpload = async (file: File) => {
		if (!audioContext || !analyser || !gainNodeRef.current) return;

		const reader = new FileReader();
		reader.onload = async (e) => {
			const arrayBuffer = e.target?.result as ArrayBuffer;
			const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

			if (audioSource) {
				audioSource.stop();
				audioSource.disconnect();
			}

			const source = audioContext.createBufferSource();
			source.buffer = audioBuffer;
			source.connect(gainNodeRef.current!);
			gainNodeRef.current!.connect(analyser);
			analyser.connect(audioContext.destination);
			source.start(0);
			setAudioSource(source);
			setIsPlaying(true);
		};
		reader.readAsArrayBuffer(file);
	};

	const togglePlayPause = () => {
		if (audioContext && audioSource) {
			if (isPlaying) {
				audioContext.suspend();
			} else {
				audioContext.resume();
			}
			setIsPlaying(!isPlaying);
		}
	};

	return (
		<div className="min-h-screen w-full bg-[#E2E2E2]">
			<Header />
			<div className="max-w-6xl mx-auto p-6">
				<div className="grid gap-6">
					{analyser && (
						<div className="w-full h-[400px]">
							<Visualization analyser={analyser} />
						</div>
					)}
					<div className="w-full max-w-xl mx-auto">
						<FileDropper onFileUpload={handleFileUpload} />
					</div>
					<div className="flex items-center justify-center gap-4">
						<button
							onClick={togglePlayPause}
							className="bg-white px-4 text-rose-500 shadow-md hover:opacity-60 py-2 rounded-md"
							disabled={!audioSource}
						>
							{isPlaying ? "Pause" : "Play"}
						</button>
						<div className="bg-white flex align-center justify-center gap-2 px-2 text-rose-500 shadow-md py-2 rounded-md">
							<label htmlFor="volume">🔊</label>
							<input
								type="range"
								min="0"
								name="volume"
								max="1"
								step="0.01"
								value={volume}
								onChange={(e) => setVolume(parseFloat(e.target.value))}
								className="w-32 accent-rose-400"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
