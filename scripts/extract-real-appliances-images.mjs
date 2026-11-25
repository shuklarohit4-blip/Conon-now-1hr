import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const userDir = '/Users/rohiitshukla/.gemini/antigravity/brain/81a133d5-a7f4-424b-ae4c-59dfc4a7998a/.user_uploaded';
const rootDir = '/Users/rohiitshukla/Downloads/Conon-Builder-Network 4';

const items = [
  // 1. CEILING FANS (6 products)
  {
    file: 'media_1795400914329_d50d9618.jpg',
    rect: { left: 295, top: 155, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/crompton-surebreeze-star-drift.webp',
    name: 'Crompton Surebreeze Star Drift 1200mm'
  },
  {
    file: 'media_1795400914329_d50d9618.jpg',
    rect: { left: 443, top: 155, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/gm-airmtx-1200mm.webp',
    name: 'GM AirMTX 1200mm Ceiling Fan'
  },
  {
    file: 'media_1795400914329_d50d9618.jpg',
    rect: { left: 591, top: 155, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/atomberg-renesa-prime-crest.webp',
    name: 'Atomberg Renesa Prime Crest 1200mm'
  },
  {
    file: 'media_1795400914329_d50d9618.jpg',
    rect: { left: 739, top: 155, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/crompton-energion-elevate.webp',
    name: 'Crompton Energion Elevate 1200mm'
  },
  {
    file: 'media_1795400914329_d50d9618.jpg',
    rect: { left: 295, top: 419, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/atomberg-renesa-halo-smart.webp',
    name: 'Atomberg Renesa Halo Smart 1200mm'
  },
  {
    file: 'media_1795400914329_d50d9618.jpg',
    rect: { left: 443, top: 419, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/modular-fan-cover-cap.webp',
    name: 'Modular Fan Cover Cap'
  },

  // 2. CHIMNEY (6 products)
  {
    file: 'media_1795400914325_8fb8d8e3.jpg',
    rect: { left: 295, top: 219, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/faber-hood-class-pro.webp',
    name: 'Faber Hood Class Pro 60 cm'
  },
  {
    file: 'media_1795400914325_8fb8d8e3.jpg',
    rect: { left: 443, top: 219, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/faber-slim-x-safe.webp',
    name: 'Faber Slim X Safe Filterless Autoclean'
  },
  {
    file: 'media_1795400914325_8fb8d8e3.jpg',
    rect: { left: 591, top: 219, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/faber-hood-glory-bldc.webp',
    name: 'Faber Hood Glory BLDC 60 cm'
  },
  {
    file: 'media_1795400914325_8fb8d8e3.jpg',
    rect: { left: 739, top: 219, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/faber-hood-comet-bldc.webp',
    name: 'Faber Hood Comet BLDC 60 cm'
  },
  {
    file: 'media_1795400914325_8fb8d8e3.jpg',
    rect: { left: 295, top: 501, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/faber-hood-dazzle.webp',
    name: 'Faber Hood Dazzle BLDC 60 cm'
  },
  {
    file: 'media_1795400914325_8fb8d8e3.jpg',
    rect: { left: 443, top: 501, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/faber-duct-pipe.webp',
    name: 'Faber Aluminium Duct Pipe Kit'
  },

  // 3. PEDESTAL FANS (3 products)
  {
    file: 'media_1795400914282_4701632d.jpg',
    rect: { left: 295, top: 227, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/atomberg-silenceaire-pedestal-fan.webp',
    name: 'Atomberg SilenceAire 400mm Pedestal Fan'
  },
  {
    file: 'media_1795400914282_4701632d.jpg',
    rect: { left: 443, top: 227, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/atomberg-renesa-pedestal-fan.webp',
    name: 'Atomberg Renesa 400mm Pedestal Fan'
  },
  {
    file: 'media_1795400914282_4701632d.jpg',
    rect: { left: 591, top: 227, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/orient-stand-31-neo.webp',
    name: 'Orient Stand 31 Neo 400MM Pedestal Fan'
  },

  // 4. EXHAUST (2 products)
  {
    file: 'media_1795400914322_34569aef.jpg',
    rect: { left: 295, top: 251, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/crompton-brisk-air-plus.webp',
    name: 'Crompton Brisk Air Plus Exhaust Fan'
  },
  {
    file: 'media_1795400914322_34569aef.jpg',
    rect: { left: 443, top: 251, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/atomberg-efficio-exhaust-fan.webp',
    name: 'Atomberg Efficio 150mm Exhaust Fan'
  },

  // 5. WATER HEATER & GEYSER (8 products)
  {
    file: 'media_1795400914329_26d152dd.jpg',
    rect: { left: 295, top: 155, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/gm-aeris-plus-15l.webp',
    name: 'GM Modular Aeris Plus 15L'
  },
  {
    file: 'media_1795400914329_26d152dd.jpg',
    rect: { left: 443, top: 155, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/racold-cdr-dlx-plus-15l.webp',
    name: 'Racold CDR DLX Plus 15L'
  },
  {
    file: 'media_1795400914329_26d152dd.jpg',
    rect: { left: 591, top: 155, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/ao-smith-elegance-prime-15l.webp',
    name: 'AO Smith Elegance Prime Neo 15L'
  },
  {
    file: 'media_1795400914329_26d152dd.jpg',
    rect: { left: 739, top: 155, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/crompton-classic-neo-15l.webp',
    name: 'Crompton Classic Neo 15L'
  },
  {
    file: 'media_1795400914329_26d152dd.jpg',
    rect: { left: 295, top: 449, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/gm-fogo-3l-instant.webp',
    name: 'GM Fogo 3L Instant Geyser'
  },
  {
    file: 'media_1795400914329_26d152dd.jpg',
    rect: { left: 443, top: 449, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/ao-smith-fast-on-3l.webp',
    name: 'AO Smith FAST-ON 3L'
  },
  {
    file: 'media_1795400914329_26d152dd.jpg',
    rect: { left: 591, top: 449, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/crompton-solarium-neo-3l.webp',
    name: 'Crompton Solarium Neo 3L'
  },
  {
    file: 'media_1795400914329_26d152dd.jpg',
    rect: { left: 739, top: 449, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/racold-cdr-horizontal-15l.webp',
    name: 'Racold CDR DLX Horizontal 15L'
  },

  // 6. UPS, INVERTER & BATTERIES (8 products)
  {
    file: 'media_1795400914330_75a57e7e.jpg',
    rect: { left: 295, top: 168, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/luminous-eco-volt-1050.webp',
    name: 'Luminous Eco Volt Neo 1050'
  },
  {
    file: 'media_1795400914330_75a57e7e.jpg',
    rect: { left: 443, top: 168, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/luminous-eco-volt-850.webp',
    name: 'Luminous Eco Volt Neo 850'
  },
  {
    file: 'media_1795400914330_75a57e7e.jpg',
    rect: { left: 591, top: 168, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/luminous-eco-volt-1550.webp',
    name: 'Luminous Eco Volt Neo 1550'
  },
  {
    file: 'media_1795400914330_75a57e7e.jpg',
    rect: { left: 739, top: 168, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/luminous-rc-18000st.webp',
    name: 'Luminous Red Charge RC 18000ST 150Ah'
  },
  {
    file: 'media_1795400914330_75a57e7e.jpg',
    rect: { left: 295, top: 438, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/luminous-rc-18000-tall.webp',
    name: 'Luminous Red Charge RC 18000 Tall'
  },
  {
    file: 'media_1795400914330_75a57e7e.jpg',
    rect: { left: 443, top: 438, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/luminous-rc-15000-pro.webp',
    name: 'Luminous Red Charge RC 15000 Pro'
  },
  {
    file: 'media_1795400914330_75a57e7e.jpg',
    rect: { left: 591, top: 438, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/luminous-tx100l-trolley.webp',
    name: 'Luminous TX100L Trolley'
  },
  {
    file: 'media_1795400914330_75a57e7e.jpg',
    rect: { left: 739, top: 438, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/v-guard-vg400-stabilizer.webp',
    name: 'V-Guard VG 400 Voltage Stabilizer'
  },

  // 7. PUMPS & MOTORS (3 products)
  {
    file: 'media_1795400914331_3672a74b.jpg',
    rect: { left: 295, top: 464, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/v-guard-pressure-booster-pump.webp',
    name: 'V-Guard Pressure Booster Pump 1 HP'
  },
  {
    file: 'media_1795400914331_3672a74b.jpg',
    rect: { left: 443, top: 464, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/grundfos-cm-booster-09hp.webp',
    name: 'Grundfos CM Booster 24L 0.9 HP'
  },
  {
    file: 'media_1795400914331_3672a74b.jpg',
    rect: { left: 591, top: 464, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/grundfos-cm-booster-07hp.webp',
    name: 'Grundfos CM Booster 24L 0.7 HP'
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

async function extractSubcatIcons() {
  const iconTargets = [
    {
      file: 'media_1795400914329_d50d9618.jpg',
      rect: { left: 154, top: 168, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/ceiling-fans-icon.webp',
      name: 'Ceiling Fans Icon'
    },
    {
      file: 'media_1795400914329_d50d9618.jpg',
      rect: { left: 154, top: 217, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/chimney-icon.webp',
      name: 'Chimney Icon'
    },
    {
      file: 'media_1795400914329_d50d9618.jpg',
      rect: { left: 154, top: 265, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/pedestal-fans-icon.webp',
      name: 'Pedestal Fans Icon'
    },
    {
      file: 'media_1795400914329_d50d9618.jpg',
      rect: { left: 154, top: 314, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/exhaust-icon.webp',
      name: 'Exhaust Icon'
    },
    {
      file: 'media_1795400914329_d50d9618.jpg',
      rect: { left: 154, top: 362, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/water-heater-geyser-icon.webp',
      name: 'Water Heater Icon'
    },
    {
      file: 'media_1795400914329_d50d9618.jpg',
      rect: { left: 154, top: 411, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/ups-inverter-batteries-icon.webp',
      name: 'UPS Inverter Icon'
    },
    {
      file: 'media_1795400914329_d50d9618.jpg',
      rect: { left: 154, top: 460, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/pumps-motors-icon.webp',
      name: 'Pumps Motors Icon'
    }
  ];

  for (const ic of iconTargets) {
    const srcPath = path.join(userDir, ic.file);
    const outPath = path.join(rootDir, ic.out);
    try {
      const cropped = await sharp(srcPath).extract(ic.rect).toBuffer();
      await sharp({
        create: {
          width: 96,
          height: 96,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
        .composite([{
          input: await sharp(cropped).resize(80, 80, { fit: 'inside' }).toBuffer(),
          gravity: 'centre'
        }])
        .webp({ quality: 95 })
        .toFile(outPath);
      console.log(`[OK] Subcat icon: ${ic.name} -> ${ic.out}`);
    } catch (e) {
      console.warn(`[WARN] Failed subcat icon ${ic.name}:`, e.message);
    }
  }
}

async function run() {
  console.log(`Extracting ${items.length} real product photos for Home Appliances...`);
  for (const item of items) {
    await processProduct(item);
  }
  await extractSubcatIcons();
  console.log('All real Home Appliances images extracted and updated successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
