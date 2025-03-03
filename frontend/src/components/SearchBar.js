import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // Передаем значение в родительский компонент
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-bar"
        placeholder="Поиск..."
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}

export default SearchBar;
