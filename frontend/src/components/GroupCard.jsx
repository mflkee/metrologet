// components/GroupCard.jsx
import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import InstrumentCard from "./InstrumentCard";

const GroupCard = ({ group, dragHandleProps }) => {
  return (
    <div className="group-container">
      <div className="group-header" {...dragHandleProps}>
        <h3>{group.name}</h3>
      </div>
      
      <Droppable droppableId={`group-${group.id}`}>
        {(provided) => (
          <div
            className="group-content"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {group.instruments?.map((instrument, index) => (
              <Draggable
                key={instrument.id}
                draggableId={`instrument-${instrument.id}`}
                index={index}
              >
                {(provided) => (
                  <InstrumentCard
                    instrument={instrument}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default GroupCard;
