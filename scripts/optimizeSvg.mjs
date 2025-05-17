import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

const INPUT_DIR = "./img_src";
const OUTPUT_DIR = "./img_dist";

// Get all files recursively
async function getFileList(dirName) {
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

async function processSvgFiles() {
    console.log("\x1b[36mSVG optimization started! \n\x1b[0m");

    const files = await getFileList(INPUT_DIR);

    // Filter SVG files only
    const svgFiles = files.filter(file =>
        /\.svg$/i.test(path.extname(file))
    );

    if (svgFiles.length === 0) {
        console.log("\x1b[33mNo SVG files found in the input directory.\x1b[0m");
        return;
    }

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    for (const file of svgFiles) {
        const _file = path.basename(file);
        const subDir = path.relative(INPUT_DIR, path.dirname(file));
        const outputDir = subDir ? `${OUTPUT_DIR}/${subDir}` : OUTPUT_DIR;

        // Ensure sub-directory exists
        await fs.mkdir(outputDir, { recursive: true });

        const inputFilePath = file;
        const outputFilePath = `${outputDir}/${_file}`;

        try {
            const origFileSize = (await fs.stat(file)).size / 1024;
            
            // Run svgo on the file
            await optimizeSvg(inputFilePath, outputFilePath);
            
            const optimizedFileSize = (await fs.stat(outputFilePath)).size / 1024;
            const savingPercentage = ((origFileSize - optimizedFileSize) / origFileSize) * 100;

            console.log(
                `${_file} size is reduced from \x1b[31m${origFileSize.toFixed(2)}kb\x1b[37m to \x1b[32m${optimizedFileSize.toFixed(2)}kb\x1b[33m (${savingPercentage.toFixed(2)}% saving!)\x1b[0m`
            );
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    console.log("\n\x1b[32mSVG optimization completed!\n\x1b[0m");
}

function optimizeSvg(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const svgo = spawn('npx', ['svgo', '-i', inputPath, '-o', outputPath]);
        
        svgo.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`SVGO process exited with code ${code}`));
            }
        });
        
        svgo.on('error', (err) => {
            reject(err);
        });
    });
}

processSvgFiles().catch(err => console.error("An error occurred:", err));