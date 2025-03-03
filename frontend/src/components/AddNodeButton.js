import React, { useState, useRef } from 'react';

function AddNodeButton({ onAdd }) {
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Создаем рефы для полей ввода
  const nameInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  // Обработчик отправки формы
  const handleSubmit = () => {
    if (name.trim() === '') return; // Проверяем, что название не пустое
    onAdd({ name, description }); // Вызываем функцию добавления узла
    setIsModalOpen(false); // Закрываем модальное окно
    setName('');
    setDescription('');
  };

  // Обработчик закрытия модального окна
  const handleClose = () => {
    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  // Обработчик открытия модального окна
  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Устанавливаем фокус на поле ввода "Название" после открытия модального окна
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 0);
  };

  // Обработчик нажатия клавиш в поле "Название"
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем стандартное поведение (например, отправку формы)
      if (descriptionInputRef.current) {
        descriptionInputRef.current.focus(); // Перемещаем фокус на поле "Описание"
      }
    }
  };

  // Обработчик нажатия клавиш в поле "Описание"
  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем стандартное поведение
      handleSubmit(); // Добавляем карточку
    }
  };

  return (
    <>
      {/* Кнопка с плюсом */}
      <div className="add-node-button" onClick={handleOpenModal}>
        <span className="plus-icon">+</span>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className={`modal-overlay active`}>
          <div className="modal-content">
            <input
              type="text"
              placeholder="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={nameInputRef} // Привязываем реф к полю ввода "Название"
              onKeyDown={handleNameKeyDown} // Обработчик нажатий клавиш
            />
            <input
              type="text"
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              ref={descriptionInputRef} // Привязываем реф к полю ввода "Описание"
              onKeyDown={handleDescriptionKeyDown} // Обработчик нажатий клавиш
            />
            <div className="modal-buttons">
              <button onClick={handleSubmit}>Да</button>
              <button onClick={handleClose}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddNodeButton;
