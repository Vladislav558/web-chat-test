export interface RegisterFormProps {
    setTab: (tab: "login" | "register" | "verify") => void;
    setEmail: (email: string) => void;
    setRememberMe: (rememberMe: boolean) => void;
  }
  
  export interface VerifyFormProps {
    email: string;
    rememberMe: boolean;
  }
  
  export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  }
  
  export interface AuthStore {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
  }
  