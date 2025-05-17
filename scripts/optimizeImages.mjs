import { promises as fsPromises } from 'fs';
import path from 'path';
import sharp from 'sharp';

const INPUT_DIR = './img_src';
const OUTPUT_DIR = './img_dist';

// Get all files recursively
async function getFileList(dirName) {
    let files = [];
    const items = await fsPromises.readdir(dirName, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            files.push(...await getFileList(`${dirName}/${item.name}`));
        } else {
            files.push(`${dirName}/${item.name}`);
        }
    }

    return files;
}

async function processFiles(files) {
    console.log("\x1b[36mImage optimization started! \n\x1b[0m");

    const imageFiles = files.filter(
        (file) => /\.(jpg|jpeg|png)$/i.test(file)
    );

    await fsPromises.mkdir(OUTPUT_DIR, { recursive: true });

    for (const file of imageFiles) {
        const _file = path.basename(file);
        const fileType = path.extname(file).toLowerCase();
        const subDir = path.relative(INPUT_DIR, path.dirname(file));
        const outputDir = path.join(OUTPUT_DIR, subDir);

        await fsPromises.mkdir(outputDir, { recursive: true });

        try {
            const origStats = await fsPromises.stat(file);
            const origFileSize = (origStats.size / 1024).toFixed(2);

            let processedFile;
            if (fileType === '.jpg' || fileType === '.jpeg') {
                processedFile = sharp(file)
                    .jpeg({
                        quality: 75,
                        mozjpeg: true,
                        progressive: true,
                    });
            } else if (fileType === '.png') {
                processedFile = sharp(file)
                    .png({
                        compressionLevel: 9,
                        effort: 10,
                        progressive: true,
                        quality: 75,
                    });
            }

            const info = await processedFile.toFile(path.join(outputDir, _file));
            const optFileSize = (info.size / 1024).toFixed(2);
            const optPercentage = (((origFileSize - optFileSize) / origFileSize) * 100).toFixed(2);

            console.log(
                `${_file} size is reduced from \x1b[31m${origFileSize}kb\x1b[0m to \x1b[32m${optFileSize}kb\x1b[33m (${optPercentage}% saving!)\x1b[0m`
            );

        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    console.log("\n\x1b[32mOptimize images task completed!\n\x1b[0m");
}

getFileList(INPUT_DIR)
    .then(processFiles)
    .catch(err => console.error("An error occurred:", err));
