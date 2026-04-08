import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import ClaimForm from '../components/claims/ClaimForm';
import { format } from 'date-fns';
import { useSettings } from '@/lib/SettingsContext';

const statusBadge = {
  filed: 'bg-blue-100 text-blue-700',
  pending_sdlc: 'bg-amber-100 text-amber-700',
  pending_dlc: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  appealed: 'bg-purple-100 text-purple-700',
};

export default function Claims() {
  const [showForm, setShowForm] = useState(false);
  const [editClaim, setEditClaim] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { settings } = useSettings();

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.FRAClaim.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FRAClaim.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['claims'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FRAClaim.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['claims'] }); setShowForm(false); setEditClaim(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FRAClaim.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['claims'] }),
  });

  const filtered = claims.filter(c => {
    // District officers can only see claims from their district
    if (user?.role === 'district_officer' && user?.district && c.district !== user.district) {
      return false;
    }
    
    const matchSearch = !search || 
      c.claimant_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.claim_id?.toLowerCase().includes(search.toLowerCase()) ||
      c.district?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchType = typeFilter === 'all' || c.claim_type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const canEdit = user?.role === 'government_admin' || user?.role === 'district_officer';
  const canDelete = user?.role === 'government_admin';

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">FRA Claims</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.role === 'district_officer' && user?.district 
              ? `${user.district} District Claims` 
              : 'Manage and track Forest Rights Act claims'}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => { setEditClaim(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> New Claim
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID, district..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="filed">Filed</SelectItem>
            <SelectItem value="pending_sdlc">Pending SDLC</SelectItem>
            <SelectItem value="pending_dlc">Pending DLC</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="appealed">Appealed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="community">Community</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No claims found. Create a new claim to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Claim ID</TableHead>
                  <TableHead className="text-xs">Claimant</TableHead>
                  <TableHead className="text-xs">District</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Land (Ac)</TableHead>
                  <TableHead className="text-xs">Filed On</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className={`hover:bg-muted/30 ${settings.compactView ? 'h-8' : ''}`}>
                    <TableCell className="text-xs font-mono">{c.claim_id}</TableCell>
                    <TableCell className="text-sm font-medium">{c.claimant_name}</TableCell>
                    <TableCell className="text-sm">{c.district}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{c.claim_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[c.status] || 'bg-muted text-muted-foreground'}`}>
                        {c.status?.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{c.land_area_acres || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {c.filing_date ? format(new Date(c.filing_date), 'dd MMM yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {canEdit && (
                          <button onClick={() => { setEditClaim(c); setShowForm(true); }} className="p-1.5 hover:bg-muted rounded-md">
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 hover:bg-destructive/10 rounded-md">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        )}
                        {!canEdit && !canDelete && <span className="text-xs text-muted-foreground px-2">View only</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {showForm && (
        <ClaimForm
          initialData={editClaim}
          onCancel={() => { setShowForm(false); setEditClaim(null); }}
          onSubmit={(data) => {
            if (editClaim) {
              updateMutation.mutate({ id: editClaim.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}