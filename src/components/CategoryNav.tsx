import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2 mb-6">
      <motion.div 
        className="flex gap-2 min-w-max"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full transition-all text-sm font-medium",
            selectedCategory === null
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20"
          )}
        >
          All Categories
        </button>
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full transition-all text-sm font-medium",
              selectedCategory === category
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20"
            )}
          >
            {category}
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default CategoryNav; 