import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

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

async function processFiles() {
    console.log("\x1b[36mGenerating webp started! \n\x1b[0m");

    const files = await getFileList(INPUT_DIR);

    // Filter relevant image files
    const imageFiles = files.filter(file =>
        /\.(jpg|jpeg|gif|png)$/i.test(path.extname(file))
    );

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    for (const file of imageFiles) {
        const _file = path.basename(file);
        const fileName = path.parse(file).name;
        const fileType = path.extname(file);
        const subDir = path.relative(INPUT_DIR, path.dirname(file));

        let outputDir = subDir ? `${OUTPUT_DIR}/${subDir}` : OUTPUT_DIR;

        // Ensure sub-directory exists
        await fs.mkdir(outputDir, { recursive: true });

        if ([".jpg", ".jpeg", ".gif", ".png"].includes(fileType)) {
            const origFileSize = +(await fs.stat(file)).size / 1024;
            const outputFilePath = `${outputDir}/${fileName}.webp`;

            try {
                const info = await sharp(file, fileType === ".gif" ? { animated: true } : {})
                    .webp({
                        quality: 60,
                        effort: 6,
                    })
                    .toFile(outputFilePath);

                const optFileSize = +info.size / 1024;
                const optPercentage = ((origFileSize - optFileSize) / origFileSize) * 100;

                console.log(
                    `${_file} size is reduced from \x1b[31m${origFileSize.toFixed(2)}kb\x1b[37m to \x1b[32m${optFileSize.toFixed(2)}kb\x1b[33m (${optPercentage.toFixed(2)}% saving!)\x1b[0m`
                );
            } catch (err) {
                console.error(`Error processing ${file}:`, err);
            }
        }
    }

    console.log("\n\x1b[32mGenerating webp images completed!\n\x1b[0m");
}

processFiles().catch(err => console.error("An error occurred:", err));