import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

const naturalSort = (a: any, b: any) => {
	return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
};

/**
 * Mengambil daftar semua arsip ZIP/CBZ dalam folder dan mengembalikan jumlahnya.
 * @returns Jumlah total arsip dalam folder
 */
const getMaxId = (basePath: string, folderPath: string): number => {
	const folderFullPath = path.normalize(path.join(basePath, folderPath));

	if (!fs.existsSync(folderFullPath)) {
		throw new Error(`Folder not found: ${folderFullPath}`);
	}

	const archiveFiles = fs
		.readdirSync(folderFullPath)
		.filter((file) => [".zip", ".cbz"].includes(path.extname(file).toLowerCase()));

	return archiveFiles.length;
};

/**
 * Mengambil daftar semua arsip dengan ID dan judul.
 * @returns Array objek dengan { id, title }
 */
const getAllArchiveTitleById = (basePath: string, folderPath: string): { id: number; title: string }[] => {
	const folderFullPath = path.normalize(path.join(basePath, folderPath));

	if (!fs.existsSync(folderFullPath)) {
		throw new Error(`Folder not found: ${folderFullPath}`);
	}

	const archiveFiles = fs
		.readdirSync(folderFullPath)
		.filter((file) => [".zip", ".cbz"].includes(path.extname(file).toLowerCase()))
		.sort(naturalSort);

	return archiveFiles.map((file, index) => ({ id: index, title: file }));
};

/**
 * Mengambil gambar dari arsip ZIP/CBZ berdasarkan ID.
 * @returns Array data URL gambar dalam arsip
 */
const getImagesFromArchive = (basePath: string, folderPath: string, id: number): string[] => {
	try {
		const folderFullPath = path.normalize(path.join(basePath, folderPath));

		if (!fs.existsSync(folderFullPath)) {
			throw new Error(`Folder not found: ${folderFullPath}`);
		}

		const archiveFiles = fs
			.readdirSync(folderFullPath)
			.filter((file) => [".zip", ".cbz"].includes(path.extname(file).toLowerCase()))
			.sort(naturalSort);

		if (id < 0 || id >= archiveFiles.length) {
			throw new Error(`Invalid archive ID: ${id}`);
		}

		const archiveFile = archiveFiles[id];
		const archivePath = path.join(folderFullPath, archiveFile);

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

export { getImagesFromArchive, getMaxId, getAllArchiveTitleById };
