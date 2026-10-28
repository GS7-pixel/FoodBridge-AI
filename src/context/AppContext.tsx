import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Donation, DonationFormData, Notification, User, UserRole, NGOPartner } from '../types';
import { sampleDonations, sampleNGOs, sampleNotifications, demoUsers } from '../data/sampleData';
import { generateId, calculateUrgency, getVisibleDonations, getVisibleNGOs, getVisibleNotifications } from '../utils/helpers';

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  setCurrentRole: (role: UserRole) => void;
  setCurrentUserId: (userId: string) => void;
  donations: Donation[];
  visibleDonations: Donation[];
  visibleNGOs: NGOPartner[];
  addDonation: (data: DonationFormData) => Donation;
  acceptDonation: (donationId: string) => boolean;
  updateDonationStatus: (donationId: string, status: Donation['status']) => boolean;
  notifications: Notification[];
  visibleNotifications: Notification[];
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  ngoPartners: NGOPartner[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'foodbridge_donations_v3';
const NOTIF_KEY = 'foodbridge_notifications';
const USER_KEY = 'foodbridge_current_user_id';

function loadDonations(): Donation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].acceptedByNgoId !== undefined) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return sampleDonations;
}

function loadNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return sampleNotifications;
}

function loadCurrentUser(): User {
  try {
    const storedId = localStorage.getItem(USER_KEY);
    if (storedId) {
      const found = demoUsers.find(u => u.id === storedId);
      if (found) return found;
    }
  } catch { /* ignore */ }
  return demoUsers[0]; // Arjun Mehta, Sunrise Catering Co.
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(loadCurrentUser);
  const [donations, setDonations] = useState<Donation[]>(loadDonations);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(USER_KEY, currentUser.id);
  }, [currentUser]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setCurrentRole = useCallback((role: UserRole) => {
    const firstOfRole = demoUsers.find(u => u.role === role) || demoUsers[0];
    setCurrentUserState(firstOfRole);
  }, []);

  const setCurrentUserId = useCallback((userId: string) => {
    const found = demoUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUserState(found);
    }
  }, []);

  // Enforced visibility rules in ONE central place
  const visibleDonations = useMemo(() => {
    return getVisibleDonations(donations, currentUser);
  }, [donations, currentUser]);

  const visibleNGOs = useMemo(() => {
    return getVisibleNGOs(sampleNGOs, currentUser);
  }, [currentUser]);

  const visibleNotifications = useMemo(() => {
    return getVisibleNotifications(notifications, currentUser);
  }, [notifications, currentUser]);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const addDonation = useCallback((data: DonationFormData): Donation => {
    const newDonation: Donation = {
      id: generateId(),
      foodName: data.foodName,
      category: data.category as Donation['category'],
      quantity: parseInt(data.quantity) || 0,
      unit: data.unit,
      preparedAt: data.preparedAt || new Date().toISOString(),
      pickupLocation: data.pickupLocation,
      pickupDeadline: data.pickupDeadline,
      storageCondition: data.storageCondition as Donation['storageCondition'],
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      notes: data.notes,
      status: 'available',
      donorId: currentUser.id,
      donorName: currentUser.businessName || currentUser.organization || currentUser.name,
      acceptedByNgoId: '',
      createdAt: new Date().toISOString(),
      urgency: calculateUrgency(data.pickupDeadline),
    };
    setDonations(prev => [newDonation, ...prev]);
    addNotification({
      title: 'Donation Posted',
      message: `${data.foodName} has been listed for pickup.`,
      type: 'success',
      targetUserId: currentUser.id,
      targetRole: 'donor',
    });
    addToast({
      title: 'Donation Created',
      message: `"${data.foodName}" is now listed and available for NGOs.`,
      type: 'success',
    });
    return newDonation;
  }, [currentUser, addNotification, addToast]);

  const acceptDonation = useCallback((donationId: string): boolean => {
    let accepted = false;
    setDonations(prev =>
      prev.map(d => {
        if (d.id === donationId && d.status === 'available') {
          accepted = true;
          const ngoId = currentUser.ngoId || '';
          const ngo = sampleNGOs.find(n => n.id === ngoId);
          return {
            ...d,
            status: 'accepted' as const,
            acceptedBy: currentUser.id,
            acceptedByName: ngo?.name || currentUser.organization || currentUser.name,
            acceptedByNgoId: ngoId,
            acceptedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );
    if (accepted) {
      addNotification({
        title: 'Donation Accepted',
        message: `A donation has been accepted for pickup.`,
        type: 'success',
        targetNgoId: currentUser.ngoId,
      });
      addToast({
        title: 'Donation Accepted!',
        message: 'You have accepted this donation. Please arrange pickup.',
        type: 'success',
      });
    } else {
      addToast({
        title: 'Cannot Accept',
        message: 'This donation is no longer available.',
        type: 'warning',
      });
    }
    return accepted;
  }, [currentUser, addNotification, addToast]);

  const updateDonationStatus = useCallback((donationId: string, status: Donation['status']): boolean => {
    let updated = false;
    setDonations(prev =>
      prev.map(d => {
        if (d.id === donationId) {
          updated = true;
          const updates: Partial<Donation> = { status };
          if (status === 'picked_up') updates.pickedUpAt = new Date().toISOString();
          if (status === 'delivered') updates.deliveredAt = new Date().toISOString();
          return { ...d, ...updates };
        }
        return d;
      })
    );
    if (updated) {
      const statusLabels: Record<string, string> = {
        picked_up: 'picked up',
        delivered: 'delivered',
        accepted: 'accepted',
        available: 'available',
      };
      addToast({
        title: 'Status Updated',
        message: `Donation marked as ${statusLabels[status]}.`,
        type: 'success',
      });
    }
    return updated;
  }, [addToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers: demoUsers,
        setCurrentRole,
        setCurrentUserId,
        donations,
        visibleDonations,
        visibleNGOs,
        addDonation,
        acceptDonation,
        updateDonationStatus,
        notifications,
        visibleNotifications,
        markNotificationRead,
        addNotification,
        ngoPartners: sampleNGOs,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useVisibleDonations(user?: User): Donation[] {
  const { donations, currentUser } = useApp();
  const effectiveUser = user || currentUser;
  return useMemo(() => getVisibleDonations(donations, effectiveUser), [donations, effectiveUser]);
}
