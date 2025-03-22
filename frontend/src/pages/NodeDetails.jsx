import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import _ from "lodash";
import {
  fetchInstrumentsByNode,
  searchAndAddInstrument,
  fetchNode,
  deleteInstrument,
  createGroup,
  fetchGroupsByNode,
  updateGroupOrder,
  updateInstrumentOrder,
  removeInstrumentFromGroup,
  assignInstrumentToGroup,
  deleteGroup
} from "../api/apiClient";
import AddInstrumentModal from "../components/AddInstrumentModal";
import InstrumentCard from "../components/InstrumentCard";
import AddGroupModal from "../components/AddGroupModal";
import '../styles/pages/NodeDetails.scss'; // Правильный путь

function NodeDetailsPage() {
  const { nodeId } = useParams();
  const [instruments, setInstruments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [nodeName, setNodeName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Добавлено недостающее состояние

  const refreshData = useCallback(async () => {
    try {
      const [nodeData, instrumentsData, groupsData] = await Promise.all([
        fetchNode(nodeId),
        fetchInstrumentsByNode(nodeId),
        fetchGroupsByNode(nodeId),
      ]);
      
      const instrumentsMap = instrumentsData.reduce((acc, i) => {
        acc[i.id] = i;
        return acc;
      }, {});

      setNodeName(nodeData.name);
      setInstruments(instrumentsData);
      setGroups(
        groupsData.map((group) => ({
          ...group,
          instruments: group.instrument_ids
            .map((id) => instrumentsMap[id])
            .filter(Boolean),
        }))
      );
    } catch (error) {
      console.error("Ошибка обновления данных:", error);
    }
  }, [nodeId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const standaloneInstruments = instruments.filter(
    (instrument) =>
      !groups.some((group) =>
        group.instruments.some((gi) => gi.id === instrument.id)
      )
  );

  const debouncedUpdateInstrumentOrder = useCallback(
    _.debounce(async (ids) => {
      await updateInstrumentOrder(ids);
    }, 500),
    []
  );

  const handleAddInstrument = async (searchParams) => {
    try {
      await searchAndAddInstrument(nodeId, searchParams);
      refreshData();
    } catch (error) {
      console.error("Ошибка при добавлении СИ:", error);
    }
  };

  const handleDeleteInstrument = async (instrumentId) => {
    try {
      await deleteInstrument(instrumentId, nodeId);
      refreshData();
    } catch (error) {
      console.error("Ошибка при удалении СИ:", error);
    }
  };

  const handleAddGroup = async (groupData) => {
    try {
      await createGroup(nodeId, groupData);
      refreshData();
    } catch (error) {
      console.error("Ошибка при создании группы:", error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Вы уверены, что хотите удалить группу?")) return;
    
    try {
      await deleteGroup(groupId);
      // Оптимизированное обновление состояния
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить группу: " + error.message);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setIsUpdating(true);

    try {
      if (type === "GROUP") {
        // Обработка перетаскивания групп
        const newGroups = [...groups];
        const [movedGroup] = newGroups.splice(source.index, 1);
        newGroups.splice(destination.index, 0, movedGroup);
        setGroups(newGroups);
        await updateGroupOrder(nodeId, newGroups.map(g => g.id));
        
      } else if (type === "INSTRUMENT") {
        let sourceGroupId, destGroupId, newInstruments;

        if (source.droppableId === "instruments" && destination.droppableId === "instruments") {
          
          // Перемещение между свободными СИ
          const newStandalone = [...standaloneInstruments];
          const [movedInstrument] = newStandalone.splice(source.index, 1);
          newStandalone.splice(destination.index, 0, movedInstrument);
          
          setInstruments(prev => [
            ...newStandalone,
            ...prev.filter(i => newStandalone.some(ni => ni.id === i.id))
          ]);
          
          debouncedUpdateInstrumentOrder(newStandalone.map(i => i.id));

        } else if (
          source.droppableId === "instruments" && 
          destination.droppableId.startsWith("group-content-")
        ) {
          
          // Из свободных в группу
          destGroupId = parseInt(destination.droppableId.replace("group-content-", ""));
          const movedInstrument = standaloneInstruments[source.index];
          await assignInstrumentToGroup(movedInstrument.id, destGroupId);
          refreshData();

        } else if (
          source.droppableId.startsWith("group-content-") && 
          destination.droppableId === "instruments"
        ) {
          
          // Из группы в свободные
          sourceGroupId = parseInt(source.droppableId.replace("group-content-", ""));
          const sourceGroup = groups.find(g => g.id === sourceGroupId);
          const movedInstrument = sourceGroup.instruments[source.index];
          await removeInstrumentFromGroup(movedInstrument.id);
          refreshData();

        } else if (
          source.droppableId.startsWith("group-content-") && 
          destination.droppableId.startsWith("group-content-")
        ) {
          
          // Перемещение между группами или внутри группы
          sourceGroupId = parseInt(source.droppableId.replace("group-content-", ""));
          destGroupId = parseInt(destination.droppableId.replace("group-content-", ""));
          const sourceGroup = groups.find(g => g.id === sourceGroupId);
          const movedInstrument = sourceGroup.instruments[source.index];

          if (sourceGroupId === destGroupId) {
            // Перемещение внутри группы
            newInstruments = [...sourceGroup.instruments];
            const [removed] = newInstruments.splice(source.index, 1);
            newInstruments.splice(destination.index, 0, removed);

            // Обновляем локальное состояние
            const updatedGroups = groups.map(group => 
              group.id === sourceGroupId 
                ? { ...group, instruments: newInstruments } 
                : group
            );
            
            setGroups(updatedGroups);
            await updateInstrumentOrder(newInstruments.map(i => i.id));

          } else {
            // Перемещение между группами
            await assignInstrumentToGroup(movedInstrument.id, destGroupId);
            refreshData();
          }
        }
      }
    } catch (error) {
      console.error("Ошибка в handleDragEnd:", error);
    } finally {
      setIsUpdating(false);
    }
  };

return (
  <div className="node-details-page">
    <h1 className="node-title">{nodeName || "Загрузка..."}</h1>

    <div className="controls-container">
      <button
        className="add-instrument-button"
        onClick={() => setIsModalOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
        Добавить СИ
      </button>

      <button
        className="add-group-button"
        onClick={() => setIsGroupModalOpen(true)}
      >
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

    <DragDropContext 
      onDragEnd={handleDragEnd}
      onDragStart={() => setIsUpdating(true)}
    >

      <div className="groups-section">
        <h2>Группы</h2>
        <Droppable droppableId="groups" type="GROUP" direction="vertical">
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
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group-wrapper ${
                        snapshot.isDragging ? 'draggable-dragging' : ''
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        width: snapshot.isDragging 
                          ? document.querySelector('.group-wrapper')?.offsetWidth 
                          : 'auto',
                      }}
                    >
                      <Droppable
                        droppableId={`group-content-${group.id}`}
                        type="INSTRUMENT"
                      >
                        {(providedInner, snapshotInner) => (
                          <div
                            className={`group-container ${
                              snapshotInner.isDraggingOver ? 'draggable-placeholder' : ''
                            }`}
                            ref={providedInner.innerRef}
                            {...providedInner.droppableProps}
                          >
                            <div className="group-header">
                              <div className="drag-handle" {...provided.dragHandleProps}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                                </svg>
                              </div>
                              <h3>{group.name}</h3>
                              {/* Кнопка должна быть ВНУТРИ group-header */}
                              <div className="delete-group-button-wrapper">
                                <button className="delete-group-button" onClick={() => handleDeleteGroup(group.id)}>
                                  ×
                                </button>
                              </div>
                            </div>
                            <div className="group-content">
                              <div className="header-row">
                                <div className="drag-handle-header"></div>
                                <div className="card-cell">ID</div>
                                <div className="card-cell">Название</div>
                                <div className="card-cell">Номер MIT</div>
                                <div className="card-cell">Номер MI</div>
                                <div className="card-cell">Дата поверки</div>
                                <div className="card-cell">Действителен до</div>
                              </div>
                              {group.instruments.map((instrument, index) => (
                                <Draggable
                                  key={instrument.id}
                                  draggableId={`instrument-${instrument.id}`}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`instrument-wrapper ${
                                        snapshot.isDragging ? 'draggable-dragging' : ''
                                      }`}
                                      style={{
                                        ...provided.draggableProps.style,
                                        width: snapshot.isDragging 
                                          ? document.querySelector('.instrument-wrapper')?.offsetWidth 
                                          : 'auto',
                                      }}
                                    >
                                      <InstrumentCard
                                        instrument={instrument}
                                        dragHandleProps={provided.dragHandleProps}
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
        <h2>СИ</h2>
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
          {(provided, snapshot) => (
            <div
              className={`draggable-instruments ${
                snapshot.isDraggingOver ? 'draggable-placeholder' : ''
              }`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {standaloneInstruments.map((instrument, index) => (
                <Draggable
                  key={instrument.id}
                  draggableId={`instrument-${instrument.id}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`instrument-wrapper ${
                        snapshot.isDragging ? 'draggable-dragging' : ''
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        width: snapshot.isDragging 
                          ? document.querySelector('.instrument-wrapper')?.offsetWidth 
                          : 'auto',
                      }}
                    >
                      <InstrumentCard
                        instrument={instrument}
                        onDelete={handleDeleteInstrument}
                        dragHandleProps={provided.dragHandleProps}
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
