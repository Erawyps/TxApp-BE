import axios from 'axios';

import { JWT_HOST_API } from 'configs/auth.config';


const axiosInstance = axios.create({
  baseURL: JWT_HOST_API,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const message =
      (typeof data === 'string' && data) ||
      data?.message ||
      error?.message ||
      'Une erreur réseau est survenue';
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
