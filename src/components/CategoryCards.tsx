import React from 'react';
import { motion } from 'framer-motion';

interface CategoryProps {
  id: string;
  name: string;
  image: string;
  onSelect: (categoryId: string) => void;
}

const getImageUrl = (imagePath: string): string => {
  console.log("Loading category image:", imagePath);
  
  if (!imagePath) return '/placeholder.jpg';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  } else if (imagePath.startsWith('/')) {
    return imagePath;
  } else {
    return `/${imagePath}`;
  }
};

const CategoryCards: React.FC<{ categories: CategoryProps[]; onSelect: (categoryId: string) => void }> = ({
  categories,
  onSelect,
}) => {
  console.log("Categories received:", categories);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {categories.map((category) => (
        <motion.div
          key={category.id}
          className="relative h-64 rounded-xl overflow-hidden shadow-lg cursor-pointer group"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(category.id)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <img
            src={getImageUrl(category.image)}
            alt={category.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              console.error(`Failed to load image: ${category.image}`);
              (e.target as HTMLImageElement).src = '/placeholder.jpg';
            }}
          />
          <div className="absolute bottom-0 left-0 p-5 z-20">
            <h3 className="text-white text-xl font-bold">{category.name}</h3>
            <p className="text-gray-200 mt-1">Click to explore</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryCards; 