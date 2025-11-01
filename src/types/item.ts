export type InputType = 'url' | 'name' | 'name+attrs';
export type Country = 'GB' | 'US' | 'EU';

export type NormalisedAttributes = {
  size?: string;     // e.g., "M", "256GB", "EU 42"
  color?: string;    // e.g., "black", "starlight"
  region?: string;   // e.g., "UK", "EU", "US"
};

export type TrackingRule =
  | { type: 'percentage_below_avg'; value: number } // e.g., 10 for -10%
  | { type: 'below_absolute'; currency: 'GBP' | 'USD' | 'EUR'; value: number };

export type ItemDTO = {
  id: string;
  title: string;
  url?: string;
  image?: string;
  domain: string;
  inputType: InputType;
  userCountry: Country;
  attributes?: NormalisedAttributes;
  links: string[];
  currentPrice?: number;
  targetPrice?: number;
  trackingRule: TrackingRule;
  status: 'TRACKING' | 'ALERTED' | 'ERROR';
  lastChecked?: string;
  history?: Array<{ ts: string; price: number }>;
  skuKey?: string;
};
