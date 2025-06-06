import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import authApi from '../api/authenticationAPI';

const AuthContext = createContext(null);

const COOKIE_NAME = 'authToken';

export const AuthenticationProvider = ({
  children,
  cookieName = COOKIE_NAME,
  cookieOptions = { expires: 7, path: '/' }
}) => {
  const [token, setTokenState] = useState(Cookies.get(cookieName) || null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setUserId(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.getMe(currentToken);

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch user details');
      }

      if (data.data && data.data.user) {
        setUser(data.data.user);
        setUserId(data.data.user._id);
      } else {
        throw new Error('User data not found in API response');
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError(err.message || 'An unexpected error occurred while fetching user data.');
      setUser(null);
      setUserId(null);
      Cookies.remove(cookieName);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentTokenInCookie = Cookies.get(cookieName);
    if (currentTokenInCookie) {
      if (currentTokenInCookie !== token) {
        setTokenState(currentTokenInCookie);
      }
      fetchUser(currentTokenInCookie);
    } else {
      if (token) {
        setTokenState(null);
      }
      setUser(null);
      setUserId(null);
      setIsLoading(false);
    }
  }, [token, fetchUser, cookieName]);

  const setAuthToken = useCallback(async (newToken) => {
    if (newToken) {
      Cookies.set(cookieName, newToken, cookieOptions);
      setTokenState(newToken);
    } else {
      const currentToken = Cookies.get(cookieName);
      if (currentToken) {
        try {
          await authApi.logout(currentToken);
        } catch (logoutError) {
          console.error("API Logout failed:", logoutError.message || logoutError);
        }
      }
      Cookies.remove(cookieName, { path: cookieOptions.path });
      setTokenState(null);
      setUser(null);
      setUserId(null);
      setError(null);
      setIsLoading(false);
    }
  }, [cookieName, cookieOptions]);

  const getAuthToken = useCallback(() => {
    return Cookies.get(cookieName) || null;
  }, [cookieName]);

  const contextValue = useMemo(() => ({
    token,
    user,
    userId,
    isLoading,
    error,
    setToken: setAuthToken,
    getToken: getAuthToken,
    clearToken: () => setAuthToken(null),
    isAuthenticated: !!token && !!user,
  }), [token, user, userId, isLoading, error, setAuthToken, getAuthToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthenticationProvider');
  }
  return context;
};