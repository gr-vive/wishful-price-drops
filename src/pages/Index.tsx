import { useState } from 'react';
import { useItems } from '@/state/useItems';
import { ItemDTO } from '@/types/item';
import { normalizeAttributes, buildSkuKey } from '@/lib/normalize';
import { Toolbar } from '@/components/Toolbar';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/EmptyState';
import { AddItemDialog, FormData } from '@/components/AddItemDialog';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const Index = () => {
  const {
    items,
    demoMode,
    setDemoMode,
    addItem,
    updateItem,
    setItems,
  } = useItems();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAddItem = (data: FormData) => {
    const normalizedAttrs = data.attributes
      ? normalizeAttributes(data.attributes)
      : undefined;

    const skuKey = buildSkuKey(data.title, normalizedAttrs, data.userCountry);

    const newItem: ItemDTO = {
      id: nanoid(),
      title: data.title,
      url: data.url,
      domain: data.url ? new URL(data.url).hostname : 'manual',
      inputType: data.inputType,
      userCountry: data.userCountry,
      attributes: normalizedAttrs,
      links: data.links,
      trackingRule: data.trackingRule,
      status: 'TRACKING',
      currentPrice: undefined,
      targetPrice:
        data.trackingRule.type === 'below_absolute'
          ? data.trackingRule.value
          : undefined,
      skuKey,
      lastChecked: new Date().toISOString(),
      history: [],
    };

    addItem(newItem);
    setDialogOpen(false);
    toast.success('Item added successfully', {
      description: `Now tracking: ${data.title}`,
    });
  };

  const handleAddDemo = () => {
    const demoItems: ItemDTO[] = [
      {
        id: nanoid(),
        title: 'A Light in the Attic',
        url: 'https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html',
        domain: 'books.toscrape.com',
        inputType: 'url',
        userCountry: 'GB',
        links: [],
        trackingRule: { type: 'below_absolute', currency: 'GBP', value: 52.0 },
        status: 'TRACKING',
        currentPrice: 51.77,
        targetPrice: 52.0,
        skuKey: buildSkuKey('A Light in the Attic', undefined, 'GB'),
        lastChecked: new Date().toISOString(),
        history: [],
      },
      {
        id: nanoid(),
        title: 'iPhone 15 Pro 256GB',
        domain: 'manual',
        inputType: 'name+attrs',
        userCountry: 'GB',
        attributes: { size: '256GB', color: 'black', region: 'UK' },
        links: [],
        trackingRule: { type: 'percentage_below_avg', value: 10 },
        status: 'TRACKING',
        currentPrice: 999.0,
        skuKey: buildSkuKey(
          'iPhone 15 Pro 256GB',
          { size: '256GB', color: 'black', region: 'UK' },
          'GB'
        ),
        lastChecked: new Date().toISOString(),
        history: [],
      },
      {
        id: nanoid(),
        title: 'Sony WH-1000XM5',
        url: 'https://www.amazon.co.uk/dp/B0BZD1L1H7',
        domain: 'amazon.co.uk',
        inputType: 'url',
        userCountry: 'GB',
        links: [],
        trackingRule: { type: 'below_absolute', currency: 'GBP', value: 300.0 },
        status: 'TRACKING',
        currentPrice: 329.0,
        targetPrice: 300.0,
        skuKey: buildSkuKey('Sony WH-1000XM5', undefined, 'GB'),
        lastChecked: new Date().toISOString(),
        history: [],
      },
    ];

    setItems(demoItems);
    toast.success('Demo items added', {
      description: 'Try refreshing prices or simulating a price drop',
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info('Refreshing prices...', {
      description: 'This may take a few moments',
    });

    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Prices updated', {
        description: `Checked ${items.length} items`,
      });
    }, 2000);
  };

  const handleSimulateDrop = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newPrice =
      item.trackingRule.type === 'below_absolute'
        ? item.trackingRule.value * 0.95
        : item.currentPrice
        ? item.currentPrice * 0.85
        : 50;

    updateItem(id, {
      currentPrice: newPrice,
      status: 'ALERTED',
      lastChecked: new Date().toISOString(),
    });

    toast.success('Price drop simulated!', {
      description: `${item.title} is now below your target`,
    });
  };

  const handleViewDetails = (id: string) => {
    toast.info('Item details', {
      description: 'Details drawer coming soon',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Unbiased</h1>
              <p className="text-muted-foreground mt-1">
                Track prices and get notified when they drop
              </p>
            </div>
            {demoMode && (
              <div className="rounded-lg bg-warning/10 border border-warning/20 px-4 py-2 text-sm text-warning-foreground">
                🧪 Demo Mode is on — prices and alerts may be simulated
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Toolbar
          onAddItem={() => setDialogOpen(true)}
          onRefresh={handleRefresh}
          onAddDemo={handleAddDemo}
          demoMode={demoMode}
          onDemoModeChange={setDemoMode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          isRefreshing={isRefreshing}
        />

        <div className="mt-8">
          {items.length === 0 ? (
            <EmptyState
              onAddItem={() => setDialogOpen(true)}
              onAddDemo={handleAddDemo}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  demoMode={demoMode}
                  onSimulateDrop={handleSimulateDrop}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddItem}
      />
    </div>
  );
};

export default Index;
