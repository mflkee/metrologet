import React, { useState } from 'react';

function AddInstrumentModal({ onClose, onAdd }) {
  const [searchParams, setSearchParams] = useState({
    mit_number: '', // Регистрационный номер
    mi_number: '', // Заводской номер
    year: '', // Год
  });

  const [isAdvancedSearchVisible, setIsAdvancedSearchVisible] = useState(false); // Состояние для расширенного поиска

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
    <div className="modal">
      <h3>Добавить средство измерений</h3>
      <form onSubmit={handleSubmit}>
        {/* Основные поля */}
        <div className="form-field">
          <label htmlFor="mit_number">Регистрационный номер</label>
          <input
            type="text"
            id="mit_number"
            name="mit_number"
            placeholder="Введите регистрационный номер"
            value={searchParams.mit_number}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="mi_number">Заводской номер</label>
          <input
            type="text"
            id="mi_number"
            name="mi_number"
            placeholder="Введите заводской номер"
            value={searchParams.mi_number}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="year">Год</label>
          <input
            type="number"
            id="year"
            name="year"
            placeholder="Введите год"
            value={searchParams.year}
            onChange={handleChange}
          />
        </div>

        {/* Кнопка для расширенного поиска */}
        <button
          type="button"
          className="toggle-advanced-search"
          onClick={() => setIsAdvancedSearchVisible((prev) => !prev)}
        >
          {isAdvancedSearchVisible ? 'Скрыть расширенный поиск' : 'Показать расширенный поиск'}
        </button>

        {/* Расширенные поля */}
        {isAdvancedSearchVisible && (
          <>
            <div className="form-field">
              <label htmlFor="org_title">Организация</label>
              <input
                type="text"
                id="org_title"
                name="org_title"
                placeholder="Введите название организации"
                value={searchParams.org_title || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="verification_date">Дата поверки</label>
              <input
                type="date"
                id="verification_date"
                name="verification_date"
                value={searchParams.verification_date || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="valid_date">Действителен до</label>
              <input
                type="date"
                id="valid_date"
                name="valid_date"
                value={searchParams.valid_date || ''}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Кнопки управления */}
        <div className="form-buttons">
          <button type="submit">Добавить</button>
          <button type="button" onClick={onClose}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

export default AddInstrumentModal;
