export type FieldError = {
  field: string;
  message: string;
};

export type ErrorResponse = {
  timestamp: string;
  status: number;
  message: string;
  errors: FieldError[];
};

export type LoginSuccess = {
  name: string;
};

export type MeResponse = {
  email: string;
  name: string;
};
