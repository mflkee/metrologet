import React from 'react';

function DeleteInstrumentMenu({ onClose, onDelete }) {
  return (
    <div className="delete-menu">
      <p>Удалить средство измерения?</p>
      <div className="delete-menu-buttons">
        <button className="delete-button" onClick={onDelete}>Да</button>
        <button className="cancel-button" onClick={onClose}>Нет</button>
      </div>
    </div>
  );
}

export default DeleteInstrumentMenu;
