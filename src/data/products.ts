import { GrainType, Product } from '../types';

const productImages: Partial<Record<GrainType, string>> = {
  [GrainType.GLUTEN_FREE]: '/assets/oats-tombrown.jpg',
  [GrainType.RICE_COMBO]: '/assets/rice-tombrown.jpg',
  [GrainType.MAIZE_COMBO]: '/assets/maize-tombrown.jpg',
  [GrainType.GARI]: '/assets/gari.jpg',
  [GrainType.KONKONTE]: '/assets/konkonte.jpg',
};

/**
 * Public catalogue fallback used when the preview is deployed without the
 * Express API. Firebase products still merge in when the catalogue is online.
 */
export const fallbackProducts: Product[] = [
  {
    id: 'p1',
    name: 'Oats Tombrown (gluten free)',
    description: 'A delicious blend of grains, nuts, and seeds for nourishing everyday breakfasts.',
    price: 15,
    weight: '1kg & 2kg',
    stock: 120,
    grainType: GrainType.GLUTEN_FREE,
    image: productImages[GrainType.GLUTEN_FREE]!,
    isPopular: true,
  },
  {
    id: 'p2',
    name: 'Rice Tombrown',
    description: 'A satisfying, energy-packed blend made for a wholesome start to the day.',
    price: 12.5,
    weight: '1kg & 2kg',
    stock: 85,
    grainType: GrainType.RICE_COMBO,
    image: productImages[GrainType.RICE_COMBO]!,
    isPopular: true,
  },
  {
    id: 'p3',
    name: 'Maize Tombrown',
    description: 'A golden cereal blend with a comforting taste and nourishing ingredients.',
    price: 11.5,
    weight: '1kg & 2kg',
    stock: 60,
    grainType: GrainType.MAIZE_COMBO,
    image: productImages[GrainType.MAIZE_COMBO]!,
    isPopular: false,
  },
];

// Product photographs are shared by the local and hosted catalogues.
export const cassavaProducts: Product[] = [
  { id: 'p4', name: GrainType.GARI, description: 'Cassava flakes for your everyday meals.', price: 0, weight: '1kg & 2kg', stock: 0, grainType: GrainType.GARI, image: productImages[GrainType.GARI]! },
  { id: 'p5', name: GrainType.KONKONTE, description: 'Dried cassava flour for preparing konkonte.', price: 0, weight: '1kg & 2kg', stock: 0, grainType: GrainType.KONKONTE, image: productImages[GrainType.KONKONTE]! },
];

fallbackProducts.push(...cassavaProducts);

/** Keep older Firestore records consistent without changing remote data. */
export function normalizeProduct(product: Product): Product {
  const aliases: Record<string, GrainType> = {
    'gluten-free cereal mix': GrainType.GLUTEN_FREE,
    'rice combo cereal mix': GrainType.RICE_COMBO,
    'maize combo cereal mix': GrainType.MAIZE_COMBO,
  };
  const name = aliases[product.name.toLowerCase()] ?? product.name;
  const grainType = aliases[product.grainType.toLowerCase()] ?? product.grainType;
  // Apply the current catalogue presentation to older Firebase records too.
  return { ...product, name, grainType, weight: '1kg & 2kg', image: productImages[grainType] ?? product.image ?? '/assets/logo.png' };
}
