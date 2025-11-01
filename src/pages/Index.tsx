import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useItems } from "@/state/useItems";
import { ItemDTO, TrackingRule } from "@/types/item";
import { Toolbar } from "@/components/Toolbar";
import { ItemCard } from "@/components/ItemCard";
import { EmptyState } from "@/components/EmptyState";
import { AddItemDialog, FormData } from "@/components/AddItemDialog";
import { ItemDetailsDrawer } from "@/components/ItemDetailsDrawer";
import { DebugPanel } from "@/components/DebugPanel";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Hero } from "@/components/Hero";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
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

  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Bootstrap on mount
  useEffect(() => {
    if (user) {
      bootstrap();
    }
  }, [user]);

  const handleAddItem = async (data: FormData) => {
    // Check if user is authenticated
    if (!user) {
      navigate("/auth");
      toast.info("Please sign in to add items");
      return;
    }

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

  const handleGetStarted = () => {
    mainContentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const selectedItem = selectedItemId ? items.find((i) => i.id === selectedItemId) || null : null;

  const handleAddItemClick = () => {
    if (!user) {
      navigate("/auth");
      toast.info("Please sign in to add items");
      return;
    }
    setDialogOpen(true);
  };

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <AuroraBackground className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground className="min-h-screen overflow-auto">
      <div data-testid="app-shell" className="w-full relative z-10">
        {/* Hero Section */}
        <Hero onGetStarted={handleGetStarted} />

        {/* Main Content */}
        <div ref={mainContentRef} className="min-h-screen bg-background/95 backdrop-blur-sm">
          {/* Demo Mode Banner */}
          {demoMode && (
            <div
              data-testid="demo-banner"
              className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-center text-sm text-warning-foreground"
            >
              🧪 Demo Mode is on — prices and alerts may be simulated
            </div>
          )}

          <main className="container mx-auto px-4 py-8">
          <Toolbar
            onAddItem={handleAddItemClick}
            onRefresh={handleRefresh}
            onAddDemo={handleAddDemo}
            demoMode={demoMode}
            onDemoModeChange={setDemoMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            isRefreshing={isRefreshing}
            onSignOut={user ? handleSignOut : undefined}
            userEmail={user?.email}
          />

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6">{user ? 'My Wishlist' : 'Get Started'}</h2>
            {items.length === 0 ? (
              <EmptyState onAddItem={handleAddItemClick} onAddDemo={handleAddDemo} />
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

          {/* Debug Panel */}
          {demoMode && <DebugPanel lastFetchAt={lastFetchAt} itemCount={items.length} />}
        </main>
        </div>

        {/* Modals and Drawers */}
        <AddItemDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleAddItem} />

        <ItemDetailsDrawer
          item={selectedItem}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onSaveTarget={handleSaveTarget}
        />
      </div>
    </AuroraBackground>
  );
};

export default Index;
