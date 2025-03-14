import axios from "axios";

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Узлы
export const fetchNodes = async () => {
  try {
    const response = await apiClient.get('/nodes/');
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при получении узлов");
  }
};

export const createNode = async (nodeData) => {
  try {
    const response = await apiClient.post('/nodes/', nodeData);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при создании узла");
  }
};

export const deleteNode = async (nodeId) => {
  try {
    const response = await apiClient.delete(`/nodes/${nodeId}`);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при удалении узла");
  }
};

export const searchNodes = async (query) => {
  try {
    const response = await apiClient.get(`/nodes/search/?query=${query}`);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при поиске узлов");
  }
};

export const fetchNode = async (nodeId) => {
  try {
    const response = await apiClient.get(`/nodes/${nodeId}`);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при получении данных узла");
  }
};

// Средства измерений
export const fetchInstrumentsByNode = async (nodeId) => {
  try {
    const response = await apiClient.get(`/instruments/${nodeId}/`);
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при получении СИ");
  }
};

export const searchAndAddInstrument = async (nodeId, searchParams) => {
  try {
    const response = await apiClient.get(`/instruments/${nodeId}/search_instruments/`, { params: searchParams });
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при добавлении СИ");
  }
};

export const deleteInstrument = async (instrumentId, nodeId) => {
  try {
    const response = await apiClient.delete(`/instruments/${instrumentId}/${nodeId}`);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при удалении СИ");
  }
};

// Функция для создания группы
export const createGroup = async (nodeId, groupData) => {
  try {
    const response = await apiClient.post(`/groups/${nodeId}/`, groupData);
    return response.data;
  } catch (error) {
    throw new Error("Ошибка при создании группы");
  }
};
