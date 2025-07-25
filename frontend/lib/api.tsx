import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  baseURL:
    process.env.NEXT_PUBLIC_ENV === "DEV"
      ? process.env.NEXT_PUBLIC_BASE_URL_DEV
      : process.env.NEXT_PUBLIC_BASE_URL_PROD,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const previousConfig = error.config as CustomAxiosRequestConfig;

    if (
      error.response?.data?.statusCode === 401 &&
      error.response?.data?.name?.toLowerCase() === "jwt error" &&
      !previousConfig._retry
    ) {
      previousConfig._retry = true;

      try {
        const response = await axios.post(
          `${previousConfig.baseURL}/users/refresh-access-token`,
          {
            refreshToken: localStorage.getItem("refreshToken"),
          }
        );

        const { accessToken, refreshToken } = response.data?.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        return await api(previousConfig);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api };
