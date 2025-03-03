import React, { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import NodeCard from '../components/NodeCard';
import AddNodeButton from '../components/AddNodeButton';
import { fetchNodes, createNode, searchNodes, deleteNode } from '../api/apiClient';
import '../styles/App.scss';

function HomePage() {
  const [nodes, setNodes] = useState([]); // Все узлы
  const [filteredNodes, setFilteredNodes] = useState([]); // Отфильтрованные узлы
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка узлов при монтировании
  useEffect(() => {
    const loadNodes = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNodes();
        setNodes(data);
        setFilteredNodes(data);
      } catch (error) {
        console.error("Ошибка при загрузке узлов:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNodes();
  }, []);

  // Обработчик поиска
  const handleSearch = async (query) => {
    setIsLoading(true);
    try {
      if (!query) {
        setFilteredNodes(nodes);
      } else {
        const data = await searchNodes(query);
        setFilteredNodes(data);
      }
    } catch (error) {
      console.error("Ошибка при поиске:", error);
      setFilteredNodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Добавление нового узла
  const handleAddNode = async (nodeData) => {
    try {
      setIsLoading(true);
      const newNode = await createNode(nodeData); // Создаем новый узел через API
      setNodes([...nodes, newNode]); // Добавляем новый узел в список
      setFilteredNodes([...filteredNodes, newNode]); // Обновляем отфильтрованный список
    } catch (error) {
      console.error("Ошибка при добавлении узла:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление узла
  const handleDeleteNode = async (nodeId) => {
    try {
      await deleteNode(nodeId); // Удаляем узел через API
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId)); // Обновляем список всех узлов
      setFilteredNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId)); // Обновляем отфильтрованный список
    } catch (error) {
      console.error("Ошибка при удалении узла:", error);
    }
  };

  return (
    <div className="home-page">
      {/* Поисковая строка */}
      <SearchBar onSearch={handleSearch} />

      {/* Контейнер карточек */}
      <div className="card-container">
        {isLoading ? (
          <p>Загрузка...</p>
        ) : filteredNodes.length > 0 ? (
          filteredNodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              onDelete={handleDeleteNode} // Передаем функцию удаления
            />
          ))
        ) : (
          <p>Нет данных</p>
        )}
        {/* Кнопка добавления узла */}
        <AddNodeButton onAdd={handleAddNode} />
      </div>
    </div>
  );
}

export default HomePage;
