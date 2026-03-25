import axios from "axios";



const axiosInstance = axios.create({
  baseURL: process.env.AUTH_URL,
  withCredentials: true
})

export default axiosInstance