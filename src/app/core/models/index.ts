// ═══════════════════════════════════════════════════════════════
//  AchatGroupéBF — Core Models / Interfaces TypeScript
// ═══════════════════════════════════════════════════════════════

// ── ENUMS / TYPES ────────────────────────────────────────────────
export type UserRole    = 'MEMBER' | 'SUPPLIER' | 'ADMIN';
export type UserStatus  = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED';

export type GroupStatus = 'OPEN' | 'THRESHOLD_REACHED' | 'PAYMENT_PENDING'
                        | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export type MemberStatus = 'ACTIVE' | 'DEPOSIT_PAID' | 'PAYMENT_COMPLETE' | 'WITHDRAWN';

export type SupplierStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED';

export type PaymentType   = 'DEPOSIT' | 'FINAL' | 'REFUND' | 'COMMISSION';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'ORANGE_MONEY' | 'MOOV_MONEY' | 'LIGDICASH' | 'CARD';

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'PROCESSING'
                        | 'SHIPPED'  | 'DELIVERED' | 'DISPUTED' | 'CANCELLED';

export type NotifType = 'NEW_MEMBER' | 'THRESHOLD_REACHED' | 'PAYMENT_REMINDER'
                      | 'PAYMENT_SUCCESS' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED'
                      | 'GROUP_EXPIRED'   | 'PROMO';

export type DisputeStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type DisputeReason = 'NOT_RECEIVED' | 'QUALITY_ISSUE' | 'WRONG_PRODUCT'
                           | 'REFUND_REFUSED' | 'OTHER';

export type ProductStatus = 'ACTIVE' | 'APPROVED' | 'PENDING' | 'PENDING_APPROVAL' | 'REJECTED' | 'INACTIVE' | 'ARCHIVED';

// ── USER ─────────────────────────────────────────────────────────
export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  trustScore: number;
  city: string;
  referralCode: string;
  totalSaved: number;
  referralCount?: number;
  createdAt: Date;
  avatarUrl?: string;
}

// ── AUTH ─────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface LoginDto {
  phone: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
  acceptTerms: boolean;
  role?: 'MEMBER' | 'SUPPLIER';
}

export interface OtpDto {
  phone: string;
  otp: string;
}

// ── CATEGORY ─────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
  productCount: number;
}

// ── SUPPLIER ─────────────────────────────────────────────────────
export interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  description?: string;
  status: SupplierStatus;
  verifiedAt?: Date;
  rating: number;
  reviewCount: number;
  totalGroups: number;
  successRate: number;
  createdAt: Date;
  user: User;
}

// ── PRODUCT ──────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  emoji: string;
  soloPrice: number;
  minGroupPrice?: number;
  category: Category;
  supplier: Supplier;
  status: ProductStatus;
  stock: number;
  rating: number;
  reviewCount: number;
  activeGroupCount: number;
  createdAt: Date;
}

// ── PRICING TIER ─────────────────────────────────────────────────
export interface PricingTier {
  minParticipants: number;
  discountPercent: number;
  price: number;
}

// ── GROUP ─────────────────────────────────────────────────────────
export interface Group {
  id: string;
  product: Product;
  supplier: Supplier;
  status: GroupStatus;
  minParticipants: number;
  currentCount: number;
  currentPrice: number;
  discountPercent: number;
  pricingTiers: PricingTier[];
  depositAmount: number;
  expiresAt: Date;
  thresholdReachedAt?: Date;
  paymentDeadline?: Date;
  members?: GroupMember[];
  createdAt: Date;
}

// ── GROUP MEMBER ─────────────────────────────────────────────────
export interface GroupMember {
  id: string;
  user: User;
  group: Group;
  status: MemberStatus;
  depositPaid: boolean;
  depositAmount: number;
  finalPaymentDone: boolean;
  joinedAt: Date;
}

// ── PAYMENT ──────────────────────────────────────────────────────
export interface Payment {
  id: string;
  user: User;
  group: Group;
  type: PaymentType;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  reference: string;
  transactionId?: string;
  phone?: string;
  createdAt: Date;
}

// ── ORDER ─────────────────────────────────────────────────────────
export interface Order {
  id: string;
  member: GroupMember;
  group: Group;
  product: Product;
  amount: number;
  status: OrderStatus;
  trackingCode?: string;
  deliveredAt?: Date;
  createdAt: Date;
}

// ── NOTIFICATION ──────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

// ── REVIEW ───────────────────────────────────────────────────────
export interface Review {
  id: string;
  user: User;
  product: Product;
  order: Order;
  rating: number;
  comment: string;
  createdAt: Date;
}

// ── DISPUTE ──────────────────────────────────────────────────────
export interface Dispute {
  id: string;
  order: Order;
  reporter: User;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

// ── ANALYTICS / STATS ────────────────────────────────────────────
export interface PlatformStats {
  totalMembers: number;
  activeGroups: number;
  successRate: number;
  totalRevenue: number;
  totalCommissions: number;
  newMembersToday: number;
  escrowAmount: number;
  openDisputes: number;
  pendingSuppliers: number;
  pendingProducts: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  commissions: number;
  groups: number;
}

export interface MemberStats {
  activeGroups: number;
  totalSaved: number;
  ongoingOrders: number;
  trustScore: number;
  referralCount: number;
}

export interface SupplierStats {
  activeGroups: number;
  totalParticipants: number;
  pendingOrders: number;
  monthlyRevenue: number;
}

// ── API WRAPPERS ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
