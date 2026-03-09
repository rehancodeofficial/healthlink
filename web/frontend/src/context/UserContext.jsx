import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = {
      id: localStorage.getItem("userId"),
      name: localStorage.getItem("userName") || localStorage.getItem("name"),
      role: localStorage.getItem("role"),
      email: localStorage.getItem("userEmail"),
    };

    if (storedUser.id) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Save to localStorage
    localStorage.setItem("userId", userData.id);
    localStorage.setItem("userName", userData.name);
    localStorage.setItem("name", userData.name); // Legacy support
    localStorage.setItem("role", userData.role);
    localStorage.setItem("userEmail", userData.email);
    if (userData.token) localStorage.setItem("token", userData.token);

    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updates };

      // Sync with localStorage
      if (updates.name) {
        localStorage.setItem("userName", updates.name);
        localStorage.setItem("name", updates.name);
      }
      if (updates.email) localStorage.setItem("userEmail", updates.email);
      // Add other fields as necessary

      return newUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
