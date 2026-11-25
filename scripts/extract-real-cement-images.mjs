import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const userDir = '/Users/rohiitshukla/.gemini/antigravity/brain/81a133d5-a7f4-424b-ae4c-59dfc4a7998a/.user_uploaded';
const rootDir = '/Users/rohiitshukla/Downloads/Conon-Builder-Network 4';

const items = [
  // 1. CEMENT (10 items)
  {
    file: 'media_1795406912684_acfb1940.jpg',
    rect: { left: 265, top: 291, width: 137, height: 137 },
    out: 'artifacts/conon/public/images/products/cement/maha-ppc-cement-50kg.webp',
    name: 'Maha PPC Cement 50kg'
  },
  {
    file: 'media_1795406912684_acfb1940.jpg',
    rect: { left: 413, top: 291, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/cement/adani-acc-suraksha-power-ppc.webp',
    name: 'Adani ACC Suraksha Power PPC Cement'
  },
  {
    file: 'media_1795406912684_acfb1940.jpg',
    rect: { left: 561, top: 291, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/cement/ultratech-ppc-cement-50kg.webp',
    name: 'UltraTech PPC Cement 50kg'
  },
  {
    file: 'media_1795406912684_acfb1940.jpg',
    rect: { left: 709, top: 291, width: 137, height: 137 },
    out: 'artifacts/conon/public/images/products/cement/birla-white-cement-50kg.webp',
    name: 'Birla White Cement 50kg'
  },
  {
    file: 'media_1795406912676_9f9f7486.jpg',
    rect: { left: 295, top: 155, width: 147, height: 135 },
    out: 'artifacts/conon/public/images/products/cement/priya-opc-53-grade-cement-50kg.webp',
    name: 'Priya OPC 53 Grade Cement 50kg'
  },
  {
    file: 'media_1795406912676_9f9f7486.jpg',
    rect: { left: 443, top: 155, width: 147, height: 135 },
    out: 'artifacts/conon/public/images/products/cement/priya-ppc-cement-50kg.webp',
    name: 'Priya PPC Cement 50kg'
  },
  {
    file: 'media_1795406912676_9f9f7486.jpg',
    rect: { left: 591, top: 155, width: 147, height: 135 },
    out: 'artifacts/conon/public/images/products/cement/maha-cement-opc-53-grade-cement-50kg.webp',
    name: 'Maha Cement OPC 53 Grade 50kg'
  },
  {
    file: 'media_1795406912676_9f9f7486.jpg',
    rect: { left: 739, top: 155, width: 147, height: 135 },
    out: 'artifacts/conon/public/images/products/cement/ramco-supergrade-ppc-cement-50kg.webp',
    name: 'Ramco Supergrade PPC Cement 50kg'
  },
  {
    file: 'media_1795406912676_9f9f7486.jpg',
    rect: { left: 295, top: 437, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cement/birla-super-opc-53-grade-cement-50kg.webp',
    name: 'Birla Super OPC 53 Grade Cement 50kg'
  },
  {
    file: 'media_1795406912676_9f9f7486.jpg',
    rect: { left: 443, top: 437, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cement/ramco-cement-opc-53-grade-50kg.webp',
    name: 'Ramco Cement OPC 53 Grade 50kg'
  },

  // 2. SAND, PLASTER & MORTARS (5 items)
  {
    file: 'media_1795406912669_edd0755c.jpg',
    rect: { left: 295, top: 168, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/sand/truegrit-triple-washed-m-sand-25kg.webp',
    name: 'TRUEGRIT Triple Washed M-Sand 25kg'
  },
  {
    file: 'media_1795406912669_edd0755c.jpg',
    rect: { left: 443, top: 168, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/sand/alagar-super-plast-gypsum-plaster-25kg.webp',
    name: 'Alagar Super Plast Gypsum Plaster 25kg'
  },
  {
    file: 'media_1795406912669_edd0755c.jpg',
    rect: { left: 591, top: 168, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/sand/jsw-enduro-plast-ready-mix-plaster-40kg.webp',
    name: 'JSW Enduro Plast Ready Mix Plaster 40kg'
  },
  {
    file: 'media_1795406912669_edd0755c.jpg',
    rect: { left: 739, top: 168, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/sand/saint-gobain-gyproc-xpert-plus-gypsum-25kg.webp',
    name: 'Saint-Gobain Gyproc Xpert+ Gypsum 25kg'
  },
  {
    file: 'media_1795406912669_edd0755c.jpg',
    rect: { left: 295, top: 452, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/sand/jsw-block-grip-aac-block-jointing-mortar-40kg.webp',
    name: 'JSW Block Grip AAC Mortar 40kg'
  },

  // 3. MASONRY TOOLS & HARDWARE (22 items)
  // File 1: media_1795406912648_d4fbced7.jpg
  {
    file: 'media_1795406912648_d4fbced7.jpg',
    rect: { left: 295, top: 167, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/tools/taparia-claw-hammer-with-handle-340g.webp',
    name: 'Taparia Claw Hammer with Handle 340g'
  },
  {
    file: 'media_1795406912648_d4fbced7.jpg',
    rect: { left: 443, top: 167, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/tools/vertical-plumb-bob-leveling-tool.webp',
    name: 'Vertical Plumb Bob Leveling Tool'
  },
  {
    file: 'media_1795406912648_d4fbced7.jpg',
    rect: { left: 591, top: 167, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/tools/masonry-pinji-bricklayer-line-pins.webp',
    name: 'Masonry Pinji Bricklayer Line Pins'
  },
  {
    file: 'media_1795406912648_d4fbced7.jpg',
    rect: { left: 739, top: 167, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/tools/notched-trowel-plastering-gurumala.webp',
    name: 'Notched Trowel Plastering Gurumala'
  },
  {
    file: 'media_1795406912648_d4fbced7.jpg',
    rect: { left: 295, top: 437, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/taparia-club-hammer-with-handle-1kg.webp',
    name: 'Taparia Club Hammer 1KG'
  },
  {
    file: 'media_1795406912648_d4fbced7.jpg',
    rect: { left: 443, top: 437, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/taparia-ball-pein-hammer-with-handle-200g.webp',
    name: 'Taparia Ball Pein Hammer 200G'
  },

  // File 2: media_1795406912671_a4d73218.jpg
  {
    file: 'media_1795406912671_a4d73218.jpg',
    rect: { left: 295, top: 163, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/blue-tarpaulin-tirpal-110-gsm.webp',
    name: 'Blue Tarpaulin Tirpal 110 GSM'
  },
  {
    file: 'media_1795406912671_a4d73218.jpg',
    rect: { left: 443, top: 163, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/haks-plaster-trowel-gurmala-4x10.webp',
    name: 'Haks Plaster Trowel Gurmala 4x10'
  },
  {
    file: 'media_1795406912671_a4d73218.jpg',
    rect: { left: 591, top: 163, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/chicken-wire-mesh-20-gauge-3ft-2kg.webp',
    name: 'Chicken Wire Mesh 20 Gauge 3ft'
  },
  {
    file: 'media_1795406912671_a4d73218.jpg',
    rect: { left: 739, top: 163, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/freemans-ikon-steel-measuring-tape.webp',
    name: 'Freemans Ikon Steel Measuring Tape'
  },
  {
    file: 'media_1795406912671_a4d73218.jpg',
    rect: { left: 295, top: 433, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/freemans-spirit-level-aluminium-magnetic-30cm.webp',
    name: 'Freemans Spirit Level Magnetic 30cm'
  },
  {
    file: 'media_1795406912671_a4d73218.jpg',
    rect: { left: 443, top: 433, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/khurpi-scraper-steel-blade.webp',
    name: 'Khurpi Scraper Steel Blade'
  },
  {
    file: 'media_1795406912671_a4d73218.jpg',
    rect: { left: 591, top: 433, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/karni-masonry-trowel.webp',
    name: 'Karni Masonry Trowel'
  },
  {
    file: 'media_1795406912671_a4d73218.jpg',
    rect: { left: 739, top: 433, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/black-foam-cleaning-sponge-12pcs.webp',
    name: 'Black Foam Cleaning Sponge 12pcs'
  },

  // File 3: media_1795406912670_06be0fdc.jpg
  {
    file: 'media_1795406912670_06be0fdc.jpg',
    rect: { left: 295, top: 162, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/plastic-bandli-tasla-ghamela.webp',
    name: 'Plastic Bandli Tasla Ghamela Red'
  },
  {
    file: 'media_1795406912670_06be0fdc.jpg',
    rect: { left: 443, top: 162, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/iron-tasla-bandli-ghamela.webp',
    name: 'Iron Tasla Bandli Ghamela'
  },
  {
    file: 'media_1795406912670_06be0fdc.jpg',
    rect: { left: 591, top: 162, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/heavy-duty-wall-cutting-chisel.webp',
    name: 'Heavy Duty Wall Cutting Chisel'
  },
  {
    file: 'media_1795406912670_06be0fdc.jpg',
    rect: { left: 739, top: 162, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/wooden-gatta-supporting-wedges-100pcs.webp',
    name: 'Wooden Gatta Supporting Wedges 100pcs'
  },
  {
    file: 'media_1795406912670_06be0fdc.jpg',
    rect: { left: 295, top: 444, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/pvc-wall-plugs-gitti-box.webp',
    name: 'PVC Wall Plugs Gitti Box'
  },
  {
    file: 'media_1795406912670_06be0fdc.jpg',
    rect: { left: 443, top: 444, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/double-face-sledge-club-hammer.webp',
    name: 'Double Face Sledge Club Hammer'
  },
  {
    file: 'media_1795406912670_06be0fdc.jpg',
    rect: { left: 591, top: 444, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/floating-trowel-plasterers-float.webp',
    name: 'Floating Trowel Plasterers Float'
  },
  {
    file: 'media_1795406912670_06be0fdc.jpg',
    rect: { left: 739, top: 444, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/tools/l-square-try-square-2ft-angle-ruler.webp',
    name: 'L-Square Try Square 2FT Angle Ruler'
  },

  // 4. CHEMICALS
  {
    file: 'media_1795406912669_f13e122e.jpg',
    rect: { left: 295, top: 365, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/adhesives/fosroc-conbextra-gp2-cementitious-grout-25kg.webp',
    name: 'Fosroc Conbextra GP2 Cementitious Grout 25kg'
  }
];

async function processProduct(item) {
  const srcPath = path.join(userDir, item.file);
  const outPath = path.join(rootDir, item.out);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const rawCrop = await sharp(srcPath)
    .extract(item.rect)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = rawCrop.info.width;
  const h = rawCrop.info.height;
  const channels = rawCrop.info.channels;
  const buf = Buffer.from(rawCrop.data);

  // Erase top-left badge (blue badge or text)
  for (let y = 0; y < Math.min(32, h); y++) {
    for (let x = 0; x < Math.min(35, w); x++) {
      const idx = (y * w + x) * channels;
      if (buf[idx+2] > 160 && buf[idx] < 80) {
        buf[idx] = 255;
        buf[idx+1] = 255;
        buf[idx+2] = 255;
      }
      if (y < 26 && x < 28) {
        buf[idx] = 255;
        buf[idx+1] = 255;
        buf[idx+2] = 255;
      }
    }
  }

  // Erase bottom-right carousel dots
  for (let y = h - 15; y < h; y++) {
    for (let x = w - 40; x < w; x++) {
      const idx = (y * w + x) * channels;
      buf[idx] = 255;
      buf[idx+1] = 255;
      buf[idx+2] = 255;
    }
  }

  // Erase outer 2px boundary line
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x <= 1 || x >= w - 2 || y <= 1 || y >= h - 2) {
        const idx = (y * w + x) * channels;
        buf[idx] = 255;
        buf[idx+1] = 255;
        buf[idx+2] = 255;
      }
    }
  }

  // Convert raw buffer to PNG with trim
  const pngBuf = await sharp(buf, { raw: { width: w, height: h, channels } })
    .png()
    .toBuffer();

  const trimmedPng = await sharp(pngBuf)
    .trim({ background: '#ffffff', threshold: 12 })
    .toBuffer();

  await sharp({
    create: {
      width: 500,
      height: 500,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{
      input: await sharp(trimmedPng)
        .resize(420, 420, { fit: 'inside', background: '#ffffff' })
        .toBuffer(),
      gravity: 'centre'
    }])
    .webp({ quality: 92 })
    .toFile(outPath);

  console.log(`[OK] Saved: ${item.name} -> ${item.out}`);
}

async function copyRealChemicals() {
  const mappings = [
    {
      src: 'artifacts/conon/public/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp',
      dest: 'artifacts/conon/public/images/products/adhesives/dr-fixit-lw-plus-5l.webp'
    },
    {
      src: 'artifacts/conon/public/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp',
      dest: 'artifacts/conon/public/images/products/paint/dr-fixit-pidicrete-urp-1l.webp'
    },
    {
      src: 'artifacts/conon/public/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp',
      dest: 'artifacts/conon/public/images/products/paint/dr-fixit-fastflex-20kg.webp'
    }
  ];

  for (const m of mappings) {
    const srcPath = path.join(rootDir, m.src);
    const destPath = path.join(rootDir, m.dest);
    if (fs.existsSync(srcPath)) {
      // Re-center on 500x500 clean white background
      await sharp({
        create: {
          width: 500,
          height: 500,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
        .composite([{
          input: await sharp(srcPath).resize(420, 420, { fit: 'inside' }).toBuffer(),
          gravity: 'centre'
        }])
        .webp({ quality: 92 })
        .toFile(destPath);
      console.log(`[OK] Copied & formatted chemical: ${m.dest}`);
    }
  }
}

async function run() {
  console.log(`Extracting ${items.length} real product photos from screenshots...`);
  for (const item of items) {
    await processProduct(item);
  }
  await copyRealChemicals();
  console.log('All real product items extracted and updated successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
