import React, { useState } from 'react';

function InstrumentTable({ instruments }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Логирование данных
  console.log("Instruments:", instruments);

  // Сортировка
  const sortedInstruments = [...instruments].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInstruments.slice(indexOfFirstItem, indexOfLastItem);

  // Логирование текущих элементов
  console.log("Current Items:", currentItems);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <table className="instrument-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>ID</th>
            <th onClick={() => handleSort('mit_title')}>Название</th>
            <th onClick={() => handleSort('mit_number')}>Номер MIT</th>
            <th onClick={() => handleSort('mi_number')}>Номер MI</th>
            <th onClick={() => handleSort('verification_date')}>Дата поверки</th>
            <th onClick={() => handleSort('valid_date')}>Действителен до</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((instrument) => (
              <tr key={instrument.id}>
                <td>{instrument.id}</td>
                <td>
                  <div className={`signal-circle ${instrument.color}`} style={{ border: '1px solid red' }}></div>
                  {instrument.mit_title || "Название отсутствует"}
                </td>
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

      <div className="pagination">
        {Array.from({ length: Math.ceil(instruments.length / itemsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            disabled={currentPage === i + 1}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </>
  );
}

export default InstrumentTable;
