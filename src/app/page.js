"use client";

import { useState } from "react";

export default function Home() {
	const [file, setFile] = useState();

	const onSubmit = async (e) => {
		e.preventDefault();
		if (!file) return;

		try {
			const data = new FormData();
			data.set("file", file);

			console.log("file", file);

			const res = await fetch("http://localhost:3001/worklogFile/generateFile", {
				method: "POST",
				headers: {
					"Content-Type": "multipart/form-data; boundary=<calculated when request is sent>",
				},
				body: { file: data },
			});

      console.log('res',res)

			// handle the error
			if (!res.ok) throw new Error(await res.text());
		} catch (e) {
			// Handle errors here
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
