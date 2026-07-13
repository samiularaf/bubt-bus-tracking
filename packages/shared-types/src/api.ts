// Mirrors the response envelope and error codes defined in API_DESIGN.md §1 and §10.

export type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
};

export type ApiError = {
  success: false;
  data: null;
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'OTP_INVALID_OR_EXPIRED'
  | 'TRIP_ALREADY_STARTED'
  | 'TRIP_NOT_RUNNING'
  | 'SCHEDULE_ALREADY_ACTIVE'
  | 'RATE_LIMITED'
  | 'MUST_CHANGE_PASSWORD'
  | 'INTERNAL_ERROR';

export interface PaginatedData<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface LoginRequest {
  identifier: string; // email, Driver ID, or Admin ID
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: 'user' | 'driver' | 'admin';
    name: string;
    mustChangePassword: boolean;
  };
}
