import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Input, Select, Button } from 'components/ui';
import { XMarkIcon } from '@heroicons/react/24/outline';

export function CourseFormModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    depart: { lieu: '', heure: '', index: '' },
    arrivee: { lieu: '', heure: '', index: '' },
    prix: '',
    somme_percue: '',
    mode_paiement: 'cash',
    client: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      prix: parseFloat(form.prix),
      somme_percue: parseFloat(form.somme_percue || form.prix)
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
          <Dialog.Title className="text-lg font-bold mb-4 flex justify-between">
            <span>Nouvelle course</span>
            <button onClick={onClose}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <h3 className="font-medium">Embarquement</h3>
              <Input
                label="Lieu"
                value={form.depart.lieu}
                onChange={(e) => setForm({...form, depart: {...form.depart, lieu: e.target.value}})}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Heure"
                  type="time"
                  value={form.depart.heure}
                  onChange={(e) => setForm({...form, depart: {...form.depart, heure: e.target.value}})}
                  required
                />
                <Input
                  label="Index km"
                  type="number"
                  value={form.depart.index}
                  onChange={(e) => setForm({...form, depart: {...form.depart, index: e.target.value}})}
                />
              </div>
            </div>

            <div className="space-y-2 p-2 bg-gray-50 rounded">
              <h3 className="font-medium">Débarquement</h3>
              <Input
                label="Lieu"
                value={form.arrivee.lieu}
                onChange={(e) => setForm({...form, arrivee: {...form.arrivee, lieu: e.target.value}})}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Heure"
                  type="time"
                  value={form.arrivee.heure}
                  onChange={(e) => setForm({...form, arrivee: {...form.arrivee, heure: e.target.value}})}
                />
                <Input
                  label="Index km"
                  type="number"
                  value={form.arrivee.index}
                  onChange={(e) => setForm({...form, arrivee: {...form.arrivee, index: e.target.value}})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Prix taximètre (€)"
                type="number"
                step="0.01"
                value={form.prix}
                onChange={(e) => setForm({...form, prix: e.target.value})}
                required
              />
              <Input
                label="Somme perçue (€)"
                type="number"
                step="0.01"
                value={form.somme_percue}
                onChange={(e) => setForm({...form, somme_percue: e.target.value})}
              />
            </div>

            <Select
              label="Mode paiement"
              options={[
                { value: 'cash', label: 'Espèces' },
                { value: 'bancontact', label: 'Bancontact' },
                { value: 'facture', label: 'Facture' }
              ]}
              value={form.mode_paiement}
              onChange={(value) => setForm({...form, mode_paiement: value})}
            />

            {form.mode_paiement === 'facture' && (
              <Input
                label="Client"
                value={form.client}
                onChange={(e) => setForm({...form, client: e.target.value})}
                required
              />
            )}

            <Input
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
            />

            <Button type="submit" className="w-full">
              Ajouter la course
            </Button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}