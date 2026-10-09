import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";

export const axiosInstance = axios.create({
  baseURL: "https://.org:8443/api/",
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
    "x-kl-kes-ajax-request": "Ajax_Request",
  },
  withCredentials: true,
});

export const refreshInstance = axios.create({
  baseURL: "https://.org:8443/api/",
  headers: {
    "Content-Type": "application/json",
    "x-kl-kes-ajax-request": "Ajax_Request",
  },
  withCredentials: true,
});

export const useAxiosInterceptor = () => {
  const navigate = useNavigate();

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403) &&
        !originalRequest?._retry
      ) {
        originalRequest._retry = true;
        try {
          const response = await refreshInstance.post(
            "/auth/refresh",
            {},
            { withCredentials: true },
          );
          if (response.status === 200) {
            return axiosInstance(originalRequest);
          } else {
            navigate("/login");
            return Promise.reject(response.statusText);
          }
        } catch (refreshError) {
          navigate("/login");
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    },
  );
};
