import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

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

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const previousConfig = error.config as CustomAxiosRequestConfig;

    const is401Error = error.response?.status === 401;
    const isNotRetry = !previousConfig._retry;
    const isNotRefreshEndpoint = !previousConfig.url?.includes(
      "refresh-access-token"
    );
    const isNotLoginEndpoint = !previousConfig.url?.endsWith("/auth/signin");

    if (
      is401Error &&
      isNotRetry &&
      isNotRefreshEndpoint &&
      isNotLoginEndpoint
    ) {
      previousConfig._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const refreshAxios = axios.create({
          baseURL: api.defaults.baseURL,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const response = await refreshAxios.post("/auth/refresh-access-token", {
          refreshToken: refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          response.data?.data;

        if (accessToken && newRefreshToken) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          if (previousConfig.headers) {
            previousConfig.headers.Authorization = `Bearer ${accessToken}`;
          }

          const retryResponse = await api(previousConfig);
          return retryResponse;
        } else {
          throw new Error("Invalid response from refresh endpoint");
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api };
