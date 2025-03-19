import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import InstrumentCard from "./InstrumentCard";

const GroupCard = ({ group, index }) => {
  return (
    <Draggable draggableId={`group-${group.id}`} index={index}>
      {(provided) => (
        <div
          className="group-container"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Droppable 
            droppableId={`group-${group.id}`} 
            type="INSTRUMENT" // Должно совпадать с другими
          >
            {(provided) => (
              <div
                className="group-content"
                ref={provided.innerRef}
                {...provided.droppableProps}
                {...provided.dragHandleProps}
              >
                <div className="group-header" {...provided.dragHandleProps}>
                  <h3 className="group-title">{group.name}</h3>
                </div>
                  {group.instruments?.map((instrument, index) => (
                    <Draggable
                      key={instrument.id}
                      draggableId={`instrument-${instrument.id}`}
                      index={index}
                    >
                      {(provided, snapshot) => {
                        console.log('Draggable props:', provided.dragHandleProps);
                        return (
                          <InstrumentCard
                            {...provided.draggableProps}
                            dragHandleProps={provided.dragHandleProps}
                            ref={provided.innerRef}
                            instrument={instrument}
                            onDelete={handleDeleteInstrument}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.5 : 1
                            }}
                          />
                        )}
                      }
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};

export default GroupCard;
