import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1"
});

export const getPlanning = (date: string) =>
  api.get(`/soutenances/planning?date=${date}`);

export const createSoutenance = (data: any) =>
  api.post("/soutenances", data);

export const autoAssign = () =>
  api.post("/soutenances/auto-assign");
