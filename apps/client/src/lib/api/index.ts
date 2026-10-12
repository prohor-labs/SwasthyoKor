import { api } from "./client";
import type { Cart, Collection, Menu, Order, Page, Product } from "@/types";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isAdmin: boolean;
  phone?: string;
}

export const authApi = {
  getMe: async (): Promise<{ user: User | null }> => {
    const res = await api.get("/auth/me");
    return res.data;
  },
  requestMagicLink: async (email: string) => {
    const res = await api.post("/auth/magic-link", { email });
    return res.data;
  },
  loginWithPassword: async (email: string, pass: string) => {
    const res = await api.post("/auth/login", { email, password: pass });
    return res.data;
  },
  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },
};

export const shopApi = {
  getProducts: async (params?: { query?: string; sortKey?: string; reverse?: boolean }): Promise<Product[]> => {
    const res = await api.get("/shop/products", { params });
    return res.data;
  },
  getProduct: async (handle: string): Promise<Product | undefined> => {
    const res = await api.get(`/shop/products/${handle}`);
    return res.data;
  },
  getProductRecommendations: async (id: string): Promise<Product[]> => {
    const res = await api.get(`/shop/products/${id}/recommendations`);
    return res.data;
  },
  getProductReviews: async (id: string) => {
    const res = await api.get(`/shop/products/${id}/reviews`);
    return res.data;
  },
  getCollections: async (): Promise<Collection[]> => {
    const res = await api.get("/shop/collections");
    return res.data;
  },
  getCollection: async (handle: string): Promise<Collection | undefined> => {
    const res = await api.get(`/shop/collections/${handle}`);
    return res.data;
  },
  getCollectionProducts: async (handle: string, params?: { sortKey?: string; reverse?: boolean }): Promise<Product[]> => {
    const res = await api.get(`/shop/collections/${handle}/products`, { params });
    return res.data;
  },
  getHomepageCategories: async () => {
    const res = await api.get("/shop/homepage/categories");
    return res.data;
  },
  getHomepageShowcase: async () => {
    const res = await api.get("/shop/homepage/showcase");
    return res.data;
  },
  getHeroBanners: async () => {
    const res = await api.get("/shop/homepage/banners");
    return res.data;
  },
  getSettings: async () => {
    const res = await api.get("/shop/settings");
    return res.data;
  },
  getMenu: async (handle: string): Promise<Menu[]> => {
    const res = await api.get(`/shop/menus/${handle}`);
    return res.data;
  },
  getPages: async (): Promise<Page[]> => {
    const res = await api.get("/shop/pages");
    return res.data;
  },
  getPage: async (handle: string): Promise<Page | undefined> => {
    const res = await api.get(`/shop/pages/${handle}`);
    return res.data;
  },
  getBlogs: async () => {
    const res = await api.get("/shop/blogs");
    return res.data;
  },
  getBlog: async (slug: string) => {
    const res = await api.get(`/shop/blogs/${slug}`);
    return res.data;
  },
};

export const cartApi = {
  getCart: async (): Promise<{ cart: Cart | null }> => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (!res.ok) return { cart: null };
    return res.json();
  },
  addItem: async (variantId: string, quantity = 1): Promise<{ cart: Cart | null }> => {
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, quantity }),
    });
    return res.json();
  },
  updateQuantity: async (variantId: string, type: "plus" | "minus" | "delete"): Promise<{ cart: Cart | null }> => {
    const res = await fetch(`/api/cart/items/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    return res.json();
  },
  removeItem: async (variantId: string): Promise<{ cart: Cart | null }> => {
    const res = await fetch(`/api/cart/items/${variantId}`, {
      method: "DELETE",
    });
    return res.json();
  },
};

export const ordersApi = {
  getOrder: async (id: string): Promise<{ order: Order | null }> => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  checkoutCart: async (data: { address?: string; phone?: string; customerName?: string }): Promise<{ paymentUrl?: string; orderId: string; redirectUrl?: string; success?: boolean }> => {
    const res = await api.post("/orders/checkout", data);
    return res.data;
  },
  checkoutDirect: async (data: {
    handle: string;
    quantity?: number;
    name?: string;
    phone?: string;
    address?: string;
    couponCode?: string;
  }): Promise<{ paymentUrl?: string; orderId: string; redirectUrl?: string; success?: boolean }> => {
    const res = await api.post("/orders/checkout/direct", data);
    return res.data;
  },
};

export const adminApi = {
  getProducts: async () => (await api.get("/admin/products")).data,
  createProduct: async (data: any) => (await api.post("/admin/products", data)).data,
  deleteProduct: async (id: string) => (await api.delete(`/admin/products/${id}`)).data,
  toggleProductAvailability: async (id: string, available: boolean) =>
    (await api.patch(`/admin/products/${id}/availability`, { available })).data,
  getOrders: async () => (await api.get("/admin/orders")).data,
  updateOrderStatus: async (id: string, status: string) =>
    (await api.patch(`/admin/orders/${id}/status`, { status })).data,
  getCollections: async () => (await api.get("/admin/collections")).data,
  createCollection: async (data: any) => (await api.post("/admin/collections", data)).data,
  deleteCollection: async (id: string) => (await api.delete(`/admin/collections/${id}`)).data,
  getCustomers: async () => (await api.get("/admin/customers")).data,
  toggleCustomerBan: async (id: string, isBanned: boolean) =>
    (await api.patch(`/admin/customers/${id}/ban`, { isBanned })).data,
  getCoupons: async () => (await api.get("/admin/coupons")).data,
  createCoupon: async (data: any) => (await api.post("/admin/coupons", data)).data,
  deleteCoupon: async (id: string) => (await api.delete(`/admin/coupons/${id}`)).data,
  getBanners: async () => (await api.get("/admin/banners")).data,
  createBanner: async (data: any) => (await api.post("/admin/banners", data)).data,
  deleteBanner: async (id: string) => (await api.delete(`/admin/banners/${id}`)).data,
  updateSettings: async (data: any) => (await api.post("/admin/settings", data)).data,
};
