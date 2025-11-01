import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Country, InputType, TrackingRule } from '@/types/item';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
}

export interface FormData {
  title: string;
  url?: string;
  input_type: InputType;
  user_country: Country;
  links: string[];
  attributes?: {
    size?: string;
    color?: string;
    region?: string;
  };
  tracking_rule: TrackingRule;
}

export function AddItemDialog({ open, onOpenChange, onSubmit }: AddItemDialogProps) {
  const [activeTab, setActiveTab] = useState<InputType>('url');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [country, setCountry] = useState<Country>('GB');
  const [links, setLinks] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [region, setRegion] = useState('');
  const [ruleType, setRuleType] = useState<'percentage' | 'absolute'>('percentage');
  const [percentValue, setPercentValue] = useState('10');
  const [absoluteValue, setAbsoluteValue] = useState('');

  const getCurrency = (country: Country): 'GBP' | 'USD' | 'EUR' => {
    switch (country) {
      case 'GB':
        return 'GBP';
      case 'US':
        return 'USD';
      case 'EU':
        return 'EUR';
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (activeTab === 'url' && !url.trim()) return;
    if (!country) return;

    const linksList = links
      .split(/[\n,]/)
      .map((l) => l.trim())
      .filter(Boolean);

    const trackingRule: TrackingRule =
      ruleType === 'percentage'
        ? { type: 'percentage_below_avg', value: Number(percentValue) || 10 }
        : {
            type: 'below_absolute',
            currency: getCurrency(country),
            value: Number(absoluteValue) || 0,
          };

    const attrs =
      activeTab === 'name+attrs'
        ? {
            size: size.trim() || undefined,
            color: color.trim() || undefined,
            region: region.trim() || undefined,
          }
        : undefined;

    onSubmit({
      title,
      url: activeTab === 'url' ? url : undefined,
      input_type: activeTab,
      user_country: country,
      links: linksList,
      attributes: attrs,
      tracking_rule: trackingRule,
    });

    // Reset form
    setTitle('');
    setUrl('');
    setLinks('');
    setSize('');
    setColor('');
    setRegion('');
    setPercentValue('10');
    setAbsoluteValue('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-add-item" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Item to Track</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as InputType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger data-testid="tab-url" value="url">
              URL
            </TabsTrigger>
            <TabsTrigger data-testid="tab-name-attrs" value="name+attrs">
              Name + Attributes
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            {/* Common fields */}
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                data-testid="input-title"
                placeholder="e.g., iPhone 15 Pro 256GB"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
            </div>

            <TabsContent value="url" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="url">Product URL *</Label>
                <Input
                  id="url"
                  data-testid="input-url"
                  type="url"
                  placeholder="https://example.com/product"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="name+attrs" className="space-y-4 mt-0">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Add size, color, and region to avoid mixing SKUs
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      data-testid="attrs-size"
                      placeholder="e.g., M, 256GB"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      data-testid="attrs-color"
                      placeholder="e.g., Black"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      data-testid="attrs-region"
                      placeholder="e.g., UK"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={country} onValueChange={(v) => setCountry(v as Country)}>
                <SelectTrigger id="country" data-testid="select-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GB">United Kingdom (GB)</SelectItem>
                  <SelectItem value="US">United States (US)</SelectItem>
                  <SelectItem value="EU">European Union (EU)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Prices are tracked per country. Choose where you shop.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="links">Additional Links (optional)</Label>
              <Textarea
                id="links"
                data-testid="input-links"
                placeholder="Add alternative product links (one per line)"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Tracking Rule *</Label>
              <RadioGroup value={ruleType} onValueChange={(v) => setRuleType(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    data-testid="rule-percent"
                    value="percentage"
                    id="rule-percent"
                  />
                  <Label htmlFor="rule-percent" className="font-normal cursor-pointer flex-1">
                    Alert me when price is{' '}
                    <Input
                      type="number"
                      className="inline-block w-20 mx-1"
                      value={percentValue}
                      onChange={(e) => setPercentValue(e.target.value)}
                      min="1"
                      max="90"
                      disabled={ruleType !== 'percentage'}
                    />
                    % below average
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    data-testid="rule-absolute"
                    value="absolute"
                    id="rule-absolute"
                  />
                  <Label htmlFor="rule-absolute" className="font-normal cursor-pointer flex-1">
                    Alert me when price is below{' '}
                    <span className="mx-1">{getCurrency(country) === 'GBP' ? '£' : getCurrency(country) === 'USD' ? '$' : '€'}</span>
                    <Input
                      data-testid="input-absolute-value"
                      type="number"
                      className="inline-block w-24 mx-1"
                      value={absoluteValue}
                      onChange={(e) => setAbsoluteValue(e.target.value)}
                      min="0"
                      step="0.01"
                      disabled={ruleType !== 'absolute'}
                      placeholder="0.00"
                    />
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-testid={`btn-submit-${activeTab}`}
            onClick={handleSubmit}
            disabled={!title || (activeTab === 'url' && !url) || !country}
          >
            Add Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
