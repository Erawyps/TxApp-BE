import { useRef, useState } from 'react';
import { Button } from 'components/ui';

export function SignaturePanel({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    onSave(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="space-y-3">
      <div className="border rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={300}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          className="w-full bg-white"
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outlined" 
          onClick={handleClear}
          className="flex-1"
        >
          Effacer
        </Button>
        <Button 
          onClick={handleSave}
          className="flex-1"
        >
          Enregistrer
        </Button>
      </div>
    </div>
  );
}