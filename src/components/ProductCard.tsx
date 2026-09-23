import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  onQuickView: (product: Product) => void;
  key?: string | number;
}

export default function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-premium group"
    >
      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800">
        <img 
          src={product.image} 
          alt={product.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallback = product.grainType.toLowerCase().includes('rice')
              ? '/assets/rice%20combo.png'
              : product.grainType.toLowerCase().includes('maize')
                ? '/assets/maize%20combo.png'
                : '/assets/gluten%20free.png';
            target.src = fallback;
            target.onerror = null;
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.isPopular && (
          <div className="absolute top-3 left-3">
            <span className="badge-mint shadow-sm">Best Seller</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
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
          {product.grainType}
        </p>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
          {product.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
          {product.description}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="inline-flex shrink-0 items-center px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
          {product.weight}
        </span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddToCart(product.id)}
          className="min-w-0 flex-1 min-h-10 bg-[var(--color-brand-blue)] text-white rounded-xl flex items-center justify-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-bold hover:bg-blue-600 shadow-lg shadow-blue-100 dark:shadow-none transition-colors"
        >
          Enquire for price <MessageCircle size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}
