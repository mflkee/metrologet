import React, { useState, forwardRef } from 'react';

const InstrumentCard = forwardRef(({ instrument, onDelete, dragHandleProps, ...props }, ref) => {
const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  // Функция для форматирования дат
  const formatDate = (dateString) => {
    if (!dateString) return ""; // Если дата отсутствует, возвращаем пустую строку
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0"); // День с ведущим нулём
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяц с ведущим нулём
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <div className={`instrument-card ${showDeleteMenu ? 'show-delete-menu' : ''}`} ref={ref} {...props}>
      {/* Элемент для перетаскивания */}

      <div className="instrument-card-content">
        <div className="drag-handle" {...dragHandleProps}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1" height="1">
            <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2z" />
          </svg>
        </div>
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
});

export default InstrumentCard;
