import axios, { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
  baseURL: "https://.org:8443/api/",
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
    "x-kl-kes-ajax-request": "Ajax_Request",
  },
  withCredentials: true,
});

const refreshInstance = axios.create({
  baseURL: "https://.org:8443/api/",
  headers: {
    "Content-Type": "application/json",
    "x-kl-kes-ajax-request": "Ajax_Request",
  },
  withCredentials: true,
});

const useAxiosInterceptor = () => {
  const navigate = useNavigate();
  // Устанавливаем интерсептор для обработки ответов от axios
  axiosInstance.interceptors.response.use(
    // Функция для успешного ответа, просто возвращает ответ
    (response: AxiosResponse) => response,
    // Функция для обработки ошибок
    async (error) => {
      // Сохраняем оригинальный запрос, чтобы повторно его использовать
      const originalRequest = error.config;
      // Проверяем, если ошибка 401 (неавторизован) и запрос еще не был повторен
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403) &&
        !originalRequest?._retry
      ) {
        // Устанавливаем флаг, чтобы избежать бесконечного цикла повторных запросов
        originalRequest._retry = true;
        console.log(
          error.response?.data?.message || error.response?.statusText,
        );
        try {
          // Отправляем запрос на обновление токена
          const response = await refreshInstance.post(
            "/auth/refresh",
            {},
            {
              withCredentials: true,
            },
          );
          // Если обновление токена прошло успешно, повторяем оригинальный запрос
          if (response.status === 200) {
            // Повторяем оригинальный запрос
            return axiosInstance(originalRequest);
          } else {
            navigate("/login"); // Перенаправляем на страницу логина
            return Promise.reject(response.statusText); // Отклоняем промис с текстом ошибки
          }
        } catch (refreshError) {
          // Если произошла ошибка при обновлении токена, перенаправляем пользователя на страницу логина
          navigate("/login"); // Перенаправляем на страницу логина

          return Promise.reject(refreshError); // Отклоняем промис с ошибкой
        }
      }
      // Если ошибка не 401 или запрос уже был повторен, отклоняем промис с ошибкой
      return Promise.reject(error);
    },
  );
};

// Экспортируем экземпляр axios для использования в других частях приложения

export { axiosInstance, useAxiosInterceptor };
