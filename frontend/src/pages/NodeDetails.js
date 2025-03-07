import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchInstrumentsByNode, searchAndAddInstrument, fetchNode, deleteInstrument } from '../api/apiClient';
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
      {/* Заголовок страницы */}
      <h1 className="node-title">{nodeName || "Загрузка..."}</h1>

      {/* Кнопка добавления СИ */}
      <button onClick={() => setIsModalOpen(true)}>Добавить СИ</button>

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

      <DragDropContext onDragEnd={handleDragEnd}>
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
                      <div
                        className="instrument-card"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {/* Кнопка удаления */}
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteInstrument(instrument.id)}
                        >
                        </button>

                        {/* Основная информация */}
                        <div className="card-content">
                          <div className="card-cell">{instrument.id}</div>
                          <div className="card-cell">{instrument.mit_title || "Название отсутствует"}</div>
                          <div className="card-cell">{instrument.mit_number}</div>
                          <div className="card-cell">{instrument.mi_number}</div>
                          <div className="card-cell">{instrument.verification_date}</div>
                          <div className="card-cell">{instrument.valid_date}</div>
                        </div>

                        {/* Сигнальная лампочка */}
                        <div className={`signal-circle ${instrument.color}`}></div>
                      </div>
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
