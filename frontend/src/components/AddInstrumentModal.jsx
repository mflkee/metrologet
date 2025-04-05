import React, { useState } from 'react';
function AddInstrumentModal({ onClose, onAdd }) {
  const [searchParams, setSearchParams] = useState({
    search: '',           // Свободный поиск * *
    mit_number: '',       // Регистрационный номер типа СИ
    mi_number: '',        // Заводской номер
    year: '',             // Год поверки
    result_docnum: '',    // Номер свидетельства о поверке
    verification_date: '',// Дата поверки
    valid_date: ''        // Действителен до
  });

  const [isAdvancedSearchVisible, setIsAdvancedSearchVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd(searchParams);
    onClose();
  };

  return (
    <div className="modal">
      <h3>Добавить средство измерений</h3>
      <form onSubmit={handleSubmit}>

        <div className="form-field">
          <label>Поиск</label>
          <input
            type="text"
            name="search"
            placeholder="FVM"
            value={searchParams.search}
            onChange={handleChange}
          />
        </div>

        {/* Основные поля */}
        <div className="form-field">
          <label>Регистрационный номер типа СИ</label>
          <input
            type="text"
            name="mit_number"
            placeholder="62129-15"
            value={searchParams.mit_number}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Заводской номер</label>
          <input
            type="text"
            name="mi_number"
            placeholder="87771776"
            value={searchParams.mi_number}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label>Год поверки</label>
          <input
            type="number"
            name="year"
            min="1950"
            max={new Date().getFullYear()}
            placeholder="2025"
            value={searchParams.year}
            onChange={handleChange}
          />
        </div>

        {/* Кнопка расширенного поиска */}
        <button
          type="button"
          className="toggle-advanced-search"
          onClick={() => setIsAdvancedSearchVisible(prev => !prev)}
        >
          {isAdvancedSearchVisible ? 'Свернуть' : 'Расширенный поиск'}
        </button>

        {isAdvancedSearchVisible && (
          <div className="advanced-search">
            <div className="form-field">
              <label>Номер свидетельства о поверке</label>
              <input
                type="text"
                name="result_docnum"
                placeholder="С-ВЯ/27-06-2024/350617442"
                value={searchParams.result_docnum}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Дата поверки</label>
              <input
                type="date"
                name="verification_date"
                value={searchParams.verification_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Действителен до</label>
              <input
                type="date"
                name="valid_date"
                value={searchParams.valid_date}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <div className="form-buttons">
          <button type="submit" className="primary">Поиск</button>
          <button type="button" onClick={onClose}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

export default AddInstrumentModal;
