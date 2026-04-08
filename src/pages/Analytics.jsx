import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

const COLORS = ['hsl(152,45%,28%)', 'hsl(35,70%,50%)', 'hsl(0,72%,51%)', 'hsl(200,55%,45%)', 'hsl(270,50%,55%)', 'hsl(340,65%,50%)'];

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function Analytics() {
  const { data: districts = [], isLoading: ld } = useQuery({
    queryKey: ['districts'],
    queryFn: () => base44.entities.District.list(),
  });
  const { data: claims = [], isLoading: lc } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.FRAClaim.list('-created_date', 500),
  });

  const isLoading = ld || lc;

  // Claim type breakdown
  const typeData = (() => {
    const ind = claims.filter(c => c.claim_type === 'individual').length;
    const com = claims.filter(c => c.claim_type === 'community').length;
    return [{ name: 'Individual', value: ind }, { name: 'Community', value: com }];
  })();

  // Land type breakdown
  const landTypeData = (() => {
    const counts = {};
    claims.forEach(c => {
      const t = c.land_type || 'other';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([k, v]) => ({
      name: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: v
    }));
  })();

  // Top districts by land
  const topLandDistricts = [...districts]
    .sort((a, b) => (b.total_land_distributed_acres || 0) - (a.total_land_distributed_acres || 0))
    .slice(0, 10)
    .map(d => ({
      name: d.name?.length > 12 ? d.name.substring(0, 12) + '…' : d.name,
      acres: d.total_land_distributed_acres || 0
    }));

  // Approval rates
  const approvalData = districts
    .filter(d => d.total_claims_filed > 0)
    .map(d => ({
      name: d.name?.length > 10 ? d.name.substring(0, 10) + '…' : d.name,
      rate: parseFloat(((d.claims_approved / d.total_claims_filed) * 100).toFixed(1))
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 12);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">In-depth analysis of FRA implementation data</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Claim Type */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4">Individual vs Community Claims</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value" stroke="hsl(var(--card))" strokeWidth={2}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Land Type */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4">Land Type Distribution</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={landTypeData} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value" stroke="hsl(var(--card))" strokeWidth={2}>
                  {landTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Districts by Land */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4">Top Districts by Land Distributed</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topLandDistricts} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="acres" fill="hsl(152,45%,28%)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Approval Rates */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4">District Approval Rates (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={approvalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="rate" stroke="hsl(152,45%,28%)" fill="hsl(152,45%,28%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}