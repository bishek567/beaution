/**
 * Shared Type Definitions for Beaution Beauty Portal
 */

export interface Service {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  offerPrice: number;
  image: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  discount: number;
  badge: string;
  services: string[];
}

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  serviceId?: string;
  packageId?: string;
  selectedName: string; // The service or package name
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  receiptNo: string;
  createdAt: string;
}

export interface SupportContact {
  dealerName: string;
  contactNumber: string;
  email: string;
  location: string;
  supportTiming: string;
  whatsappNumber: string;
}

export interface CustomerMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: 'Unread' | 'Replied' | 'Spam';
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  method: string;
  status: string;
  receiptNo: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalSales: number;
  totalBookings: number;
  revenue: number;
  customerSatisfaction: number;
  recentBookings: Booking[];
  salesByService: { name: string; value: number }[];
}
