import axios from "axios";   // 🔥 obligatoire !

const API_URL = "http://127.0.0.1:5000/api/v1";   // 🔥 définition ici !

export interface AuthData {
  name?: string;
  email: string;
  password: string;
  role?: string;
}

export const registerUser = (data: AuthData) =>
  axios.post(`${API_URL}/auth/register`, data);

export const loginUser = (data: AuthData) =>
  axios.post(`${API_URL}/auth/login`, data);

export interface StudentRegisterData {
  name: string;
  prenom: string;
  email: string;
  password: string;
  cin: string;
  cne: string;
  tel?: string;
  filiere: string;
  niveau: string;
}

export const registerStudent = (data: StudentRegisterData) =>
  axios.post(`${API_URL}/auth/register/student`, data);
