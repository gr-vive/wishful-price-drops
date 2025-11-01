import { useState, useEffect } from "react";
import { useItems } from "@/state/useItems";
import { ItemDTO, TrackingRule } from "@/types/item";
import { Toolbar } from "@/components/Toolbar";
import { ItemCard } from "@/components/ItemCard";
import { EmptyState } from "@/components/EmptyState";
import { AddItemDialog, FormData } from "@/components/AddItemDialog";
import { ItemDetailsDrawer } from "@/components/ItemDetailsDrawer";
import { DebugPanel } from "@/components/DebugPanel";
import { toast } from "sonner";

const Index = () => {
  const {
    items,
    demoMode,
    lastFetchAt,
    bootstrap,
    addBy,
    setDemoMode,
    seedDemo,
    refreshPrices,
    simulateDrop,
    editTrackingRule,
  } = useItems();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Bootstrap on mount
  useEffect(() => {
    bootstrap();
  }, []);

  const handleAddItem = async (data: FormData) => {
    try {
      await addBy({
        mode: data.input_type,
        title: data.title,
        country: data.user_country,
        url: data.url,
        links: data.links,
        attrs: data.attributes,
        rule: data.tracking_rule,
      });

      setDialogOpen(false);
      toast.success("Item added successfully", {
        description: `Now tracking: ${data.title}`,
      });
    } catch (error) {
      toast.error("Failed to add item", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleAddDemo = () => {
    seedDemo();
    toast.success("Demo items added", {
      description: "Try refreshing prices or simulating a price drop",
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info("Refreshing prices...", {
      description: "This may take a few moments",
    });

    try {
      await refreshPrices();
      setIsRefreshing(false);
      toast.success("Prices updated", {
        description: `Checked ${items.length} items`,
      });
    } catch (error) {
      setIsRefreshing(false);
      toast.error("Failed to refresh prices", {
        description: "Consider enabling Demo Mode",
      });
    }
  };

  const handleSimulateDrop = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      await simulateDrop(id);
      toast.success("Price drop simulated!", {
        description: `${item.title} is now below your target`,
      });
    } catch (error) {
      toast.error("Failed to simulate drop");
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedItemId(id);
    setDrawerOpen(true);
  };

  const handleSaveTarget = async (id: string, rule: TrackingRule) => {
    try {
      await editTrackingRule(id, rule);
      toast.success("Target price updated");
    } catch (error) {
      toast.error("Failed to update target");
    }
  };

  const selectedItem = selectedItemId ? items.find((i) => i.id === selectedItemId) || null : null;

  return (
    <div data-testid="app-shell" className="min-h-screen bg-background">
      {/* Demo Mode Banner */}
      {demoMode && (
        <div
          data-testid="demo-banner"
          className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-center text-sm text-warning-foreground"
        >
          🧪 Demo Mode is on — prices and alerts may be simulated
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Inbiased</h1>
              <p className="text-muted-foreground mt-1">Track prices and get notified when they drop</p>
            </div>
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
          <h2 className="text-2xl font-semibold mb-6">My Wishlist</h2>
          {items.length === 0 ? (
            <EmptyState onAddItem={() => setDialogOpen(true)} onAddDemo={handleAddDemo} />
          ) : (
            <div data-testid="wishlist" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Debug Panel */}
      {demoMode && <DebugPanel lastFetchAt={lastFetchAt} itemCount={items.length} />}

      {/* Modals and Drawers */}
      <AddItemDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleAddItem} />

      <ItemDetailsDrawer
        item={selectedItem}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSaveTarget={handleSaveTarget}
      />
    </div>
  );
};

export default Index;
