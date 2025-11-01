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

export type PricePoint = {
  ts: string;
  price: number;
};

export type ItemDTO = {
  id: string;
  title: string;
  url?: string;
  image?: string;
  domain: string;
  input_type: InputType;
  user_country: Country;
  attributes?: NormalisedAttributes;
  links: string[];
  initial_price?: number;
  current_price?: number;
  target_price?: number;
  lowest_price_today?: number;
  lowest_price_url?: string;
  lowest_price_store?: string;
  tracking_rule: TrackingRule;
  status: 'TRACKING' | 'ALERTED' | 'ERROR';
  last_checked?: string;
  history?: PricePoint[];
  sku_key: string;
};
