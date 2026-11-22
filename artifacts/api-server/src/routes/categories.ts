import { Router, type IRouter } from "express";
import {
  CategoryModel,
  CATALOG_CATEGORIES,
  type ICategory,
  mongoose,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/categories", async (req, res) => {
  try {
    let categories: ICategory[] = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const dbCategories = await CategoryModel.find().sort({ catId: 1 }).lean();
        if (dbCategories && dbCategories.length > 0) {
          categories = dbCategories as unknown as ICategory[];
        }
      } catch (err) {
        console.warn("[Categories API] DB query warning, falling back to static catalog:", err);
      }
    }

    if (!categories || categories.length === 0) {
      categories = CATALOG_CATEGORIES;
    }

    return res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (err: any) {
    console.error("[Categories API] Error in /categories:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch categories",
      categories: CATALOG_CATEGORIES,
    });
  }
});

router.get("/categories/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    let category: ICategory | null = null;

    if (mongoose.connection.readyState === 1) {
      try {
        category = await CategoryModel.findOne({ slug }).lean() as unknown as ICategory;
      } catch (err) {
        console.warn("[Categories API] DB lookup warning, falling back to static catalog:", err);
      }
    }

    if (!category) {
      category = (CATALOG_CATEGORIES.find((c) => c.slug === slug) as unknown as ICategory) || null;
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        error: `Category not found for slug: ${slug}`,
      });
    }

    return res.json({
      success: true,
      category,
    });
  } catch (err: any) {
    console.error("[Categories API] Error in /categories/:slug:", err);
    return res.status(500).json({
      success: false,
      error: err?.message || "Failed to fetch category",
    });
  }
});

export default router;
