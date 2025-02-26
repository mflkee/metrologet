import React from 'react';

function DeleteNodeMenu({ onClose, onDelete }) {
  return (
    <div className="delete-menu">
      <p>Удалить узел?</p>
      <div className="delete-menu-buttons">
        <button onClick={onDelete}>Да</button>
        <button onClick={onClose}>Нет</button>
      </div>
    </div>
  );
}

export default DeleteNodeMenu;
