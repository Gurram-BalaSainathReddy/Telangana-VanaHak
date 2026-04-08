import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['hsl(152,45%,28%)', 'hsl(35,70%,50%)', 'hsl(0,72%,51%)', 'hsl(200,55%,45%)', 'hsl(270,50%,55%)'];

export default function ClaimStatusChart({ claims }) {
  const statusCounts = claims.reduce((acc, claim) => {
    const s = claim.status || 'filed';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No claim data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={2}
          stroke="hsl(var(--card))"
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            background: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px'
          }} 
        />
        <Legend 
          wrapperStyle={{ fontSize: '11px' }} 
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}