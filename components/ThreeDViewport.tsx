
import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Box, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CameraParams } from '../types';

interface ThreeDViewportProps {
  params: CameraParams;
  onChange: (params: CameraParams) => void;
  imageUrl?: string;
}

const CameraVisualizer: React.FC<{ params: CameraParams }> = ({ params }) => {
  const cameraRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (cameraRef.current) {
      const phi = (90 - params.elevation) * (Math.PI / 180);
      const theta = (params.azimuth + 90) * (Math.PI / 180);
      const radius = params.distance * 5;
      
      cameraRef.current.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, [params]);

  return (
    <group ref={cameraRef}>
      <Box args={[0.8, 0.5, 0.6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>
      <Cylinder args={[0.2, 0.2, 0.4]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.4]}>
        <meshStandardMaterial color="#1e293b" />
      </Cylinder>
      <mesh position={[0, 0, -0.8]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
};

const SubjectVisualizer: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  return (
    <group>
      {imageUrl ? (
        <mesh rotation={[0, 0, 0]}>
          <planeGeometry args={[3, 3]} />
          <meshBasicMaterial side={THREE.DoubleSide} map={new THREE.TextureLoader().load(imageUrl)} />
        </mesh>
      ) : (
        <mesh>
          <Box args={[2, 2, 0.1]}>
            <meshStandardMaterial color="#475569" />
          </Box>
          <Text position={[0, 0, 0.06]} fontSize={0.2} color="white">
            Upload Image
          </Text>
        </mesh>
      )}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[5, 0.05, 16, 100]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
         <torusGeometry args={[5, 0.05, 16, 100, Math.PI]} />
         <meshBasicMaterial color="#ec4899" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const ThreeDViewport: React.FC<ThreeDViewportProps> = ({ params, onChange, imageUrl }) => {
  const step = (key: keyof CameraParams, amount: number) => {
    let newVal = params[key] + amount;
    if (key === 'azimuth') {
        if (newVal >= 360) newVal = 0;
        if (newVal < 0) newVal = 315;
    } else if (key === 'elevation') {
        newVal = Math.max(-30, Math.min(60, newVal));
    } else if (key === 'distance') {
        newVal = Math.max(0.6, Math.min(1.4, newVal));
    }
    onChange({ ...params, [key]: newVal });
  };

  return (
    <div className="w-full h-[450px] bg-slate-900 rounded-xl relative overflow-hidden border border-slate-700 shadow-inner">
      <Canvas>
        <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Grid infiniteGrid fadeDistance={30} cellColor="#334155" sectionColor="#475569" />
        
        <Suspense fallback={null}>
          <SubjectVisualizer imageUrl={imageUrl} />
          <CameraVisualizer params={params} />
        </Suspense>

        <OrbitControls enablePan={false} maxDistance={20} minDistance={2} />
      </Canvas>
      
      {/* Legend */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/80 rounded border border-emerald-500/30 text-[10px] uppercase tracking-tighter">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Azimuth</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/80 rounded border border-pink-500/30 text-[10px] uppercase tracking-tighter">
          <div className="w-2 h-2 rounded-full bg-pink-500" />
          <span>Elevation</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/80 rounded border border-amber-500/30 text-[10px] uppercase tracking-tighter">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Distance</span>
        </div>
      </div>

      {/* Interactive Ball Icons - Modern Control Widget */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-6 items-center bg-slate-800/40 p-3 rounded-full border border-white/5 backdrop-blur-md">
        {/* Azimuth Ball */}
        <div className="flex flex-col items-center gap-1 group">
            <button 
                onClick={() => step('azimuth', 45)}
                className="w-10 h-10 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white"
                title="Rotate Azimuth"
            >
                <i className="fa-solid fa-arrows-spin" />
            </button>
            <span className="text-[9px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">AZ</span>
        </div>

        {/* Elevation Ball */}
        <div className="flex flex-col items-center gap-1 group">
            <button 
                onClick={() => step('elevation', 15)}
                className="w-10 h-10 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:bg-pink-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white"
                title="Adjust Elevation"
            >
                <i className="fa-solid fa-arrows-up-down" />
            </button>
            <span className="text-[9px] text-pink-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">EL</span>
        </div>

        {/* Distance Ball */}
        <div className="flex flex-col items-center gap-1 group">
            <button 
                onClick={() => step('distance', -0.2)}
                className="w-10 h-10 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:bg-amber-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-white"
                title="Zoom In"
            >
                <i className="fa-solid fa-magnifying-glass-plus" />
            </button>
            <span className="text-[9px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">DIST</span>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/90 px-4 py-1.5 rounded-full border border-slate-600 text-[10px] font-mono tracking-wider text-emerald-400 flex items-center gap-4">
        <span><b className="text-white/50">AZ:</b> {params.azimuth}°</span>
        <span className="w-px h-3 bg-slate-700" />
        <span><b className="text-white/50">EL:</b> {params.elevation}°</span>
        <span className="w-px h-3 bg-slate-700" />
        <span><b className="text-white/50">DIST:</b> {params.distance.toFixed(1)}x</span>
      </div>
    </div>
  );
};

export default ThreeDViewport;
