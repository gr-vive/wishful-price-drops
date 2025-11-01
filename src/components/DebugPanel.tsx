interface DebugPanelProps {
  lastFetchAt?: string;
  itemCount: number;
}

export function DebugPanel({ lastFetchAt, itemCount }: DebugPanelProps) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

  return (
    <div
      data-testid="debug-panel"
      className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 shadow-lg max-w-sm text-sm"
    >
      <h3 className="font-semibold mb-2 text-warning-foreground">🔧 Debug Panel</h3>
      <div className="space-y-1 text-muted-foreground">
        <p>
          <span className="font-medium">Items:</span> {itemCount}
        </p>
        <p data-testid="debug-last-fetch">
          <span className="font-medium">Last fetch:</span>{' '}
          {lastFetchAt ? new Date(lastFetchAt).toLocaleTimeString() : 'Never'}
        </p>
        <p data-testid="debug-api-base" className="break-all">
          <span className="font-medium">API:</span> {apiBase}
        </p>
      </div>
    </div>
  );
}
