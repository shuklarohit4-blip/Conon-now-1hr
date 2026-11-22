import sharp from 'sharp';
import path from 'path';

const SRC = '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/.user_uploaded/media_1795242642462_0b66cefb.jpg';
const OUT_DIR = '/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/products/wood';
const SUBCAT_DIR = '/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/subcategories';

async function generateCleanBoard(card) {
  const { data, info } = await sharp(SRC)
    .extract({ left: card.x, top: card.y, width: card.w, height: card.h })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const boardLeft = card.boardLeft;
  const boardRight = card.boardRight;
  const boardTop = card.boardTop;
  const boardBottom = card.boardBottom;

  // Inpaint top-left if blue ribbon was there (y < 42, x < boardLeft + 22)
  if (card.inpaint) {
    for (let y = boardTop; y < 42; y++) {
      for (let x = boardLeft; x < boardLeft + 22; x++) {
        const idx = (y * width + x) * channels;
        const b = data[idx + 2], r = data[idx];
        if ((b > 130 && b > r + 25) || (r > 240 && b > 240)) {
          // Mirror from right side
          const srcX = boardRight - (x - boardLeft);
          const srcIdx = (y * width + srcX) * channels;
          data[idx] = data[srcIdx];
          data[idx + 1] = data[srcIdx + 1];
          data[idx + 2] = data[srcIdx + 2];
          data[idx + 3] = 255;
        }
      }
    }
  }

  // Clear everything outside the board rectangle
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      if (x < boardLeft || x > boardRight || y < boardTop || y > boardBottom) {
        data[idx + 3] = 0;
      }
    }
  }

  // Crop exact board rectangle
  const bw = boardRight - boardLeft + 1;
  const bh = boardBottom - boardTop + 1;
  const boardPng = await sharp(data, { raw: { width, height, channels } })
    .extract({ left: boardLeft, top: boardTop, width: bw, height: bh })
    .png()
    .toBuffer();

  // Fit within 360x360 with preserved aspect ratio
  const scale = Math.min(220 / bw, 360 / bh);
  const boardWidth = Math.round(bw * scale);
  const boardHeight = Math.round(bh * scale);

  const resizedBoard = await sharp(boardPng)
    .resize(boardWidth, boardHeight, { fit: 'contain' })
    .png()
    .toBuffer();

  // Place on a 400x400 transparent canvas
  const canvas = sharp({
    create: {
      width: 400,
      height: 400,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  const topOffset = Math.round((400 - boardHeight) / 2);
  const leftOffset = Math.round((400 - boardWidth) / 2);

  const finalImage = await canvas
    .composite([
      {
        input: resizedBoard,
        top: topOffset,
        left: leftOffset
      }
    ])
    .webp({ quality: 95 })
    .toBuffer();

  const outFile = path.join(OUT_DIR, card.id + '.webp');
  await sharp(finalImage).toFile(outFile);
  console.log('Generated clean packshot for:', card.id);
}

async function run() {
  await generateCleanBoard({
    id: 'archidply-pure-classic-mr-plywood',
    x: 260, y: 284, w: 146, h: 145,
    boardLeft: 37, boardRight: 109, boardTop: 16, boardBottom: 142,
    inpaint: true
  });
  await generateCleanBoard({
    id: 'archidply-pure-classic-plus-mr-plywood',
    x: 412, y: 284, w: 146, h: 145,
    boardLeft: 32, boardRight: 105, boardTop: 16, boardBottom: 142,
    inpaint: false
  });
  await generateCleanBoard({
    id: 'greenply-ecotec-mr-303-plywood',
    x: 565, y: 284, w: 146, h: 145,
    boardLeft: 33, boardRight: 94, boardTop: 18, boardBottom: 141,
    inpaint: true
  });
  await generateCleanBoard({
    id: 'greenply-ecotec-710-bwp-plywood',
    x: 718, y: 284, w: 146, h: 145,
    boardLeft: 25, boardRight: 93, boardTop: 16, boardBottom: 142,
    inpaint: false
  });

  // Extract the 3 subcategory icons
  await sharp(SRC)
    .extract({ left: 118, top: 194, width: 42, height: 42 })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(SUBCAT_DIR, 'plywood-blockboard-icon.webp'));

  await sharp(SRC)
    .extract({ left: 118, top: 244, width: 42, height: 42 })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(SUBCAT_DIR, 'hdhmr-mdf-icon.webp'));

  await sharp(SRC)
    .extract({ left: 118, top: 294, width: 42, height: 42 })
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(SUBCAT_DIR, 'laminates-icon.webp'));

  console.log('All packshots and icons generated successfully!');
}

run().catch(console.error);
