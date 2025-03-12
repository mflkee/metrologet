import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchInstrumentsByNode, searchAndAddInstrument, fetchNode, deleteInstrument } from '../api/apiClient';
import AddInstrumentModal from '../components/AddInstrumentModal';
import InstrumentCard from '../components/InstrumentCard'; // Импортируем обновленный компонент

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

  // Загрузка средств измерения для узла
  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const data = await fetchInstrumentsByNode(nodeId);
        console.log("Fetched Instruments:", data); // Логирование данных
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

  // Обработчик удаления СИ
  const handleDeleteInstrument = async (instrumentId) => {
    try {
      await deleteInstrument(instrumentId, nodeId); // Удаление через API
      setInstruments((prev) => prev.filter((item) => item.id !== instrumentId)); // Обновление состояния
    } catch (error) {
      console.error("Ошибка при удалении СИ:", error);
    }
  };

  return (
    <div className="node-details-page">
      {/* Заголовок страницы */}
      <h1 className="node-title">{nodeName || "Загрузка..."}</h1>

      {/* Кнопка добавления СИ */}
    <button className="add-instrument-button" onClick={() => setIsModalOpen(true)}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
      </svg>
      Добавить СИ
    </button>

      {/* Модальное окно добавления СИ */}
      {isModalOpen && (
        <AddInstrumentModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddInstrument}
        />
      )}

      {/* Статическая строка-заголовок */}
      <div className="header-row">
        <div className="card-cell">ID</div>
        <div className="card-cell">Название</div>
        <div className="card-cell">Номер MIT</div>
        <div className="card-cell">Номер MI</div>
        <div className="card-cell">Дата поверки</div>
        <div className="card-cell">Действителен до</div>
      </div>

      <DragDropContext onDragEnd={(result) => {}}>
        <Droppable droppableId="instruments">
          {(provided) => (
            <div
              className="draggable-instruments"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {instruments.length > 0 ? (
                instruments.map((instrument, index) => (
                  <Draggable
                    key={instrument.id}
                    draggableId={instrument.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <InstrumentCard
                        key={instrument.id}
                        instrument={instrument}
                        onDelete={handleDeleteInstrument} // Передаем функцию удаления
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      />
                    )}
                  </Draggable>
                ))
              ) : (
                <p>Нет данных</p>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default NodeDetailsPage;
