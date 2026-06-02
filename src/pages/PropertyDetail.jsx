import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiFileText, FiShield, FiCheckCircle, FiExternalLink, FiAlertCircle, FiCopy } from 'react-icons/fi';
import { FaWallet, FaCoins, FaRobot } from 'react-icons/fa';
import { properties, transactions } from '../data/platform';
import { ProgressBar } from '../components/ui';
import { useWallet } from '../hooks/useWallet';

const txLabels = {
  idle: 'Ready to invest',
  wrong_network: 'Wrong network — switch requested',
  signature_pending: 'Wallet signature pending',
  submitted_onchain: 'Submitted on-chain',
  pending_confirmation: 'Waiting for confirmation',
  confirmed: 'Investment intent confirmed',
  rejected: 'User rejected signature',
  failed: 'Transaction failed',
};

function PropertyDetail() {
  const { id } = useParams();
  const property = useMemo(() => properties.find(p => p.id === Number(id)) || properties[0], [id]);
  const wallet = useWallet();
  const [qty, setQty] = useState(25);
  const total = qty * property.tokenPrice;
  const isBusy = ['signature_pending', 'submitted_onchain', 'pending_confirmation', 'wrong_network'].includes(wallet.txState);

  const handleInvest = async () => {
    await wallet.signInvestment({ property, quantity: qty, totalUsd: total });
  };

  const copyReceipt = async () => {
    if (!wallet.investmentReceipt) return;
    await navigator.clipboard.writeText(JSON.stringify(wallet.investmentReceipt, null, 2));
  };

  return <div className="bg-page min-h-screen"><section className="container py-10"><div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10"><div><img src={property.image} className="rounded-[2rem] h-[460px] w-full object-cover shadow-2xl"/><div className="mt-8 grid md:grid-cols-3 gap-4"><Metric label="Annual ROI" value={`${property.annualRoi}%`}/><Metric label="Rental Yield" value={`${property.rentalYield}%`}/><Metric label="Monthly Income" value={`$${property.monthlyIncome.toLocaleString()}`}/></div></div><aside className="glass-card p-7 h-fit sticky top-24"><div className="flex justify-between items-start"><div><p className="badge mb-3">{property.chain}</p><h1 className="text-4xl font-black">{property.title}</h1><p className="text-secondary-500 mt-1">{property.location}</p></div></div><div className="mt-6"><ProgressBar value={property.funded}/><p className="text-sm text-secondary-500 mt-2">{property.funded}% funded • {property.availableTokens.toLocaleString()} tokens available</p></div><div className="mt-6 rounded-3xl bg-secondary-950 text-white p-5"><p className="text-white/60 text-sm">Investment simulator</p><div className="flex items-end gap-3 mt-3"><input type="number" value={qty} min="1" max={property.availableTokens} onChange={e=>setQty(Math.max(1, Number(e.target.value)||1))} className="w-full rounded-2xl px-4 py-3 bg-white text-secondary-950 outline-none"/><span className="pb-3 text-sm">tokens</span></div><div className="grid grid-cols-2 gap-3 mt-4 text-sm"><span>Total investment</span><b className="text-right">${total.toLocaleString()}</b><span>Expected yearly return</span><b className="text-right">${Math.round(total*property.annualRoi/100).toLocaleString()}</b><span>Token symbol</span><b className="text-right">{property.tokenSymbol}</b><span>Wallet</span><b className="text-right">{wallet.shortAddress || 'Not connected'}</b><span>Network</span><b className="text-right">{wallet.chain}</b></div></div><button disabled={isBusy} onClick={handleInvest} className="btn w-full justify-center mt-5 disabled:opacity-60 disabled:cursor-not-allowed"><FaWallet className="mr-2"/>{wallet.address ? (isBusy ? txLabels[wallet.txState] : 'Sign Investment Transaction') : 'Connect Wallet & Sign Investment'}</button>{wallet.address && <button onClick={wallet.disconnect} className="btn-secondary w-full justify-center mt-3">Disconnect wallet</button>}<InvestmentStatus wallet={wallet} onCopy={copyReceipt}/><Link to="/property-3d" className="btn-secondary w-full justify-center mt-3">Open polished 3D viewer</Link><p className="text-xs text-secondary-500 mt-4">Working demo: the button connects MetaMask when available. If MetaMask is unavailable or the chain cannot switch, it still creates a demo signed investment receipt so the flow works end-to-end. Add VITE_INVESTMENT_CONTRACT_ADDRESS for a real contract call.</p></aside></div>
      <div className="grid lg:grid-cols-3 gap-8 mt-12"><Panel title="Token model" icon={FaCoins} items={[`Total supply: ${property.totalTokens.toLocaleString()}`,`Available: ${property.availableTokens.toLocaleString()}`,`Contract: ${property.contractAddress}`,'ERC-1155 / security-token-ready architecture']}/><Panel title="Trust documents" icon={FiFileText} items={property.documents.concat(['SHA-256/IPFS hash verification planned'])}/><Panel title="Risk engine" icon={FiShield} items={[`Risk level: ${property.risk}`,`Liquidity score: ${property.liquidityScore}/100`,'Vacancy, insurance, maintenance and tax assumptions displayed']}/></div>
      <div className="mt-12 grid lg:grid-cols-[.9fr_1.1fr] gap-8"><div className="glass-card p-7"><h2 className="text-2xl font-black flex items-center gap-2"><FaRobot className="text-primary-600"/> AI recommendation</h2><p className="text-secondary-600 mt-3">Best fit for investors seeking {property.risk.toLowerCase()} risk, token liquidity, rental yield and transparent document review. The next production phase can connect this card to property embeddings, user risk preference and historical performance.</p></div><div className="glass-card p-7"><h2 className="text-2xl font-black mb-5">Transaction status timeline</h2><div className="space-y-4">{transactions.map(t=><div key={t.state} className="flex gap-4"><FiCheckCircle className="text-primary-600 mt-1"/><div><b>{t.state}</b><p className="text-sm text-secondary-500">{t.description}</p></div></div>)}</div></div></div>
    </section></div>;
}

function InvestmentStatus({ wallet, onCopy }) {
  if (wallet.error) return <Alert>{wallet.error}</Alert>;
  const warn = wallet.warning;
  if (wallet.txState === 'idle' && !wallet.signature) return null;

  return <div className="mt-4 rounded-3xl border border-primary-100 bg-primary-50/80 p-4 text-sm">
    {warn && <p className="mb-3 rounded-2xl bg-yellow-50 border border-yellow-100 p-3 text-yellow-800">{warn}</p>}
    <div className="flex items-start gap-3">
      <FiCheckCircle className={wallet.txState === 'failed' || wallet.txState === 'rejected' ? 'text-red-500 mt-1' : 'text-primary-600 mt-1'} />
      <div className="min-w-0 flex-1">
        <b className="text-secondary-950">{txLabels[wallet.txState] || wallet.txState}</b>
        <p className="text-secondary-600 mt-1">Required network: {wallet.requiredChainName}. Current wallet: {wallet.shortAddress || 'not connected'}.</p>
        {wallet.signature && <p className="text-secondary-500 mt-2 break-all">Signature: {wallet.signature.slice(0, 28)}...{wallet.signature.slice(-18)}</p>}
        {wallet.txHash && <p className="text-secondary-500 mt-2 break-all">Tx hash: {wallet.txHash}</p>}
        {wallet.investmentReceipt && <button onClick={onCopy} className="mt-3 inline-flex items-center gap-2 font-bold text-primary-700"><FiCopy/>Copy signed receipt</button>}
      </div>
    </div>
  </div>;
}

function Alert({ children }) {
  return <div className="mt-4 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 flex gap-3"><FiAlertCircle className="mt-1"/><span>{children}</span></div>;
}

function Metric({label,value}){return <div className="glass-card p-5"><p className="text-sm text-secondary-500">{label}</p><b className="text-3xl text-secondary-950">{value}</b></div>}
function Panel({title,icon:Icon,items}){return <div className="glass-card p-7"><Icon className="text-primary-600 text-3xl mb-4"/><h3 className="text-xl font-black mb-4">{title}</h3><ul className="space-y-2 text-sm text-secondary-600">{items.map(i=><li key={i} className="flex gap-2"><FiExternalLink className="mt-1 text-primary-500"/>{i}</li>)}</ul></div>}
export default PropertyDetail;
