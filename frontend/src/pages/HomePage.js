import React, { useEffect, useState } from 'react';
import {
  fetchNodes,
  createNode,
  deleteNode,
  searchNodes,
} from '../api/apiClient';
import NodeCard from '../components/NodeCard';
import AddNodeButton from '../components/AddNodeButton';
import SearchBar from '../components/SearchBar';
import '../styles/App.scss'; // Глобальные стили

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
      const newNode = await createNode(nodeData);
      setNodes([...nodes, newNode]);
      setFilteredNodes([...filteredNodes, newNode]);
    } catch (error) {
      console.error("Ошибка при добавлении узла:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление узла
  const handleDeleteNode = async (nodeId) => {
    try {
      setIsLoading(true);
      await deleteNode(nodeId);
      setNodes(nodes.filter((node) => node.id !== nodeId));
      setFilteredNodes(filteredNodes.filter((node) => node.id !== nodeId));
    } catch (error) {
      console.error("Ошибка при удалении узла:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page">
      <SearchBar onSearch={handleSearch} />
      <div className="card-container">
        {isLoading ? (
          <p>Загрузка...</p>
        ) : filteredNodes.length > 0 ? (
          filteredNodes.map((node) => (
            <NodeCard key={node.id} node={node} onDelete={handleDeleteNode} />
          ))
        ) : (
          <div className="no-data">Нет данных</div>
        )}
        <AddNodeButton onAdd={handleAddNode} />
      </div>
    </div>
  );
}

export default HomePage;
