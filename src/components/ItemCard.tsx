import { ExternalLink, TrendingDown, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { ItemDTO } from '@/types/item';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ItemCardProps {
  item: ItemDTO;
  onSimulateDrop?: (id: string) => void;
  onViewDetails: (id: string) => void;
  demoMode: boolean;
}

export function ItemCard({ item, onSimulateDrop, onViewDetails, demoMode }: ItemCardProps) {
  // Guard against malformed items
  if (!item.tracking_rule) {
    console.error('Item missing tracking_rule:', item);
    return null;
  }

  const getCurrencySymbol = (currency?: 'GBP' | 'USD' | 'EUR') => {
    switch (currency) {
      case 'GBP':
        return '£';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return '£';
    }
  };

  const getStatusBadge = () => {
    switch (item.status) {
      case 'ALERTED':
        return (
          <Badge data-testid="badge-alerted" variant="default" className="bg-warning text-warning-foreground">
            <AlertCircle className="mr-1 h-3 w-3" />
            Alert!
          </Badge>
        );
      case 'ERROR':
        return (
          <Badge variant="destructive">
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            Tracking
          </Badge>
        );
    }
  };

  const currency = item.tracking_rule.type === 'below_absolute' 
    ? item.tracking_rule.currency 
    : 'GBP';
  const symbol = getCurrencySymbol(currency);

  return (
    <Card
      data-testid={`item-card-${item.id}`}
      className="group overflow-hidden transition-all hover:shadow-md cursor-pointer"
      onClick={() => onViewDetails(item.id)}
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="flex-shrink-0">
          <div className="h-24 w-24 overflow-hidden rounded-md bg-muted">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ExternalLink className="h-8 w-8" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                data-testid="item-title"
                className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors"
              >
                {item.title}
              </h3>
              <p data-testid="item-domain" className="text-sm text-muted-foreground mt-1">
                {item.domain}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Initial Price</p>
                <p className="text-sm font-medium">
                  {item.initial_price !== undefined
                    ? `${symbol}${item.initial_price.toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Target Price</p>
                <p
                  data-testid="item-target-price"
                  className="text-sm font-semibold text-primary"
                >
                  {item.tracking_rule.type === 'below_absolute'
                    ? `${symbol}${item.tracking_rule.value.toFixed(2)}`
                    : `${item.tracking_rule.value}% below avg`}
                </p>
              </div>

              {item.last_checked && (
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground">Last checked</p>
                  <p className="text-xs">
                    {new Date(item.last_checked).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-1">Lowest Price Today</p>
              <div className="flex items-center justify-between gap-2">
                <p
                  data-testid="item-lowest-price"
                  className="text-lg font-bold text-success"
                >
                  {item.lowest_price_today !== undefined
                    ? `${symbol}${item.lowest_price_today.toFixed(2)}`
                    : 'N/A'}
                </p>
                {item.lowest_price_url && item.lowest_price_store && (
                  <a
                    href={item.lowest_price_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.lowest_price_store}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {demoMode && onSimulateDrop && item.status !== 'ALERTED' && (
            <Button
              data-testid="btn-simulate-drop"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                onSimulateDrop(item.id);
              }}
            >
              <Zap className="mr-2 h-3 w-3" />
              Simulate Drop
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
