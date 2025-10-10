import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProjectionChart = ({ portfolio, investmentService }) => {
  const [projections, setProjections] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState('moderate');

  useEffect(() => {
    loadProjections();
  }, [portfolio.id]);

  const loadProjections = async () => {
    try {
      const data = await investmentService.getPortfolioProjections(portfolio.id, 10);
      setProjections(data);
    } catch (error) {
      console.error('Error cargando proyecciones:', error);
    }
  };

  if (!projections) {
    return <div className="loading">Cargando proyecciones...</div>;
  }

  const chartData = projections[selectedScenario].map(p => ({
    año: `Año ${p.year}`,
    'Total Invertido': p.totalInvested,
    'Valor Proyectado': p.projectedValue,
    'Ganancia': p.gains
  }));

  const scenarios = {
    conservative: { name: 'Conservador (7%)', color: '#ffc107' },
    moderate: { name: 'Moderado (8%)', color: '#007bff' },
    optimistic: { name: 'Optimista (9%)', color: '#28a745' }
  };

  return (
    <div className="projection-chart card">
      <h2>Proyecciones a 10 Años - {portfolio.broker.toUpperCase()}</h2>

      <div className="scenario-selector">
        {Object.entries(scenarios).map(([key, scenario]) => (
          <button
            key={key}
            className={`scenario-btn ${selectedScenario === key ? 'active' : ''}`}
            onClick={() => setSelectedScenario(key)}
            style={{
              borderColor: selectedScenario === key ? scenario.color : '#e1e5e9',
              backgroundColor: selectedScenario === key ? scenario.color : 'white',
              color: selectedScenario === key ? 'white' : '#333'
            }}
          >
            {scenario.name}
          </button>
        ))}
      </div>

      <div style={{ height: '400px', marginTop: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="año" />
            <YAxis />
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Total Invertido" 
              stroke="#6c757d" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Valor Proyectado" 
              stroke={scenarios[selectedScenario].color} 
              strokeWidth={3}
              dot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="Ganancia" 
              stroke="#28a745" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="projection-summary">
        <h3>Resumen de Proyección ({scenarios[selectedScenario].name})</h3>
        <div className="projection-stats">
          {projections[selectedScenario].slice(-1).map(p => (
            <React.Fragment key={p.year}>
              <div className="projection-stat">
                <span>Total a Invertir (10 años):</span>
                <strong>${p.totalInvested.toFixed(2)}</strong>
              </div>
              <div className="projection-stat">
                <span>Valor Proyectado:</span>
                <strong style={{ color: scenarios[selectedScenario].color }}>
                  ${p.projectedValue.toFixed(2)}
                </strong>
              </div>
              <div className="projection-stat">
                <span>Ganancia Estimada:</span>
                <strong style={{ color: '#28a745' }}>
                  ${p.gains.toFixed(2)}
                </strong>
              </div>
              <div className="projection-stat">
                <span>Retorno Total:</span>
                <strong>
                  {((p.gains / p.totalInvested) * 100).toFixed(2)}%
                </strong>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectionChart;
