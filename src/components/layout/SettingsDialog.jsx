import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSettings } from '@/lib/SettingsContext';

export default function SettingsDialog({ open, onClose }) {
  const { settings, updateSettings } = useSettings();
  const [local, setLocal] = useState({ ...settings });

  const handleSave = () => {
    updateSettings(local);
    toast.success('Settings saved');
    onClose();
  };

  const toggle = (key) => setLocal(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates on claim status changes</p>
            </div>
            <Switch checked={local.emailNotifications} onCheckedChange={() => toggle('emailNotifications')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Compact View</Label>
              <p className="text-xs text-muted-foreground">Show denser table rows in Claims page</p>
            </div>
            <Switch checked={local.compactView} onCheckedChange={() => toggle('compactView')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto Refresh Data</Label>
              <p className="text-xs text-muted-foreground">Automatically refresh dashboard every 5 minutes</p>
            </div>
            <Switch checked={local.autoRefresh} onCheckedChange={() => toggle('autoRefresh')} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}