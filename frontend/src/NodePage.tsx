import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInstruments, createInstrument, deleteInstrument } from './api';
import { MeasuringInstrument, MeasuringInstrumentCreate } from './types';
import './NodePage.css';

const NodePage: React.FC = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const [instruments, setInstruments] = useState<MeasuringInstrument[]>([]);
  const [newInstrument, setNewInstrument] = useState<MeasuringInstrumentCreate>({
    vri_id: '',
    org_title: '',
    mit_number: '',
    mit_title: '',
    mit_notation: '',
    mi_number: '',
    result_docnum: '',
    mi_modification: '',
    verification_date: undefined,
    valid_date: undefined,
  });

  useEffect(() => {
    const fetchInstruments = async () => {
      if (nodeId) {
        const data = await getInstruments(parseInt(nodeId));
        setInstruments(data);
      }
    };

    fetchInstruments();
  }, [nodeId]); // nodeId добавлен в зависимости

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nodeId) {
      await createInstrument(parseInt(nodeId), newInstrument);
      setNewInstrument({
        vri_id: '',
        org_title: '',
        mit_number: '',
        mit_title: '',
        mit_notation: '',
        mi_number: '',
        result_docnum: '',
        mi_modification: '',
        verification_date: undefined,
        valid_date: undefined,
      });
      setInstruments((prev) => [...prev, { ...newInstrument, id: Date.now(), node_id: parseInt(nodeId) }]);
    }
  };

  const handleDelete = async (instrumentId: number) => {
    if (nodeId) {
      await deleteInstrument(parseInt(nodeId), instrumentId);
      setInstruments((prev) => prev.filter((inst) => inst.id !== instrumentId));
    }
  };

  return (
    <div className="node-container">
      <Link to="/" className="back-link">← На главную</Link>
      
      <div className="instrument-form">
        <h2>Добавить новое средство измерения</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Номер типа СИ"
            value={newInstrument.mit_number}
            onChange={(e) => setNewInstrument({ ...newInstrument, mit_number: e.target.value })}
            required
          />
          <input
            placeholder="Заводской номер"
            value={newInstrument.mi_number}
            onChange={(e) => setNewInstrument({ ...newInstrument, mi_number: e.target.value })}
            required
          />
          <button type="submit">Добавить</button>
        </form>
      </div>

      <div className="instruments-list">
        <h2>Список средств измерений</h2>
        {instruments.map((instrument) => (
          <div key={instrument.id} className="instrument-card">
            <div className="instrument-info">
              <h3>{instrument.mit_title || 'Без названия'}</h3>
              <p>Тип: {instrument.mit_number}</p>
              <p>Заводской номер: {instrument.mi_number}</p>
              {instrument.verification_date && 
                <p>Дата поверки: {instrument.verification_date}</p>}
            </div>
            <button 
              className="delete-btn"
              onClick={() => handleDelete(instrument.id)}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePage;
