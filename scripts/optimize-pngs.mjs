import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const targetDirs = [
  'artifacts/conon/public/categories',
  'artifacts/conon/public/rentals',
  'artifacts/conon/public/images'
];

async function optimizeDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (!file.endsWith('.png')) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.size > 300 * 1024) {
      const beforeKB = Math.round(stat.size / 1024);
      try {
        const compressed = await sharp(fullPath)
          .png({ quality: 80, compressionLevel: 9, palette: true })
          .toBuffer();
        const afterKB = Math.round(compressed.length / 1024);
        if (compressed.length < stat.size) {
          fs.writeFileSync(fullPath, compressed);
          console.log(`[OPTIMIZED] ${file}: ${beforeKB} KB -> ${afterKB} KB (-${Math.round((1 - afterKB/beforeKB)*100)}%)`);
        } else {
          console.log(`[SKIPPED] ${file}: no reduction`);
        }
      } catch (err) {
        console.error(`[ERROR] ${file}: ${err.message}`);
      }
    }
  }
}

async function run() {
  console.log('🚀 Starting PNG optimization pass...');
  for (const dir of targetDirs) {
    await optimizeDir(dir);
  }
  console.log('✅ PNG optimization pass complete!');
}

run();
