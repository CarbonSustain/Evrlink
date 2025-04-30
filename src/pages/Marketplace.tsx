import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Gift,
  Heart,
  Send,
  Lock,
  Star,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { fetchBackgrounds, DatabaseEvents } from "@/services/api";
import { Background } from "@/services/api";
import Button from "@/components/Button";
import { useBackgroundAddedEvent } from "@/hooks/useDatabaseEvents";
import { toast } from "react-hot-toast";
import { useBackgroundsStore } from "@/services/store";
import CategoryNav from "@/components/CategoryNav";
import BackgroundGallery from "@/components/BackgroundGallery";
import { API_BASE_URL } from "@/services/api";
import BackgroundDetailsModal from "@/components/BackgroundDetailsModal";

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  icon: React.ReactNode;
}

interface BackgroundModalProps {
  background: Background | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (background: Background) => void;
}

// Add placeholder images for categories to ensure they always display something
const DEFAULT_CATEGORY_IMAGES = {
  "Birthday Cards": "/categories/birthday.jpg",
  "Wedding Cards": "/categories/wedding.jpg",
  "Holiday Cards": "/categories/holiday.jpg",
  "Love Cards": "/categories/love.jpg",
  "Thank You Cards": "/categories/thankyou.jpg",
  "Anniversary Cards": "/categories/anniversary.jpg",
  default: "/categories/default.jpg",
};

// Update getImageUrl to handle backend URLs and Windows paths
const getImageUrl = (imageURI: string): string => {
  if (imageURI.startsWith("http")) {
    return imageURI; // S3 URL
  }
  // Convert Windows backslashes to forward slashes
  const normalizedPath = imageURI.replace(/\\\\/g, "/").replace(/\\/g, "/");

  // Remove any leading slashes to avoid double slashes in the URL
  const cleanPath = normalizedPath.replace(/^\/+/, "");

  // Construct the full URL using API_BASE_URL
  const fullUrl = `${API_BASE_URL}/${cleanPath}`;
  console.log("Constructed image URL:", fullUrl, "from:", imageURI);
  return fullUrl;
};

const BackgroundModal: React.FC<BackgroundModalProps> = ({
  background,
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!background) return null;

  // Use the getImageUrl function for consistent image URL handling
  const imageUrl = getImageUrl(background.imageURI);

  return (
    <>
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
                      By {background.artistAddress.slice(0, 6)}...
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
                    Background Details
                  </h4>
                  <ul className="space-y-3 text-base text-gray-300">
                    <li className="flex justify-between items-center">
                      <span>Creator Earnings</span>
                      <span className="text-primary font-medium">40%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Used</span>
                      <span className="text-secondary font-medium">
                        {background.usageCount} times
                      </span>
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
    </>
  );
};

const categories: Category[] = [
  {
    id: "Birthday Cards",
    name: "Birthday Cards",
    image: "/categories/birthday.jpg",
    description: "Celebrate special days with unique blockchain cards",
    icon: <Gift className="w-6 h-6" />,
  },
  {
    id: "Wedding Cards",
    name: "Wedding Cards",
    image: "/categories/wedding.jpg",
    description: "Commemorate beautiful unions forever on-chain",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    id: "Holiday Cards",
    name: "Holiday Cards",
    image: "/categories/holiday.jpg",
    description: "Welcome new beginnings with digital memories",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: "Love Cards",
    name: "Love & Romance",
    image: "/categories/love.jpg",
    description: "Express your feelings with blockchain permanence",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    id: "Thank You Cards",
    name: "Thank You Cards",
    image: "/categories/thankyou.jpg",
    description: "Show gratitude with unique digital cards",
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: "Anniversary Cards",
    name: "Anniversary Cards",
    image: "/categories/anniversary.jpg",
    description: "Celebrate milestones with digital keepsakes",
    icon: <Lock className="w-6 h-6" />,
  },
];

const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  // Get backgrounds for the selected category, or all backgrounds if no category is selected
  const backgrounds = selectedCategory
    ? backgroundsByCategory[selectedCategory] || []
    : Object.values(backgroundsByCategory).flat();

  useEffect(() => {
    // Load all backgrounds on first load
    fetchAllBackgrounds();

    // Subscribe to background added/updated events
    const unsubscribeAdded = DatabaseEvents.onBackgroundAdded(
      handleBackgroundAdded
    );
    const unsubscribeUpdated = DatabaseEvents.onBackgroundUpdated(
      handleBackgroundUpdated
    );

    // Clean up event listeners on component unmount
    return () => {
      unsubscribeAdded();
      unsubscribeUpdated();
    };
  }, []);

  // When category changes, load backgrounds for that category if needed
  useEffect(() => {
    if (
      selectedCategory &&
      (!backgroundsByCategory[selectedCategory] ||
        backgroundsByCategory[selectedCategory].length === 0)
    ) {
      fetchCategoryBackgrounds(selectedCategory);
    }
  }, [selectedCategory]);

  // Handlers for background changes
  const handleBackgroundAdded = (background: Background) => {
    console.log("Background added:", background);
    addBackground(background);
  };

  const handleBackgroundUpdated = (background: Background) => {
    console.log("Background updated:", background);
    updateBackground(background);
  };

  const handleBackgroundSelect = (background: Background) => {
    setSelectedBackground(background);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBackground(null);
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);

    // Load backgrounds for this category if not already loaded
    if (
      !backgroundsByCategory[category] ||
      backgroundsByCategory[category].length === 0
    ) {
      fetchCategoryBackgrounds(category);
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.17, 0.67, 0.83, 0.97],
      },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-1000"></div>

      {/* Navbar */}
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="content-container relative z-10">
          {!selectedCategory ? (
            <>
              <div className="max-w-3xl mx-auto text-center mb-16">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUpVariants}
                  custom={0}
                >
                  <div className="inline-block animate-float">
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-secondary/30 rounded-full animate-pulse-slow" />
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Gift className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>

                  <motion.h1
                    className="text-4xl sm:text-5xl font-display font-semibold tracking-tight text-white mb-6"
                    variants={fadeInUpVariants}
                    custom={1}
                  >
                    Explore Our
                    <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Gift Card Collection
                    </span>
                  </motion.h1>

                  <motion.p
                    className="text-xl text-gray-300"
                    variants={fadeInUpVariants}
                    custom={2}
                  >
                    Choose a category to find the perfect background for your
                    gift card
                  </motion.p>
                </motion.div>
              </div>

              {/* Category Navigation for selection */}
              <CategoryNav
                categories={Object.keys(backgroundsByCategory)}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />

              {/* Show all backgrounds if no category is selected */}
              <div className="mt-12">
                <h2 className="text-2xl font-display font-medium text-white mb-6">
                  All Backgrounds
                </h2>
                <BackgroundGallery
                  backgrounds={backgrounds}
                  isLoading={isLoading}
                  error={error}
                  onSelectBackground={handleBackgroundSelect}
                  emptyStateMessage="No backgrounds available yet. Be the first to create one!"
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-10 flex justify-between items-center">
                <div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-white/60 hover:text-white flex items-center mb-3 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 19L8 12L15 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Back to Categories
                  </button>
                  <h1 className="text-3xl font-display font-medium text-white">
                    {selectedCategory}
                  </h1>
                </div>
              </div>

              {/* Category Navigation for switching between categories */}
              <CategoryNav
                categories={Object.keys(backgroundsByCategory)}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />

              {/* Background gallery for the selected category */}
              <BackgroundGallery
                backgrounds={backgrounds}
                isLoading={isLoading}
                error={error}
                onSelectBackground={handleBackgroundSelect}
                emptyStateMessage={`No backgrounds found in ${
                  selectedCategory || "this category"
                }`}
              />
            </>
          )}
        </div>
      </main>

      {selectedBackground && (
        <BackgroundDetailsModal
          open={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          background={selectedBackground}
        />
      )}
    </div>
  );
};

export default Marketplace;
