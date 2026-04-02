'use client';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  bgGradient: string;
}

export default function SensorCard({ title, value, unit, icon, color, bgGradient }: SensorCardProps) {
  // Use color prop directly - supports both rgb() and hex formats
  
  return (
    <div 
      className="relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]"
      style={{ 
        background: color, 
        minHeight: '280px', 
        height: '280px',
        border: '4px solid rgba(255, 255, 255, 0.2)',
        margin: '4px'
      }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <div className="text-7xl transform rotate-12">{icon}</div>
      </div>
      
      <div className="relative p-5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-bold tracking-wide mb-1" style={{ fontSize: '1.25rem' }}>{title}</h3>
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse shadow-lg shadow-green-400/50"></span>
              <span className="text-white/90 text-xs font-semibold uppercase tracking-wide">Live</span>
            </div>
          </div>
          <div className="opacity-90" style={{ fontSize: '3rem' }}>{icon}</div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-baseline space-x-3">
            <span 
              className="font-black text-white drop-shadow-2xl"
              style={{ fontSize: '4rem', lineHeight: '1' }}
            >
              {(value === 1 || value === 0) && (unit === '' || unit === '-' || unit === 'status') ? (value === 1 ? 'ON' : 'OFF') : value.toFixed(1)}
            </span>
            {!((value === 1 || value === 0) && (unit === '' || unit === '-' || unit === 'status')) && (
            <span 
              className="font-bold text-white/90"
              style={{ fontSize: '1.75rem' }}
            >
              {unit}
            </span>
            )}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/30">
          <div className="flex items-center justify-between text-white/80 text-xs">
            <span className="font-medium">Last update</span>
            <span className="font-semibold">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
