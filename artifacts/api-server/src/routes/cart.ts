import { Router, type IRouter } from "express";
import {
  centsToDecimal,
  collection,
  decimal,
  decimalToNumber,
  multiplyMoneyCents,
  nextId,
  CATALOG_PRODUCTS,
} from "@workspace/db";
import { AddToCartBody, UpdateCartItemBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();
const MAX_CART_ITEMS = 100;

const FALLBACK_MATERIALS = [
  {
    "id": "maha-ppc-cement-50kg",
    "name": "Maha PPC Cement, 50 Kg Bag",
    "category": "cement",
    "price": 355,
    "unit": "50 Kg Bag",
    "vendor": "Maha Cement Official"
  },
  {
    "id": "adani-acc-suraksha-power-ppc",
    "name": "Adani ACC Suraksha Power PPC Cement, 50 Kg Bag",
    "category": "cement",
    "price": 370,
    "unit": "50 Kg Bag",
    "vendor": "ACC Official"
  },
  {
    "id": "ultratech-ppc-cement-50kg",
    "name": "Ultratech PPC Cement, 50 Kg Bag",
    "category": "cement",
    "price": 410,
    "unit": "50 Kg Bag",
    "vendor": "UltraTech Official"
  },
  {
    "id": "birla-white-cement-50kg",
    "name": "Birla White Cement",
    "category": "cement",
    "price": 40,
    "unit": "Pack",
    "vendor": "Birla White Official"
  },
  {
    "id": "priya-opc-53-grade-cement-50kg",
    "name": "Priya OPC 53 Grade Cement, 50 Kg Bag",
    "category": "cement",
    "price": 390,
    "unit": "50 Kg Bag",
    "vendor": "Priya Cement Official"
  },
  {
    "id": "priya-ppc-cement-50kg",
    "name": "Priya PPC Cement, 50 Kg Bag",
    "category": "cement",
    "price": 360,
    "unit": "50 Kg Bag",
    "vendor": "Priya Cement Official"
  },
  {
    "id": "maha-cement-opc-53-grade-cement-50kg",
    "name": "Maha Cement OPC 53 Grade Cement, 50 Kg Bag",
    "category": "cement",
    "price": 390,
    "unit": "50 Kg Bag",
    "vendor": "Maha Cement Official"
  },
  {
    "id": "ramco-supergrade-ppc-cement-50kg",
    "name": "Ramco Supergrade PPC Cement, 50 Kg Bag",
    "category": "cement",
    "price": 395,
    "unit": "50 Kg Bag",
    "vendor": "Ramco Official"
  },
  {
    "id": "birla-super-opc-53-grade-cement-50kg",
    "name": "Birla Super OPC 53 Grade Cement, 50 Kg Bag",
    "category": "cement",
    "price": 450,
    "unit": "50 Kg Bag",
    "vendor": "Birla Super Official"
  },
  {
    "id": "ramco-cement-opc-53-grade-50kg",
    "name": "Ramco Cement OPC 53 Grade, 50 Kg Bag",
    "category": "cement",
    "price": 430,
    "unit": "50 Kg Bag",
    "vendor": "Ramco Official"
  },
  {
    "id": "truegrit-triple-washed-m-sand-25kg",
    "name": "TRUEGRIT Triple Washed M-Sand (Plastering Grade / P-Sand) - 25kg Bag",
    "category": "sand-plaster-mortars",
    "price": 150,
    "unit": "25 Kg Bag",
    "vendor": "TRUEGRIT Official"
  },
  {
    "id": "alagar-super-plast-gypsum-plaster-25kg",
    "name": "Alagar Super Plast Gypsum Plaster, 25 Kg Bag",
    "category": "sand-plaster-mortars",
    "price": 295,
    "unit": "25 Kg Bag",
    "vendor": "Alagar Official"
  },
  {
    "id": "jsw-enduro-plast-ready-mix-plaster-40kg",
    "name": "JSW Enduro Plast Ready Mix Plaster, 40 Kg Bag",
    "category": "sand-plaster-mortars",
    "price": 305,
    "unit": "40 Kg Bag",
    "vendor": "JSW Cement Official"
  },
  {
    "id": "saint-gobain-gyproc-xpert-plus-gypsum-25kg",
    "name": "Saint-Gobain Gyproc Xpert+ Gypsum Punning Plaster, 25 Kg",
    "category": "sand-plaster-mortars",
    "price": 395,
    "unit": "25 Kg Bag",
    "vendor": "Gyproc Official"
  },
  {
    "id": "jsw-block-grip-aac-block-jointing-mortar-40kg",
    "name": "JSW Block Grip AAC Block Jointing Mortar/Adhesive, 40 Kg Bag",
    "category": "sand-plaster-mortars",
    "price": 415,
    "unit": "40 Kg Bag",
    "vendor": "JSW Cement Official"
  },
  {
    "id": "taparia-claw-hammer-with-handle-340g",
    "name": "Taparia Claw Hammer with Handle, 340 gms",
    "category": "masonry-tools-hardware",
    "price": 375,
    "unit": "1 Pc",
    "vendor": "Taparia Official"
  },
  {
    "id": "vertical-plumb-bob-leveling-tool",
    "name": "Vertical Plumb Bob Leveling Tool with Rope String",
    "category": "masonry-tools-hardware",
    "price": 115,
    "unit": "1 Pc",
    "vendor": "WorkPro Official"
  },
  {
    "id": "masonry-pinji-bricklayer-line-pins",
    "name": "Masonry Pinji Bricklayer Line Pins (1-Piece)",
    "category": "masonry-tools-hardware",
    "price": 55,
    "unit": "1 Pc",
    "vendor": "Generic Official"
  },
  {
    "id": "notched-trowel-plastering-gurumala",
    "name": "Notched Trowel Plastering Gurumala",
    "category": "masonry-tools-hardware",
    "price": 94,
    "unit": "1 Pc",
    "vendor": "WorkPro Official"
  },
  {
    "id": "taparia-club-hammer-with-handle-1kg",
    "name": "Taparia Club Hammer with Handle - 1KG - GH 1000",
    "category": "masonry-tools-hardware",
    "price": 531,
    "unit": "1 Pc",
    "vendor": "Taparia Official"
  },
  {
    "id": "taparia-ball-pein-hammer-with-handle-200g",
    "name": "Taparia Ball Pein Hammer with Handle - 200G - WH 200",
    "category": "masonry-tools-hardware",
    "price": 246,
    "unit": "1 Pc",
    "vendor": "Taparia Official"
  },
  {
    "id": "blue-tarpaulin-tirpal-110-gsm",
    "name": "Blue Tarpaulin (Tirpal), 110 GSM, Waterproof Protective Sheet",
    "category": "masonry-tools-hardware",
    "price": 389,
    "unit": "1 Sheet",
    "vendor": "Tirpal Official"
  },
  {
    "id": "haks-plaster-trowel-gurmala-4x10",
    "name": "Haks Plaster Trowel Gurmala, 4\" x 10\"",
    "category": "masonry-tools-hardware",
    "price": 40,
    "unit": "1 Pc",
    "vendor": "Haks Official"
  },
  {
    "id": "chicken-wire-mesh-20-gauge-3ft-2kg",
    "name": "Chicken Wire Mesh, 20 Gauge, 3ft Wide, 2Kg",
    "category": "masonry-tools-hardware",
    "price": 320,
    "unit": "1 Roll",
    "vendor": "Generic Official"
  },
  {
    "id": "freemans-ikon-steel-measuring-tape",
    "name": "Freemans Ikon Steel Measuring Tape, Auto-Lock, ABS Case with Belt Clip",
    "category": "masonry-tools-hardware",
    "price": 86,
    "unit": "1 Pc",
    "vendor": "Freemans Official"
  },
  {
    "id": "freemans-spirit-level-aluminium-magnetic-30cm",
    "name": "Freemans Spirit Level, Aluminium, Magnetic, 30cm (12\")",
    "category": "masonry-tools-hardware",
    "price": 240,
    "unit": "1 Pc",
    "vendor": "Freemans Official"
  },
  {
    "id": "khurpi-scraper-steel-blade",
    "name": "Khurpi / Scraper, Steel Blade with Wooden Handle | Paint, Putty & Plaster Removal | Painter's Tool",
    "category": "masonry-tools-hardware",
    "price": 40,
    "unit": "1 Pc",
    "vendor": "Generic Official"
  },
  {
    "id": "karni-masonry-trowel",
    "name": "Karni Masonry Trowel",
    "category": "masonry-tools-hardware",
    "price": 70,
    "unit": "1 Pc",
    "vendor": "Generic Official"
  },
  {
    "id": "black-foam-cleaning-sponge-12pcs",
    "name": "Black Foam Cleaning Sponge - 12 Pcs Pack",
    "category": "masonry-tools-hardware",
    "price": 180,
    "unit": "Pack",
    "vendor": "Generic Official"
  },
  {
    "id": "plastic-bandli-tasla-ghamela",
    "name": "Plastic Bandli / Tasla / Ghamela | Lightweight Rustproof Pan for Cement, Mortar, Sand & Household",
    "category": "masonry-tools-hardware",
    "price": 99,
    "unit": "1 Pc",
    "vendor": "Generic Official"
  },
  {
    "id": "iron-tasla-bandli-ghamela",
    "name": "Iron Tasla / Bandli for Construction | Cement, Mortar, Sand & Concrete Carrying Pan | Ghamela",
    "category": "masonry-tools-hardware",
    "price": 120,
    "unit": "1 Pc",
    "vendor": "Generic Official"
  },
  {
    "id": "heavy-duty-wall-cutting-chisel",
    "name": "Heavy Duty Wall Cutting Chisel",
    "category": "masonry-tools-hardware",
    "price": 90,
    "unit": "1 Pc",
    "vendor": "WorkPro Official"
  },
  {
    "id": "wooden-gatta-supporting-wedges-100pcs",
    "name": "Wooden Gatta | Supporting Wedges for Fittings - 100 Pcs Pack",
    "category": "masonry-tools-hardware",
    "price": 55,
    "unit": "Pack",
    "vendor": "Generic Official"
  },
  {
    "id": "pvc-wall-plugs-gitti-box",
    "name": "PVC Wall Plugs Gitti Box",
    "category": "masonry-tools-hardware",
    "price": 35,
    "unit": "1 Box",
    "vendor": "Generic Official"
  },
  {
    "id": "double-face-sledge-club-hammer",
    "name": "Double Face Sledge / Club Hammer, Wooden Handle | Masonry, Chisel Driving & Demolition Work",
    "category": "masonry-tools-hardware",
    "price": 150,
    "unit": "1 Pc",
    "vendor": "WorkPro Official"
  },
  {
    "id": "floating-trowel-plasterers-float",
    "name": "Floating Trowel / Plasterer's Float | Wooden Handle | Plaster, Render & Concrete Levelling Tool",
    "category": "masonry-tools-hardware",
    "price": 60,
    "unit": "1 Pc",
    "vendor": "WorkPro Official"
  },
  {
    "id": "l-square-try-square-2ft-angle-ruler",
    "name": "L-Square (Try Square) 2FT Right Angle Ruler",
    "category": "masonry-tools-hardware",
    "price": 199,
    "unit": "1 Pc",
    "vendor": "Freemans Official"
  },
  {
    "id": "fosroc-conbextra-gp2-cementitious-grout-25kg",
    "name": "Fosroc Conbextra GP2 Cementitious Grout, 25kg",
    "category": "chemicals",
    "price": 550,
    "unit": "25 Kg Bag",
    "vendor": "Fosroc Official"
  },
  {
    "id": "dr-fixit-lw-plus-5l",
    "name": "Dr. Fixit LW+ Integral Waterproofing Liquid Compound 5L",
    "category": "chemicals",
    "price": 640,
    "unit": "5 L Can",
    "vendor": "Dr. Fixit Official"
  },
  {
    "id": "dr-fixit-pidicrete-urp-1l",
    "name": "Dr. Fixit Pidicrete URP SBR Latex Bonding Agent 1L",
    "category": "chemicals",
    "price": 280,
    "unit": "1 L Bottle",
    "vendor": "Dr. Fixit Official"
  },
  {
    "id": "dr-fixit-fastflex-12kg",
    "name": "Dr. Fixit Fastflex Dual Component Waterproofing Coating 12 Kg",
    "category": "chemicals",
    "price": 1850,
    "unit": "12 Kg Kit",
    "vendor": "Dr. Fixit Official"
  },
  {
    "id": "century-sainik-710-bwp",
    "name": "Century Sainik 710 BWP Plywood 19mm",
    "category": "wood",
    "price": 1455,
    "unit": "1 Sheet",
    "vendor": "CenturyPly Official"
  },
  {
    "id": "action-tesa-hdhmr-board-plain",
    "name": "Action Tesa HDHMR Board Plain 18mm",
    "category": "wood",
    "price": 514,
    "unit": "1 Sheet",
    "vendor": "Action Tesa Official"
  },
  {
    "id": "cp-plus-4-port-poe-switch",
    "name": "CP Plus 4 Port PoE Switch, 65W",
    "category": "cctv",
    "price": 1350,
    "unit": "Piece",
    "vendor": "CP Plus Official"
  },
  {
    "id": "atomberg-renesa-pedestal-fan",
    "name": "Atomberg Renesa 400mm Pedestal Fan with Remote",
    "category": "electrical",
    "price": 3699,
    "unit": "Piece",
    "vendor": "Atomberg Official"
  },
  {
    "id": "ebco-pro-motion-tandem-box",
    "name": "Ebco Pro Motion Tandem Box, S3 Series, 50Kg",
    "category": "hardware",
    "price": 2447,
    "unit": "Full Set",
    "vendor": "Ebco Official"
  }
];

interface CartItemRecord {
  id: number;
  externalId: string;
  materialId: string;
  name: string;
  category: string;
  price: any;
  unit: string;
  quantity: any;
  vendor: string;
}

interface CartRecord {
  id: number;
  sessionId: string;
  createdAt: Date;
  items: CartItemRecord[];
}

const memoryCarts = new Map<string, CartRecord>();
let memoryCartIdCounter = 1000;
let memoryItemIdCounter = 5000;
let isMongoOperational = false; // Fast memory-first bypass for 0-latency instant response

async function getOrCreateCart(sessionId: string): Promise<CartRecord> {
  if (isMongoOperational) {
    try {
      let cart = await collection("carts").findOne({ sessionId });
      if (cart) return cart as unknown as CartRecord;

      const newCart = {
        id: await nextId("carts"),
        sessionId,
        createdAt: new Date(),
        items: [],
      };
      await collection("carts").insertOne(newCart);
      cart = await collection("carts").findOne({ sessionId });
      if (cart) return cart as unknown as CartRecord;
    } catch {
      isMongoOperational = false;
    }
  }

  // Instant in-memory fallback
  let memCart = memoryCarts.get(sessionId);
  if (!memCart) {
    memCart = {
      id: memoryCartIdCounter++,
      sessionId,
      createdAt: new Date(),
      items: [],
    };
    memoryCarts.set(sessionId, memCart);
  }
  return memCart;
}

async function buildCartResponse(cartInput: any) {
  let cart = cartInput;
  if (typeof cartInput === "number") {
    try {
      cart = await collection("carts").findOne({ id: cartInput });
    } catch {
      // ignore
    }
    if (!cart) {
      for (const c of memoryCarts.values()) {
        if (c.id === cartInput) {
          cart = c;
          break;
        }
      }
    }
  }

  const items: CartItemRecord[] = cart?.items ?? [];
  const categoryMap = new Map<string, CartItemRecord[]>();
  for (const item of items) {
    const catName = item.category || "General";
    const group = categoryMap.get(catName) ?? [];
    group.push(item);
    categoryMap.set(catName, group);
  }

  const categories = Array.from(categoryMap.entries()).map(([category, catItems]) => {
    const subtotalCents = catItems.reduce(
      (sum, item) => sum + multiplyMoneyCents(item.price, item.quantity),
      0n,
    );
    return {
      category,
      vendor: catItems[0]?.vendor || "CONON Vendor",
      items: catItems.map((item) => ({
        id: item.externalId,
        materialId: item.materialId,
        name: item.name,
        category: item.category,
        price: decimalToNumber(item.price),
        unit: item.unit,
        quantity: decimalToNumber(item.quantity),
        vendor: item.vendor,
        total: Number(centsToDecimal(multiplyMoneyCents(item.price, item.quantity)).toString()),
      })),
      subtotal: Number(centsToDecimal(subtotalCents).toString()),
      deliveryTime: 60,
    };
  });

  const grandTotalCents = categories.reduce(
    (sum, category) => sum + BigInt(Math.round(category.subtotal * 100)),
    0n,
  );
  return {
    id: `cart-${cart?.id ?? 1}`,
    categories,
    totalItems: items.length,
    grandTotal: Number(centsToDecimal(grandTotalCents).toString()),
  };
}

router.get("/cart", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);
  res.json(await buildCartResponse(cart));
});

router.post("/cart", async (req, res) => {
  const body = AddToCartBody.parse(req.body);
  const cart = await getOrCreateCart(req.sessionId);

  let material: any = null;
  try {
    material = await collection("materials").findOne({ externalId: body.materialId });
  } catch {
    // Ignore DB offline
  }

  // Cascading catalog lookup
  const catalogProduct = CATALOG_PRODUCTS.find(
    (p) => p.id === body.materialId || p.slug === body.materialId || p.title === body.name,
  );
  const fallbackMat = FALLBACK_MATERIALS.find(
    (m) => m.id === body.materialId || m.name === body.name,
  );

  const name =
    material?.name ??
    body.name ??
    catalogProduct?.title ??
    catalogProduct?.name ??
    fallbackMat?.name ??
    "Building Material";

  const category =
    material?.category ??
    body.category ??
    catalogProduct?.categoryName ??
    catalogProduct?.categorySlug ??
    fallbackMat?.category ??
    "General";

  const unit =
    material?.unit ??
    body.unit ??
    catalogProduct?.unit ??
    fallbackMat?.unit ??
    "Piece";

  const vendor =
    material?.vendor ??
    body.vendor ??
    catalogProduct?.brand ??
    catalogProduct?.vendor ??
    fallbackMat?.vendor ??
    "CONON Verified Supplier";

  const rawPrice =
    body.price ??
    material?.price ??
    catalogProduct?.price ??
    fallbackMat?.price ??
    100;

  const price =
    typeof rawPrice === "object" && rawPrice !== null && "toString" in rawPrice
      ? rawPrice
      : decimal(rawPrice);

  const existing = cart.items.find((item) => item.materialId === body.materialId);

  if (existing) {
    existing.quantity = decimal(decimalToNumber(existing.quantity) + body.quantity);
    try {
      await collection("carts").updateOne(
        { id: cart.id },
        { $inc: { "items.$[item].quantity": decimal(body.quantity) } },
        { arrayFilters: [{ "item.externalId": existing.externalId }] },
      );
    } catch {
      // MongoDB offline / update ignored
    }
  } else {
    const newItem: CartItemRecord = {
      id: await nextId("cartItems").catch(() => memoryItemIdCounter++),
      externalId: randomUUID(),
      materialId: body.materialId,
      name,
      category,
      price,
      unit,
      quantity: decimal(body.quantity),
      vendor,
    };
    cart.items.push(newItem);
    try {
      await collection("carts").updateOne(
        {
          id: cart.id,
          items: { $not: { $elemMatch: { materialId: body.materialId } } },
          $expr: { $lt: [{ $size: { $ifNull: ["$items", []] } }, MAX_CART_ITEMS] },
        },
        { $push: { items: newItem } } as any,
      );
    } catch {
      // MongoDB offline / insert ignored
    }
  }

  res.json(await buildCartResponse(cart));
});

router.delete("/cart/:itemId", async (req, res) => {
  const cart = await getOrCreateCart(req.sessionId);
  const targetId = req.params.itemId;

  try {
    await collection("carts").updateOne(
      { id: cart.id },
      {
        $pull: {
          items: {
            $or: [
              { externalId: targetId },
              { materialId: targetId },
              { id: Number(targetId) || -1 },
            ],
          },
        },
      } as any,
    );
  } catch {
    // Ignore DB error
  }

  cart.items = cart.items.filter(
    (item) =>
      item.externalId !== targetId &&
      item.materialId !== targetId &&
      item.id !== Number(targetId),
  );

  res.json(await buildCartResponse(cart));
});

router.patch("/cart/:itemId", async (req, res) => {
  const body = UpdateCartItemBody.parse(req.body);
  const cart = await getOrCreateCart(req.sessionId);
  const targetId = req.params.itemId;

  if (body.quantity <= 0) {
    try {
      await collection("carts").updateOne(
        { id: cart.id },
        {
          $pull: {
            items: {
              $or: [
                { externalId: targetId },
                { materialId: targetId },
                { id: Number(targetId) || -1 },
              ],
            },
          },
        } as any,
      );
    } catch {
      // Ignore DB error
    }
    cart.items = cart.items.filter(
      (item) =>
        item.externalId !== targetId &&
        item.materialId !== targetId &&
        item.id !== Number(targetId),
    );
  } else {
    try {
      await collection("carts").updateOne(
        { id: cart.id },
        { $set: { "items.$[item].quantity": decimal(body.quantity) } },
        {
          arrayFilters: [
            {
              $or: [
                { "item.externalId": targetId },
                { "item.materialId": targetId },
              ],
            },
          ],
        },
      );
    } catch {
      // Ignore DB error
    }
    const item = cart.items.find(
      (it) =>
        it.externalId === targetId ||
        it.materialId === targetId ||
        it.id === Number(targetId),
    );
    if (item) {
      item.quantity = decimal(body.quantity);
    }
  }

  res.json(await buildCartResponse(cart));
});

export default router;
