import { Router, type IRouter } from "express";
import {
  ProductModel,
  CATALOG_PRODUCTS,
  type IProduct,
  mongoose,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const categoryQuery = (req.query.categorySlug || req.query.category || "") as string;
    const subCategoryQuery = (req.query.subCategory || "") as string;
    const searchQuery = (req.query.search || req.query.q || "") as string;
    const limitQuery = parseInt(req.query.limit as string) || 0;

    let products: IProduct[] = [];

    // Attempt DB fetch if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const filter: Record<string, any> = {};
        if (categoryQuery) {
          filter.$or = [
            { categorySlug: categoryQuery },
            { categoryName: new RegExp(`^${categoryQuery}$`, "i") },
          ];
        }
        if (subCategoryQuery) {
          filter.subCategory = new RegExp(`^${subCategoryQuery}$`, "i");
        }
        if (searchQuery) {
          filter.$or = [
            { name: new RegExp(searchQuery, "i") },
            { title: new RegExp(searchQuery, "i") },
            { brand: new RegExp(searchQuery, "i") },
            { description: new RegExp(searchQuery, "i") },
          ];
        }

        let query = ProductModel.find(filter).lean();
        if (limitQuery > 0) {
          query = query.limit(limitQuery);
        }
        const dbProducts = await query.exec();
        if (dbProducts && dbProducts.length > 0) {
          products = dbProducts as unknown as IProduct[];
        }
      } catch (err) {
        console.warn("[Products API] DB query warning, falling back to static catalog:", err);
      }
    }

    // Fallback to static catalog if DB returned nothing or DB is offline
    if (!products || products.length === 0) {
      let filtered = [...CATALOG_PRODUCTS];
      if (categoryQuery) {
        filtered = filtered.filter(
          (p) =>
            p.categorySlug === categoryQuery ||
            p.categoryName?.toLowerCase() === categoryQuery.toLowerCase()
        );
      }
      if (subCategoryQuery) {
        filtered = filtered.filter(
          (p) => p.subCategory?.toLowerCase() === subCategoryQuery.toLowerCase()
        );
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.title.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }
      if (limitQuery > 0) {
        filtered = filtered.slice(0, limitQuery);
      }
      products = filtered as unknown as IProduct[];
    }

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err: any) {
    console.error("[Products API] Error in /products:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch products",
      products: [],
    });
  }
});

router.get("/products/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    if (!idOrSlug) {
      return res.status(400).json({ success: false, error: "Product id or slug required" });
    }

    let product: IProduct | null = null;

    // Attempt DB fetch if connected
    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
          product = await ProductModel.findById(idOrSlug).lean() as unknown as IProduct;
        }
        if (!product) {
          product = await ProductModel.findOne({
            $or: [{ slug: idOrSlug }, { id: idOrSlug }],
          }).lean() as unknown as IProduct;
        }
      } catch (err) {
        console.warn("[Products API] DB lookup warning, falling back to static catalog:", err);
      }
    }

    // Fallback to static catalog
    if (!product) {
      const match = CATALOG_PRODUCTS.find(
        (p) => p.slug === idOrSlug || p.id === idOrSlug
      );
      if (match) {
        product = match as unknown as IProduct;
      }
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found for: ${idOrSlug}`,
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (err: any) {
    console.error("[Products API] Error in /products/:idOrSlug:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch product",
    });
  }
});

export default router;
