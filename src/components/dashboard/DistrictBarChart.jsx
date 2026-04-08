import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DistrictBarChart({ districts }) {
  const data = districts.slice(0, 10).map(d => ({
    name: d.name?.length > 10 ? d.name.substring(0, 10) + '…' : d.name,
    Approved: d.claims_approved || 0,
    Rejected: d.claims_rejected || 0,
    Pending: d.claims_pending || 0,
  }));

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No district data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <YAxis 
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
          axisLine={{ stroke: 'hsl(var(--border))' }}
        />
        <Tooltip 
          contentStyle={{ 
            background: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" iconSize={8} />
        <Bar dataKey="Approved" fill="hsl(152,45%,28%)" radius={[3,3,0,0]} />
        <Bar dataKey="Rejected" fill="hsl(0,72%,51%)" radius={[3,3,0,0]} />
        <Bar dataKey="Pending" fill="hsl(35,70%,50%)" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}