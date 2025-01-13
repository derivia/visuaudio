import { useEffect, useRef } from "react";

const NUM_BANDS = 64;
const MIN_FREQ = 20; // max. human frequency
const MAX_FREQ = 20000; // min. human frequency

const Visualization = ({ analyser }: { analyser: AnalyserNode }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const animationFrameId = useRef<number>();
	const prevDataRef = useRef<number[]>([]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		const sampleRate = analyser.context.sampleRate;

		// get frequency using logarithmic scale to match human perception
		const getFrequencyBands = () => {
			const bands = [];
			// generate exponentially spaced frequency bands
			const minLog = Math.log10(MIN_FREQ);
			const maxLog = Math.log10(MAX_FREQ);
			const logStep = (maxLog - minLog) / NUM_BANDS;

			for (let i = 0; i < NUM_BANDS; i++) {
				const startFreq = Math.pow(10, minLog + i * logStep);
				const endFreq = Math.pow(10, minLog + (i + 1) * logStep);
				bands.push({ startFreq, endFreq });
			}
			return bands;
		};

		// convert frequency to FFT bin index (https://en.wikipedia.org/wiki/Fast_Fourier_transform)
		const getBinForFrequency = (freq: number): number => {
			return Math.floor((freq * 2 * bufferLength) / sampleRate);
		};

		const frequencyBands = getFrequencyBands();
		const baseSmoothingFactor = 0.7;
		const noiseThreshold = 0.02;

		const resizeCanvas = () => {
			canvas.width = container.clientWidth;
			canvas.height = container.clientHeight;
		};

		resizeCanvas();
		const resizeObserver = new ResizeObserver(resizeCanvas);
		resizeObserver.observe(container);

		const getBandAmplitude = (startFreq: number, endFreq: number): number => {
			const startBin = getBinForFrequency(startFreq);
			const endBin = getBinForFrequency(endFreq);
			let sum = 0;
			let count = 0;

			// average amplitudes within the frequency range
			for (let i = startBin; i <= endBin && i < bufferLength; i++) {
				sum += dataArray[i];
				count++;
			}

			return count > 0 ? sum / count : 0;
		};

		// apply dynamic smoothing based on frequency band
		const applyDynamicSmoothing = (
			amplitude: number,
			bandIndex: number,
		): number => {
			const smoothingFactor =
				bandIndex < NUM_BANDS / 4 ? 0.4 : baseSmoothingFactor;
			const prevAmplitude = prevDataRef.current[bandIndex] || 0;
			return (
				prevAmplitude * smoothingFactor + amplitude * (1 - smoothingFactor)
			);
		};

		const applyNoiseThreshold = (
			amplitude: number,
			bandIndex: number,
		): number => {
			const threshold =
				bandIndex < NUM_BANDS / 4 ? noiseThreshold * 0.5 : noiseThreshold;
			return amplitude > threshold ? amplitude : 0;
		};

		// normalize amplitudes across all bands
		const normalizeAmplitudes = (amplitudes: number[]): number[] => {
			const maxAmplitude = Math.max(...amplitudes);
			return maxAmplitude > 0
				? amplitudes.map((a) => a / maxAmplitude)
				: amplitudes;
		};

		const draw = () => {
			animationFrameId.current = requestAnimationFrame(draw);
			analyser.getByteFrequencyData(dataArray);

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const barWidth = canvas.width / NUM_BANDS;
			const padding = barWidth * 0.1; // 10% padding between bars

			const amplitudes = frequencyBands.map((band, index) => {
				let amplitude = getBandAmplitude(band.startFreq, band.endFreq) / 255;
				amplitude = applyDynamicSmoothing(amplitude, index);
				amplitude = applyNoiseThreshold(amplitude, index);
				return amplitude;
			});

			const normalizedAmplitudes = normalizeAmplitudes(amplitudes);

			normalizedAmplitudes.forEach((amplitude, index) => {
				const barHeight = (amplitude * canvas.height) / 1.2;
				const x = index * barWidth + padding;
				const barWidthWithPadding = barWidth - padding * 2;

				// calculate color based on frequency (which makes it a rainbow effect)
				const hue = (index / NUM_BANDS) * 360;
				ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

				ctx.fillRect(
					x,
					canvas.height - barHeight,
					barWidthWithPadding,
					barHeight,
				);

				prevDataRef.current[index] = amplitude;
			});
		};

		draw();

		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
			resizeObserver.disconnect();
		};
	}, [analyser]);

	return (
		<div
			ref={containerRef}
			className="w-full h-full border-dashed border-3 border-slate-500 rounded relative"
		>
			<canvas ref={canvasRef} style={{ background: "transparent" }} />
		</div>
	);
};

export default Visualization;
