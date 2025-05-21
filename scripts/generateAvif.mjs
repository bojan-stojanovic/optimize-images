import path from 'path';
import sharp from 'sharp';
import fs from 'fs/promises';
import { 
    getFileList, 
    filterFilesByExtensions,
    ensureOutputDir, 
    logOptimizationResult,
    logProcessStart,
    logProcessComplete,
    INPUT_DIR
} from './imageUtils.mjs';

async function processFiles() {
    logProcessStart('AVIF generation');

    const files = await getFileList(INPUT_DIR);
    const imageFiles = filterFilesByExtensions(files, ['.jpg', '.jpeg', '.png']);

    if (imageFiles.length === 0) {
        console.log("\x1b[33mNo image files found in the input directory.\x1b[0m");
        return;
    }

    for (const file of imageFiles) {
        const filename = path.basename(file);
        const outputDir = await ensureOutputDir(file);
        const outputPath = `${outputDir}/${path.parse(file).name}.avif`;

        try {
            const origStats = await fs.stat(file);
            const origFileSize = origStats.size / 1024;

            const info = await sharp(file)
                .avif({
                    quality: 50,
                    chromaSubsampling: "4:2:0",
                    effort: 9,
                })
                .toFile(outputPath);

            const optFileSize = info.size / 1024;
            
            logOptimizationResult(filename, origFileSize, optFileSize);
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    logProcessComplete('AVIF generation');
}

processFiles().catch(err => console.error("An error occurred:", err));
