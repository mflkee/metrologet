import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Поиск..."
        value={query}
        onChange={handleChange}
        className="search-bar"
      />
    </div>
  );
}

export default SearchBar;
