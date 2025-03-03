import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NodeCard({ node, onDelete }) {
  const [showDeleteMenu, setShowDeleteMenu] = useState(false); // Состояние меню удаления
  const navigate = useNavigate(); // Для навигации

  // Обработчик клика по карточке
  const handleCardClick = () => {
    if (!showDeleteMenu) navigate(`/node/${node.id}`); // Переход к деталям узла
  };

  return (
    <div
      className={`card ${showDeleteMenu ? 'show-delete-menu' : ''}`} // Добавляем класс при открытии меню
      onClick={handleCardClick} // Обработчик клика
    >
      {/* Основное содержимое карточки */}
      <div>
        <div className="card-title">{node.name}</div> {/* Название узла */}
        <div className="card-description">{node.description || "Описание отсутствует"}</div> {/* Описание узла */}

        {/* Сигнальный кружок (индикатор состояния) */}
        <div className={`signal-circle ${node.color}`}></div>

        {/* Кнопка удаления */}
        <button
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation(); // Предотвращаем всплытие события
            setShowDeleteMenu(true); // Показываем меню подтверждения удаления
          }}
          aria-label={`Удалить узел ${node.name}`}
        >
          ×
        </button>
      </div>

      {/* Меню подтверждения удаления */}
      {showDeleteMenu && (
        <div className="delete-menu">
          <p>Удалить узел?</p> {/* Вопрос подтверждения */}
          <div className="delete-menu-buttons">
            {/* Кнопка "Да" */}
            <button
              onClick={() => {
                onDelete(node.id); // Удаляем узел через пропс onDelete
                setShowDeleteMenu(false); // Скрываем меню
              }}
            >
              Да
            </button>
            {/* Кнопка "Нет" */}
            <button onClick={() => setShowDeleteMenu(false)}>Нет</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NodeCard;
