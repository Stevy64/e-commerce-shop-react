/**
 * Service API pour l'e-commerce ADDINA
 * 
 * Ce service remplace les appels Supabase par des appels vers l'API Django.
 * Il maintient la même interface pour assurer la compatibilité avec le frontend existant.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:8002/api';

// Interface pour les types de données (compatibles avec Supabase)
export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined: string;
}

export interface Profile {
  id: string;
  user: User;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  discount?: number;
  image_url?: string;
  is_new?: boolean;
  effective_price: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user: string;
  product: Product;
  quantity: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user: User;
  total_amount: number;
  status: string;
  items: OrderItem[];
  total_items: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  total_price: number;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user: string;
  product: Product;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface CartTotal {
  total_amount: number;
  total_items: number;
  currency: string;
}

class ApiService {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Intercepteur pour gérer le refresh token
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.accessToken) {
          try {
            await this.refreshToken();
            // Retry the original request
            return this.api.request(error.config);
          } catch (refreshError) {
            this.logout();
            throw refreshError;
          }
        }
        throw error;
      }
    );

    // Charger le token depuis le localStorage
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.accessToken = token;
    }
  }

  private saveTokenToStorage(tokens: AuthTokens) {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(tokens.user));
    this.accessToken = tokens.access;
  }

  private clearTokenFromStorage() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.accessToken = null;
  }

  // Authentification
  async login(username: string, password: string): Promise<AuthTokens> {
    const response = await this.api.post<AuthTokens>('/auth/login/', {
      username,
      password,
    });
    this.saveTokenToStorage(response.data);
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }): Promise<{ message: string; user: User }> {
    const response = await this.api.post('/auth/register/', userData);
    return response.data;
  }

  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post<{ access: string }>('/auth/refresh/', {
      refresh: refreshToken,
    });

    this.accessToken = response.data.access;
    localStorage.setItem('access_token', response.data.access);
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/auth/user/');
    return response.data;
  }

  logout() {
    this.clearTokenFromStorage();
  }

  // Produits
  async getProducts(): Promise<Product[]> {
    const response = await this.api.get<{ results: Product[] }>('/products/');
    return response.data.results || response.data;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const response = await this.api.get<Product[]>('/products/featured/');
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.api.get<Product>(`/products/${id}/`);
    return response.data;
  }

  // Panier
  async getCartItems(): Promise<CartItem[]> {
    const response = await this.api.get<{ results: CartItem[] }>('/cart-items/');
    return response.data.results || response.data;
  }

  async addToCart(productId: string, quantity: number = 1): Promise<CartItem> {
    const response = await this.api.post<CartItem>('/cart-items/', {
      product_id: productId,
      quantity,
    });
    return response.data;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const response = await this.api.patch<CartItem>(`/cart-items/${id}/`, {
      quantity,
    });
    return response.data;
  }

  async removeFromCart(id: string): Promise<void> {
    await this.api.delete(`/cart-items/${id}/`);
  }

  async clearCart(): Promise<{ message: string; deleted_count: number }> {
    const response = await this.api.delete('/cart/clear/');
    return response.data;
  }

  async getCartTotal(): Promise<CartTotal> {
    const response = await this.api.get<CartTotal>('/cart/total/');
    return response.data;
  }

  // Commandes
  async getOrders(): Promise<Order[]> {
    const response = await this.api.get<{ results: Order[] }>('/orders/');
    return response.data.results || response.data;
  }

  async createOrderFromCart(): Promise<Order> {
    const response = await this.api.post<Order>('/orders/create-from-cart/');
    return response.data;
  }

  // Liste de souhaits
  async getWishlistItems(): Promise<WishlistItem[]> {
    const response = await this.api.get<{ results: WishlistItem[] }>('/wishlist-items/');
    return response.data.results || response.data;
  }

  async addToWishlist(productId: string): Promise<WishlistItem> {
    const response = await this.api.post<WishlistItem>('/wishlist-items/', {
      product_id: productId,
    });
    return response.data;
  }

  async removeFromWishlist(id: string): Promise<void> {
    await this.api.delete(`/wishlist-items/${id}/`);
  }

  // Profil
  async getProfile(): Promise<Profile> {
    const response = await this.api.get<Profile>('/profile/me/');
    return response.data;
  }

  async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
    const response = await this.api.patch<Profile>('/profiles/me/', profileData);
    return response.data;
  }

  // Utilitaires
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Instance singleton du service API
export const apiService = new ApiService();

// Export par défaut pour compatibilité
export default apiService;

