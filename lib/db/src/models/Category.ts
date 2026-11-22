import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { ICategory, ICategorySubcategory } from "../catalogData";

export interface ICategoryDocument extends Document, ICategory {}

const CategorySubcategorySchema = new Schema<ICategorySubcategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    itemCount: { type: Number, default: 0 },
  },
  { _id: false },
);

const CategorySchema = new Schema<ICategoryDocument>(
  {
    catId: { type: Number, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    department: { type: String, required: true },
    image: { type: String, required: true },
    dbCategory: { type: String, required: true },
    route: { type: String, required: true },
    badge: { type: String },
    subcategories: { type: [CategorySubcategorySchema], default: [] },
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

export const CategoryModel: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);
