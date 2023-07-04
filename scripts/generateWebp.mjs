import fs from "fs";
import { readdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const INPUT_DIR = "./img_src";
const OUTPUT_DIR = "./img_dist";
let counter = 0;

// get all files recursively
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
    console.log("\x1b[36mGenerating webp started! \n\x1b[0m");

    // get number of jpg, jpeg and png files
    const filesNumber = [...files.filter(item => item.split(".").pop() === "jpg" || item.split(".").pop() === "jpeg" || item.split(".").pop() === "png")].length;

    // create outupt directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR)
    }

    for (const file of files) {
        const _file = file.split("/").pop(); // get file name without path
        const fileName = path.parse(file).name; // get file name without path and extension
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

        // dynamically change output directory
        if (subDir === INPUT_DIR) {
            outputDir = OUTPUT_DIR + "/";
        } else {
            outputDir = OUTPUT_DIR + subDir + "/";
        }

        // process jpg, jpeg and png files into webp
        if (fileType === ".jpg" || fileType === ".jpeg" || fileType === ".png") {
            sharp(file)
                .webp({
                    quality: 75,
                    effort: 6
                })
                .toFile(outputDir + fileName + ".webp", (err, info) => {
                    const optFileSize = +((info.size / 1024).toFixed(2));
                    const optPercentage = +(((optFileSize / origFileSize) * 100).toFixed(2));

                    // log file size reduction
                    console.log(`${_file} size is reduced from \x1b[31m${origFileSize}kb \x1b[37mto \x1b[32m${optFileSize}kb \x1b[33m(${optPercentage}% saving!)\x1b[0m`);

                    taskDone(filesNumber);
                });
        }
    }
});

// log message once processing of files is done
function taskDone(filesNumber) {
    counter++;

    if (counter === filesNumber) {
        console.log("\n\x1b[32mGenerating webp images completed!\n\x1b[0m");
    }
}
