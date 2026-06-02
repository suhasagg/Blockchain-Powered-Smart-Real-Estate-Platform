import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { useWallet } from '../../hooks/useWallet';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const wallet = useWallet();
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Admin', href: '/admin' },
    { name: 'Roadmap', href: '/roadmap' },
  ];
  const linkClass = ({ isActive }) => `px-3 py-2 text-sm font-semibold rounded-full transition ${isActive ? 'bg-primary-50 text-primary-700' : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'}`;
  return (
    <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-white/70 shadow-sm">
      <div className="container">
        <div className="flex justify-between h-18 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-600 to-blue-400 grid place-items-center shadow-lg shadow-blue-200"><span className="h-4 w-4 rounded-full border-4 border-white" /></span>
            <span className="text-2xl font-black tracking-tight text-secondary-950">RealFraction</span>
          </Link>
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => <NavLink key={item.name} to={item.href} className={linkClass}>{item.name}</NavLink>)}
            <button onClick={wallet.connect} className="btn ml-2"><FaWallet className="mr-2" />{wallet.shortAddress || 'Connect Wallet'}</button>
          </div>
          <button className="lg:hidden text-secondary-700" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <FiX size={26}/> : <FiMenu size={26}/>}</button>
        </div>
        {isOpen && <div className="lg:hidden pb-4 space-y-2">{navigation.map((item) => <NavLink key={item.name} to={item.href} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-secondary-700 hover:bg-primary-50">{item.name}</NavLink>)}<button onClick={() => { wallet.connect(); setIsOpen(false); }} className="btn w-full justify-center">{wallet.shortAddress || 'Connect Wallet'}</button></div>}
      </div>
    </nav>
  );
}
export default Navbar;
