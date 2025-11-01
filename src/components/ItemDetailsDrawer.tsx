import { ItemDTO, TrackingRule } from '@/types/item';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface ItemDetailsDrawerProps {
  item: ItemDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveTarget: (id: string, rule: TrackingRule) => void;
}

export function ItemDetailsDrawer({
  item,
  open,
  onOpenChange,
  onSaveTarget,
}: ItemDetailsDrawerProps) {
  const [editingRule, setEditingRule] = useState(false);
  const [targetValue, setTargetValue] = useState<string>('');

  if (!item) return null;

  const handleEditRule = () => {
    if (item.tracking_rule.type === 'below_absolute') {
      setTargetValue(String(item.tracking_rule.value));
    }
    setEditingRule(true);
  };

  const handleSaveRule = () => {
    if (item.tracking_rule.type === 'below_absolute') {
      const value = parseFloat(targetValue);
      if (!isNaN(value) && value > 0) {
        onSaveTarget(item.id, {
          type: 'below_absolute',
          currency: item.tracking_rule.currency,
          value,
        });
      }
    }
    setEditingRule(false);
  };

  const getCurrency = () => {
    if (item.user_country === 'GB') return '£';
    if (item.user_country === 'US') return '$';
    return '€';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent data-testid="drawer-item-details" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-start gap-2">
            <span data-testid="item-title">{item.title}</span>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </SheetTitle>
          <SheetDescription>Item details and tracking settings</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <Label className="text-muted-foreground">Domain</Label>
            <p data-testid="item-domain" className="text-sm font-medium">
              {item.domain}
            </p>
          </div>

          <div>
            <Label className="text-muted-foreground">Country</Label>
            <Badge variant="outline" className="mt-1">
              {item.user_country}
            </Badge>
          </div>

          {item.attributes && Object.keys(item.attributes).length > 0 && (
            <div>
              <Label className="text-muted-foreground">Attributes</Label>
              <div className="mt-1 space-y-1">
                {item.attributes.color && (
                  <p className="text-sm">
                    <span className="font-medium">Color:</span> {item.attributes.color}
                  </p>
                )}
                {item.attributes.size && (
                  <p className="text-sm">
                    <span className="font-medium">Size:</span> {item.attributes.size}
                  </p>
                )}
                {item.attributes.region && (
                  <p className="text-sm">
                    <span className="font-medium">Region:</span> {item.attributes.region}
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <Label className="text-muted-foreground">SKU Key</Label>
            <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
              {item.sku_key}
            </p>
          </div>

          <div>
            <Label className="text-muted-foreground">Last Checked</Label>
            <p data-testid="details-last-checked" className="text-sm">
              {item.last_checked
                ? new Date(item.last_checked).toLocaleString()
                : 'Never'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-muted-foreground">Tracking Rule</Label>
              {!editingRule && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditRule}
                  disabled={item.tracking_rule.type !== 'below_absolute'}
                >
                  Edit Target
                </Button>
              )}
            </div>
            {editingRule ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    data-testid="input-target-inline"
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="Target price"
                  />
                  <Button
                    data-testid="btn-save-target"
                    onClick={handleSaveRule}
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingRule(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm">
                {item.tracking_rule.type === 'below_absolute'
                  ? `Below ${getCurrency()}${item.tracking_rule.value}`
                  : `${item.tracking_rule.value}% below average`}
              </p>
            )}
          </div>

          <div>
            <Label className="text-muted-foreground">Price History</Label>
            <div data-testid="details-history" className="mt-2">
              {!item.history || item.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history yet</p>
              ) : (
                <div className="space-y-1">
                  {item.history.slice(-5).reverse().map((point, idx) => (
                    <div key={idx} className="text-sm flex justify-between">
                      <span>{new Date(point.ts).toLocaleDateString()}</span>
                      <span className="font-medium">
                        {getCurrency()}
                        {point.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
