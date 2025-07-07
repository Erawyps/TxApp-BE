import { useRef } from 'react';

export const SignaturePad = ({ onSave, penColor = '#000', backgroundColor = '#fff', height = 200 }) => {
  const sigPadRef = useRef();

  const setPenColor = () => {
    if (sigPadRef.current) {
      const context = sigPadRef.current.getContext('2d');
      context.strokeStyle = penColor;
    }
  };

  setPenColor();
  
  const clear = () => {
    sigPadRef.current.clear();
  };
  
  const save = () => {
    if (sigPadRef.current.isEmpty()) {
      alert("Veuillez fournir une signature");
      return;
    }
    const signature = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
    onSave(signature);
  };

  return (
    <div style={{ background: backgroundColor, padding: '10px' }}>
      <canvas
        ref={sigPadRef}
        style={{
          border: '1px solid #000',
          width: '100%',
          height: `${height}px`,
        }}
      />
      <div style={{ marginTop: '10px' }}>
        <button type="button" onClick={clear} style={{ marginRight: '10px' }}>
          Effacer
        </button>
        <button type="button" onClick={save}>
          Enregistrer
        </button>
      </div>
    </div>
  );
};