import axios from 'axios';
import { MeasuringInstrument, MeasuringInstrumentCreate } from './types';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Nodes API
export const getNodes = async () => {
  const response = await api.get<Node[]>('/nodes/');
  return response.data;
};

export const deleteNode = async (id: number) => {
  await api.delete(`/nodes/${id}`);
};

// Instruments API
export const getInstruments = async (nodeId: number) => {
  const response = await api.get<MeasuringInstrument[]>(`/nodes/${nodeId}/instruments/`);
  return response.data;
};

export const createInstrument = async (
  nodeId: number,
  instrument: MeasuringInstrumentCreate
) => {
  const response = await api.post<MeasuringInstrument>(
    `/nodes/${nodeId}/instruments/`,
    instrument
  );
  return response.data;
};

export const deleteInstrument = async (nodeId: number, instrumentId: number) => {
  await api.delete(`/nodes/${nodeId}/instruments/${instrumentId}`);
};
