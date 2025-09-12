import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import CurrencyFormatter from '../utils/CurrencyFormatter';

const BudgetChart = ({ activeBudget, totalExpenses, remaining, status }) => {
  if (!activeBudget) {
    return (
      <div className="card">
        <h2>Gráfico del Presupuesto</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Selecciona un presupuesto para ver el gráfico</p>
        </div>
      </div>
    );
  }

  // Prepare data for the pie chart
  const data = [
    {
      name: 'Gastado',
      value: totalExpenses,
      color: '#dc3545'
    },
    {
      name: 'Restante',
      value: Math.max(0, remaining),
      color: status === 'safe' ? '#28a745' : status === 'warning' ? '#ffc107' : '#6c757d'
    }
  ];

  // If over budget, show only expenses
  if (remaining < 0) {
    data[0].value = activeBudget.amount;
    data.push({
      name: 'Sobregasto',
      value: Math.abs(remaining),
      color: '#dc3545'
    });
    data[1].value = 0;
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
          <p style={{ margin: 0, color: data.payload.color }}>
            {CurrencyFormatter.formatAmount(data.value, activeBudget.currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (activeBudget.amount === 0) {
    return (
      <div className="card">
        <h2>Gráfico del Presupuesto</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Configura tu presupuesto para ver el gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Gráfico del Presupuesto</h2>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        <strong>{activeBudget.name}</strong>
      </p>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BudgetChart;
