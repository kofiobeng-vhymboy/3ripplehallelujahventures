import React from 'react';
import { Search } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (id: string) => void;
  onQuickView: (product: Product) => void;
}

export function ProductGrid({ products, loading, onAddToCart, onQuickView }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {products.length > 0 ? products.map(product => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onQuickView={onQuickView} />
      )) : loading ? [1, 2, 3].map(index => (
        <div key={index} className="card-premium h-96 animate-pulse bg-slate-100 dark:bg-slate-800" aria-label="Loading products" />
      )) : (
        <p className="col-span-full py-12 text-center text-slate-600 dark:text-slate-300">No products match your search. Try another name or ingredient.</p>
      )}
    </div>
  );
}

interface ProductsPageProps extends ProductGridProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export default function ProductsPage({ searchQuery, onSearch, ...gridProps }: ProductsPageProps) {
  return (
    <section className="bg-slate-50 pb-16 pt-8 dark:bg-slate-900/30 sm:pb-24 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-blue)]">The 3Ripple collection</p>
          <h1 className="mb-3 text-4xl text-slate-800 dark:text-slate-100 sm:text-5xl">Our Products</h1>
          <p className="max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">Explore our Tombrown blends in 600g, 800g and 1.2kg, and our cassava essentials in 1kg and 2kg. Add your favourites to an enquiry and ask us about current prices on WhatsApp.</p>
        </header>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="product-search" type="search" value={searchQuery} onChange={event => onSearch(event.target.value)} placeholder="Search products or ingredients" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>
          <p role="status" className="text-sm text-slate-500 dark:text-slate-400">{gridProps.products.length} {gridProps.products.length === 1 ? 'product' : 'products'}{searchQuery ? ' found' : ' to explore'}</p>
        </div>
        <ProductGrid {...gridProps} />
      </div>
    </section>
  );
}
