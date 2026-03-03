import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { getSession, clearSession } from "../utils/session";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

function createClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
  });

  instance.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    try {
      const session = getSession();
      const token = session?.user?.token ?? session?.accessToken;

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    } catch {}
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        try {
          clearSession();
        } catch {
          console.error("Error occured when clearing session");
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

const api = createClient();

const client: {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  instance: AxiosInstance;
} = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return api.get<T>(url, config).then((r) => r.data as T);
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return api.post<T>(url, data, config).then((r) => r.data as T);
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return api.put<T>(url, data, config).then((r) => r.data as T);
  },
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return api.patch<T>(url, data, config).then((r) => r.data as T);
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return api.delete<T>(url, config).then((r) => r.data as T);
  },
  instance: api,
};

export default client;
