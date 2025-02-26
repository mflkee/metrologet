import React from 'react';

function InstrumentTable({ instruments }) {
  return (
    <div className="instrument-table">
      {/* Заголовки колонок */}
      <div className="table-header">
        <div className="header-cell">ID</div>
        <div className="header-cell">Название</div>
        <div className="header-cell">Номер MIT</div>
        <div className="header-cell">Номер MI</div>
        <div className="header-cell">Дата поверки</div>
        <div className="header-cell">Действителен до</div>
      </div>

      {/* Карточки средств измерений */}
      <div className="card-container">
        {instruments.length > 0 ? (
          instruments.map((instrument) => (
            <div key={instrument.id} className="instrument-card">
              <div className="card-cell">{instrument.id}</div>
              <div className="card-cell">{instrument.mit_title}</div>
              <div className="card-cell">{instrument.mit_number}</div>
              <div className="card-cell">{instrument.mi_number}</div>
              <div className="card-cell">{instrument.verification_date}</div>
              <div className="card-cell">{instrument.valid_date}</div>
            </div>
          ))
        ) : (
          <div className="no-data">Нет данных</div>
        )}
      </div>
    </div>
  );
}

export default InstrumentTable;
