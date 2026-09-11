// Location: hooks/usePayGuardSession.ts
// Custom hook for authentication logic.
//
// This combines:
//  - PayGuardNetworkClient (API calls)
//  - usePayGuardSession store (Zustand state)
//  - Expo Router navigation
// Into one simple hook that any screen can use.

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { PayGuardNetworkClient, extractApiError } from '@/services/PayGuardNetworkClient';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import type { PayGuardAuthCredentials, PayGuardRegisterPayload } from '@/types/payGuardModels';

export const usePayGuardAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pull actions from the Zustand store
  const { authenticateIdentity, purgeSession, isAuthenticated } =
    usePayGuardSession();

  /**
   * Login with email + password.
   * On success → stores the identity in Zustand → navigates to dashboard.
   * On failure → sets error message for the UI to display.
   */
  const login = useCallback(
    async (credentials: PayGuardAuthCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await PayGuardNetworkClient.login(credentials);
        // Store token inside the identity object for the interceptor to use
        authenticateIdentity({
          ...response.identity,
          token: response.accessToken,
        });
        // Navigate to the main app (tabs)
        router.replace('/(tabs)/pg-dashboard');
      } catch (e) {
        setError(extractApiError(e));
      } finally {
        setIsLoading(false);
      }
    },
    [authenticateIdentity]
  );

  /**
   * Register a new account.
   * On success → auto-login → navigate to dashboard.
   */
  const register = useCallback(
    async (payload: PayGuardRegisterPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await PayGuardNetworkClient.register(payload);
        authenticateIdentity({
          ...response.identity,
          token: response.accessToken,
        });
        router.replace('/(tabs)/pg-dashboard');
      } catch (e) {
        setError(extractApiError(e));
      } finally {
        setIsLoading(false);
      }
    },
    [authenticateIdentity]
  );

  /**
   * Logout — clears Zustand store → redirects to login screen.
   */
  const logout = useCallback(() => {
    purgeSession();
    router.replace('/(auth)/pg-login');
  }, [purgeSession]);

  return { login, register, logout, isLoading, error, isAuthenticated };
};
