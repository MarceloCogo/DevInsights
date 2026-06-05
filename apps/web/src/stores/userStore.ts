/**
 * User Store - Authentication and organization state
 * @module stores/userStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UserState, User, Organization } from '../types/store';

interface UserActions {
  setUser: (user: User) => void;
  setOrganization: (organization: Organization | null) => void;
  setOrganizations: (organizations: Organization[]) => void;
  setActiveOrganizationId: (id: number | null) => void;
  clearUser: () => void;
}

const initialState: UserState = {
  user: null,
  organization: null,
  organizations: [],
  activeOrganizationId: null,
};

export const useUserStore = create<UserState & UserActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),
      setOrganization: (organization) => set({ organization }),
      setOrganizations: (organizations) => set({ organizations }),
      setActiveOrganizationId: (id) => set({ activeOrganizationId: id }),
      clearUser: () => set(initialState),
    }),
    { name: 'user-store' }
  )
);
