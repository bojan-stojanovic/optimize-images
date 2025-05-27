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
    INPUT_DIR,
    OUTPUT_DIR
} from './imageUtils.mjs';

async function processFiles() {
    logProcessStart('Image optimization');

    const files = await getFileList(INPUT_DIR);
    const imageFiles = filterFilesByExtensions(files, ['.jpg', '.jpeg', '.png', '.gif']);

    if (imageFiles.length === 0) {
        console.log("\x1b[33mNo image files found in the input directory.\x1b[0m");
        return;
    }

    // Ensure main output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    for (const file of imageFiles) {
        const filename = path.basename(file);
        const fileType = path.extname(file).toLowerCase();
        const outputDir = await ensureOutputDir(file);
        const outputPath = path.join(outputDir, filename);

        try {
            const origStats = await fs.stat(file);
            const origFileSize = origStats.size / 1024;

            let processedFile;
            if (fileType === '.jpg' || fileType === '.jpeg') {
                processedFile = sharp(file)
                    .jpeg({
                        quality: 75, // quality, integer 1-100
                        mozjpeg: true,
                        progressive: true,
                    });
            } else if (fileType === '.png') {
                processedFile = sharp(file)
                    .png({
                        compressionLevel: 9, // zlib compression level, 0 (fastest, largest) to 9 (slowest, smallest)
                        effort: 10, // CPU effort, between 1 (fastest) and 10 (slowest)
                        progressive: true,
                        quality: 75, // use the lowest number of colours needed to achieve given quality
                    });
            } else {
              processedFile = sharp(file, { animated: true })
                .gif({
                    effort: 10, // CPU effort, between 1 (fastest) and 10 (slowest)
                    loop: 0,
                });
            }

            const info = await processedFile.toFile(outputPath);
            const optFileSize = info.size / 1024;

            logOptimizationResult(filename, origFileSize, optFileSize);
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    logProcessComplete('Optimize images task');
}

processFiles().catch(err => console.error("An error occurred:", err));
