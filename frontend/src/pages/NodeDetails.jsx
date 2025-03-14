import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { fetchInstrumentsByNode, searchAndAddInstrument, fetchNode, deleteInstrument, createGroup } from "../api/apiClient";
import AddInstrumentModal from "../components/AddInstrumentModal";
import InstrumentCard from "../components/InstrumentCard";
import AddGroupModal from "../components/AddGroupModal";

function NodeDetailsPage() {
  const { nodeId } = useParams();
  const [instruments, setInstruments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [nodeName, setNodeName] = useState("");

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

  const handleAddInstrument = async (searchParams) => {
    try {
      const newInstrument = await searchAndAddInstrument(nodeId, searchParams);
      setInstruments([...instruments, newInstrument]);
    } catch (error) {
      console.error("Ошибка при добавлении СИ:", error);
    }
  };

  const handleDeleteInstrument = async (instrumentId) => {
    try {
      await deleteInstrument(instrumentId, nodeId);
      setInstruments((prev) => prev.filter((item) => item.id !== instrumentId));
    } catch (error) {
      console.error("Ошибка при удалении СИ:", error);
    }
  };

  const handleAddGroup = async (groupData) => {
    try {
      const newGroup = await createGroup(nodeId, groupData);
      console.log("Группа создана:", newGroup);
    } catch (error) {
      console.error("Ошибка при создании группы:", error);
    }
  };

  return (
    <div className="node-details-page">
      <h1 className="node-title">{nodeName || "Загрузка..."}</h1>

      <button className="add-instrument-button" onClick={() => setIsModalOpen(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
        Добавить СИ
      </button>

      {isModalOpen && <AddInstrumentModal onClose={() => setIsModalOpen(false)} onAdd={handleAddInstrument} />}

      <button className="add-group-button" onClick={() => setIsGroupModalOpen(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
        Добавить группу
      </button>

      <AddGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} onAdd={handleAddGroup} />

      <div className="header-row">
        <div className="drag-handle-header"></div>
        <div className="card-cell">ID</div>
        <div className="card-cell">Название</div>
        <div className="card-cell">Номер MIT</div>
        <div className="card-cell">Номер MI</div>
        <div className="card-cell">Дата поверки</div>
        <div className="card-cell">Действителен до</div>
        <div></div> {/* Пустой элемент для выравнивания с delete-button */}
      </div>

      <DragDropContext onDragEnd={(result) => {}}>
        <Droppable droppableId="instruments">
          {(provided) => (
            <div className="draggable-instruments" ref={provided.innerRef} {...provided.droppableProps}>
              {instruments.length > 0 ? (
                instruments.map((instrument, index) => (
                  <Draggable key={instrument.id} draggableId={instrument.id.toString()} index={index}>
                    {(provided) => (
                      <InstrumentCard
                        instrument={instrument}
                        onDelete={handleDeleteInstrument}
                        ref={provided.innerRef} // Передаем ref
                        {...provided.draggableProps}
                        dragHandleProps={provided.dragHandleProps}
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
