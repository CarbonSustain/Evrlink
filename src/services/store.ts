import { create } from 'zustand';
import { Background } from './api';
import { fetchBackgrounds } from './api';

interface BackgroundsState {
  // Store backgrounds by category
  backgroundsByCategory: Record<string, Background[]>;
  // Track which categories have been loaded
  loadedCategories: Set<string>;
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCategoryBackgrounds: (category: string) => Promise<void>;
  addBackground: (background: Background) => void;
  updateBackground: (background: Background) => void;
  fetchAllBackgrounds: () => Promise<void>;
  clearCache: () => void;
}

export const useBackgroundsStore = create<BackgroundsState>((set, get) => ({
  backgroundsByCategory: {},
  loadedCategories: new Set<string>(),
  isLoading: false,
  error: null,
  
  fetchCategoryBackgrounds: async (category: string) => {
    // Skip if already loaded
    if (get().loadedCategories.has(category)) {
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const backgrounds = await fetchBackgrounds(category);
      
      set((state) => ({
        backgroundsByCategory: {
          ...state.backgroundsByCategory,
          [category]: backgrounds,
        },
        loadedCategories: new Set([...state.loadedCategories, category]),
        isLoading: false,
      }));
      
      console.log(`Loaded ${backgrounds.length} backgrounds for category: ${category}`);
    } catch (error) {
      console.error(`Failed to load backgrounds for category: ${category}`, error);
      set({ 
        error: `Failed to load backgrounds for category: ${category}`, 
        isLoading: false 
      });
    }
  },
  
  fetchAllBackgrounds: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const backgrounds = await fetchBackgrounds();
      
      // Group backgrounds by category
      const byCategory: Record<string, Background[]> = {};
      
      backgrounds.forEach(bg => {
        const category = bg.category;
        if (!byCategory[category]) {
          byCategory[category] = [];
        }
        byCategory[category].push(bg);
      });
      
      set({ 
        backgroundsByCategory: byCategory,
        loadedCategories: new Set(Object.keys(byCategory)),
        isLoading: false 
      });
      
      console.log(`Loaded backgrounds for ${Object.keys(byCategory).length} categories`);
    } catch (error) {
      console.error('Failed to load all backgrounds', error);
      set({ 
        error: 'Failed to load backgrounds', 
        isLoading: false 
      });
    }
  },
  
  addBackground: (background: Background) => {
    set((state) => {
      const category = background.category;
      const existingCategoryBackgrounds = state.backgroundsByCategory[category] || [];
      
      return {
        backgroundsByCategory: {
          ...state.backgroundsByCategory,
          [category]: [...existingCategoryBackgrounds, background],
        },
        loadedCategories: new Set([...state.loadedCategories, category]),
      };
    });
  },
  
  updateBackground: (background: Background) => {
    set((state) => {
      const category = background.category;
      const existingCategoryBackgrounds = state.backgroundsByCategory[category] || [];
      
      return {
        backgroundsByCategory: {
          ...state.backgroundsByCategory,
          [category]: existingCategoryBackgrounds.map(bg => 
            bg.id === background.id ? background : bg
          ),
        },
      };
    });
  },
  
  clearCache: () => {
    set({
      backgroundsByCategory: {},
      loadedCategories: new Set<string>(),
      isLoading: false,
      error: null,
    });
  },
})); 