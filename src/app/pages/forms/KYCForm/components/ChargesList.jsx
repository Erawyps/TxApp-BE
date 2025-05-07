import { useState } from "react";
import { Button, Input } from "components/ui";
import { Modal } from "../../../../../components/shared/modal/Modal";

export function ChargesList({ charges = [], onAdd, onRemove }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCharge, setNewCharge] = useState({
    type: "",
    description: "",
    montant: "",
  });

  const handleAddCharge = () => {
    onAdd(newCharge);
    setNewCharge({ type: "", description: "", montant: "" });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {charges.map((charge, index) => (
        <div key={index} className="flex items-center gap-4 rounded border p-3">
          <div className="flex-1">
            <p className="font-medium">{charge.type}</p>
            <p className="text-sm text-gray-600">{charge.description}</p>
          </div>
          <div className="text-lg font-semibold">{charge.montant} €</div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(index)}
          >
            Supprimer
          </Button>
        </div>
      ))}

      <Button type="button" onClick={() => setIsModalOpen(true)}>
        Ajouter une charge
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle charge"
      >
        <div className="space-y-4">
          <Input
            label="Type"
            value={newCharge.type}
            onChange={(e) => setNewCharge({...newCharge, type: e.target.value})}
            placeholder="Ex: Carburant, Péage..."
          />
          <Input
            label="Description"
            value={newCharge.description}
            onChange={(e) => setNewCharge({...newCharge, description: e.target.value})}
          />
          <Input
            label="Montant (€)"
            type="number"
            value={newCharge.montant}
            onChange={(e) => setNewCharge({...newCharge, montant: e.target.value})}
          />
          <div className="flex justify-end space-x-3">
            <Button onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button color="primary" onClick={handleAddCharge}>
              Ajouter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}