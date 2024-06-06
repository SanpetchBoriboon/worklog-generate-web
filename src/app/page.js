"use client";

import { useState } from "react";
import * as ExcelJS from "exceljs";
import * as dateFns from "date-fns";

export default function Home() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files?.[0];
        setFile(uploadedFile);

        // Optionally, you can read the contents of the file here and convert it to JSON
        if (uploadedFile) {
            convertExcelToJson(uploadedFile);
        }
    };

    const convertExcelToJson = async (uploadedFile) => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(uploadedFile);

        const originalData = [];

        workbook.eachSheet((sheet, sheetId) => {
            sheet.eachRow((row, rowNumber) => {
                const rowData = {};

                row.eachCell((cell, colNumber) => {
                    rowData[`Column${colNumber}`] = cell.value;
                });

                originalData.push(rowData);
            });
        });

        // Extract header row
        const headerRow = originalData[0];

        // Convert columns to desired format using map
        const convertedData = originalData.slice(1).map((row) => {
            return Object.fromEntries(Object.entries(row).map(([key, value]) => [headerRow[key], value]));
        });
        return convertedData;
    };

    const generateExcelFile = async () => {
        const fileBuffer = await file.arrayBuffer();
        const jsonData = await convertExcelToJson(fileBuffer);
        const yaerMonth = file.name.split("_")[1].split("-");
        const fileName = `Report JiraWorkLog - ${yaerMonth[0]}_${yaerMonth[1]}`;

        const worklogSheet = jsonData
            .sort((a, b) => {
                return new Date(a["Started at"]).valueOf() - new Date(b["Started at"]).valueOf();
            })
            .map((col) => {
                let timeSpent = col["Time Spent (seconds)"] / 3600;
                const worklogCol = {};
                worklogCol["Name"] = col["Author"];
                worklogCol["ISSUEKEY"] = col["Issue Key"];
                worklogCol["Subtask Name"] = col["Issue Summary"];
                worklogCol["Description"] = col["Comment"];
                worklogCol["Date"] = dateFns.format(new Date(col["Started at"]), "dd/MM/yyyy");
                worklogCol["Time Spent"] = timeSpent.toFixed(1) + "h";
                return worklogCol;
            });

        let rows = [];

        for (const doc of worklogSheet) {
            rows.push(Object.values(doc));
        }

        const workbook = new ExcelJS.Workbook();
        let sheet = workbook.addWorksheet(`sheet1`);
        rows.unshift(Object.keys(worklogSheet[0]));
        sheet.addRows(rows);

        // Generate the Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${fileName}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!file) return;

        try {
            setLoading(true);
            await generateExcelFile();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);

            // reload window when download success
            window.location.reload();
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
                                <label className="flex flex-col w-full h-32 border-4 border-blue-200 border-dashed hover:bg-green-100 hover:border-green-600">
                                    <div
                                        className="flex flex-col items-center justify-center pt-7"
                                        style={{ cursor: "pointer" }}
                                    >
                                        {file ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-8 h-8 text-green-400 group-hover:text-green-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 13l4 4L19 7"
                                                />
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
                                    <input type="file" name="file" onChange={handleFileChange} className="opacity-0" />
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-center p-2">
                            <button
                                className={`w-full px-4 py-2 text-white ${
                                    file && !loading ? "bg-green-500" : "bg-gray-500"
                                } rounded shadow-x`}
                                type="submit"
                                disabled={!file || loading}
                                style={!file ? { cursor: "not-allowed" } : { cursor: "pointer" }}
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
