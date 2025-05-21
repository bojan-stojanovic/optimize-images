import path from 'path';
import { spawn } from 'child_process';
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

async function processSvgFiles() {
    logProcessStart('SVG optimization');

    const files = await getFileList(INPUT_DIR);
    const svgFiles = filterFilesByExtensions(files, ['.svg']);

    if (svgFiles.length === 0) {
        console.log("\x1b[33mNo SVG files found in the input directory.\x1b[0m");
        return;
    }

    for (const file of svgFiles) {
        const filename = path.basename(file);
        const outputDir = await ensureOutputDir(file);
        const outputPath = path.join(outputDir, filename);

        try {
            const origStats = await fs.stat(file);
            const origFileSize = origStats.size / 1024;
            
            await optimizeSvg(file, outputPath);
            
            const optimizedStats = await fs.stat(outputPath);
            const optimizedFileSize = optimizedStats.size / 1024;
            
            logOptimizationResult(filename, origFileSize, optimizedFileSize);
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    logProcessComplete('SVG optimization');
}

processSvgFiles().catch(err => console.error("An error occurred:", err));
