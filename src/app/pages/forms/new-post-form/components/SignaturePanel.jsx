import { toast } from 'sonner';
import { useController } from 'react-hook-form';
import { useRef } from 'react';

export function SignaturePanel({ name, control }) {
  const { field } = useController({ name, control });
  
  const canvasRef = useRef(null);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL();
    field.onChange(signatureData); // Sauvegarde directe dans react-hook-form
    toast.success('Signature enregistrée');
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    field.onChange(null);
  };

//logique de dessin sur le canvas
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    
    const handleMouseMove = (e) => {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    };

    const handleMouseUp = () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      ctx.lineTo(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
      ctx.stroke();
    };

    const handleTouchEnd = () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };

    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
  };


  return (
    <div>
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        style={{ border: '1px solid black' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
      <div>
        <button onClick={handleSave}>Enregistrer</button>
        <button onClick={handleClear}>Effacer</button>
      </div>
    </div>
  );
}