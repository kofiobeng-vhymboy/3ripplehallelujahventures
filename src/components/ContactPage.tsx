import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);
    try {
      const recipient = '3ripplehallelujahventures@gmail.com';
      const subject = `Website enquiry from ${formState.name}`;
      const body = `Name: ${formState.name}\nEmail: ${formState.email}\n\n${formState.message}`;
      window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setIsSent(true);
      setFormState({ name: '', email: '', message: '' });
      setTimeout(() => setIsSent(false), 5000);
    } catch (err) {
      console.error("Failed to open email composer:", err);
      setError("Could not open your email app. Please email us directly.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6"
          >
            Get in Touch
          </motion.h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Have questions about our mixes or need help with an order? Our team is here to help you start your morning right.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white dark:bg-[#0f172a] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[var(--color-brand-blue)] shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Email Us</p>
                    <p className="text-xl font-medium text-slate-800 dark:text-slate-200">3ripplehallelujahventures@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Call Us</p>
                    <p className="text-xl font-medium text-slate-800 dark:text-slate-200">020 179 2171</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Visit Us</p>
                    <p className="text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                      Amrahia-Newtown, off Adenta–Dodowa Road
                      <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">GPS Address: GD-227-5164</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={20} className="text-[var(--color-brand-blue)]" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Support Hours</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">8:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">9:00 AM - 2:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">Closed</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#1e293b] p-10 rounded-[40px] shadow-2xl shadow-slate-100 dark:shadow-none border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="text-[var(--color-brand-blue)]" size={24} />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Send a Message</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Your Name</label>
                  <input 
                    required
                    disabled={isSending}
                    type="text" 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors disabled:opacity-50 dark:text-slate-100"
                    placeholder="John Doe"
                    value={formState.name}
                    onChange={e => setFormState({ ...formState, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Email Address</label>
                  <input 
                    required
                    disabled={isSending}
                    type="email" 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors disabled:opacity-50 dark:text-slate-100"
                    placeholder="john@example.com"
                    value={formState.email}
                    onChange={e => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Message</label>
                  <textarea 
                    required
                    disabled={isSending}
                    rows={4}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors resize-none disabled:opacity-50 dark:text-slate-100"
                    placeholder="How can we help you?"
                    value={formState.message}
                    onChange={e => setFormState({ ...formState, message: e.target.value })}
                  />
                </div>
                <button 
                  type="submit"
                  className={`w-full btn-primary !py-5 flex items-center justify-center gap-3 transition-all ${isSent ? 'bg-green-600 border-green-600' : ''}`}
                  disabled={isSending || isSent}
                >
                  {isSending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sending...
                    </>
                  ) : isSent ? (
                    'Message Sent!'
                  ) : (
                    <>
                      Send via Email
                      <Send size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
