export interface AuthState {
  id: number | null;
  checking: boolean;
  isLoggedIn: boolean;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role?: string | null;
}

export interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  cityId: number;
  email: string;
  password: string;
  confirm: string;
}

export interface ChangePasswordFormValues {
  email: string;
  password: string;
  confirm: string;
}