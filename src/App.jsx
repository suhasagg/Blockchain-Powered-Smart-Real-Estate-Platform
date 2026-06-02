import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Property3D from './pages/Property3D';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Admin from './pages/Admin';
import Roadmap from './pages/Roadmap';
import NotFound from './pages/NotFound';

function AnimatedRoutes(){const location=useLocation();return <AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.25}}><Routes location={location}><Route path="/" element={<Home/>}/><Route path="/properties" element={<Properties/>}/><Route path="/properties/:id" element={<PropertyDetail/>}/><Route path="/property-3d" element={<Property3D/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/marketplace" element={<Marketplace/>}/><Route path="/admin" element={<Admin/>}/><Route path="/roadmap" element={<Roadmap/>}/><Route path="/about" element={<About/>}/><Route path="/privacy" element={<Privacy/>}/><Route path="/faq" element={<FAQ/>}/><Route path="/blog" element={<Blog/>}/><Route path="/blog/:slug" element={<BlogPost/>}/><Route path="*" element={<NotFound/>}/></Routes></motion.div></AnimatePresence>}
function App(){return <Router><div className="min-h-screen flex flex-col"><Navbar/><main className="flex-grow"><AnimatedRoutes/></main><Footer/></div></Router>}
export default App;
