import axios from "axios";

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Получение всех узлов
export const fetchNodes = async () => {
  try {
    const response = await apiClient.get('/nodes/');
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при получении узлов");
  }
};

// Создание нового узла
export const createNode = async (nodeData) => {
  try {
    const response = await apiClient.post('/nodes/', nodeData);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при создании узла");
  }
};

// Удаление узла
export const deleteNode = async (nodeId) => {
  try {
    const response = await apiClient.delete(`/nodes/${nodeId}`);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при удалении узла");
  }
};

// Поиск узлов
export const searchNodes = async (query) => {
  try {
    const response = await apiClient.get(`/nodes/search/?query=${query}`);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при поиске узлов");
  }
};

export const fetchInstrumentsByNode = async (nodeId) => {
  try {
    const response = await apiClient.get(`/instruments/${nodeId}/`);
    console.log("API Response:", response.data); // Логирование данных
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при получении СИ");
  }
};

// Поиск и добавление СИ через API "АРШИН"
export const searchAndAddInstrument = async (nodeId, searchParams) => {
  try {
    const response = await apiClient.get(`/instruments/${nodeId}/search_instruments/`, { params: searchParams });
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при добавлении СИ");
  }
};

// В файле api/apiClient.js
export const fetchNode = async (nodeId) => {
  try {
    const response = await apiClient.get(`/nodes/${nodeId}`);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при получении данных узла");
  }
};

// Удаление СИ
export const deleteInstrument = async (instrumentId) => {
  try {
    const response = await apiClient.delete(`/instruments/${instrumentId}`);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при удалении СИ");
  }
};
