import mongoose, { Schema, type Document, type Model } from "mongoose";
import type {
  IProduct,
  IProductSpecification,
  IProductVariant,
} from "../catalogData";

export interface IProductDocument extends Document, IProduct {}

const ProductSpecificationSchema = new Schema<IProductSpecification>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },
    image: { type: String },
  },
  { _id: false },
);

const ProductSchema = new Schema<IProductDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    categorySlug: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    subCategory: { type: String },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    shortTagline: { type: String },
    specChips: { type: [String], default: [] },
    description: { type: String, required: true },
    highlights: { type: [String], default: [] },
    specifications: { type: [ProductSpecificationSchema], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    unit: { type: String, default: "Piece" },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    deliveryEta: { type: String, default: "60 Mins" },
    vendor: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const ProductModel: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);
