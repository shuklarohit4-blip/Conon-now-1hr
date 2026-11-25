import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const userDir = '/Users/rohiitshukla/.gemini/antigravity/brain/81a133d5-a7f4-424b-ae4c-59dfc4a7998a/.user_uploaded';
const rootDir = '/Users/rohiitshukla/Downloads/Conon-Builder-Network 4';

const items = [
  // ==========================================
  // 1. MODULAR KITCHEN - Waste Bins & Other Accessories
  // ==========================================
  {
    file: 'media_1795400705098_b4f5ac46.jpg',
    rect: { left: 295, top: 210, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/ebco-swing-out-waste-bin-rectangular.webp',
    name: 'Ebco Swing Out Waste Bin, Rectangular'
  },
  {
    file: 'media_1795400705098_b4f5ac46.jpg',
    rect: { left: 443, top: 210, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/hettich-waste-bin-it-classic-13l.webp',
    name: 'Hettich Waste-Bin.It Classic, 13 Litres'
  },
  {
    file: 'media_1795400705098_b4f5ac46.jpg',
    rect: { left: 591, top: 210, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/ebco-pull-out-waste-bin-40l.webp',
    name: 'Ebco Pull Out Waste Bin, 40L'
  },
  {
    file: 'media_1795400705098_b4f5ac46.jpg',
    rect: { left: 739, top: 210, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/aristo-wheel-waste-bin-pedal-65l.webp',
    name: 'Aristo Wheel Waste Bin with Pedal 65L'
  },
  {
    file: 'media_1795400705098_b4f5ac46.jpg',
    rect: { left: 295, top: 490, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/ebco-auto-pull-out-waste-bin.webp',
    name: 'Ebco Auto Pull Out Waste Bin'
  },
  {
    file: 'media_1795400705098_b4f5ac46.jpg',
    rect: { left: 443, top: 490, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/aristo-wheel-waste-bin-120l-green.webp',
    name: 'Aristo Wheel Waste Bin 120L Green'
  },
  {
    file: 'media_1795400705098_b4f5ac46.jpg',
    rect: { left: 591, top: 490, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/aristo-wheel-waste-bin-120l-blue.webp',
    name: 'Aristo Wheel Waste Bin 120L Blue'
  },
  {
    file: 'media_1795400705098_b4f5ac46.jpg',
    rect: { left: 739, top: 490, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/ebco-fascia-bracket-powb4.webp',
    name: 'Ebco Fascia Bracket - POWB4-40-EB-AT'
  },

  // ==========================================
  // 2. MODULAR KITCHEN - Skirting & Hardware
  // ==========================================
  {
    file: 'media_1795400705098_cfd42d64.jpg',
    rect: { left: 295, top: 466, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/ebco-pvc-skirting-plinth-clip-100mm.webp',
    name: 'Ebco PVC Skirting Q Plinth and Clip, 100mm'
  },
  {
    file: 'media_1795400705098_cfd42d64.jpg',
    rect: { left: 443, top: 466, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/modular-kitchen/ebco-pvc-skirting-joints-100mm.webp',
    name: 'Ebco PVC Skirting Joints, 100mm'
  },

  // ==========================================
  // 3. HOME APPLIANCES - Pedestal Fans & Exhaust
  // ==========================================
  {
    file: 'media_1795400914282_4701632d.jpg',
    rect: { left: 295, top: 227, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/appliances/atomberg-silenceaire-pedestal-fan.webp',
    name: 'Atomberg SilenceAire 400mm Pedestal Fan with Remote'
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

  // ==========================================
  // 4. PLYWOOD & BOARDS - Plywood, Blockboard, HDHMR, MDF, Boilo
  // ==========================================
  {
    file: 'media_1795405933895_8413189c.jpg',
    rect: { left: 295, top: 170, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/wood/century-sainik-710-bwp.webp',
    name: 'Century Sainik 710 BWP Plywood'
  },
  {
    file: 'media_1795405933895_8413189c.jpg',
    rect: { left: 443, top: 170, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/wood/greenply-gold-710-bwp.webp',
    name: 'Greenply Gold 710 BWP Plywood'
  },
  {
    file: 'media_1795405933895_8413189c.jpg',
    rect: { left: 591, top: 170, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/wood/greenply-absolute-calibrated.webp',
    name: 'Greenply Absolute Calibrated Plywood'
  },
  {
    file: 'media_1795405933928_59a65e5e.jpg',
    rect: { left: 295, top: 258, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/wood/action-tesa-hdhmr-board-plain.webp',
    name: 'Action Tesa HDHMR Board, Plain, 8 x 4'
  },
  {
    file: 'media_1795405933928_59a65e5e.jpg',
    rect: { left: 443, top: 258, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/wood/action-tesa-plain-interior-mdf.webp',
    name: 'Action Tesa Plain Interior Grade MDF'
  },
  {
    file: 'media_1795405933928_59a65e5e.jpg',
    rect: { left: 591, top: 258, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/wood/action-tesa-plain-exterior-mdf.webp',
    name: 'Action Tesa Plain Exterior Grade MDF'
  },
  {
    file: 'media_1795405933928_59a65e5e.jpg',
    rect: { left: 739, top: 258, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/wood/action-tesa-boilo-board-plain.webp',
    name: 'Action Tesa Boilo Board, Plain, 8 x 4'
  },

  // ==========================================
  // 5. CCTV & NETWORKING - NVR, DVR & Switches
  // ==========================================
  {
    file: 'media_1795406734996_eb1c756b.jpg',
    rect: { left: 295, top: 238, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/tp-link-10-100-switch.webp',
    name: 'TP-Link 10/100 Mbps Switch'
  },
  {
    file: 'media_1795406734996_eb1c756b.jpg',
    rect: { left: 443, top: 238, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-8-port-poe-switch.webp',
    name: 'CP Plus 8 Port PoE Switch - CP-ANW-HPU8H2-N12'
  },
  {
    file: 'media_1795406734996_eb1c756b.jpg',
    rect: { left: 591, top: 238, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-4-port-poe-switch.webp',
    name: 'CP Plus 4 Port PoE Switch 65W'
  },
  {
    file: 'media_1795406734996_eb1c756b.jpg',
    rect: { left: 739, top: 238, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-8-channel-nvr.webp',
    name: 'CP Plus 8 Channel NVR - CP-UNR-108F1'
  },
  {
    file: 'media_1795406734996_eb1c756b.jpg',
    rect: { left: 295, top: 506, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-4-channel-dvr.webp',
    name: 'CP Plus 4 Channel DVR'
  },
  {
    file: 'media_1795406734996_eb1c756b.jpg',
    rect: { left: 443, top: 506, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/tp-link-poe-switch-gigabit.webp',
    name: 'TP-Link Gigabit PoE Switch'
  },
  {
    file: 'media_1795406734996_eb1c756b.jpg',
    rect: { left: 591, top: 506, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/tp-link-desktop-switch.webp',
    name: 'TP-Link Desktop PoE Switch'
  },
  {
    file: 'media_1795406734996_eb1c756b.jpg',
    rect: { left: 739, top: 506, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-rack-switch.webp',
    name: 'CP Plus 16/24 Port Rackmount Switch'
  },

  // From Page 2 of NVR & DVR:
  {
    file: 'media_1795406735024_5dbacd02.jpg',
    rect: { left: 295, top: 158, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-4-ch-dvr-uvr.webp',
    name: 'CP Plus 4 Channel DVR - CP-UVR-0401E1V-I'
  },
  {
    file: 'media_1795406735024_5dbacd02.jpg',
    rect: { left: 443, top: 158, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-16-ch-nvr.webp',
    name: 'CP Plus 16 Channel NVR'
  },
  {
    file: 'media_1795406735024_5dbacd02.jpg',
    rect: { left: 591, top: 158, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-8-ch-dvr-uvr.webp',
    name: 'CP Plus 8 Channel DVR - CP-UVR-0801E1V-I'
  },
  {
    file: 'media_1795406735024_5dbacd02.jpg',
    rect: { left: 739, top: 158, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-32-ch-nvr.webp',
    name: 'CP Plus 32 Channel NVR'
  },
  {
    file: 'media_1795406735024_5dbacd02.jpg',
    rect: { left: 295, top: 430, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/cp-plus-4-ch-nvr.webp',
    name: 'CP Plus 4 Channel NVR - CP-UNR-104F1'
  },
  {
    file: 'media_1795406735024_5dbacd02.jpg',
    rect: { left: 443, top: 430, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/tp-link-es220gmp-managed-poe.webp',
    name: 'TP-Link ES220GMP 20-Port Managed PoE Switch'
  },
  {
    file: 'media_1795406735024_5dbacd02.jpg',
    rect: { left: 591, top: 430, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/cctv/tp-link-tl-sl1218mp-poe.webp',
    name: 'TP-Link TL-SL1218MP 18-Port PoE Switch'
  },

  // ==========================================
  // 6. CEMENT & CIVIL WORKS - Masonry Tools & Chemicals
  // ==========================================
  {
    file: 'media_1795406912648_d4fbced7.jpg',
    rect: { left: 295, top: 167, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/tools/taparia-claw-hammer-with-handle-340g.webp',
    name: 'Taparia Claw Hammer with Handle, 340 gms'
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
    rect: { left: 295, top: 439, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/tools/taparia-club-hammer-with-handle-1kg.webp',
    name: 'Taparia Club Hammer 1KG'
  },
  {
    file: 'media_1795406912648_d4fbced7.jpg',
    rect: { left: 443, top: 439, width: 147, height: 137 },
    out: 'artifacts/conon/public/images/products/tools/taparia-ball-pein-hammer-with-handle-200g.webp',
    name: 'Taparia Ball Pein Hammer 200G'
  },
  {
    file: 'media_1795406912669_f13e122e.jpg',
    rect: { left: 295, top: 365, width: 147, height: 138 },
    out: 'artifacts/conon/public/images/products/adhesives/fosroc-conbextra-gp2-cementitious-grout-25kg.webp',
    name: 'Fosroc Conbextra GP2 Cementitious Grout, 25kg'
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

  // Erase top-left badge
  for (let y = 0; y < Math.min(32, h); y++) {
    for (let x = 0; x < Math.min(36, w); x++) {
      const idx = (y * w + x) * channels;
      // If blue badge
      if (buf[idx+2] > 160 && buf[idx] < 80) {
        buf[idx] = 255;
        buf[idx+1] = 255;
        buf[idx+2] = 255;
      }
      if (y < 28 && x < 30) {
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
    // Modular Kitchen subcat icons
    {
      file: 'media_1795400705098_b4f5ac46.jpg',
      rect: { left: 154, top: 254, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/tandems-inserts-icon.webp',
      name: 'Tandems Inserts Icon'
    },
    {
      file: 'media_1795400705098_b4f5ac46.jpg',
      rect: { left: 154, top: 326, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/pullouts-baskets-wickers-icon.webp',
      name: 'Pullouts Baskets Wickers Icon'
    },
    {
      file: 'media_1795400705098_b4f5ac46.jpg',
      rect: { left: 154, top: 396, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/waste-bins-other-accessories-icon.webp',
      name: 'Waste Bins Icon'
    },
    {
      file: 'media_1795400705098_b4f5ac46.jpg',
      rect: { left: 154, top: 468, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/magic-corner-pantry-units-pulldowns-icon.webp',
      name: 'Magic Corner Icon'
    },
    {
      file: 'media_1795400705098_b4f5ac46.jpg',
      rect: { left: 154, top: 536, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/skirting-hardware-icon.webp',
      name: 'Skirting Hardware Icon'
    },

    // Plywood subcat icons
    {
      file: 'media_1795405933895_8413189c.jpg',
      rect: { left: 154, top: 258, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/plywood-blockboard-icon.webp',
      name: 'Plywood Blockboard Icon'
    },
    {
      file: 'media_1795405933895_8413189c.jpg',
      rect: { left: 154, top: 322, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/hdhmr-mdf-icon.webp',
      name: 'HDHMR MDF Icon'
    },
    {
      file: 'media_1795405933895_8413189c.jpg',
      rect: { left: 154, top: 392, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/laminates-icon.webp',
      name: 'Laminates Icon'
    },

    // CCTV subcat icons
    {
      file: 'media_1795406734996_eb1c756b.jpg',
      rect: { left: 154, top: 260, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/cameras-icon.webp',
      name: 'Cameras Icon'
    },
    {
      file: 'media_1795406734996_eb1c756b.jpg',
      rect: { left: 154, top: 326, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/nvr-dvr-switches-icon.webp',
      name: 'NVR DVR Switches Icon'
    },
    {
      file: 'media_1795406734996_eb1c756b.jpg',
      rect: { left: 154, top: 400, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/cctv-accessories-icon.webp',
      name: 'CCTV Accessories Icon'
    },
    {
      file: 'media_1795406734996_eb1c756b.jpg',
      rect: { left: 154, top: 466, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/wifi-networking-icon.webp',
      name: 'Wifi Networking Icon'
    },
    {
      file: 'media_1795406734996_eb1c756b.jpg',
      rect: { left: 154, top: 536, width: 28, height: 28 },
      out: 'artifacts/conon/public/images/subcategories/cctv-cat6-cable-icon.webp',
      name: 'CCTV Cable Icon'
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
  console.log(`Extracting ${items.length} real product photos from screenshots...`);
  for (const item of items) {
    await processProduct(item);
  }
  await extractSubcatIcons();
  console.log('All real product items and icons extracted successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
