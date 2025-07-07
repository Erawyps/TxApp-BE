import { useEffect, useState } from 'react';
import { Button } from 'components/ui';

export function ShiftTimer({ isActive, onStart, onStop, startTime, endTime }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateDuration = () => {
    if (!startTime) return '00:00:00';
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = endTime ? new Date(`2000-01-01T${endTime}`) : currentTime;
    
    const diff = end - start;
    return new Date(diff).toISOString().substr(11, 8);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-center">
        <div className="text-4xl font-mono mb-2">
          {calculateDuration()}
        </div>
        <div className="text-sm text-gray-500 mb-4">
          {startTime && `Début: ${startTime}`} 
          {endTime && ` • Fin: ${endTime}`}
        </div>
        
        {!isActive ? (
          <Button onClick={onStart} className="w-full">
            Démarrer le shift
          </Button>
        ) : (
          <Button variant="outline" onClick={onStop} className="w-full">
            Terminer le shift
          </Button>
        )}
      </div>
    </div>
  );
}