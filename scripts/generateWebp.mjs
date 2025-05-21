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
    logProcessStart('WebP generation');

    const files = await getFileList(INPUT_DIR);
    const imageFiles = filterFilesByExtensions(files, ['.jpg', '.jpeg', '.png', '.gif']);

    if (imageFiles.length === 0) {
        console.log("\x1b[33mNo image files found in the input directory.\x1b[0m");
        return;
    }

    for (const file of imageFiles) {
        const filename = path.basename(file);
        const fileType = path.extname(file).toLowerCase();
        const outputDir = await ensureOutputDir(file);
        const outputPath = `${outputDir}/${path.parse(file).name}.webp`;

        try {
            const origStats = await fs.stat(file);
            const origFileSize = origStats.size / 1024;

            let sharpInstance;
            let webpOptions = {
                quality: 60,
                effort: 6
            };
            
            // Special handling for GIF files
            if (fileType === '.gif') {
                sharpInstance = sharp(file, { animated: true });
                // Add loop: 0 for infinite looping in animated WebP
                webpOptions.loop = 0;
                webpOptions.animationMode = 'loop';
            } else {
                sharpInstance = sharp(file);
            }

            const info = await sharpInstance
                .webp(webpOptions)
                .toFile(outputPath);

            const optFileSize = info.size / 1024;
            
            logOptimizationResult(filename, origFileSize, optFileSize);
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    logProcessComplete('WebP generation');
}

processFiles().catch(err => console.error("An error occurred:", err));
