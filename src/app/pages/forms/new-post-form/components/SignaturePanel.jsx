import { useRef, useEffect, useState } from 'react';
import { Button } from 'components/ui';
import { toast } from 'sonner';

export function SignaturePanel({ onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Setup canvas
    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      ctx.scale(ratio, ratio);
      ctx.strokeStyle = '#3b82f6'; // Couleur primaire
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    };
    
    resizeCanvas();
    
    // Dessin
    const startDrawing = (e) => {
      setIsDrawing(true);
      const { offsetX, offsetY } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    };
    
    const draw = (e) => {
      if (!isDrawing) return;
      const { offsetX, offsetY } = getCoordinates(e);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    };
    
    const stopDrawing = () => {
      setIsDrawing(false);
      if (canvas.toDataURL() !== canvas.blankDataURL) {
        setHasSigned(true);
        onSave(canvas.toDataURL());
      }
    };

    // Gestion des événements
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
  }, [isDrawing, onSave]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: (e.clientX - rect.left) * (canvas.width / rect.width),
      offsetY: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onSave(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-medium">Signature</label>
        {hasSigned && (
          <span className="text-sm text-green-600">✓ Signé</span>
        )}
      </div>
      
      <div 
        ref={canvasRef}
        className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 touch-action-none"
        style={{ touchAction: 'none' }}
      />
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={clearSignature}
          className="flex-1"
        >
          Effacer
        </Button>
        <Button
          onClick={() => {
            if (!hasSigned) {
              toast.info('Veuillez signer dans la zone ci-dessus');
            }
          }}
          className="flex-1"
          disabled={!hasSigned}
        >
          Confirmer
        </Button>
      </div>
    </div>
  );
}