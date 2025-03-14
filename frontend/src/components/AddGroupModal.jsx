import React, { useState } from "react";

const AddGroupModal = ({ isOpen, onClose, onAdd }) => {
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName.trim() === "") {
      setError("Название группы не может быть пустым");
      return;
    }

    // Прослеживаем, что передаем в родительский компонент
    console.log("Передаем данные в родительский компонент:", { name: groupName });

    onAdd({ name: groupName });
    setGroupName("");
    setError(""); // Сбросить ошибку после успешного добавления
    onClose();
  };

  return (
    <>
      <div className="modal-overlay active" onClick={onClose}></div>
      <div className="modal-group active"> {/* изменили класс здесь */}
        <h3>Добавить группу</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Название группы</label>
            <input
              type="text"
              placeholder="Введите название группы"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-buttons">
            <button type="submit" className="add-button">
              Добавить
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Закрыть
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddGroupModal;
