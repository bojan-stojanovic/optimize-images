import fs from "fs";
import { readdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const INPUT_DIR = "./img_src";
const OUTPUT_DIR = "./img_dist";
let counter = 0;

const getFileList = async (dirName) => {
    let files = [];
    const items = await readdir(dirName, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            files = [
                ...files,
                ...(await getFileList(`${dirName}/${item.name}`)),
            ];
        } else {
            files.push(`${dirName}/${item.name}`);
        }
    }

    return files;
};

getFileList(INPUT_DIR).then((files) => {
    console.log("\x1b[36mImage optimization started! \n\x1b[0m");

    const filesNumber = [...files.filter(item => item.split(".").pop() === "jpg" || item.split(".").pop() === "jpeg" || item.split(".").pop() === "png")].length;

    // create outupt directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR)
    }

    for (const file of files) {
        const _file = file.split("/").pop(); // get file without path
        const fileType = path.extname(file); // get file type
        const subDir = path.dirname(file).split(INPUT_DIR).join(""); // get sub-directory name

        let outputDir;
        let origFileSize;

        // get original file size before optimization
        if (fileType !== "") {
            origFileSize = +((fs.statSync(file).size / 1024).toFixed(2));
        }

        // create sub-directory if it doesn't exist
        if (!fs.existsSync(OUTPUT_DIR + subDir) && subDir !== INPUT_DIR) {
            fs.mkdirSync(OUTPUT_DIR + subDir, {
                recursive: true,
            });
        }

        if (subDir === INPUT_DIR) {
            outputDir = OUTPUT_DIR + "/";
        } else {
            outputDir = OUTPUT_DIR + subDir + "/";
        }

        if (fileType === ".jpg" || fileType === ".jpeg") {
            sharp(file)
                .jpeg({
                    quality: 75,
                    mozjpeg: true
                })
                .toFile(outputDir + _file, (err, info) => {
                    const optFileSize = +((info.size / 1024).toFixed(2));
                    const optPercentage = +(((optFileSize / origFileSize) * 100).toFixed(2));

                    console.log(`${_file} size is reduced from \x1b[31m${origFileSize}kb \x1b[0mto \x1b[32m${optFileSize}kb \x1b[33m(${optPercentage}% saving!)\x1b[0m`);

                    taskDone(filesNumber);
                });
        }

        if (fileType === ".png") {
            sharp(file)
                .png({
                    compressionLevel: 9,
                    effort: 10
                })
                .toFile(outputDir + _file, (err, info) => {
                    const optFileSize = +((info.size / 1024).toFixed(2));
                    const optPercentage = +(((optFileSize / origFileSize) * 100).toFixed(2));

                    console.log(`${_file} size is reduced from \x1b[31m${origFileSize}kb \x1b[0mto \x1b[32m${optFileSize}kb \x1b[33m(${optPercentage}% saving!)\x1b[0m`);

                    taskDone(filesNumber);
                });
        }
    }
});

function taskDone(filesNumber) {
    counter++;

    if (counter === filesNumber) {
        console.log("\n\x1b[32mOptimize images task completed!\n\x1b[0m")
    }
}
