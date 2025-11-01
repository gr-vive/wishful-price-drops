import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddItem: () => void;
  onAddDemo: () => void;
}

export function EmptyState({ onAddItem, onAddDemo }: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className="flex min-h-[500px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center"
    >
      <div className="mb-6 rounded-full bg-muted p-6">
        <Package className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-2xl font-semibold">Start tracking prices</h3>
      <p className="mb-8 max-w-md text-muted-foreground">
        Add a product link or name to start monitoring prices and get alerts when they drop.
      </p>
      <div className="flex gap-3">
        <Button
          data-testid="btn-empty-add-demo"
          variant="outline"
          onClick={onAddDemo}
        >
          Add demo items
        </Button>
        <Button data-testid="btn-empty-add-item" onClick={onAddItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add item
        </Button>
      </div>
    </div>
  );
}
