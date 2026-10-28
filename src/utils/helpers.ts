import { DonationStatus, UrgencyLevel, StorageCondition, Donation, NGOPartner, User, Notification } from '../types';

export function getVisibleDonations(donations: Donation[], user: User): Donation[] {
  if (!user) return [];
  if (user.role === 'admin') {
    return donations;
  }
  if (user.role === 'donor') {
    return donations.filter(d => d.donorId === user.id);
  }
  if (user.role === 'ngo') {
    return donations.filter(d =>
      d.status === 'available' || (Boolean(user.ngoId) && d.acceptedByNgoId === user.ngoId)
    );
  }
  return [];
}

export function getVisibleNGOs(ngos: NGOPartner[], user: User): NGOPartner[] {
  if (!user) return [];
  if (user.role === 'admin') {
    return ngos;
  }
  if (user.role === 'ngo') {
    return ngos.filter(n => n.id === user.ngoId);
  }
  return [];
}

export function getVisibleNotifications(notifications: Notification[], user: User): Notification[] {
  if (!user) return [];
  if (user.role === 'admin') {
    return notifications;
  }
  if (user.role === 'donor') {
    return notifications.filter(n =>
      (!n.targetRole && !n.targetUserId) ||
      n.targetRole === 'donor' ||
      n.targetUserId === user.id
    );
  }
  if (user.role === 'ngo') {
    return notifications.filter(n =>
      (!n.targetRole && !n.targetNgoId) ||
      (n.targetRole === 'ngo' && !n.targetNgoId) ||
      n.targetNgoId === user.ngoId
    );
  }
  return [];
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} at ${formatTime(iso)}`;
}

export function timeRemaining(deadline: string): string {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = end - now;
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function getUrgencyColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
  }
}

export function getStatusColor(status: DonationStatus): string {
  switch (status) {
    case 'available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'picked_up': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'delivered': return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

export function getStatusLabel(status: DonationStatus): string {
  switch (status) {
    case 'available': return 'Available';
    case 'accepted': return 'Accepted';
    case 'picked_up': return 'Picked Up';
    case 'delivered': return 'Delivered';
  }
}

export function getStorageLabel(storage: StorageCondition): string {
  switch (storage) {
    case 'room_temperature': return 'Room Temperature';
    case 'refrigerated': return 'Refrigerated';
    case 'frozen': return 'Frozen';
    case 'hot_holding': return 'Hot Holding';
  }
}

export function generateId(): string {
  return `don-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function calculateUrgency(deadline: string): UrgencyLevel {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const hoursLeft = (end - now) / (1000 * 60 * 60);
  if (hoursLeft <= 2) return 'critical';
  if (hoursLeft <= 6) return 'high';
  if (hoursLeft <= 24) return 'medium';
  return 'low';
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
