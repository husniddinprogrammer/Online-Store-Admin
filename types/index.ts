// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  page?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
}

export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail: string;
  timestamp?: string;
  errors?: Record<string, string>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DELIVERY" | "CUSTOMER";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
  birthdayAt: string;
  phoneNumber: string;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  birthdayAt: string;
  phoneNumber: string;
  balance: number;
  blocked: boolean;
  role: UserRole;
  lastLoginAt: string;
  createdAt: string;
  emailVerified: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  surname: string;
  birthdayAt: string;
  phoneNumber: string;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  imageLink: string;
}

export interface CategoryRequest {
  name: string;
  /** New image file to upload. Omit to keep the existing image. */
  image?: File;
}

// ─── Company ─────────────────────────────────────────────────────────────────

export interface Company {
  id: number;
  name: string;
  imageLink: string;
}

export interface CompanyRequest {
  name: string;
  /** Image is optional for companies. Omit to keep the existing image. */
  image?: File;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: number;
  imageUrl?: string;
  imageLink?: string;
  isMain?: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  discountPercent: number;
  stockQuantity: number;
  soldQuantity: number;
  category: Category;
  company: Company;
  arrivalPrice: number;
  sellPrice: number;
  discountedPrice: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  averageRating: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  discountPercent: number;
  stockQuantity: number;
  categoryId: number;
  companyId: number;
  arrivalPrice: number;
  sellPrice: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageLink: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface DeliveryAddress {
  id: number;
  regionType: string;
  cityType: string;
  homeNumber: string;
  roomNumber: string;
  createdAt: string;
}

export interface Order {
  id: number;
  userId: number;
  userName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  note?: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageLink: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// ─── Comment ─────────────────────────────────────────────────────────────────

export interface Comment {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  userSurname: string;
  text: string;
  rating: number;
  createdAt: string;
}

// ─── Notification ────────────────────────────────────────────────────────────

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface Notification {
  id: number;
  type: NotificationType;
  text: string;
  isSeen: boolean;
}

// ─── Address ─────────────────────────────────────────────────────────────────

export type RegionType =
  | "TASHKENT_CITY"
  | "TASHKENT_REGION"
  | "ANDIJAN"
  | "FERGANA"
  | "NAMANGAN"
  | "SAMARKAND"
  | "BUKHARA"
  | "NAVOI"
  | "KASHKADARYA"
  | "SURKHANDARYA"
  | "JIZZAKH"
  | "SIRDARYA"
  | "KHOREZM"
  | "KARAKALPAKSTAN";

export interface Address {
  id: number;
  regionType: RegionType;
  cityType: string;
  homeNumber: string;
  roomNumber: string;
  createdAt: string;
}

// ─── Poster ──────────────────────────────────────────────────────────────────

export interface Poster {
  id: number;
  imageLink: string;
  clickQuantity: number;
  link: string;
  createdAt: string;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export type PayMethod = "CARD" | "CASH";
export type PaymentStatus = "PAID" | "PENDING" | "FAILED";

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: PayMethod;
  status: PaymentStatus;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export type AnalyticsPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

export interface AnalyticsParams {
  period: AnalyticsPeriod;
  /** Required when period = CUSTOM (YYYY-MM-DD) */
  fromDate?: string;
  /** Required when period = CUSTOM (YYYY-MM-DD) */
  toDate?: string;
  /** Number of top products to return — default 10 */
  topLimit?: number;
}

export interface TopSellingProduct {
  productId: number;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
}

export interface AnalyticsData {
  totalProfit: number;
  totalRevenue: number;
  totalSoldProductsCount: number;
  totalOrdersCount: number;
  totalUsersAdded: number;
  totalProductsAdded: number;
  topSellingProducts: TopSellingProduct[];
  /** Present when backend includes chart-ready time series data */
  revenueChartData?: RevenueChartPoint[];
}

// ─── Query Params ────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface UserQueryParams extends PaginationParams {
  search?: string;
}

export type ProductSortOption =
  | "NEWEST"
  | "POPULAR"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "DISCOUNT_DESC"
  | "DISCOUNT_ASC"
  | "ID_DESC"
  | "ID_ASC"
  | "STOCK_DESC"
  | "STOCK_ASC"
  | "SOLD_DESC"
  | "SOLD_ASC";

export interface ProductQueryParams extends PaginationParams {
  search?: string;
  categoryId?: number;
  companyId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSortOption;
}

export interface OrderQueryParams extends PaginationParams {
  status?: OrderStatus;
}
