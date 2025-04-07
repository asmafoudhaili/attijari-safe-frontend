import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Axios Interceptor - Token:', token);
    console.log('Axios Interceptor - Request URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios Interceptor - Added Authorization header:', config.headers.Authorization);
    } else {
      console.log('Axios Interceptor - No token found, skipping Authorization header');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Axios Response Interceptor - Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;