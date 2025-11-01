import { Plus, RefreshCw, Beaker, LogOut } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ToolbarProps {
  onAddItem: () => void;
  onRefresh: () => void;
  onAddDemo: () => void;
  demoMode: boolean;
  onDemoModeChange: (enabled: boolean) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  isRefreshing?: boolean;
  onSignOut?: () => void;
  userEmail?: string;
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
  onSignOut,
  userEmail,
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

        {userEmail && onSignOut && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback>
                    {userEmail.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
