// components/InstrumentTable.jsx

import React from 'react';

function InstrumentTable({ instruments }) {
  return (
    <table className="instrument-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Номер MIT</th>
          <th>Номер MI</th>
          <th>Дата поверки</th>
          <th>Действителен до</th>
        </tr>
      </thead>
      <tbody>
        {instruments.length > 0 ? (
          instruments.map((instrument) => (
            <tr key={instrument.id}>
              <td>{instrument.id}</td>
              <td>{instrument.mit_title}</td>
              <td>{instrument.mit_number}</td>
              <td>{instrument.mi_number}</td>
              <td>{instrument.verification_date}</td>
              <td>{instrument.valid_date}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">Нет данных</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default InstrumentTable;
