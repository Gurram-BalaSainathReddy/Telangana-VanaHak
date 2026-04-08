import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as MapTooltip } from 'react-leaflet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

const TELANGANA_CENTER = [17.85, 79.15];

const getColor = (rate) => {
  if (rate >= 70) return '#166534';
  if (rate >= 50) return '#ca8a04';
  if (rate >= 30) return '#ea580c';
  return '#dc2626';
};

const getRadius = (count) => {
  if (count > 5000) return 22;
  if (count > 2000) return 18;
  if (count > 1000) return 14;
  if (count > 500) return 10;
  return 7;
};

export default function MapView() {
  const [metric, setMetric] = useState('approval_rate');

  const { data: districts = [], isLoading } = useQuery({
    queryKey: ['districts'],
    queryFn: () => base44.entities.District.list(),
  });

  const districtsWithCoords = districts.filter(d => d.latitude && d.longitude);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">GIS Map View</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Geospatial visualization of FRA claims across Telangana</p>
        </div>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approval_rate">Approval Rate</SelectItem>
            <SelectItem value="total_claims">Total Claims</SelectItem>
            <SelectItem value="land_distributed">Land Distributed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Map */}
      <div className="flex-1 p-4 lg:p-6 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-full rounded-xl overflow-hidden border border-border shadow-sm">
            <MapContainer
              center={TELANGANA_CENTER}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              {districtsWithCoords.map((d) => {
                const rate = d.total_claims_filed > 0
                  ? (d.claims_approved / d.total_claims_filed) * 100
                  : 0;
                const color = getColor(rate);
                const radius = getRadius(d.total_claims_filed || 0);

                return (
                  <CircleMarker
                    key={d.id}
                    center={[d.latitude, d.longitude]}
                    radius={radius}
                    pathOptions={{
                      fillColor: color,
                      color: color,
                      weight: 2,
                      opacity: 0.9,
                      fillOpacity: 0.5
                    }}
                  >
                    <MapTooltip direction="top" offset={[0, -10]}>
                      <span className="font-medium">{d.name}</span>
                    </MapTooltip>
                    <Popup>
                      <div className="space-y-2 min-w-[180px]">
                        <h3 className="font-bold text-sm">{d.name}</h3>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <span className="text-gray-500">Total Claims:</span>
                          <span className="font-medium">{d.total_claims_filed?.toLocaleString()}</span>
                          <span className="text-gray-500">Approved:</span>
                          <span className="font-medium text-green-700">{d.claims_approved?.toLocaleString()}</span>
                          <span className="text-gray-500">Rejected:</span>
                          <span className="font-medium text-red-600">{d.claims_rejected?.toLocaleString()}</span>
                          <span className="text-gray-500">Pending:</span>
                          <span className="font-medium text-amber-600">{d.claims_pending?.toLocaleString()}</span>
                          <span className="text-gray-500">Land (Acres):</span>
                          <span className="font-medium">{d.total_land_distributed_acres?.toLocaleString()}</span>
                          <span className="text-gray-500">Approval Rate:</span>
                          <span className="font-semibold">{rate.toFixed(1)}%</span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 lg:px-6 pb-4 flex flex-wrap items-center gap-4 text-xs">
        <span className="font-medium text-muted-foreground">Approval Rate:</span>
        {[
          { color: '#166534', label: '≥70%' },
          { color: '#ca8a04', label: '50-70%' },
          { color: '#ea580c', label: '30-50%' },
          { color: '#dc2626', label: '<30%' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}