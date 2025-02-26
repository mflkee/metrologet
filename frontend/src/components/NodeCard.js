import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteNodeMenu from './DeleteNodeMenu';

function NodeCard({ node, onDelete }) {
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!showDeleteMenu) navigate(`/node/${node.id}`);
  };

  return (
    <div className="card" onClick={handleCardClick}>
      {/* Контент карточки */}
      {!showDeleteMenu && (
        <>
          <div className="card-header">{node.name}</div>
          <div className="card-body">{node.description || "Описание отсутствует"}</div>
          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteMenu(true);
            }}
            aria-label={`Удалить узел ${node.name}`}
          >
            ×
          </button>
        </>
      )}

      {/* Меню подтверждения удаления */}
      {showDeleteMenu && (
        <div className="delete-menu-container">
          <DeleteNodeMenu
            onClose={() => setShowDeleteMenu(false)}
            onDelete={() => {
              onDelete(node.id);
              setShowDeleteMenu(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default NodeCard;
