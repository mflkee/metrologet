import React, { useState } from 'react';

function AddGroupModal({ onClose, onAdd }) {
  const [groupName, setGroupName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName.trim()) {
      onAdd(groupName.trim());
    }
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-content">
        <h3>Создать группу</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Название группы"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="modal-buttons">
            <button type="submit">Создать</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGroupModal;
