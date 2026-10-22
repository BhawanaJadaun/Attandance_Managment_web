import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext =
  createContext(null);


const AuthProvider = ({
  children,
}) => {

  const [user, setUser] =
    useState(() => {

      const savedUser =
        localStorage.getItem(
          "attendanceUser"
        );

      try {
        return savedUser
          ? JSON.parse(savedUser)
          : null;
      }

      catch {
        localStorage.removeItem(
          "attendanceUser"
        );

        return null;
      }
    });


  const [token, setToken] =
    useState(() => {
      return localStorage.getItem(
        "attendanceToken"
      );
    });


  const login = (
    userData,
    accessToken
  ) => {

    setUser(userData);
    setToken(accessToken);

    localStorage.setItem(
      "attendanceUser",
      JSON.stringify(userData)
    );

    localStorage.setItem(
      "attendanceToken",
      accessToken
    );
  };


  const logout = () => {

    setUser(null);
    setToken(null);

    localStorage.removeItem(
      "attendanceUser"
    );

    localStorage.removeItem(
      "attendanceToken"
    );
  };


  const role =
    user?.role || null;


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        role,
        login,
        logout,

        isAuthenticated:
          Boolean(
            user && token
          ),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


const useAuth = () => {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};


export {
  AuthProvider,
  useAuth,
};
