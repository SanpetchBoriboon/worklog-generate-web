"use client";

import { useState } from "react";

export default function Home() {
	const [file, setFile] = useState();

	const onSubmit = async (e) => {
		e.preventDefault();

		if (!file) return;

		try {
			const data = new FormData();
			data.append("file", file);

			const fileName = file.name

			const yaerMonth = fileName.split('_')[1].split('-');
      		const generateFileName = `Report JiraWorkLog - ${yaerMonth[0]}_${yaerMonth[1]}.xlsx`;

			const res = await fetch("http://localhost:3001/worklogFile/generateFile", {
				method: "POST",
				body: data,
			});

			if (!res.ok) {
				throw new Error(await res.text());
			}

			// // Assuming the response is a Blob containing the Excel file
			const blob = await res.blob();

			// Create a temporary link to trigger the download
			const link = document.createElement("a");
			link.href = window.URL.createObjectURL(blob);
			link.download = generateFileName;
			document.body.appendChild(link);

			// Trigger the download
			link.click();

			// Remove the temporary link
			document.body.removeChild(link);

			// Reload the window after download
			window.location.reload();
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<main>
			<form onSubmit={onSubmit}>
				<input type="file" name="file" onChange={(e) => setFile(e.target.files?.[0])} />
				<input type="submit" value="Submit" />
			</form>
		</main>
	);
}
