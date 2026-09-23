import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Clock, CheckCircle2, ChevronRight, Calendar, Hash, CreditCard } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';

interface OrderHistoryProps {
  userId: string;
  onClose: () => void;
}

export default function OrderHistory({ userId, onClose }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED: return 'text-green-600 bg-green-50 dark:bg-green-900/10 dark:text-green-400';
      case OrderStatus.PENDING: return 'text-amber-600 bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400';
      case OrderStatus.PROCESSING: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/10 dark:text-blue-400';
      case OrderStatus.CANCELLED: return 'text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col h-full transition-colors duration-300">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#0f172a] sticky top-0 z-10 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Your Order History</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Track your cereal mix purchases</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X size={20} className="text-slate-400 dark:text-slate-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-100 dark:border-slate-800 border-t-[var(--color-brand-blue)] rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Catalog...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-white dark:bg-[#1e293b] rounded-[24px] shadow-sm flex items-center justify-center mb-4 transition-colors">
              <Package className="text-slate-200 dark:text-slate-700" size={32} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">No orders yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[200px]">Once you complete a purchase, your order history will appear here.</p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id}
              className="bg-white dark:bg-[#1e293b] p-6 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-[var(--color-brand-blue)]/20 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 group-hover:text-[var(--color-brand-blue)] group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Order ID</span>
                       <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Calendar size={12} className="text-slate-300 dark:text-slate-600" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-slate-50 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.quantity}x</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.productName}</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-brand-blue)]">Price on enquiry</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <CreditCard size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest font-display">WhatsApp Pay</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Total Amount</span>
                  <span className="text-sm font-semibold text-[var(--color-brand-blue)]">Confirmed via WhatsApp</span>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                View Receipt <ChevronRight size={14} />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
