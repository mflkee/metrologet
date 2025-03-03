import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  fetchInstrumentsByNode,
  searchAndAddInstrument,
  fetchNode,
} from '../api/apiClient';
import AddInstrumentModal from '../components/AddInstrumentModal';

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

  // Обработка завершения перетаскивания карточки
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(instruments);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setInstruments(reordered);

    // Здесь можно добавить вызов API для обновления порядка карточек в БД
    // updateInstrumentOrder(reordered);
  };

  return (
    <div className="node-details-page">
      <h1 className="node-title">{nodeName || "Загрузка..."}</h1>
      <button onClick={() => setIsModalOpen(true)}>Добавить СИ</button>
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

      {/* Интерактивные карточки с информацией о СИ */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="instruments">
          {(provided) => (
            <div
              className="draggable-instruments"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {instruments.map((instrument, index) => (
                <Draggable
                  key={instrument.id}
                  draggableId={instrument.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      className="instrument-card"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="card-cell">{instrument.id}</div>
                      <div className="card-cell">{instrument.mit_title}</div>
                      <div className="card-cell">{instrument.mit_number}</div>
                      <div className="card-cell">{instrument.mi_number}</div>
                      <div className="card-cell">{instrument.verification_date}</div>
                      <div className="card-cell">{instrument.valid_date}</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default NodeDetailsPage;
