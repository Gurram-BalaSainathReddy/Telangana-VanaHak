import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function DistrictTable({ districts }) {
  if (!districts || districts.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">No district data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-semibold">District</TableHead>
            <TableHead className="text-xs font-semibold text-right">Filed</TableHead>
            <TableHead className="text-xs font-semibold text-right">Approved</TableHead>
            <TableHead className="text-xs font-semibold text-right">Rejected</TableHead>
            <TableHead className="text-xs font-semibold text-right">Pending</TableHead>
            <TableHead className="text-xs font-semibold text-right">Land (Acres)</TableHead>
            <TableHead className="text-xs font-semibold">Approval Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {districts.map((d) => {
            const rate = d.total_claims_filed > 0 
              ? ((d.claims_approved / d.total_claims_filed) * 100).toFixed(1) 
              : 0;
            return (
              <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-sm">{d.name}</TableCell>
                <TableCell className="text-right text-sm">{d.total_claims_filed?.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm text-primary font-medium">{d.claims_approved?.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm text-destructive">{d.claims_rejected?.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm text-accent-foreground">{d.claims_pending?.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm">{d.total_land_distributed_acres?.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {rate}%
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}