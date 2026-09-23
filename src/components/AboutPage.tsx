import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Users, ShieldCheck, Target, Award, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 bg-[var(--color-brand-blue)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6">Our Story</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Cultivating health and harmony through nature's most powerful grains since 2018.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white dark:bg-[#0f172a] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
               initial={{ opacity: 0, x: -30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-8">Nourishing Generations</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                At 3ripple Hallelujah Ventures, we believe that breakfast isn't just a meal—it's the foundation of a purposeful day. Our journey began in a small kitchen with a simple goal: to make artisanal, healthy cereal mixes accessible to everyone.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Today, we partner with sustainable farms across the region to source the finest non-GMO grains, ensuring that every spoonful you take is packed with the nutrients your body deserves.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                  <Target className="text-[var(--color-brand-blue)] mb-3" size={24} />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Our Mission</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">To revolutionize breakfast by providing nutrient-dense, plant-based fuel.</p>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                  <Award className="text-[var(--color-brand-blue)] mb-3" size={24} />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Our Vision</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">A world where healthy eating is the default choice for every household.</p>
                </div>
              </div>
            </motion.div>
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="relative"
            >
               <img 
                src="/assets/gluten%20free.png" 
                alt="3ripple gluten-free cereal jar" 
                onError={(e) => { (e.target as HTMLImageElement).src = "/assets/rice%20combo.png"; }}
                className="rounded-[40px] shadow-2xl"
               />
               <div className="absolute -bottom-6 -right-6 bg-[var(--color-brand-mint)] p-8 rounded-3xl shadow-xl max-w-[200px]">
                 <p className="text-slate-800 font-bold text-lg">Made with care</p>
                 <p className="text-xs text-slate-700">Cereal blends created for nourishing everyday breakfasts.</p>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-16">The 3ripple Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Heart className="text-red-500" />, title: "Community First", desc: "We invest back into the communities that grow our grains." },
              { icon: <Users />, title: "Inclusion", desc: "Nutritional health should be accessible to all dietary needs." },
              { icon: <ShieldCheck className="text-green-500" />, title: "Transparency", desc: "You know exactly what goes into your mix. No hidden secrets." }
            ].map((v, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white dark:bg-slate-800 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[var(--color-brand-blue)]">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">{v.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
