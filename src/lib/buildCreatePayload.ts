import { InputType, Country, NormalisedAttributes, TrackingRule } from '@/types/item';
import { normalizeAttributes, buildSkuKey } from './normalize';

export interface CreatePayloadInput {
  mode: InputType;
  title: string;
  country: Country;
  url?: string;
  links?: string[];
  attrs?: Partial<NormalisedAttributes>;
  rule: TrackingRule;
}

export function createPayload(input: CreatePayloadInput) {
  const { mode, title, country, url, links, attrs, rule } = input;

  const normalizedAttrs = attrs ? normalizeAttributes(attrs) : undefined;
  const sku_key = buildSkuKey(title, normalizedAttrs, country);

  const basePayload = {
    title,
    user_country: country,
    links: links || [],
    attributes: normalizedAttrs,
    tracking_rule: rule,
    sku_key,
  };

  if (mode === 'url') {
    return {
      ...basePayload,
      input_type: 'url' as const,
      url: url || '',
    };
  }

  if (mode === 'name+attrs') {
    return {
      ...basePayload,
      input_type: 'name+attrs' as const,
      attributes: normalizedAttrs || {},
    };
  }

  // mode === 'name'
  return {
    ...basePayload,
    input_type: 'name' as const,
  };
}
