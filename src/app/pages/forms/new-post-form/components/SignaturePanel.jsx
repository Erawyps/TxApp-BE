import { useRef, useEffect } from 'react';

export function SignaturePanel({ control, name }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Configuration du canvas
    const resizeCanvas = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(ratio, ratio);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    };
    
    resizeCanvas();
    
    // Gestion des événements
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
      // Sauvegarder la signature
      control.setValue(name, canvas.toDataURL());
    };
    
    // Gestion à la fois souris et tactile
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrawing(e.touches[0]);
    });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      draw(e.touches[0]);
    });
    
    canvas.addEventListener('touchend', stopDrawing);
    
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [control, name]);
  
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
    control.setValue(name, '');
  };

  return (
    <div className="signature-panel">
      <p>Signez ci-dessous :</p>
      <div className="signature-container">
        <canvas 
          ref={canvasRef}
          style={{
            border: '1px solid #ddd',
            backgroundColor: '#f9f9f9',
            touchAction: 'none'
          }}
        />
      </div>
      <button 
        type="button" 
        onClick={clearSignature}
        className="clear-btn"
      >
        Effacer
      </button>
      
      <style>{`
        .signature-panel {
          margin: 20px 0;
        }
        .signature-container {
          width: 100%;
          height: 200px;
          margin: 10px 0;
        }
        .clear-btn {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 5px 10px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}