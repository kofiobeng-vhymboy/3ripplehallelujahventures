import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Package, Save, AlertCircle, CheckCircle2, Trash2, Pencil } from 'lucide-react';
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, GrainType } from '../types';
import { formatGhs } from '../lib/currency';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  allProducts: Product[];
}

export default function AdminPanel({ isOpen, onClose, onProductAdded, allProducts }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isRealAuth = !!auth.currentUser;
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    weight: '500g bag',
    stock: 100,
    grainType: GrainType.GLUTEN_FREE,
    image: '',
    isPopular: false,
    ingredients: []
  });

  const [ingredientInput, setIngredientInput] = useState('');

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      weight: product.weight || '500g bag',
      stock: product.stock !== undefined ? product.stock : 100,
      grainType: product.grainType || GrainType.GLUTEN_FREE,
      image: product.image || '',
      isPopular: product.isPopular || false,
      ingredients: [...(product.ingredients || [])]
    });
    setEditingId(product.id);
    setActiveTab('add');
    setError(null);
    setSuccess(false);
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      weight: '500g bag',
      stock: 100,
      grainType: GrainType.GLUTEN_FREE,
      image: '',
      isPopular: false,
      ingredients: []
    });
    setEditingId(null);
    setIngredientInput('');
    setSuccess(false);
    setError(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to remove this product from the catalog?")) return;
    
    setLoading(true);
    try {
      const { deleteDoc, doc: firestoreDoc } = await import('firebase/firestore');
      await deleteDoc(firestoreDoc(db, 'products', productId));
      if (editingId === productId) handleResetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to delete product. It might be a protected local product.");
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), ingredientInput.trim()]
      }));
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!isRealAuth) {
        setError("You must be signed in with a Google account to perform this action.");
        setLoading(false);
        return;
      }
      const productData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        const productRef = doc(db, 'products', editingId);
        // Use setDoc with merge: true to avoid "id not found" errors when syncing local products to cloud
        await setDoc(productRef, productData, { merge: true });
        setSuccess(true);
        setTimeout(() => {
          handleResetForm();
          setActiveTab('manage');
        }, 1500);
      } else {
        const productsRef = collection(db, 'products');
        await addDoc(productsRef, {
          ...productData,
          createdAt: serverTimestamp(),
        });
        setSuccess(true);
        onProductAdded();
        setTimeout(() => {
          handleResetForm();
        }, 1500);
      }
    } catch (err) {
      setError(`Failed to ${editingId ? 'update' : 'add'} product. Check your permissions.`);
      handleFirestoreError(err, OperationType.WRITE, 'products');
    } finally {
      setLoading(false);
    }
  };

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
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
            className="fixed left-1/2 top-1/2 w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-[32px] shadow-2xl z-[201] overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#1e293b]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-brand-blue)] rounded-xl flex items-center justify-center text-white">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Admin Portal</h2>
                  <div className="flex gap-4 mt-2">
                    <button 
                      onClick={() => {
                        setActiveTab('add');
                        if (!editingId) handleResetForm();
                      }}
                      className={`text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'add' ? 'border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400'}`}
                    >
                      {editingId ? 'Edit Product' : 'Add Product'}
                    </button>
                    <button 
                      onClick={() => setActiveTab('manage')}
                      className={`text-[10px] font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${activeTab === 'manage' ? 'border-[var(--color-brand-blue)] text-[var(--color-brand-blue)]' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400'}`}
                    >
                      Manage Catalog ({allProducts.length})
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors shadow-sm">
                <X size={20} className="text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 dark:bg-[#0f172a] transition-colors">
              {!isRealAuth && (
                <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[24px] flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-amber-500 shadow-sm shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-100 mb-1">Incomplete Authentication</h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
                      You are using a temporary session. To save changes to the product catalog, please sign in using the <strong>Google Login</strong> option in the security settings.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'add' ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-pulse">
                      <AlertCircle size={20} />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 text-sm">
                      <CheckCircle2 size={20} />
                      Product {editingId ? 'updated' : 'added'} successfully!
                    </div>
                  )}

                  {editingId && (
                    <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-6">
                      <div className="flex items-center gap-3">
                        <Pencil size={16} className="text-[var(--color-brand-blue)]" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 italic">Editing: {formData.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleResetForm}
                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                      >
                        Cancel Edit
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Product Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium dark:text-slate-100"
                        placeholder="e.g. Premium Millet Mix"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Price (GHS)</label>
                      <input 
                        type="number" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium dark:text-slate-100"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Grain Type</label>
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium dark:text-slate-100"
                        value={formData.grainType}
                        onChange={(e) => setFormData({...formData, grainType: e.target.value as GrainType})}
                      >
                        {Object.values(GrainType).map(type => (
                          <option key={type} value={type} className="dark:bg-[#1e293b]">{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Weight Details</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium dark:text-slate-100"
                        placeholder="e.g. 500g bag"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea 
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium dark:text-slate-100"
                      placeholder="Tell customers what's special about this mix..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Product Image URL (External link or /assets/filename.jpg)</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium dark:text-slate-100"
                      placeholder="/assets/product1.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ingredients</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium dark:text-slate-100"
                        placeholder="Add ingredient..."
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                      />
                      <button 
                        type="button"
                        onClick={addIngredient}
                        className="p-3 bg-[var(--color-brand-blue)] text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.ingredients?.map((ing, i) => (
                        <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                          {ing}
                          <button type="button" onClick={() => removeIngredient(i)} className="text-slate-400 dark:text-slate-500 hover:text-red-500">
                            <Trash2 size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                    <input 
                      type="checkbox" 
                      id="isPopular"
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)]"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                    />
                    <label htmlFor="isPopular" className="text-sm font-bold text-slate-700 dark:text-slate-200">Display as "Popular" on homepage</label>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full btn-primary !py-4 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      <span className="font-bold tracking-wide">{editingId ? 'UPDATE PRODUCT' : 'SAVE PRODUCT TO CATALOG'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {allProducts.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      No products found in catalog.
                    </div>
                  ) : (
                    allProducts.map(product => (
                      <div key={product.id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-[var(--color-brand-blue)]/20 transition-all">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-16 h-16 rounded-xl object-cover shadow-sm bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate">{product.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{product.grainType}</span>
                            <span>•</span>
                            <span className="text-[var(--color-brand-blue)]">{formatGhs(product.price)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-3 bg-white text-[var(--color-brand-blue)] rounded-xl shadow-sm border border-slate-100 hover:bg-blue-50 transition-all"
                            title="Edit Product"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={loading}
                            className="p-3 bg-white text-red-500 rounded-xl shadow-sm border border-slate-100 hover:bg-red-50 transition-all disabled:opacity-50"
                            title="Delete Product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
