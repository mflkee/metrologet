import React, { useState, forwardRef } from "react";

const InstrumentCard = forwardRef(
  ({ instrument, onDelete, draggableProps, dragHandleProps }, ref) => {
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);

    const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("ru-RU");
    };

    return (
      <div
        className={`instrument-card ${showDeleteMenu ? "show-delete-menu" : ""}`}
        ref={ref}
        {...draggableProps}
      >
        <div className="instrument-card-content">
          {/* Элемент для перетаскивания — только на иконке */}
          <div className="drag-handle" {...dragHandleProps}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2z" />
            </svg>
          </div>

          {/* Остальной контент карточки */}
          <div className="card-cell">{instrument.id}</div>
          <div className="card-cell">{instrument.mit_title || "Название отсутствует"}</div>
          <div className="card-cell">{instrument.mit_number}</div>
          <div className="card-cell">{instrument.mi_number}</div>
          <div className="card-cell">{formatDate(instrument.verification_date)}</div>
          <div className="card-cell">{formatDate(instrument.valid_date)}</div>
          <div className={`signal-circle ${instrument.color}`}></div>
          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteMenu(true);
            }}
            aria-label={`Удалить СИ ${instrument.id}`}
          ></button>
        </div>

        {/* Меню удаления */}
        {showDeleteMenu && (
          <div className="delete-menu">
            <p>Удалить средство измерения?</p>
            <div className="delete-menu-buttons">
              <button
                onClick={() => {
                  onDelete(instrument.id);
                  setShowDeleteMenu(false);
                }}
              >
                Да
              </button>
              <button onClick={() => setShowDeleteMenu(false)}>Нет</button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default InstrumentCard;
