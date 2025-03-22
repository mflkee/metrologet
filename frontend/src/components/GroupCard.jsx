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
                      {(providedInstrument) => (
                        <InstrumentCard
                          instrument={instrument}
                          onDelete={handleDeleteInstrument} // Убедитесь что этот пропс передается
                          ref={providedInstrument.innerRef}
                          {...providedInstrument.draggableProps}
                          dragHandleProps={providedInstrument.dragHandleProps} // Явная передача
                        />
                      )}
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
