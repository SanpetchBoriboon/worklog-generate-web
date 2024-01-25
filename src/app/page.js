"use client";

import { useState } from "react";

export default function Home() {
	const [file, setFile] = useState(null);
	const [loading, setLoading] = useState(false);

	const onSubmit = async (e) => {
		e.preventDefault();

		if (!file) return;

		try {
			setLoading(true);

			const data = new FormData();
			data.append("file", file);

			const fileName = file.name;
			const yaerMonth = fileName.split("_")[1].split("-");
			const generateFileName = `Report JiraWorkLog - ${yaerMonth[0]}_${yaerMonth[1]}.xlsx`;

			const res = await fetch(`https://generate-worklog-server.fly.dev/worklogFile/generateFile`, {
				method: "POST",
				body: data,
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			const blob = await res.blob();
			const link = document.createElement("a");
			link.href = window.URL.createObjectURL(blob);
			link.download = generateFileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Reload the window after download
			window.location.reload();
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main>
			<form onSubmit={onSubmit}>
				<div className="flex justify-center mt-8">
					<div className="max-w-2xl rounded-lg shadow-xl bg-gray-50">
						<div className="m-4">
							<label className="inline-block mb-2 text-gray-500">File Upload</label>
							<div className="flex items-center justify-center w-full">
								<label className="flex flex-col w-full h-32 border-4 border-blue-200 border-dashed hover:bg-gray-100 hover:border-gray-300">
									<div className="flex flex-col items-center justify-center pt-7" style={{cursor: 'pointer'}}>
										{file ? (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-8 h-8 text-green-400 group-hover:text-green-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
											</svg>
										) : (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
												/>
											</svg>
										)}
										<p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
											{file ? "File attached" : "Attach a file"}
										</p>
									</div>
									<input type="file" name="file" onChange={(e) => setFile(e.target.files?.[0])} className="opacity-0" />
								</label>
							</div>
						</div>
						<div className="flex justify-center p-2">
							<button
								className={`w-full px-4 py-2 text-white ${file && !loading ? "bg-green-500" : "bg-gray-500"} rounded shadow-x`}
								type="submit"
								disabled={!file || loading}
							>
								{loading ? "Uploading..." : "Upload"}
							</button>
						</div>
					</div>
				</div>
			</form>
		</main>
	);
}
