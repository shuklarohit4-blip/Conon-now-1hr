import os
import sys
import json

# Add scripts directory and project root to path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root_dir)
sys.path.insert(0, os.path.join(root_dir, "scripts"))

from build_full_database_catalog import CATEGORIES, PRODUCTS as P1_5
from catalog_group_electrical import get_electrical_products
from catalog_group_hardware import get_hardware_products
from catalog_group_finishing import get_finishing_products

all_categories = CATEGORIES
all_products = P1_5 + get_electrical_products() + get_hardware_products() + get_finishing_products()

print(f"Total categories assembled: {len(all_categories)}")
print(f"Total products assembled: {len(all_products)}")

# TS template for catalogData.ts
ts_content = """// Unified Single-Source-of-Truth Catalog Data
// 18 Categories and 108 Rich Verified Brand Products

export interface IProductSpecification {
  label: string;
  value: string;
}

export interface IProductVariant {
  id: string;
  label: string;
  unit: string;
  price: number;
  mrp: number;
  discountPercent: number;
  stock: number;
  image?: string;
}

export interface IProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subCategory?: string;
  image: string;
  images: string[];
  shortTagline?: string;
  specChips: string[];
  description: string;
  highlights: string[];
  specifications: IProductSpecification[];
  variants: IProductVariant[];
  price: number;
  mrp: number;
  discountPercent: number;
  unit: string;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  deliveryEta: string;
  vendor?: string;
}

export interface ICategorySubcategory {
  name: string;
  slug: string;
  itemCount: number;
}

export interface ICategory {
  id: string;
  catId: number;
  slug: string;
  title: string;
  department: string;
  image: string;
  dbCategory: string;
  route: string;
  badge?: string;
  subcategories: ICategorySubcategory[];
}

export const CATALOG_CATEGORIES: ICategory[] = """ + json.dumps(all_categories, indent=2) + """;

export const CATALOG_PRODUCTS: IProduct[] = """ + json.dumps(all_products, indent=2) + """;

export const getProductsByCategory = (categorySlug: string): IProduct[] => {
  return CATALOG_PRODUCTS.filter(
    (p) => p.categorySlug === categorySlug
  );
};

export const getProductBySlug = (slug: string): IProduct | undefined => {
  return CATALOG_PRODUCTS.find((p) => p.slug === slug);
};

export const getCategoryBySlug = (slug: string): ICategory | undefined => {
  return CATALOG_CATEGORIES.find((c) => c.slug === slug);
};
"""

target_paths = [
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "lib", "db", "src", "catalogData.ts"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "artifacts", "conon", "src", "data", "catalogData.ts")
]

for p in target_paths:
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Wrote catalog to {p} ({len(ts_content)} bytes)")
