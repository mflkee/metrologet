import React, { useState } from 'react';

function AddInstrumentModal({ onClose, onAdd }) {
  const [searchParams, setSearchParams] = useState({
    search: '',
    mit_number: '',
    mi_number: '',
    year: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(searchParams);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Добавить средство измерений</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="search"
            placeholder="Поиск..."
            value={searchParams.search}
            onChange={handleChange}
          />
          <input
            type="text"
            name="mit_number"
            placeholder="Номер MIT"
            value={searchParams.mit_number}
            onChange={handleChange}
          />
          <input
            type="text"
            name="mi_number"
            placeholder="Номер MI"
            value={searchParams.mi_number}
            onChange={handleChange}
          />
          <input
            type="number"
            name="year"
            placeholder="Год"
            value={searchParams.year}
            onChange={handleChange}
          />
          <button type="submit">Добавить</button>
          <button type="button" onClick={onClose}>
            Отмена
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddInstrumentModal;
