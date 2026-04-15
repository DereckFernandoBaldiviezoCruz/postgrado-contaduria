import API_URL from "../config/api";

export const listarCarreras = async () => {
  const res = await fetch(`${API_URL}/carreras`);
  return await res.json();
};

export const listarProgramas = async () => {
  const res = await fetch(`${API_URL}/programas`);
  return await res.json();
};