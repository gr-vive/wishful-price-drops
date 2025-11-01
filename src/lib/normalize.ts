import { NormalisedAttributes, Country } from '@/types/item';

// Normalize attributes according to spec
export function normalizeAttributes(input: Partial<NormalisedAttributes>): NormalisedAttributes {
  const result: NormalisedAttributes = {};

  // Color normalization
  if (input.color) {
    let color = input.color.trim().toLowerCase().replace(/\s+/g, ' ');
    // Map synonyms
    if (color === 'colour') color = 'color';
    if (color === 'grey') color = 'gray';
    result.color = color || undefined;
  }

  // Size normalization
  if (input.size) {
    let size = input.size.trim().toUpperCase().replace(/\s+/g, '');
    // Storage sizes: 256 GB, 256gb, 256 -> 256GB
    if (/^\d+\s*GB$/i.test(size)) {
      size = size.replace(/\s/g, '').toUpperCase();
    }
    // Apparel sizes: normalize to S|M|L|XL|XXL
    const apparelSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    if (apparelSizes.includes(size)) {
      size = size;
    }
    result.size = size || undefined;
  }

  // Region normalization
  if (input.region) {
    let region = input.region.trim();
    if (['UK', 'United Kingdom', 'GB'].includes(region)) {
      region = 'UK';
    } else if (['EU', 'Europe'].includes(region)) {
      region = 'EU';
    } else if (['US', 'USA', 'United States'].includes(region)) {
      region = 'US';
    }
    result.region = region || undefined;
  }

  return result;
}

// Slug title for SKU key
export function slugTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Build SKU key from title, attributes, and country
export function buildSkuKey(
  title: string,
  attrs?: NormalisedAttributes,
  country?: Country
): string {
  const slug = slugTitle(title);

  const attrParts: string[] = [];
  if (attrs) {
    if (attrs.color) attrParts.push(`color:${attrs.color.toLowerCase()}`);
    if (attrs.size) attrParts.push(`size:${attrs.size.toLowerCase()}`);
    if (attrs.region) attrParts.push(`region:${attrs.region.toLowerCase()}`);
  }

  const parts = [slug];
  if (attrParts.length > 0) {
    parts.push(attrParts.join('|'));
  }
  if (country) {
    parts.push(country);
  }

  return parts.join('|');
}
