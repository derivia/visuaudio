import { useState } from "react";

const FileDropper = ({
	onFileUpload,
}: { onFileUpload: (file: File) => void }) => {
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file && file.type === "audio/mpeg") {
			onFileUpload(file);
		} else {
			alert("Please upload a valid MP3 file.");
		}
	};

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && file.type === "audio/mpeg") {
			onFileUpload(file);
		} else {
			alert("Please upload a valid MP3 file.");
		}
	};

	return (
		<div
			className={`p-4 border-2 border-dashed ${
				isDragging ? "border-rose-500" : "border-gray-400"
			} rounded-lg text-center cursor-pointer`}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<input
				type="file"
				accept="audio/mpeg"
				onChange={handleFileInput}
				className="hidden"
				id="fileInput"
			/>
			<label htmlFor="fileInput" className="cursor-pointer">
				{isDragging
					? "Drop the file here"
					: "Drag & drop an MP3 file or click to upload"}
			</label>
		</div>
	);
};

export default FileDropper;
