import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Donation, DonationFormData, Notification, User, UserRole, NGOPartner } from '../types';
import { sampleDonations, sampleNGOs, sampleNotifications, demoUsers } from '../data/sampleData';
import { generateId, calculateUrgency } from '../utils/helpers';

interface AppContextType {
  currentUser: User;
  setCurrentRole: (role: UserRole) => void;
  donations: Donation[];
  addDonation: (data: DonationFormData) => Donation;
  acceptDonation: (donationId: string) => boolean;
  updateDonationStatus: (donationId: string, status: Donation['status']) => boolean;
  notifications: Notification[];
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

const STORAGE_KEY = 'foodbridge_donations';
const NOTIF_KEY = 'foodbridge_notifications';

function loadDonations(): Donation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<UserRole>('donor');
  const [donations, setDonations] = useState<Donation[]>(loadDonations);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const currentUser = demoUsers.find(u => u.role === currentRole) || demoUsers[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications]);

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
    setCurrentRoleState(role);
  }, []);

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
      donorName: currentUser.organization || currentUser.name,
      createdAt: new Date().toISOString(),
      urgency: calculateUrgency(data.pickupDeadline),
    };
    setDonations(prev => [newDonation, ...prev]);
    addNotification({
      title: 'Donation Posted',
      message: `${data.foodName} has been listed for pickup.`,
      type: 'success',
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
          return {
            ...d,
            status: 'accepted' as const,
            acceptedBy: currentUser.id,
            acceptedByName: currentUser.organization || currentUser.name,
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
        setCurrentRole,
        donations,
        addDonation,
        acceptDonation,
        updateDonationStatus,
        notifications,
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
