import path from 'path';
import fs from 'fs/promises';
import { optimize } from 'svgo';
import { 
    getFileList, 
    filterFilesByExtensions,
    ensureOutputDir, 
    logOptimizationResult,
    logProcessStart,
    logProcessComplete,
    INPUT_DIR
} from './imageUtils.mjs';

async function optimizeSvg(inputPath, outputPath) {
    const data = await fs.readFile(inputPath, 'utf8');
    const result = optimize(data);
    await fs.writeFile(outputPath, result.data, 'utf8');
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
