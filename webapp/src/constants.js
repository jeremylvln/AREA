import Axios from "axios";

export const BACK_ADDRESS = 'http://localhost:8080';
export const API = Axios.create({
  baseURL: BACK_ADDRESS,
  withCredentials: true,
  header : {
    'Content-Type': 'application/json'
  }
});