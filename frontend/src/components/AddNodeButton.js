import React, { useState, useRef } from 'react';

function AddNodeButton({ onAdd }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const nameInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  const handleSubmit = () => {
    if (name.trim() === '') return;
    onAdd({ name, description });
    setIsExpanded(false);
    setName('');
    setDescription('');
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'name' && descriptionInputRef.current) {
        descriptionInputRef.current.focus(); // Перевод фокуса на описание
      } else if (field === 'description') {
        handleSubmit(); // Добавляем узел
      }
    }
  };

  return (
    <div
      className="add-node-button"
      onMouseEnter={() => {
        setIsExpanded(true);
        setTimeout(() => nameInputRef.current?.focus(), 100); // Фокус на название
      }}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {!isExpanded && <div className="plus-icon">+</div>}
      {isExpanded && (
        <div className="add-node-form">
          <input
            type="text"
            placeholder="Название объекта"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'name')}
            ref={nameInputRef} // Фокусируется автоматически
          />
          <input
            type="text"
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'description')}
            ref={descriptionInputRef}
          />
        </div>
      )}
    </div>
  );
}

export default AddNodeButton;
