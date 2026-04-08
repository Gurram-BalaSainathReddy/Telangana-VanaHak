import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

const TELANGANA_DISTRICTS = [
  "Adilabad","Bhadradri Kothagudem","Hyderabad","Jagtial","Jangaon","Jayashankar","Jogulamba Gadwal",
  "Kamareddy","Karimnagar","Khammam","Komaram Bheem","Mahabubabad","Mahbubnagar","Mancherial",
  "Medak","Medchal–Malkajgiri","Mulugu","Nagarkurnool","Nalgonda","Narayanpet","Nirmal",
  "Nizamabad","Peddapalli","Rajanna Sircilla","Rangareddy","Sangareddy","Siddipet",
  "Suryapet","Vikarabad","Wanaparthy","Warangal","Yadadri Bhuvanagiri"
];

export default function ClaimForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState(initialData || {
    claimant_name: '',
    district: '',
    mandal: '',
    village: '',
    claim_type: 'individual',
    status: 'filed',
    land_area_acres: '',
    land_type: 'agriculture',
    filing_date: '',
    tribe_community: '',
    gram_sabha_resolution: false,
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      land_area_acres: form.land_area_acres ? parseFloat(form.land_area_acres) : 0,
      claim_id: form.claim_id || `FRA-${Date.now().toString(36).toUpperCase()}`
    });
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold">{initialData ? 'Edit Claim' : 'New FRA Claim'}</h2>
          <button onClick={onCancel}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs">Claimant Name *</Label>
              <Input value={form.claimant_name} onChange={e => update('claimant_name', e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs">District *</Label>
              <Select value={form.district} onValueChange={v => update('district', v)}>
                <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                <SelectContent>
                  {TELANGANA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Mandal</Label>
              <Input value={form.mandal} onChange={e => update('mandal', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Village</Label>
              <Input value={form.village} onChange={e => update('village', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Claim Type</Label>
              <Select value={form.claim_type} onValueChange={v => update('claim_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="filed">Filed</SelectItem>
                  <SelectItem value="pending_sdlc">Pending SDLC</SelectItem>
                  <SelectItem value="pending_dlc">Pending DLC</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="appealed">Appealed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Land Area (Acres)</Label>
              <Input type="number" step="0.01" value={form.land_area_acres} onChange={e => update('land_area_acres', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Land Type</Label>
              <Select value={form.land_type} onValueChange={v => update('land_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="habitation">Habitation</SelectItem>
                  <SelectItem value="forest_produce">Forest Produce</SelectItem>
                  <SelectItem value="grazing">Grazing</SelectItem>
                  <SelectItem value="water_bodies">Water Bodies</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Filing Date</Label>
              <Input type="date" value={form.filing_date} onChange={e => update('filing_date', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Tribe / Community</Label>
              <Input value={form.tribe_community} onChange={e => update('tribe_community', e.target.value)} />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <Switch checked={form.gram_sabha_resolution} onCheckedChange={v => update('gram_sabha_resolution', v)} />
              <Label className="text-xs">Gram Sabha Resolution Passed</Label>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{initialData ? 'Update' : 'Submit Claim'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}