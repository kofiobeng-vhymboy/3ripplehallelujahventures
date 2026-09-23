import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, MessageSquare } from 'lucide-react';
import { OrderItem, UserProfile, OrderStatus } from '../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  user: UserProfile | null;
}

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, user }: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const WHATSAPP_NUMBER = "233201792171"; 

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Save to Firestore if user is logged in
    if (user) {
      try {
        const orderData = {
          userId: user.uid,
          items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
          })),
          total: subtotal,
          status: OrderStatus.PENDING,
          createdAt: serverTimestamp(),
          customerName: `${user.firstName} ${user.lastName}`,
          customerPhone: user.phone
        };

        await addDoc(collection(db, 'orders'), orderData);
      } catch (err) {
        console.error("Failed to record order history:", err);
        // We don't block the WhatsApp checkout even if history saving fails
      }
    }

    let message = `*New Order from 3ripple Hallelujah Ventures*\n\n`;
    if (user) {
      message += `*Customer:* ${user.firstName} ${user.lastName}\n`;
      message += `*Phone:* ${user.phone}\n\n`;
    }
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.productName} (quantity: ${item.quantity}) — please share the current price and availability.\n`;
    });
    message += `\nPlease share the current prices, delivery options, and payment steps for these products.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-[#0f172a] shadow-2xl z-[101] flex flex-col transition-colors duration-300"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#0f172a] sticky top-0 z-10 transition-colors">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-[var(--color-brand-blue)]" size={24} />
                <h2 className="text-xl font-bold dark:text-slate-100">Your Mix Collection</h2>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400 font-bold">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="text-slate-200 dark:text-slate-700" size={32} />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Your cart is empty</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-[200px]">
                    Looks like you haven't added any grain mixes yet.
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-6 text-[var(--color-brand-blue)] font-bold text-sm hover:underline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden shrink-0">
                      <div className="w-full h-full flex items-center justify-center bg-[var(--color-brand-mint)]/20">
                         <Leaf className="text-[var(--color-brand-blue)]/40" size={24} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{item.productName}</h4>
                      <p className="text-xs font-semibold text-[var(--color-brand-blue)] mt-0.5">Price and availability on enquiry</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#1e293b] rounded-lg p-1 border border-slate-100 dark:border-slate-700">
                          <button 
                            onClick={() => onUpdateQuantity(item.productId, -1)}
                            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all text-slate-600 dark:text-slate-300"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center dark:text-slate-100">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.productId, 1)}
                            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm transition-all text-slate-600 dark:text-slate-300"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(item.productId)}
                          className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 bg-slate-50 dark:bg-[#1e293b] border-t border-slate-100 dark:border-slate-800 transition-colors">
                <div className="mb-6 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 p-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ready to ask about your selection?</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We’ll reply with current pricing, availability, and delivery details.</p>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleCheckout}
                    className="btn-primary w-full !py-4 text-lg shadow-xl shadow-blue-100 dark:shadow-none"
                  >
                    Enquire via WhatsApp <MessageSquare size={20} />
                  </button>
                  <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                    Clicking "Complete" will open a WhatsApp chat to confirm your order details and delivery address.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simple Helper Icons
function Leaf(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a7 7 0 0 1-7 7c0 0-2 1.5-3 3Z" />
      <path d="M14 11.05V17" />
    </svg>
  );
}
