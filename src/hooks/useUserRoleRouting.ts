import { useEffect, useRef } from 'react';
import { User, UserRole } from '../types';

interface UseUserRoleRoutingOptions {
  currentUser: User | null;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

/**
 * Custom hook that monitors the logged-in user's role and automatically routes
 * them to the appropriate dashboard (Citizen, Admin, or Government) upon successful login.
 */
export function useUserRoleRouting({
  currentUser,
  currentTab,
  setCurrentTab,
}: UseUserRoleRoutingOptions) {
  const prevUserIdRef = useRef<string | null>(null);
  const isInitialMountRef = useRef<boolean>(true);

  // Resolves target dashboard for a given user role
  const getDashboardForRole = (role?: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'admin-dashboard';
      case 'government':
        return 'govt-dashboard';
      case 'citizen':
      default:
        return 'citizen-dashboard';
    }
  };

  useEffect(() => {
    if (!currentUser) {
      prevUserIdRef.current = null;
      isInitialMountRef.current = false;
      return;
    }

    const previousId = prevUserIdRef.current;
    const isNewLoginOrSwitch = previousId !== null && previousId !== currentUser.id;
    const isLoginFromNull = previousId === null && !isInitialMountRef.current;
    const isOnLoginPage = currentTab === 'login';

    // Route when user logs in, switches accounts, or is currently on the login page
    if (isNewLoginOrSwitch || isLoginFromNull || isOnLoginPage) {
      const targetDashboard = getDashboardForRole(currentUser.role);
      if (currentTab !== targetDashboard) {
        setCurrentTab(targetDashboard);
      }
    }

    prevUserIdRef.current = currentUser.id;
    isInitialMountRef.current = false;
  }, [currentUser, currentTab, setCurrentTab]);

  return {
    getDashboardForRole,
  };
}
