import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/v1";

export const getMyReports = (token: string) =>
  axios.get(`${API_URL}/reports/student`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const uploadReport = (formData: FormData, token: string) =>
  axios.post(`${API_URL}/reports/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    },
  });
