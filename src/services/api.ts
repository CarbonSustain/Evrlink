import axios from "axios";
import { useWallet } from "@/contexts/WalletContext";
import { eventBus } from "./eventBus";
import { authLog, apiLog } from "../utils/debug";

// Get API base URL from environment or use fallback with improved error handling
export const getApiBaseUrl = () => {
  // First try Vite environment variable
  let baseUrl = import.meta.env.VITE_API_URL;

  // If that's not available, use default
  if (!baseUrl) {
    console.warn("VITE_API_URL not found in environment, using default URL");
    baseUrl =
      import.meta.env.MODE === "development"
        ? "http://localhost:3001"
        : "http://localhost:3001";
  }

  // Log the API base URL being used
  console.log("API Base URL:", baseUrl);

  // Remove trailing slash if present
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

// Use the function to get the base URL
export const API_BASE_URL = getApiBaseUrl();

// Ensure the base URL is reasonable
if (!API_BASE_URL.startsWith("http")) {
  console.error("Invalid API base URL detected:", API_BASE_URL);
  console.error(
    "This will cause API requests to fail. Please check your VITE_API_URL environment variable."
  );
}

// Event system for database changes
export class DatabaseEvents {
  private static listeners = {
    backgroundAdded: [] as ((background: Background) => void)[],
    backgroundUpdated: [] as ((background: Background) => void)[],
  };

  // Methods to register listeners
  static onBackgroundAdded(callback: (background: Background) => void) {
    this.listeners.backgroundAdded.push(callback);
    return () => this.offBackgroundAdded(callback); // Return unsubscribe function
  }

  static onBackgroundUpdated(callback: (background: Background) => void) {
    this.listeners.backgroundUpdated.push(callback);
    return () => this.offBackgroundUpdated(callback); // Return unsubscribe function
  }

  // Methods to remove listeners
  static offBackgroundAdded(callback: (background: Background) => void) {
    this.listeners.backgroundAdded = this.listeners.backgroundAdded.filter(
      (cb) => cb !== callback
    );
  }

  static offBackgroundUpdated(callback: (background: Background) => void) {
    this.listeners.backgroundUpdated = this.listeners.backgroundUpdated.filter(
      (cb) => cb !== callback
    );
  }

  // Methods to emit events
  static emitBackgroundAdded(background: Background) {
    this.listeners.backgroundAdded.forEach((callback) => callback(background));
  }

  static emitBackgroundUpdated(background: Background) {
    this.listeners.backgroundUpdated.forEach((callback) =>
      callback(background)
    );
  }
}

export interface Background {
  id: string;
  artistAddress: string;
  imageURI: string;
  category: string;
  price: string;
  blockchainId?: string;
  blockchainTxHash?: string;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GiftCard {
  id: string;
  creatorAddress: string;
  currentOwner: string;
  price: string;
  message: string;
  secretHash?: string;
  backgroundId: string;
  background?: Background;
  isClaimable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  bio?: string;
  profileImageUrl?: string;
  totalGiftCardsCreated?: number;
  totalGiftCardsSold?: number;
  totalBackgroundsCreated?: number;
}

export interface Transaction {
  id: string;
  giftCardId: string;
  fromAddress: string;
  toAddress: string;
  transactionType: "purchase" | "transfer" | "claim";
  amount: string;
  timestamp: string;
}

// Get token from localStorage with more robust error handling
const getToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      authLog("No auth token found in localStorage", null, "warn");
      return null;
    }

    // Check if it looks like a JWT (has 3 parts separated by dots)
    const parts = token.split(".");
    if (parts.length !== 3) {
      authLog(
        "Token does not appear to be in JWT format",
        { token: token.substring(0, 15) + "..." },
        "warn"
      );
    } else {
      authLog("Found valid JWT token format", {
        tokenPreview: token.substring(0, 15) + "...",
      });
    }

    return token;
  } catch (error) {
    authLog("Error accessing localStorage for token", error, "error");
    return null;
  }
};

// Add token to request headers with improved error handling
export const getAuthHeaders = () => {
  apiLog("Getting auth headers for request");
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    apiLog("Added Authorization header to request", {
      headerPreview: `Bearer ${token.substring(0, 15)}...`,
    });
  } else {
    apiLog(
      "No auth token available - request may fail if authentication is required",
      null,
      "warn"
    );
  }

  return headers;
};

// Fetch backgrounds (all or by category)
export const fetchBackgrounds = async (
  category?: string,
  page: number = 1,
  limit: number = 20
): Promise<Background[]> => {
  try {
    const params: any = { page, limit };
    if (category) params.category = category;

    const response = await axios.get(`${API_BASE_URL}/api/background`, {
      params,
    });
    return response.data.backgrounds || response.data;
  } catch (error) {
    console.error("Fetch backgrounds error:", error);
    throw new Error("Failed to fetch backgrounds");
  }
};

// Get background by ID
export const getBackgroundById = async (id: string): Promise<Background> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/background/${id}`);

    // Emit background updated event
    eventBus.emitBackgroundUpdated({
      background: response.data,
      action: "updated",
    });

    return response.data;
  } catch (error) {
    console.error("Get background error:", error);
    throw new Error("Failed to get background");
  }
};

// Get all background categories
export const getBackgroundCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/background/categories`
    );
    return response.data.categories || response.data;
  } catch (error) {
    console.error("Get categories error:", error);
    throw new Error("Failed to get categories");
  }
};

// Create gift card
export const createGiftCard = async (data: {
  backgroundId: string | number;
  price: string;
  message: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/gift-cards/create`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Add success field to the response
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error("Create gift card error:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to create gift card",
    };
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/images/upload`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.imageUrl || response.data;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }
};

export const createBackground = async (data: {
  image: File;
  category: string;
  price: string;
}) => {
  try {
    const formData = new FormData();
    formData.append("image", data.image);
    formData.append("category", data.category);
    formData.append("price", data.price);
    formData.append(
      "artistAddress",
      localStorage.getItem("walletAddress") || ""
    );

    // Log the request details for debugging
    console.log("Sending background creation request:", {
      category: data.category,
      price: data.price,
      artistAddress: localStorage.getItem("walletAddress"),
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/backgrounds`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Background created successfully:", response.data);

    // Emit background added event
    if (response.data && response.data.background) {
      DatabaseEvents.emitBackgroundAdded(response.data.background);
    }

    return response.data;
  } catch (error) {
    console.error("Create background error:", error);
    throw new Error("Failed to create background");
  }
};

export const mintBackgroundNFT = async (data: {
  image: File;
  category: string;
  price: string;
}): Promise<any> => {
  try {
    // Check if user is authenticated
    const token = getToken();
    if (!token) {
      authLog("No auth token found when attempting to mint NFT", null, "error");
      throw new Error("Authentication required - please login first");
    }

    const walletAddress = localStorage.getItem("walletAddress");
    if (!walletAddress) {
      authLog(
        "No wallet address found when attempting to mint NFT",
        null,
        "error"
      );
      throw new Error("No wallet address found - please connect your wallet");
    }

    authLog("Starting NFT minting process", {
      category: data.category,
      price: data.price,
      imageFilename: data.image.name,
      walletAddress,
    });

    const formData = new FormData();
    formData.append("image", data.image);
    formData.append("category", data.category);
    formData.append("price", data.price);
    formData.append("artistAddress", walletAddress);

    apiLog("Sending mint request to backend", {
      endpoint: `${API_BASE_URL}/api/background/mint`,
      walletAddress,
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/background/mint`,
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    apiLog("Mint request successful", {
      statusCode: response.status,
      dataPreview: JSON.stringify(response.data).substring(0, 100) + "...",
    });

    // Emit background added event if successful
    if (response.data && response.data.success) {
      const backgroundData = response.data.background || response.data;
      eventBus.emitBackgroundUpdated({
        background: backgroundData,
        action: "added",
      });

      apiLog("Background created and event emitted", {
        backgroundId: backgroundData.id,
      });
    }

    return response.data;
  } catch (error: any) {
    authLog("Error during NFT minting", error, "error");

    // Handle authentication errors specifically
    if (error.response && error.response.status === 401) {
      authLog(
        "Authentication error during minting - token may be invalid",
        {
          statusCode: error.response.status,
          statusText: error.response.statusText,
          errorDetails: error.response.data,
        },
        "error"
      );

      throw new Error("Authentication failed - please login again");
    }

    // Provide more specific error message from the server response when available
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }

    // Otherwise throw a generic error
    throw new Error("Failed to mint background NFT");
  }
};

export const verifyBackgroundStatus = async (
  backgroundId: string | number
): Promise<any> => {
  try {
    const id = backgroundId.toString();
    const response = await axios.get(
      `${API_BASE_URL}/api/background/verify/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Verify background status error:", error);
    throw new Error("Failed to verify background status");
  }
};

// =====================
// GIFT CARD ENDPOINTS
// =====================

// Get all gift cards with filtering
export const fetchGiftCards = async (
  page: number = 1,
  limit: number = 20,
  status?: string,
  minPrice?: string,
  maxPrice?: string
): Promise<GiftCard[]> => {
  try {
    const params: any = { page, limit };
    if (status) params.status = status;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    const response = await axios.get(`${API_BASE_URL}/api/gift-cards`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data.giftCards || response.data;
  } catch (error) {
    console.error("Fetch gift cards error:", error);
    throw new Error("Failed to fetch gift cards");
  }
};

// Transfer a gift card
export const transferGiftCard = async (data: {
  giftCardId: string | number;
  recipientAddress: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/gift-cards/transfer`,
      {
        giftCardId: data.giftCardId,
        recipientAddress: data.recipientAddress,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error("Transfer gift card error:", error);
    throw new Error("Failed to transfer gift card");
  }
};

// Set secret key for a gift card
export const setGiftCardSecret = async (data: {
  giftCardId: string | number;
  secret: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/gift-cards/${data.giftCardId}/set-secret`,
      {
        secret: data.secret,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error("Set gift card secret error:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to set gift card secret",
    };
  }
};

// Claim a gift card
export const claimGiftCard = async (data: {
  giftCardId: string | number;
  secret: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/gift-cards/claim`,
      {
        giftCardId: data.giftCardId,
        secret: data.secret,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Claim gift card error:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to claim gift card",
    };
  }
};

// Buy a gift card
export const buyGiftCard = async (data: {
  giftCardId: string | number;
  message?: string;
  price: string;
}): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/gift-cards/buy`,
      {
        giftCardId: data.giftCardId,
        message: data.message,
        price: data.price,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    console.error("Buy gift card error:", error.response?.data || error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to buy gift card",
    };
  }
};

// =====================
// USER ENDPOINTS
// =====================

// Create or update a user profile
export const updateUserProfile = async (data: {
  username?: string;
  email?: string;
  bio?: string;
  profileImageUrl?: string;
}): Promise<User> => {
  try {
    const walletAddress = localStorage.getItem("walletAddress");
    if (!walletAddress) {
      throw new Error("No wallet address found - please connect your wallet");
    }

    const userData = {
      walletAddress,
      ...data,
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/user/profile`,
      userData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.user || response.data;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw new Error("Failed to update user profile");
  }
};

// Get user profile
export const getUserProfile = async (walletAddress: string): Promise<User> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/${walletAddress}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.user || response.data;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw new Error("Failed to get user profile");
  }
};

// Get all users with pagination and sorting
export const fetchUsers = async (
  page: number = 1,
  limit: number = 20,
  sortBy?: string,
  sortOrder?: "ASC" | "DESC"
): Promise<User[]> => {
  try {
    const params: any = { page, limit };
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    const response = await axios.get(`${API_BASE_URL}/api/user`, {
      params,
      headers: getAuthHeaders(),
    });
    return response.data.users || response.data;
  } catch (error) {
    console.error("Fetch users error:", error);
    throw new Error("Failed to fetch users");
  }
};

// Get top users
export const getTopUsers = async (limit: number = 10): Promise<User[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/top?limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.users || response.data;
  } catch (error) {
    console.error("Get top users error:", error);
    throw new Error("Failed to get top users");
  }
};

// Search users
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/search?query=${encodeURIComponent(query)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.users || response.data;
  } catch (error) {
    console.error("Search users error:", error);
    throw new Error("Failed to search users");
  }
};

// Get user activity
export const getUserActivity = async (
  walletAddress: string
): Promise<any[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/${walletAddress}/activity`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.activity || response.data;
  } catch (error) {
    console.error("Get user activity error:", error);
    throw new Error("Failed to get user activity");
  }
};

// =====================
// TRANSACTION ENDPOINTS
// =====================

// Get recent transactions
export const getRecentTransactions = async (
  limit: number = 10
): Promise<Transaction[]> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/transactions/recent?limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.transactions || response.data;
  } catch (error) {
    console.error("Get recent transactions error:", error);
    throw new Error("Failed to get recent transactions");
  }
};

// =====================
// AUTHENTICATION
// =====================

// Login with wallet
export const loginWithWallet = async (
  walletAddress: string,
  signature: string
): Promise<any> => {
  try {
    // Normalize the address to lowercase to avoid checksum issues
    const normalizedAddress = walletAddress.toLowerCase();

    authLog("Attempting login with wallet", {
      address: normalizedAddress,
      signatureType: signature.startsWith("mock_signature_for_")
        ? "mock"
        : "real",
    });

    apiLog("Sending login request to backend", {
      endpoint: `${API_BASE_URL}/api/auth/login`,
      method: "POST",
    });

    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      address: normalizedAddress, // Use normalized address
      signature,
    });

    // Validate the response
    if (!response.data || !response.data.token) {
      authLog("Invalid login response - missing token", response.data, "error");
      throw new Error("Authentication failed: server response missing token");
    }

    const token = response.data.token;
    authLog("Login successful", {
      tokenPreview: token.substring(0, 15) + "...",
      userInfo: response.data.user,
    });

    // Store token for future requests
    localStorage.setItem("token", token);
    localStorage.setItem("walletAddress", walletAddress); // Store original format

    // Verify token was properly stored
    const storedToken = localStorage.getItem("token");
    if (storedToken !== token) {
      authLog("Token storage verification failed", null, "error");
      throw new Error("Failed to store authentication token");
    }

    authLog("Token stored successfully in localStorage");

    return response.data;
  } catch (error: any) {
    authLog("Login error", error, "error");

    // Extract useful error information if available
    if (error.response) {
      authLog(
        "Server response error",
        {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        },
        "error"
      );

      if (error.response.data && error.response.data.error) {
        throw new Error(`Login failed: ${error.response.data.error}`);
      }
    }

    throw new Error(
      "Failed to login with wallet: " + (error.message || "Unknown error")
    );
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    return response.data.user || response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

// Logout
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("walletAddress");
};

// Check and refresh authentication if needed
export const checkAuthState = async (): Promise<{
  isAuthenticated: boolean;
  message: string;
}> => {
  try {
    const token = localStorage.getItem("token");
    const walletAddress = localStorage.getItem("walletAddress");

    // If we don't have both token and wallet address, we're not authenticated
    if (!token || !walletAddress) {
      authLog(
        "Not authenticated - missing token or wallet address",
        {
          hasToken: !!token,
          hasWalletAddress: !!walletAddress,
        },
        "warn"
      );
      return {
        isAuthenticated: false,
        message: "Not authenticated - please connect your wallet",
      };
    }

    // Try to decode the token to check expiration
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));

        // Check if token is expired
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000);
          const now = new Date();

          // If token is expired or about to expire (within 10 minutes)
          if (expiryDate.getTime() - now.getTime() < 10 * 60 * 1000) {
            authLog(
              "Token is expired or about to expire",
              {
                expiry: expiryDate.toISOString(),
                now: now.toISOString(),
              },
              "warn"
            );

            // Try to refresh the token by re-authenticating
            authLog("Attempting to refresh authentication");

            // Create a mock signature for development
            const signature = `mock_signature_for_${walletAddress}`;
            const response = await loginWithWallet(walletAddress, signature);

            if (response && response.token) {
              authLog("Authentication refreshed successfully");
              return {
                isAuthenticated: true,
                message: "Authentication refreshed successfully",
              };
            } else {
              authLog("Failed to refresh authentication", null, "error");
              return {
                isAuthenticated: false,
                message: "Failed to refresh authentication",
              };
            }
          }
        }
      }
    } catch (decodeError) {
      authLog("Error decoding token", decodeError, "error");
      // Continue with the check - we'll try to use the token anyway
    }

    // Validate the current authentication by making a test request
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: getAuthHeaders(),
      });

      if (
        response.data &&
        (response.data.user || response.data.walletAddress)
      ) {
        authLog("Authentication validation successful", response.data);
        return {
          isAuthenticated: true,
          message: "Authentication validated successfully",
        };
      } else {
        authLog(
          "Authentication validation failed - invalid response",
          response.data,
          "warn"
        );
        return {
          isAuthenticated: false,
          message: "Authentication validation failed",
        };
      }
    } catch (error: any) {
      authLog("Error validating authentication", error, "error");

      // Check if it's an authentication error (401)
      if (error.response && error.response.status === 401) {
        // Try to refresh authentication
        try {
          authLog("Authentication validation failed - attempting to refresh");

          // Create a mock signature for development
          const signature = `mock_signature_for_${walletAddress}`;
          const refreshResponse = await loginWithWallet(
            walletAddress,
            signature
          );

          if (refreshResponse && refreshResponse.token) {
            authLog(
              "Authentication refreshed successfully after validation failure"
            );
            return {
              isAuthenticated: true,
              message: "Authentication refreshed successfully",
            };
          }
        } catch (refreshError) {
          authLog(
            "Failed to refresh authentication after validation failure",
            refreshError,
            "error"
          );
        }
      }

      return {
        isAuthenticated: false,
        message:
          "Authentication validation failed: " +
          (error.message || "Unknown error"),
      };
    }
  } catch (error: any) {
    authLog("Unexpected error in checkAuthState", error, "error");
    return {
      isAuthenticated: false,
      message:
        "Authentication check failed: " + (error.message || "Unknown error"),
    };
  }
};
