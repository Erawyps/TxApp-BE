import { Listbox } from "components/shared/form/Listbox";

const paiementMethods = [
  { id: 'CASH', label: 'Cash' },
  { id: 'BC', label: 'Bancontact' },
  { id: 'F-SNCB', label: 'Facture SNCB' },
  { id: 'F-WL', label: 'Facture William Lenox' },
  { id: 'VIR', label: 'Virement' },
  { id: 'AVC', label: 'Avance client' }
];

export const PaiementMethodSelect = ({ value, onChange, label, error }) => {
  return (
    <Listbox
      label={label}
      options={paiementMethods}
      value={paiementMethods.find(m => m.id === value) || null}
      onChange={(val) => onChange(val?.id || '')}
      displayField="label"
      error={error}
    />
  );
};