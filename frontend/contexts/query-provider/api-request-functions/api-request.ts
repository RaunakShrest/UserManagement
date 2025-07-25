import { api } from "@/lib/api";

interface Address {
  zip: string;
  city: string;
  country: string;
  addressLine: string;
  state: string;
}

export interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  userType: string;
  status: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface GetCurrentUserResponse {
  statusCode: number;
  data: CurrentUser;
  message?: string;
  success: boolean;
}

interface SignInResponse {
  statusCode: number;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
  success: boolean;
}

interface LoginFormData {
  email: string;
  password: string;
}
export interface SignOutResponse {
  message: string;
  success: boolean;
}
export interface ApiError {
  data: {
    message: string;
    statusCode?: number;
  };
  status: number;
}

export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("Access token not found");
    }

    const response = await api.get<GetCurrentUserResponse>(
      "/auth/get-current-user"
    );

    return response.data;
  } catch (error: any) {
    throw error?.response;
  }
};

export const signInUser = async (
  formData: LoginFormData
): Promise<SignInResponse> => {
  try {
    const response = await api.post<SignInResponse>("/auth/signin", formData);

    if (response.data?.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.data.accessToken);
    }
    if (response.data?.data?.refreshToken) {
      localStorage.setItem("refreshToken", response.data.data.refreshToken);
    }

    return response.data;
  } catch (error: any) {
    throw error.response;
  }
};

export const signOutUser = async (): Promise<SignOutResponse> => {
  try {
    const response = await api.post<SignOutResponse>("/auth/signout");

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    return response.data;
  } catch (error: any) {
    const apiError: ApiError = error.response || {
      data: { message: "An unexpected error occurred" },
      status: 500,
    };

    throw apiError;
  }
};
