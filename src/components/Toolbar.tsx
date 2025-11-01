import { Plus, RefreshCw, Beaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ToolbarProps {
  onAddItem: () => void;
  onRefresh: () => void;
  onAddDemo: () => void;
  demoMode: boolean;
  onDemoModeChange: (enabled: boolean) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  isRefreshing?: boolean;
}

export function Toolbar({
  onAddItem,
  onRefresh,
  onAddDemo,
  demoMode,
  onDemoModeChange,
  sortBy,
  onSortChange,
  isRefreshing = false,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button data-testid="btn-add-item" onClick={onAddItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
        <Button
          data-testid="btn-refresh"
          variant="outline"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Refresh Prices
        </Button>
        <Button
          data-testid="btn-add-demo"
          variant="outline"
          onClick={onAddDemo}
        >
          <Beaker className="mr-2 h-4 w-4" />
          Demo Items
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="sort-select" className="text-sm">
            Sort by:
          </Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger
              id="sort-select"
              data-testid="select-sort"
              className="w-[140px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date added</SelectItem>
              <SelectItem value="price">Current price</SelectItem>
              <SelectItem value="pctChange">% Change</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="demo-mode"
            data-testid="toggle-demo"
            checked={demoMode}
            onCheckedChange={onDemoModeChange}
          />
          <Label htmlFor="demo-mode" className="text-sm cursor-pointer">
            Demo Mode
          </Label>
        </div>
      </div>
    </div>
  );
}
