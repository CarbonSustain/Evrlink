import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import BackgroundModal from "./BackgroundModal";

export interface Background {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  price: number;
  artist?: string;
  description?: string;
}

interface BackgroundsGridProps {
  backgrounds: Background[];
  isLoading?: boolean;
}

const BackgroundsGrid: React.FC<BackgroundsGridProps> = ({
  backgrounds,
  isLoading = false,
}) => {
  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectBackground = (background: Background) => {
    setSelectedBackground(background);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Helper to format price in ETH
  const formatPrice = (price: number) => {
    return `${price} ETH`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-lg bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (backgrounds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">No backgrounds found</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {backgrounds.map((background) => (
          <motion.div
            key={background.id}
            className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectBackground(background)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={background.imageUrl}
              alt={background.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/400x400?text=Image+Not+Found";
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <h3 className="font-medium text-white">{background.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-white/70">
                  {formatPrice(background.price)}
                </p>
                <button
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement favorite functionality
                  }}
                >
                  <Heart className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {selectedBackground && (
        <BackgroundModal
          background={selectedBackground}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSelect={() => {
            // Handle background selection logic
            handleCloseModal();
          }}
        />
      )}
    </>
  );
};

export default BackgroundsGrid;
