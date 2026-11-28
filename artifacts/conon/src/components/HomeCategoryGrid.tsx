import React from "react";
import { type HomeCategory } from "@/data/homeCategories";
import { useLiveCategories } from "@/hooks/useCononLiveData";
import { HomeCategoryTile } from "./HomeCategoryTile";

interface HomeCategoryGridProps {
  onSelectCategory?: (category: HomeCategory) => void;
  selectedSlug?: string | null;
}

export const HomeCategoryGrid: React.FC<HomeCategoryGridProps> = ({
  onSelectCategory,
}) => {
  const rawCategories = useLiveCategories();
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  return (
    <section className="bg-white border-b border-[#EAECEF] w-full">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-white">
        {/* Strict Responsive Grid: 6 cols desktop, 4 cols tablet, 3 cols mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-3.5 sm:gap-x-5 lg:gap-x-6 gap-y-5 sm:gap-y-6 lg:gap-y-8">
          {categories.map((category, index) => (
            <HomeCategoryTile
              key={category.slug || `cat-${index}`}
              category={category}
              index={index}
              onClick={(cat) => onSelectCategory?.(cat)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
