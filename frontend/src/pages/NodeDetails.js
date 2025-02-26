import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchInstrumentsByNode,
  searchAndAddInstrument,
  fetchNode,
} from '../api/apiClient';
import AddInstrumentModal from '../components/AddInstrumentModal';
import InstrumentTable from '../components/InstrumentTable';

function NodeDetailsPage() {
  const { nodeId } = useParams();
  const [instruments, setInstruments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeName, setNodeName] = useState('');

  // Загрузка данных узла
  useEffect(() => {
    const loadNode = async () => {
      try {
        const nodeData = await fetchNode(nodeId);
        setNodeName(nodeData.name);
      } catch (error) {
        console.error("Ошибка при загрузке данных узла:", error);
      }
    };
    loadNode();
  }, [nodeId]);

  // Загрузка СИ для узла
  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const data = await fetchInstrumentsByNode(nodeId);
        setInstruments(data);
      } catch (error) {
        console.error("Ошибка при загрузке СИ:", error);
      }
    };
    loadInstruments();
  }, [nodeId]);

  // Обработчик добавления нового СИ
  const handleAddInstrument = async (searchParams) => {
    try {
      const newInstrument = await searchAndAddInstrument(nodeId, searchParams);
      setInstruments([...instruments, newInstrument]);
    } catch (error) {
      console.error("Ошибка при добавлении СИ:", error);
    }
  };

  return (
    <div className="node-details-page">
      <h1 className="node-title">{nodeName ? `${nodeName}` : "Загрузка..."}</h1>
      <button onClick={() => setIsModalOpen(true)}>Добавить СИ</button>
      {isModalOpen && (
        <AddInstrumentModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddInstrument}
        />
      )}
      <InstrumentTable instruments={instruments} />
    </div>
  );
}

export default NodeDetailsPage;
