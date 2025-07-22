import { Modal } from 'components/ui';
import { SummaryAccordion } from './SummaryAccordion';

export function FinancialSummaryModal({ isOpen, onClose, totals }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Résumé financier">
      <SummaryAccordion 
        recettes={totals.recettes}
        charges={totals.charges}
        salaire={totals.salaire}
      />
    </Modal>
  );
}