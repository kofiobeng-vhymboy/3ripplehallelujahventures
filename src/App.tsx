import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import QuickViewModal from './components/QuickViewModal';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import { Product, GrainType, OrderItem, UserProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Leaf, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import { db, auth } from './lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

import { onAuthStateChanged } from 'firebase/auth';
import TypingEffect from './components/TypingEffect';

export default function App() {
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [firestoreProducts, setFirestoreProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'contact'>('home');
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#home');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [firestoreStatus, setFirestoreStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash || '#home');
      if (hash === '#about') setCurrentView('about');
      else if (hash === '#contact') setCurrentView('contact');
      else setCurrentView('home');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Build user profile from auth and firestore
        const userData: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          firstName: user.displayName?.split(' ')[0] || 'User',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          photoURL: user.photoURL || '',
          isAdmin: user.email === 'kofiobeng2006@gmail.com',
          savedAddresses: []
        };
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Fetch initial products from Express API
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setLocalProducts(data);
      })
      .catch(err => console.error("Failed to fetch local products:", err));

    // Real-time Firestore products
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsFromDb = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setFirestoreProducts(productsFromDb);
      setFirestoreStatus('online');
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      if (err.message.includes('unavailable') || err.message.includes('offline')) {
        setFirestoreStatus('offline');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Combine local and remote products
    const combined = [...localProducts];
    
    // Avoid duplicates if IDs overlap (unlikely in this setup but good practice)
    firestoreProducts.forEach(fp => {
      if (!combined.find(p => p.id === fp.id)) {
        combined.push(fp);
      }
    });
    
    setAllProducts(combined);
  }, [localProducts, firestoreProducts]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.grainType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price
      }];
    });

    setShowToast(product.name);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!currentUser) return;

    const isWishlisted = currentUser.wishlist?.includes(productId);
    const userDocRef = doc(db, 'users', currentUser.uid);

    try {
      await updateDoc(userDocRef, {
        wishlist: isWishlisted ? arrayRemove(productId) : arrayUnion(productId)
      });
      
      setShowToast(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
      setTimeout(() => setShowToast(null), 2000);
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      setShowToast("Failed to update wishlist");
      setTimeout(() => setShowToast(null), 2000);
    }
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, data);
      setShowToast("Profile updated successfully");
      setTimeout(() => setShowToast(null), 2000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setShowToast("Failed to update profile");
      setTimeout(() => setShowToast(null), 2000);
      throw err;
    }
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[var(--color-brand-white)] dark:bg-[#0f172a] selection:bg-[var(--color-brand-mint)] selection:text-[var(--color-brand-blue)] transition-colors duration-300">
      <Navbar 
        onSearch={setSearchQuery} 
        cartCount={totalCartItems} 
        onOpenCart={() => setIsCartOpen(true)} 
        user={currentUser}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        activeHash={currentHash}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {firestoreStatus === 'offline' && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 py-2 px-4 text-center text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
          <Zap size={14} />
          Connecting to secure grain catalog offline. Updates may be delayed.
        </div>
      )}

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        user={null}
      />

      <AdminPanel 
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onProductAdded={() => {
          // Products refresh automatically via onSnapshot
          setShowToast("New product catalog updated!");
        }}
        allProducts={allProducts}
      />

      <QuickViewModal 
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={false}
        isLoggedIn={false}
      />

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <CheckCircle2 className="text-[var(--color-brand-mint)]" size={20} />
            <span className="font-medium">{showToast} added to cart</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="dark:bg-[var(--color-dark-bg)] transition-colors duration-300">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <section id="home" className="relative pt-20 pb-32 overflow-hidden bg-white dark:bg-[var(--color-dark-bg)] bg-cover bg-center" style={{ backgroundImage: `${isDarkMode ? "linear-gradient(90deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.9) 48%, rgba(15,23,42,0.35) 100%)" : "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.9) 45%, rgba(255,255,255,0.35) 100%)"}, url('/assets/background.jpg')` }}>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 dark:bg-blue-900/10 -z-10 rounded-l-[120px]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-[var(--color-brand-mint)]/30 rounded-full">
                        <Leaf className="text-[var(--color-brand-blue)]" size={16} />
                        <span className="text-xs font-bold text-[var(--color-brand-blue)] uppercase tracking-wider">Naturally Sourced Ingredients</span>
                      </div>
                      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] text-slate-800 dark:text-slate-100 mb-8 min-h-[3.3em] sm:min-h-[2.2em] md:min-h-[1.1em]">
                        <TypingEffect 
                          segments={[
                            { text: "Experience the Joy of " },
                            { text: "Healthy", className: "text-[var(--color-brand-mint)] bg-slate-800 px-2 rounded-lg" },
                            { text: " Eating" }
                          ]} 
                          speed={50} 
                        />
                      </h1>
                      <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-lg min-h-[3em]">
                        <TypingEffect 
                          segments={[{ text: "Discover our premium, naturally sourced cereal mixes. From artisanal Gluten-Free blends to energizing Rice Combos, we bring wellness to your table." }]} 
                          delay={2500} 
                          speed={20} 
                        />
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <a href="#mixes" className="btn-primary px-8">
                          Shop Cereal Mixes <ArrowRight size={20} />
                        </a>
                        <a href="#about" className="btn-outline px-8">
                          Our Story
                        </a>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      className="relative"
                    >
                      <img 
                        src="/assets/rice combo.png" 
                        alt="3ripple rice combo cereal"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/gluten%20free.png";
                          target.onerror = null;
                        }}
                        className="rounded-[40px] shadow-2xl shadow-blue-200 w-full aspect-[4/3] object-cover"
                      />
                      <div className="absolute -bottom-8 -left-8 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 max-w-[240px]">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-[var(--color-brand-mint)] rounded-lg" />
                          <span className="font-bold text-slate-800 dark:text-slate-100">Made for your breakfast</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Thoughtfully blended cereal mixes for everyday nourishment.</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </section>

              {/* Products Section */}
              <section id="mixes" className="py-24 bg-slate-50 dark:bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl mb-4 text-slate-800 dark:text-slate-100">Our Cereal Mixes</h2>
                    {searchQuery && (
                      <p className="text-[var(--color-brand-blue)] font-medium mb-2">
                        Showing results for: "{searchQuery}"
                      </p>
                    )}
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                      Explore our handcrafted blends designed for peak nutrition and incredible taste.
                    </p>
                    <div className="w-24 h-1 bg-[var(--color-brand-blue)] mx-auto mt-6 rounded-full" />
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {!loading ? (
                      filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                          <ProductCard 
                            key={p.id} 
                            product={p} 
                            onAddToCart={handleAddToCart} 
                            onQuickView={handleQuickView}
                          />
                        ))
                      ) : (
                        <div className="col-span-full py-20 text-center">
                          <p className="text-slate-400 dark:text-slate-500 text-lg">No products found matching your search.</p>
                        </div>
                      )
                    ) : (
                      [1,2,3].map(i => (
                        <div key={i} className="card-premium h-96 animate-pulse bg-slate-100" />
                      ))
                    )}
                  </div>

                  {/* Utility Grid */}
                </div>
              </section>

              {/* Values Section (Summary) */}
              <section className="py-32 bg-[var(--color-brand-blue)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                  <h2 className="text-white text-5xl mb-6">Why Trust 3ripple Hallelujah?</h2>
                  <p className="text-blue-100 mb-16 max-w-xl mx-auto">We stand by three fundamental pillars that ensure every bag of cereal we produce meets the highest standards.</p>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { icon: <ShieldCheck size={32} />, title: "Certified Gluten-Free", desc: "Strict production environments ensure zero cross-contamination." },
                      { icon: <Leaf size={32} />, title: "100% Natural Sourcing", desc: "No preservatives, artificial sweeteners, or artificial fillers." },
                      { icon: <Zap size={32} />, title: "Fresh Batch Delivery", desc: "Small batch production ensures your cereal arrives at peak freshness." }
                    ].map((v, i) => (
                      <div key={i} className="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-white hover:bg-white/20 transition-all">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          {v.icon}
                        </div>
                        <h3 className="text-xl mb-3">{v.title}</h3>
                        <p className="text-sm text-blue-100 leading-relaxed">{v.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-16">
                    <a href="#about" className="btn-primary bg-white !text-[var(--color-brand-blue)] hover:bg-blue-50">Learn More About Us</a>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="dark:bg-[#0f172a]"
            >
              <AboutPage />
            </motion.div>
          )}

          {currentView === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="dark:bg-[#0f172a]"
            >
              <ContactPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Enhanced Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <img 
                  src="/assets/logo.png" 
                  alt="3ripple Logo" 
                  className="w-10 h-10 object-contain rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/logo.png";
                  }}
                />
                <span className="font-display font-bold text-lg tracking-tight text-slate-800 dark:text-slate-100">
                  3ripple <span className="text-[var(--color-brand-blue)]">Hallelujah</span>
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-8">
                Providing premium, naturally sourced cereal mixes that bring wellness and joy to your breakfast table. Small batches, big nutrition.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-[var(--color-brand-blue)] hover:border-[var(--color-brand-blue)]/20 transition-all cursor-pointer">
                    <Zap size={18} />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-6 uppercase text-xs tracking-widest">Navigation</h4>
              <ul className="space-y-4">
                <li><a href="#home" className="text-slate-500 dark:text-slate-400 hover:text-[var(--color-brand-blue)] transition-colors text-sm">Home</a></li>
                <li><a href="#mixes" className="text-slate-500 dark:text-slate-400 hover:text-[var(--color-brand-blue)] transition-colors text-sm">Products</a></li>
                <li><a href="#about" className="text-slate-500 dark:text-slate-400 hover:text-[var(--color-brand-blue)] transition-colors text-sm">About Us</a></li>
                <li><a href="#contact" className="text-slate-500 dark:text-slate-400 hover:text-[var(--color-brand-blue)] transition-colors text-sm">Contact Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-6 uppercase text-xs tracking-widest">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-[var(--color-brand-blue)] transition-colors text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-[var(--color-brand-blue)] transition-colors text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-[var(--color-brand-blue)] transition-colors text-sm">Shipping Info</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-[var(--color-brand-blue)] transition-colors text-sm">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
            <p className="text-slate-400 dark:text-slate-600 text-xs">
              © 2026 3ripple Hallelujah Ventures. All rights reserved. Made with health in mind.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
