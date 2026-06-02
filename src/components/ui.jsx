import { motion } from 'framer-motion';

export function SectionHeader({ eyebrow, title, description, light = false }) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-12">
      {eyebrow && <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary-500 mb-3">{eyebrow}</p>}
      <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-secondary-950'}`}>{title}</h2>
      {description && <p className={`mt-4 text-lg ${light ? 'text-white/70' : 'text-secondary-600'}`}>{description}</p>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, accent = '' }) {
  return (
    <motion.div initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="glass-card p-6">
      {Icon && <Icon className={`w-7 h-7 mb-4 ${accent || 'text-primary-600'}`} />}
      <div className="text-3xl font-extrabold text-secondary-950">{value}</div>
      <div className="text-sm text-secondary-500 mt-1">{label}</div>
    </motion.div>
  );
}

export function ProgressBar({ value }) {
  return <div className="h-3 rounded-full bg-secondary-100 overflow-hidden"><motion.div initial={{width:0}} whileInView={{width:`${value}%`}} viewport={{once:true}} transition={{duration:.9}} className="h-full rounded-full bg-gradient-to-r from-primary-500 to-blue-400" /></div>;
}
