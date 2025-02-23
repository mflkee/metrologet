import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNodes, deleteNode } from './api';
import { Node } from './types';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const data = await getNodes();
        console.log('Данные с сервера:', data);

        // Адаптируем данные, если они приходят в неправильном формате
        const formattedData = data.map((item: any) => ({
          id: item.node_id || item.id,       // Если id приходит как node_id
          name: item.node_name || item.name, // Если name приходит как node_name
          description: item.node_description || item.description,
        }));

        setNodes(formattedData);
      } catch (error) {
        console.error('Ошибка при загрузке узлов:', error);
      }
    };

    fetchNodes();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteNode(id);
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении узла:', error);
    }
  };

  return (
    <div className="home-container">
      <h1>Узлы измерений</h1>
      <div className="nodes-grid">
        {nodes.map((node) => (
          <div key={node.id} className="node-card">
            <div className="card-content">
              <h3>{node.name}</h3>
              {node.description && <p>{node.description}</p>}
              <div className="card-actions">
                <Link to={`/nodes/${node.id}`} className="btn view-btn">
                  Подробнее
                </Link>
                <button
                  className="btn delete-btn"
                  onClick={() => handleDelete(node.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
