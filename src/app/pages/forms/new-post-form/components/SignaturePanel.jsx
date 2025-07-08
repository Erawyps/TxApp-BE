import { useRef, useEffect } from 'react';
import { Button } from 'components/ui';

export function SignaturePanel({ onSave, penColor = '#000', backgroundColor = '#f9fafb', height = 150 }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = height;
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    resizeCanvas();
    
    const startDrawing = (e) => {
      isDrawing.current = true;
      const { offsetX, offsetY } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    };
    
    const draw = (e) => {
      if (!isDrawing.current) return;
      const { offsetX, offsetY } = getCoordinates(e);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    };
    
    const stopDrawing = () => {
      isDrawing.current = false;
      onSave(canvas.toDataURL());
    };
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, [onSave, penColor, backgroundColor, height]);
  
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSave(null);
  };

  return (
    <div className="signature-panel space-y-2">
      <div className="signature-container border rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef}
          style={{
            width: '100%',
            height: `${height}px`,
            backgroundColor: backgroundColor,
            touchAction: 'none'
          }}
        />
      </div>
      <Button 
        variant="outline"
        onClick={clearSignature}
        className="w-full"
      >
        Effacer
      </Button>
    </div>
  );
}