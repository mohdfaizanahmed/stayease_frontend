import axios from "axios";

const API = axios.create({
  // baseURL: "https://hostel-management-backend-g35l.onrender.com/api/auth", //backend url
  
    // baseURL: "http://localhost:5000/api/auth", // Use your local server
    baseURL:"https://stayease-backend-6xbb.onrender.com/api/auth", // Use your local server
  
  
});

//Add token to request headers
API.interceptors.request.use((config) => {
  const userData =JSON.parse(localStorage.getItem("userData"));
  console.log(userData)
  const token = userData?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
