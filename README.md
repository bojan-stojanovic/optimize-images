# Optimize Images

A Node.js toolkit for optimizing images and generating next-gen formats using the [sharp](https://sharp.pixelplumbing.com/ "sharp - High performance Node.js image processing") library and [SVGO](https://github.com/svg/svgo) for SVG optimization.

## Overview

This project provides a set of scripts to:
- Optimize JPG, JPEG, PNG and GIF images with reduced file size while maintaining quality
- Convert images to next-gen formats (WebP and AVIF) for better web performance
- Convert GIF animations to animated WebP for better performance
- Optimize SVG files to reduce their size

## Supported File Types

| File Type | Optimization | WebP Conversion | AVIF Conversion |
|-----------|:------------:|:---------------:|:---------------:|
| JPG/JPEG  | ✅           | ✅              | ✅              |
| PNG       | ✅           | ✅              | ✅              |
| GIF       | ✅           | ✅ (animated)   | -               |
| SVG       | ✅           | -               | -               |

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone this repository
2. Install dependencies using your preferred package manager:

   With npm:
   ```
   npm install
   ```

   With yarn:
   ```
   yarn install
   ```

   With pnpm:
   ```
   pnpm install
   ```

   With bun:
   ```
   bun install
   ```

### Usage

1. Place your source images in the `img_src` directory
2. Run the desired script(s)
3. Optimized images will be saved to the `img_dist` directory

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run optimize` | Optimizes JPG, JPEG, PNG and GIF images with reduced file size |
| `npm run webp` | Generates WebP versions of JPG, JPEG, PNG, and animated GIF images |
| `npm run avif` | Generates AVIF versions of JPG, JPEG, and PNG images |
| `npm run svg` | Optimizes SVG images using SVGO |
| `npm run all` | Runs all the above scripts in sequence |

You can also use yarn, pnpm, or bun instead of npm:
- `yarn optimize`, `pnpm optimize`, `bun run optimize`
- `yarn webp`, `pnpm webp`, `bun run webp`
- etc.

### Examples

To optimize all JPG, JPEG, PNG and GIF images:
```
npm run optimize
```

To generate WebP versions of all images (including animated WebP from GIFs):
```
npm run webp
```

To optimize SVG files:
```
npm run svg
```

To run all optimization scripts:
```
npm run all
```

## Configuration

The scripts use the following default settings:

- Input directory: `./img_src`
- Output directory: `./img_dist`
- JPG/JPEG optimization: 75% quality with mozjpeg and progressive encoding
- PNG optimization: Level 9 compression with effort 10
- GIF optimization: With effort 10
- WebP conversion: 60% quality with effort 6
- Animated WebP (from GIF): 60% quality with effort 6, preserving animation
- AVIF conversion: 50% quality with 4:2:0 chroma subsampling and effort 9
- SVG optimization: Uses default SVGO settings with viewBox preservation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
