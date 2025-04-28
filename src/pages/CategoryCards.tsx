import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Heart, Send, Plus, Loader2 } from "lucide-react";
import Button from "@/components/Button";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import BackgroundGallery from "@/components/BackgroundGallery";
import { Background } from "@/services/api";
import { eventBus, BackgroundUpdatedEvent } from "@/services/eventBus";
import { useBackgroundsStore } from "@/services/store";

interface CardModalProps {
  background: Background | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (background: Background) => void;
}

const CardModal: React.FC<CardModalProps> = ({
  background,
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!background) return null;

  // Convert imageURI to a full URL if it's just a relative path
  const imageUrl = background.imageURI.startsWith("http")
    ? background.imageURI
    : `http://localhost:3001/${background.imageURI}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0A0B14] rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/10"
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10 hover:bg-black/60"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-72 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B14] to-transparent z-10" />
                <img
                  src={imageUrl}
                  alt={background.category}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 -mt-16 relative z-20">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-display font-medium text-white mb-2">
                      {background.category}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      Created by {background.artistAddress.slice(0, 6)}...
                      {background.artistAddress.slice(-4)}
                    </p>
                  </div>
                  <div className="bg-primary/20 px-6 py-3 rounded-full">
                    <span className="text-primary font-medium text-lg">
                      {background.price} ETH
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  Beautiful background from our {background.category}{" "}
                  collection. Use this to create a unique gift card that will be
                  minted on the blockchain.
                </p>

                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <h4 className="text-white font-medium mb-4 text-lg">
                    Card Details
                  </h4>
                  <ul className="space-y-3 text-base text-gray-300">
                    <li className="flex justify-between items-center">
                      <span>Creator Earnings</span>
                      <span className="text-primary font-medium">40%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Platform Fee</span>
                      <span className="text-secondary font-medium">60%</span>
                    </li>
                    {background.blockchainId && (
                      <li className="flex justify-between items-center">
                        <span>Blockchain ID</span>
                        <span className="text-secondary font-medium">
                          #{background.blockchainId}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  onClick={() => onSelect(background)}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl text-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Create Gift Card
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CategoryCards: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Use the backgrounds store
  const {
    backgroundsByCategory,
    isLoading,
    error,
    fetchCategoryBackgrounds,
    fetchAllBackgrounds,
    addBackground,
    updateBackground,
  } = useBackgroundsStore();

  // Get the backgrounds for the current category
  const backgrounds = selectedCategory
    ? backgroundsByCategory[selectedCategory] || []
    : [];

  useEffect(() => {
    // Fetch all backgrounds on first load to populate categories
    fetchAllBackgrounds();
  }, []);

  useEffect(() => {
    // Set the selected category from URL param
    if (categoryId) {
      const decodedCategory = decodeURIComponent(categoryId);
      setSelectedCategory(decodedCategory);
      // Fetch backgrounds for this category if not already loaded
      fetchCategoryBackgrounds(decodedCategory);
    }
  }, [categoryId]);

  useEffect(() => {
    // Subscribe to background update events
    const unsubscribe = eventBus.onBackgroundUpdated(handleBackgroundChange);

    // Clean up event listener on component unmount
    return () => {
      unsubscribe();
    };
  }, [selectedCategory]);

  // Handler for background changes
  const handleBackgroundChange = (data: BackgroundUpdatedEvent) => {
    console.log("Background change detected:", data);

    // Only refresh if we're in the same category as the changed background
    // or if no category is selected yet
    if (
      data.background &&
      data.background.category &&
      (!selectedCategory || data.background.category === selectedCategory)
    ) {
      if (data.action === "added") {
        // Add the new background to our store
        addBackground(data.background);
      } else if (data.action === "updated") {
        // Update the existing background in our store
        updateBackground(data.background);
      }
    }
  };

  const handleCardSelect = (background: Background) => {
    // Navigate to create gift page with background
    navigate(`/create-gift`, {
      state: {
        backgroundId: background.id,
        backgroundPrice: background.price,
        backgroundImage: background.imageURI.startsWith("http")
          ? background.imageURI
          : `http://localhost:3001/${background.imageURI}`,
      },
    });
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Update URL to reflect the selected category
    navigate(`/categories/${encodeURIComponent(category)}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] relative">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-10"></div>
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>

      {/* Navbar */}
      <Navbar />

      <div className="content-container relative z-10 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-display font-medium text-white mb-2">
              {selectedCategory ? selectedCategory : "Backgrounds"}
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full" />
          </div>

          <Button
            onClick={() => navigate("/create-background")}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl text-base font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Create Background
          </Button>
        </motion.div>

        {/* Category Navigation */}
        <CategoryNav
          categories={Object.keys(backgroundsByCategory)}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />

        {/* Background Gallery using our reusable component */}
        <BackgroundGallery
          backgrounds={backgrounds}
          isLoading={isLoading}
          error={error}
          onSelectBackground={setSelectedBackground}
          emptyStateMessage={`No backgrounds found in ${
            selectedCategory || "this category"
          }`}
        />
      </div>

      <CardModal
        background={selectedBackground}
        isOpen={!!selectedBackground}
        onClose={() => setSelectedBackground(null)}
        onSelect={handleCardSelect}
      />
    </div>
  );
};

export default CategoryCards;
