import fs from "fs/promises";
import path from "path";

// Common utility functions shared across scripts
export const INPUT_DIR = "./img_src";
export const OUTPUT_DIR = "./img_dist";

// Get all files recursively
export async function getFileList(dirName) {
    let files = [];
    const items = await fs.readdir(dirName, { withFileTypes: true });

    for (const item of items) {
        const fullPath = `${dirName}/${item.name}`;
        if (item.isDirectory()) {
            files.push(...await getFileList(fullPath));
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

// Filter files by extensions
export function filterFilesByExtensions(files, extensions) {
    return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return extensions.includes(ext);
    });
}

// Ensure output directory exists
export async function ensureOutputDir(inputPath) {
    const subDir = path.relative(INPUT_DIR, path.dirname(inputPath));
    const outputDir = subDir ? `${OUTPUT_DIR}/${subDir}` : OUTPUT_DIR;
    
    await fs.mkdir(outputDir, { recursive: true });
    return outputDir;
}

// Log optimization results
export function logOptimizationResult(filename, origSize, newSize) {
    const savingPercentage = ((origSize - newSize) / origSize) * 100;
    
    console.log(
        `${filename} size is reduced from \x1b[31m${origSize.toFixed(2)}kb\x1b[37m to \x1b[32m${newSize.toFixed(2)}kb\x1b[33m (${savingPercentage.toFixed(2)}% saving!)\x1b[0m`
    );
}

// Log process start
export function logProcessStart(processName) {
    console.log(`\x1b[36m${processName} started! \n\x1b[0m`);
}

// Log process completion
export function logProcessComplete(processName) {
    console.log(`\n\x1b[32m${processName} completed!\n\x1b[0m`);
}