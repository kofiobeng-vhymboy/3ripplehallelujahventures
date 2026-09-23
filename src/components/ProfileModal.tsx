import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, MapPin, Package, Settings, LogOut, ChevronRight, Phone, Mail, Heart, ShoppingBag, Check, Pencil } from 'lucide-react';
import { UserProfile, Product } from '../types';
import OrderHistory from './OrderHistory';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  allProducts: Product[];
  onAddToCart: (id: string) => void;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  allProducts, 
  onAddToCart, 
  onUpdateProfile,
  onLogout, 
  onOpenAdmin 
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'wishlist'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || ''
  });

  // Keep form in sync with user prop if it changes and we're not editing
  useEffect(() => {
    if (!isEditing) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || ''
      });
    }
  }, [user, isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || ''
    });
    setIsEditing(false);
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
            className="fixed left-1/2 top-1/2 w-full max-w-4xl bg-white dark:bg-[#0f172a] rounded-[32px] shadow-2xl z-[201] overflow-hidden transition-colors duration-300"
          >
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Sidebar */}
              <div className="w-full md:w-72 bg-slate-50 dark:bg-[#1e293b] p-8 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-20 h-20 bg-[var(--color-brand-mint)] dark:bg-[var(--color-brand-mint)]/20 rounded-3xl flex items-center justify-center text-[var(--color-brand-blue)] mb-4 shadow-lg shadow-mint-100 dark:shadow-none">
                    <User size={40} />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-center">{user.firstName} {user.lastName}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium text-center mt-1">{user.email}</p>
                </div>

                <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide flex-1">
                  {[
                    { id: 'info', icon: <User size={18} />, label: 'Info' },
                    { id: 'orders', icon: <Package size={18} />, label: 'Orders' },
                    { id: 'wishlist', icon: <Heart size={18} />, label: 'Wishlist' },
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`flex-shrink-0 flex items-center justify-center md:justify-between p-3.5 px-5 md:px-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-white dark:bg-[#0f172a] text-[var(--color-brand-blue)] shadow-md shadow-blue-50 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">{item.label}</span>
                      </div>
                      <ChevronRight size={14} className={`hidden md:block ${activeTab === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                    </button>
                  ))}
                </nav>

                <div className="mt-8 space-y-4">
                  {user.isAdmin && (
                    <button 
                      onClick={() => {
                        onClose();
                        onOpenAdmin();
                      }}
                      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:bg-slate-800 transition-colors"
                    >
                      <Settings size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">Admin Portal</span>
                    </button>
                  )}
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                  >
                    <LogOut size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex flex-col dark:bg-[#0f172a] transition-colors">
                {activeTab === 'info' ? (
                  <div className="flex-1 p-10 overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Account Details</h2>
                      <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors hidden md:block">
                        <X size={20} className="text-slate-400 dark:text-slate-500" />
                      </button>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">First Name</label>
                          <div className={`flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border ${isEditing ? 'border-[var(--color-brand-blue)] ring-2 ring-[var(--color-brand-blue)]/10' : 'border-slate-100 dark:border-slate-800'}`}>
                            <User className="text-slate-400 dark:text-slate-500" size={20} />
                            {isEditing ? (
                              <input 
                                type="text"
                                min={activeTab === 'info' ? 0 : undefined} 
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="bg-transparent border-none outline-none font-medium text-slate-800 dark:text-slate-100 w-full"
                                placeholder="First Name"
                              />
                            ) : (
                              <span className="font-medium text-slate-800 dark:text-slate-100">{user.firstName}</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Last Name</label>
                          <div className={`flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border ${isEditing ? 'border-[var(--color-brand-blue)] ring-2 ring-[var(--color-brand-blue)]/10' : 'border-slate-100 dark:border-slate-800'}`}>
                            <User className="text-slate-400 dark:text-slate-500" size={20} />
                            {isEditing ? (
                              <input 
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="bg-transparent border-none outline-none font-medium text-slate-800 dark:text-slate-100 w-full"
                                placeholder="Last Name"
                              />
                            ) : (
                              <span className="font-medium text-slate-800 dark:text-slate-100">{user.lastName}</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Number</label>
                          <div className={`flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border ${isEditing ? 'border-[var(--color-brand-blue)] ring-2 ring-[var(--color-brand-blue)]/10' : 'border-slate-100 dark:border-slate-800'}`}>
                            <Phone className="text-slate-400 dark:text-slate-500" size={20} />
                            {isEditing ? (
                              <input 
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-transparent border-none outline-none font-medium text-slate-800 dark:text-slate-100 w-full"
                                placeholder="Phone Number"
                              />
                            ) : (
                              <span className="font-medium text-slate-800 dark:text-slate-100">{user.phone || 'Not provided'}</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email Address</label>
                          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 opacity-60">
                            <Mail className="text-slate-400 dark:text-slate-500" size={20} />
                            <span className="font-medium text-slate-800 dark:text-slate-100">{user.email}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1 italic">Email cannot be changed</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Saved Addresses</label>
                        {user.savedAddresses.length > 0 ? (
                          user.savedAddresses.map((addr, i) => (
                            <div key={i} className="p-6 border border-slate-100 dark:border-slate-800 rounded-[24px] bg-white dark:bg-[#1e293b] shadow-sm flex items-start gap-4 hover:border-[var(--color-brand-blue)]/20 transition-colors">
                              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-[var(--color-brand-blue)] shrink-0">
                                <MapPin size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{addr.street}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{addr.city}, {addr.state} {addr.zipCode}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium italic">{addr.phone}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-[24px] text-center">
                            <MapPin className="mx-auto text-slate-200 dark:text-slate-800 mb-2" size={32} />
                            <p className="text-xs text-slate-400 dark:text-slate-600">No saved addresses yet</p>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex gap-4">
                          <button 
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="flex-1 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-4 bg-[var(--color-brand-blue)] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-brand-blue)]/90 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isSaving ? (
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                              >
                                <Settings size={18} />
                              </motion.div>
                            ) : (
                              <Check size={18} />
                            )}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                        >
                          <Pencil size={18} />
                          Edit Profile Information
                        </button>
                      )}
                    </div>
                  </div>
                ) : activeTab === 'orders' ? (
                  <OrderHistory userId={user.uid} onClose={onClose} />
                ) : (
                  <div className="flex-1 p-10 overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                       <h2 className="text-2xl font-bold text-slate-800">My Wishlist</h2>
                       <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors hidden md:block">
                         <X size={20} className="text-slate-400" />
                       </button>
                    </div>
                    
                    <div className="space-y-4">
                      {user.wishlist && user.wishlist.length > 0 ? (
                        allProducts
                          .filter(p => user.wishlist?.includes(p.id))
                          .map(product => (
                            <div key={product.id} className="flex items-center gap-3 sm:gap-6 p-3 sm:p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:border-red-100 transition-colors group">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-sm"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">{product.name}</h4>
                                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{product.grainType}</p>
                                <p className="text-xs font-semibold text-[var(--color-brand-blue)] mt-1">Price available on enquiry</p>
                              </div>
                              <button 
                                onClick={() => onAddToCart(product.id)}
                                className="p-2.5 sm:p-3 bg-white text-[var(--color-brand-blue)] rounded-2xl shadow-sm border border-slate-100 hover:bg-[var(--color-brand-blue)] hover:text-white transition-all transform active:scale-95 flex items-center gap-2 group-hover:shadow-md"
                              >
                                <ShoppingBag size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest px-1 hidden sm:inline">Add</span>
                              </button>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-20">
                          <Heart size={48} className="mx-auto text-slate-100 mb-4" />
                          <p className="text-slate-400 font-medium">Your wishlist is empty.</p>
                          <p className="text-xs text-slate-300 mt-1">Products you heart will appear here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
