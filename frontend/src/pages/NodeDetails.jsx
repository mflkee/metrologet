import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  fetchInstrumentsByNode,
  searchAndAddInstrument,
  fetchNode,
  deleteInstrument,
  createGroup,
  fetchGroupsByNode,
  updateGroupOrder,
  removeInstrumentFromGroup,
  assignInstrumentToGroup
} from "../api/apiClient";
import AddInstrumentModal from "../components/AddInstrumentModal";
import InstrumentCard from "../components/InstrumentCard";
import AddGroupModal from "../components/AddGroupModal";



function NodeDetailsPage() {
  const { nodeId } = useParams();
  const [instruments, setInstruments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [nodeName, setNodeName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [nodeData, instrumentsData, groupsData] = await Promise.all([
          fetchNode(nodeId),
          fetchInstrumentsByNode(nodeId),
          fetchGroupsByNode(nodeId),
        ]);

        setNodeName(nodeData.name);
        setInstruments(instrumentsData);
        
        const groupsWithInstruments = groupsData.map(group => ({
          ...group,
          instruments: instrumentsData.filter(i => i.group_id === group.id)
        }));
        
        setGroups(groupsWithInstruments);

      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };
    
    loadData();
  }, [nodeId]);

  const standaloneInstruments = instruments.filter(
    instrument => !groups.some(
      group => group.instruments.some(
        gi => gi.id === instrument.id
      )
    )
  );

  const handleAddInstrument = async (searchParams) => {
    try {
      const newInstrument = await searchAndAddInstrument(nodeId, searchParams);
      setInstruments(prev => [...prev, newInstrument]);
    } catch (error) {
      console.error("Ошибка при добавлении СИ:", error);
    }
  };

  const handleDeleteInstrument = async (instrumentId) => {
    try {
      await deleteInstrument(instrumentId, nodeId);
      setInstruments(prev => prev.filter(i => i.id !== instrumentId));
    } catch (error) {
      console.error("Ошибка при удалении СИ:", error);
    }
  };

  const handleAddGroup = async (groupData) => {
    try {
      const newGroup = await createGroup(nodeId, groupData);
      setGroups(prev => [...prev, { ...newGroup, instruments: [] }]);
    } catch (error) {
      console.error("Ошибка при создании группы:", error);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;
    
    if (!destination) return;
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) return;

    // Сохраняем предыдущее состояние для отката
    const prevState = {
      instruments: [...instruments],
      groups: [...groups],
      standaloneInstruments: [...standaloneInstruments]
    };

    try {
      // Для инструментов
      if (type === 'INSTRUMENT') {
        let movedInstrument;
        const sourceGroupId = source.droppableId.replace('group-content-', '');
        const destGroupId = destination.droppableId.replace('group-content-', '');

        // Обновляем данные локально
        const newGroups = groups.map(group => {
          if (group.id.toString() === sourceGroupId) {
            movedInstrument = group.instruments[source.index];
            return {
              ...group,
              instruments: group.instruments.filter((_, i) => i !== source.index)
            };
          }
          return group;
        });

        if (destination.droppableId === 'instruments') {
          // Перемещение в свободные
          await removeInstrumentFromGroup(movedInstrument.id);
          setInstruments(prev => [...prev, movedInstrument]);
        } else {
          // Перемещение в другую группу
          const updatedGroups = newGroups.map(group => {
            if (group.id.toString() === destGroupId) {
              return {
                ...group,
                instruments: [
                  ...group.instruments.slice(0, destination.index),
                  movedInstrument,
                  ...group.instruments.slice(destination.index)
                ]
              };
            }
            return group;
          });
          
          await assignInstrumentToGroup(movedInstrument.id, parseInt(destGroupId));
          setGroups(updatedGroups);
        }
      }

      // Для групп
      if (type === 'GROUP') {
        const newGroups = [...groups];
        const [movedGroup] = newGroups.splice(source.index, 1);
        newGroups.splice(destination.index, 0, movedGroup);
        
        await updateGroupOrder(nodeId, newGroups.map(g => g.id));
        setGroups(newGroups);
      }

    } catch (error) {
      console.error('Ошибка сохранения изменений:', error);
      // Откатываем состояние при ошибке
      setInstruments(prevState.instruments);
      setGroups(prevState.groups);
    }
  };

  return (
    <div className="node-details-page">
      <h1 className="node-title">{nodeName || "Загрузка..."}</h1>

      <div className="controls-container">
        <button className="add-instrument-button" onClick={() => setIsModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
          Добавить СИ
        </button>

        <button className="add-group-button" onClick={() => setIsGroupModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
          Добавить группу
        </button>
      </div>

      {isModalOpen && (
        <AddInstrumentModal 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddInstrument} 
        />
      )}
      
      <AddGroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        onAdd={handleAddGroup} 
      />

      {/* Модальные окна */}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="groups-section">
          <h2>Группы</h2>
          
          <Droppable 
            droppableId="groups" 
            type="GROUP"
            direction="vertical"
          >
            {(provided) => (
              <div 
                className="groups-list"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                  {groups.map((group, index) => (
                    <Draggable 
                      key={group.id}
                      draggableId={`group-${group.id}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="group-wrapper"
                        >
                          <Droppable
                            droppableId={`group-content-${group.id}`}
                            type="INSTRUMENT"
                          >
                            {(providedInner) => (
                              <div
                                className="group-container"
                                ref={providedInner.innerRef}
                                {...providedInner.droppableProps}
                              >
                                <div 
                                  className="group-header" 
                                  {...provided.dragHandleProps}
                                >
                                <h3>{group.name}</h3>
                                </div>
                                <div className="group-content">
                                  {group.instruments.map((instrument, index) => (
                                    <Draggable
                                      key={instrument.id}
                                      draggableId={`instrument-${instrument.id}`}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                        >
                                          <InstrumentCard
                                            instrument={instrument}
                                            dragHandleProps={provided.dragHandleProps}
                                            {...provided.draggableProps}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {providedInner.placeholder}
                                </div>
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        <div className="instruments-section">
          <h2>Свободные средства измерения</h2>
          <div className="header-row">
            <div className="drag-handle-header"></div>
            <div className="card-cell">ID</div>
            <div className="card-cell">Название</div>
            <div className="card-cell">Номер MIT</div>
            <div className="card-cell">Номер MI</div>
            <div className="card-cell">Дата поверки</div>
            <div className="card-cell">Действителен до</div>
          </div>
          
          <Droppable droppableId="instruments" type="INSTRUMENT">
            {(provided) => (
              <div 
                className="draggable-instruments"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {standaloneInstruments.map((instrument, index) => (
                  <Draggable
                    key={instrument.id}
                    draggableId={`instrument-${instrument.id}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="instrument-wrapper" // Добавьте этот класс
                      >
                        <InstrumentCard
                          instrument={instrument}
                          onDelete={handleDeleteInstrument}
                          dragHandleProps={provided.dragHandleProps} // Явная передача
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}

export default NodeDetailsPage;
