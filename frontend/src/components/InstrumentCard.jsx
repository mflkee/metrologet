import React, { useState } from 'react';

function InstrumentCard({ instrument, onDelete }) {
  const [showDeleteMenu, setShowDeleteMenu] = useState(false); // Состояние меню удаления

  return (
    <div className={`instrument-card ${showDeleteMenu ? 'show-delete-menu' : ''}`}>
      {/* Основное содержимое карточки */}
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

      {/* Кнопка удаления */}
      <button
        className="delete-button"
        onClick={(e) => {
          e.stopPropagation(); // Предотвращаем всплытие события
          setShowDeleteMenu(true); // Показываем меню подтверждения удаления
        }}
        aria-label={`Удалить СИ ${instrument.id}`}
      >
      </button>

      {/* Меню подтверждения удаления */}
      {showDeleteMenu && (
        <div className="delete-menu">
          <p>Удалить средство измерения?</p>
          <div className="delete-menu-buttons">
            <button
              onClick={() => {
                onDelete(instrument.id); // Удаляем СИ через пропс onDelete
                setShowDeleteMenu(false); // Скрываем меню
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

export default InstrumentCard;
