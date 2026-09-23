import { GrainType, Product } from '../types';

/**
 * Public catalogue fallback used when the preview is deployed without the
 * Express API. Firebase products still merge in when the catalogue is online.
 */
export const fallbackProducts: Product[] = [
  {
    id: 'p1',
    name: 'Gluten-Free Cereal Mix',
    description: 'A delicious blend of grains, nuts, and seeds for nourishing everyday breakfasts.',
    price: 15,
    weight: '600g jar',
    stock: 120,
    grainType: GrainType.GLUTEN_FREE,
    image: '/assets/gluten%20free.png',
    isPopular: true,
  },
  {
    id: 'p2',
    name: 'Rice Combo Cereal Mix',
    description: 'A satisfying, energy-packed blend made for a wholesome start to the day.',
    price: 12.5,
    weight: '600g jar',
    stock: 85,
    grainType: GrainType.RICE_COMBO,
    image: '/assets/rice%20combo.png',
    isPopular: true,
  },
  {
    id: 'p3',
    name: 'Maize Combo Cereal Mix',
    description: 'A golden cereal blend with a comforting taste and nourishing ingredients.',
    price: 11.5,
    weight: '600g jar',
    stock: 60,
    grainType: GrainType.MAIZE_COMBO,
    image: '/assets/maize%20combo.png',
    isPopular: false,
  },
];
