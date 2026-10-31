import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { getProductSizes } from '../data/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  onQuickView: (product: Product) => void;
  key?: string | number;
}

export default function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const sizes = getProductSizes(product.grainType);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-premium group flex h-full min-w-0 flex-col"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
        <img 
          src={product.image} 
          alt={product.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/assets/logo.png';
          }}
          loading="lazy"
          className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
        />
        {product.isPopular && (
          <div className="absolute top-3 left-3">
            <span className="badge-mint shadow-sm">Best Seller</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
           <button 
             onClick={() => onQuickView(product)}
             className="w-full bg-white/90 backdrop-blur-sm text-slate-900 py-2 rounded-lg text-sm font-semibold shadow-xl border border-white/20 hover:bg-white transition-colors"
           >
             Quick View
           </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-brand-blue)]">
          {product.grainType.includes('Cassava') ? 'Cassava essentials' : 'Tombrown collection'}
        </p>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
          {product.description}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Available sizes</span>
          <div className="flex flex-wrap items-center gap-2" aria-label={`Available in ${sizes.join(', ')}`}>
            {sizes.map(size => (
              <span key={size} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">{size}</span>
            ))}
          </div>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddToCart(product.id)}
          aria-label={`Enquire about ${product.name}`}
          className="w-full min-h-11 bg-[var(--color-brand-blue)] text-white rounded-xl flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
        >
          Enquire for price <MessageCircle size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}
