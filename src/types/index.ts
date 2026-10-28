export type UserRole = 'donor' | 'ngo' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  organization?: string;
  businessName?: string;
  ngoId?: string;
  avatar?: string;
  email: string;
}

export type FoodCategory = 
  | 'Cooked Meals'
  | 'Fresh Produce'
  | 'Bakery Items'
  | 'Dairy Products'
  | 'Canned Goods'
  | 'Beverages'
  | 'Dry Goods'
  | 'Mixed/Other';

export type DonationStatus = 'available' | 'accepted' | 'picked_up' | 'delivered';

export type StorageCondition = 'room_temperature' | 'refrigerated' | 'frozen' | 'hot_holding';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Donation {
  id: string;
  foodName: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  preparedAt: string;
  pickupLocation: string;
  pickupDeadline: string;
  storageCondition: StorageCondition;
  contactName: string;
  contactPhone: string;
  notes: string;
  status: DonationStatus;
  donorId: string;
  donorName: string;
  acceptedByNgoId?: string;
  acceptedBy?: string;
  acceptedByName?: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  createdAt: string;
  urgency: UrgencyLevel;
}

export interface NGOPartner {
  id: string;
  name: string;
  description: string;
  location: string;
  area: string;
  capacity: number;
  acceptedFoodTypes: string[];
  pickupAvailable: boolean;
  specialties: FoodCategory[];
  contactEmail: string;
  contactPhone: string;
  operatingHours: string;
  distance: number; // km from donor (demo)
  activePickups: number;
  totalDelivered: number;
  rating: number;
  avatar: string;
}

export interface MatchResult {
  ngoId: string;
  score: number;
  reason: string;
}

export interface MatchResponse {
  matches: MatchResult[];
  isFallback?: boolean;
}

export interface AIMatch {
  ngoId: string;
  ngo: NGOPartner;
  score: number;
  factors: MatchFactor[];
  explanation: string;
}

export interface MatchFactor {
  name: string;
  score: number;
  weight: number;
  detail: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  targetRole?: UserRole;
  targetUserId?: string;
  targetNgoId?: string;
}

export interface DonationFormData {
  foodName: string;
  category: FoodCategory | '';
  quantity: string;
  unit: string;
  preparedAt: string;
  pickupLocation: string;
  pickupDeadline: string;
  storageCondition: StorageCondition | '';
  contactName: string;
  contactPhone: string;
  notes: string;
}
