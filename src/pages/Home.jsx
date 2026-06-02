import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiFileText, FiActivity, FiCpu } from 'react-icons/fi';
import { FaWallet, FaCoins, FaHome, FaRobot, FaKey, FaGavel } from 'react-icons/fa';
import { properties, platformFeatures, roadmap } from '../data/platform';
import { ProgressBar, SectionHeader, StatCard } from '../components/ui';

function Home() {
  const steps = [
    [FaWallet, 'Connect wallet', 'MetaMask, WalletConnect, Coinbase Wallet, network validation, SIWE-ready login.'],
    [FiShield, 'Complete trust checks', 'KYC/AML, jurisdiction gating, risk disclosure, and document verification.'],
    [FaCoins, 'Buy fractional tokens', 'Select quantity, review investment summary, sign transaction, track confirmation.'],
    [FaHome, 'Earn and manage', 'Dashboard shows owned tokens, rental payouts, documents, and resale options.']
  ];
  return <div className="overflow-hidden">
    <section className="hero-shell text-white">
      <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1800&q=80" className="h-full w-full object-cover"/><div className="absolute inset-0 bg-secondary-950/75"/></div>
      <div className="container relative py-24 md:py-32 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
        <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.7}}>
          <p className="inline-flex px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-bold backdrop-blur">Smart real estate ownership infrastructure</p>
          <h1 className="mt-6 text-5xl md:text-7xl font-black tracking-tight leading-tight">Tokenize, invest, rent, auction, and manage property in one premium Web3 platform.</h1>
          <p className="mt-6 text-xl text-white/75 max-w-2xl">EstateFi combines automated documents, NFT property control, fractional ownership, rental payouts, secondary trading, staking, smart-home access, and compliance-ready workflows.</p>
          <div className="mt-8 flex flex-wrap gap-4"><Link to="/properties" className="btn text-base px-6 py-3">Explore Properties <FiArrowRight className="ml-2"/></Link><Link to="/dashboard" className="btn-secondary text-base px-6 py-3">Investor Dashboard</Link></div>
        </motion.div>
        <motion.div initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} className="glass-dark p-6 md:p-8">
          <div className="grid grid-cols-2 gap-4"><StatCard label="Token entry" value="$10" icon={FaCoins}/><StatCard label="Target return" value="7%+" icon={FiActivity}/><StatCard label="Documents" value="Hashed" icon={FiFileText}/><StatCard label="Smart access" value="NFT Key" icon={FaKey}/></div>
          <div className="mt-6 p-5 rounded-3xl bg-white/10 border border-white/10"><div className="flex justify-between text-sm"><span>Featured funding progress</span><span>89%</span></div><div className="mt-3"><ProgressBar value={89}/></div><p className="text-sm text-white/65 mt-3">Animated funding bars and transaction-state UI added for a more polished product journey.</p></div>
        </motion.div>
      </div>
    </section>

    <section className="container py-20"><SectionHeader eyebrow="How it works" title="A complete investment journey" description="The layout now explains the exact wallet → KYC → investment → portfolio lifecycle."/><div className="grid md:grid-cols-4 gap-6">{steps.map(([Icon,title,desc],i)=><motion.div key={title} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} transition={{delay:i*.08}} viewport={{once:true}} className="glass-card p-6"><Icon className="text-primary-600 text-3xl mb-5"/><h3 className="font-bold text-xl mb-2">{title}</h3><p className="text-secondary-600 text-sm">{desc}</p></motion.div>)}</div></section>

    <section className="bg-white py-20"><div className="container"><SectionHeader eyebrow="Marketplace" title="Featured investment opportunities" description="Cards include ROI, token supply, available tokens, funding progress, risk and smart-home status."/><div className="grid lg:grid-cols-3 gap-8">{properties.map(p=><Link to={`/properties/${p.id}`} key={p.id} className="property-card group"><img src={p.image} className="h-56 w-full object-cover group-hover:scale-105 transition duration-700"/><div className="p-6"><div className="flex justify-between items-start gap-4"><div><h3 className="text-xl font-black">{p.title}</h3><p className="text-secondary-500 text-sm">{p.location}</p></div><span className="badge">{p.chain}</span></div><div className="grid grid-cols-3 gap-3 my-5 text-center"><div><b>{p.annualRoi}%</b><span>ROI</span></div><div><b>${p.tokenPrice}</b><span>Token</span></div><div><b>{p.risk}</b><span>Risk</span></div></div><ProgressBar value={p.funded}/><p className="mt-3 text-sm text-secondary-500">{p.funded}% funded • {p.availableTokens.toLocaleString()} tokens left</p></div></Link>)}</div></div></section>

    <section className="container py-20"><SectionHeader eyebrow="Feature merge" title="All document features converted into website sections" description="Automated docs, NFT smart-home access, rental distribution, secondary market, compliance, indexing, AI recommendations, admin controls, observability and multichain support are now represented."/><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{platformFeatures.map((f,i)=><motion.div key={f} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.03}} className="feature-pill"><FiCpu className="text-primary-600"/>{f}</motion.div>)}</div></section>

    <section className="bg-secondary-950 text-white py-20"><div className="container"><SectionHeader light eyebrow="Roadmap" title="Production-ready advancement plan" description="A concise technical roadmap was added directly into the product experience."/><div className="grid md:grid-cols-7 gap-4">{roadmap.map(([n,t])=><div key={n} className="rounded-3xl bg-white/10 border border-white/10 p-5"><div className="text-3xl font-black text-primary-300">{n}</div><p className="text-sm text-white/75 mt-3">{t}</p></div>)}</div></div></section>
  </div>;
}
export default Home;
