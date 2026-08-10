import axios from "axios";

const apiExterna = axios.create({
  // Coloque o endereço real da sua API externa aqui
  baseURL: process.env.EXTERNAL_API_URL || "https://api.suaempresa.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiExterna;