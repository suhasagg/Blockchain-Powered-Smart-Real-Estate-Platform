import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import { Experience } from '../components/property/Experience';
import { Overlay } from '../components/property/Overlay';
function Property3D(){const [loading,setLoading]=useState(true);useEffect(()=>{const t=setTimeout(()=>setLoading(false),1200);return()=>clearTimeout(t)},[]);return <div className="fixed z-50 inset-0 bg-secondary-950">{loading&&<div className="absolute z-50 inset-0 grid place-items-center bg-secondary-950 text-white"><div className="glass-dark p-8 text-center max-w-md"><div className="mx-auto h-14 w-14 rounded-3xl bg-gradient-to-br from-primary-500 to-blue-300 animate-pulse mb-5"/><h1 className="text-3xl font-black">EstateFi 3D Viewer</h1><p className="text-white/60 mt-2">Loading property assets, investment metrics and immersive controls...</p><div className="h-2 bg-white/10 rounded-full mt-6 overflow-hidden"><div className="h-full w-2/3 bg-primary-400 rounded-full animate-pulse"/></div></div></div>}<Leva hidden/><Overlay/><Canvas shadows camera={{position:[0,0,5],fov:30}}><color attach="background" args={["#232323"]}/><Experience/></Canvas></div>}
export default Property3D;
