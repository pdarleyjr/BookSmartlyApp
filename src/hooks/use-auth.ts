import { useState, useEffect } from "react";

type User = {
  id: string;
  name?: string;
  email: string;
  avatarUrl?: string;
  organizationId?: number;
};

// Mock user for demonstration purposes
const MOCK_USER: User = {
  id: "mock-user-id",
  email: "user@example.com",
  name: "Demo User",
  organizationId: 1
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate loading the user
    const timer = setTimeout(() => {
      setUser(MOCK_USER);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(MOCK_USER);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err : new Error("Failed to login"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Simulate logout
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
      setError(err instanceof Error ? err : new Error("Failed to logout"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
}