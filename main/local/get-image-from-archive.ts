import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".jpe", ".avif"];

const naturalSort = (a: any, b: any) => {
	return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
};
/**
 * Mengambil gambar dari arsip ZIP/CBZ berdasarkan ID.
 * @returns Array data URL gambar dalam arsip
 */
const getImagesFromArchive = (fullPath: string): string[] => {
	try {
		const archivePath = fullPath;
		// path.join(folderFullPath, archiveFile);

		if (!fs.existsSync(archivePath)) {
			throw new Error(`File not found: ${archivePath}`);
		}

		const zip = new AdmZip(archivePath);
		const zipEntries = zip.getEntries();

		const imageEntries = zipEntries
			.filter((entry) => {
				const ext = path.extname(entry.entryName).toLowerCase();
				return IMAGE_EXTENSIONS.includes(ext) && !entry.isDirectory;
			})
			.sort((a, b) => naturalSort(a.entryName, b.entryName));

		if (imageEntries.length === 0) {
			throw new Error("No images found in archive.");
		}

		return imageEntries.map((entry) => {
			const imageBuffer = zip.readFile(entry);
			if (!imageBuffer) throw new Error(`Failed to read file: ${entry.entryName}`);

			const ext = path.extname(entry.entryName).substring(1);
			return `data:image/${ext};base64,${imageBuffer.toString("base64")}`;
		});
	} catch (error) {
		console.error("Error reading archive:", error.message);
		return [];
	}
};

export { getImagesFromArchive };
