import { create } from 'zustand';
import { ProposalStatus } from '../types/proposal';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

interface UIState {
  // Toast notifications
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;

  // Filter & Search states
  filterStatus: 'all' | ProposalStatus;
  setFilterStatus: (status: 'all' | ProposalStatus) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Convenience toast dispatchers
  notifySuccess: (title: string, description?: string) => void;
  notifyError: (title: string, description?: string) => void;
  notifyInfo: (title: string, description?: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  filterStatus: 'all',
  setFilterStatus: (filterStatus) => set({ filterStatus }),

  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  notifySuccess: (title, description) => {
    get().addToast({ type: 'success', title, description });
  },

  notifyError: (title, description) => {
    get().addToast({ type: 'error', title, description });
  },

  notifyInfo: (title, description) => {
    get().addToast({ type: 'info', title, description });
  },
}));

