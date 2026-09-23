import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Leaf, ShieldCheck, Zap, Info, Heart } from 'lucide-react';
import { Product } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
  isLoggedIn: boolean;
}

export default function QuickViewModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  isLoggedIn
}: QuickViewModalProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-45%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-45%' }}
            className="fixed left-1/2 top-1/2 w-[95%] max-w-4xl bg-white dark:bg-[#0f172a] rounded-[32px] md:rounded-[40px] shadow-2xl z-[201] overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-300"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full text-slate-900 dark:text-slate-100 shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-all z-30"
            >
              <X size={24} />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="w-full md:w-1/2 relative bg-slate-50 dark:bg-slate-900">
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = product.grainType.toLowerCase().includes('rice')
                      ? '/assets/rice%20combo.png'
                      : product.grainType.toLowerCase().includes('maize')
                        ? '/assets/maize%20combo.png'
                        : '/assets/gluten%20free.png';
                    target.onerror = null;
                  }}
                  className="w-full h-full object-cover aspect-square md:aspect-auto md:h-[600px]"
                />
                {product.isPopular && (
                  <div className="absolute top-6 left-6">
                    <span className="badge-mint !py-2 !px-4 shadow-lg scale-110">Best Seller</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative dark:bg-[#0f172a] transition-colors">

                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest font-bold text-[var(--color-brand-blue)] mb-2">
                    {product.grainType}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white leading-tight mb-4">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-lg font-bold text-[var(--color-brand-blue)]">Price available on enquiry</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {product.weight}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>

                {product.ingredients && product.ingredients.length > 0 && (
                  <div className="mb-10">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Info size={14} className="text-[var(--color-brand-blue)]" />
                      Active Ingredients
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.ingredients.map((ing, i) => (
                        <span key={i} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs font-bold text-[var(--color-brand-blue)] border border-blue-100/50 dark:border-blue-800/30">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-10">
                  <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800">
                    <Leaf className="mx-auto mb-2 text-green-500" size={20} />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Natural</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800">
                    <ShieldCheck className="mx-auto mb-2 text-blue-500" size={20} />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Premium</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800">
                    <Zap className="mx-auto mb-2 text-amber-500" size={20} />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Energy</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto">
                  <button 
                    onClick={() => {
                      onAddToCart(product.id);
                      onClose();
                    }}
                    className="flex-1 btn-primary flex items-center justify-center gap-3 py-4 md:py-5 shadow-lg shadow-blue-100 dark:shadow-none"
                  >
                    <ShoppingBag size={20} />
                    <span className="font-bold tracking-wide">ADD TO MY CART</span>
                  </button>

                  {isLoggedIn && (
                    <button 
                      onClick={() => onToggleWishlist(product.id)}
                      className={`p-4 md:p-5 rounded-2xl border transition-all flex items-center justify-center ${
                        isWishlisted 
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-500 shadow-sm shadow-red-50' 
                          : 'bg-slate-50 dark:bg-[#1e293b] border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-50 dark:hover:bg-red-900/10'
                      }`}
                      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={isWishlisted ? "fill-current" : ""} size={24} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
