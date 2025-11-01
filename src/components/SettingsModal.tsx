import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetDemo: () => void;
}

export function SettingsModal({
  open,
  onOpenChange,
  onResetDemo,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="modal-settings">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your preferences and manage demo data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="country-setting">Default Country</Label>
            <Select data-testid="select-country" defaultValue="GB">
              <SelectTrigger id="country-setting">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="EU">Europe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency-setting">Preferred Currency</Label>
            <Select data-testid="select-currency" defaultValue="GBP">
              <SelectTrigger id="currency-setting">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 border-t">
            <Label className="text-muted-foreground mb-2 block">Demo Data</Label>
            <Button
              data-testid="btn-reset-demo"
              variant="destructive"
              onClick={() => {
                onResetDemo();
                onOpenChange(false);
              }}
            >
              Reset Demo Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
