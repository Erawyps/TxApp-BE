// FullForm.jsx
import { useFieldArray, Controller } from 'react-hook-form';
import { Button, Card, Input, Select, TabGroup, TabItem } from "components/ui";
import { toast } from "sonner";
import { Page } from "components/shared/Page";
import { useState } from 'react';

export function FullForm({ chauffeurs, vehicules, control, onSwitchMode, onSubmit }) {
  useFieldArray({
    control,
    name: "courses"
  });

  useFieldArray({
    control,
    name: "charges"
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleFormSubmit = (data) => {
    try {
      onSubmit(data);
      toast.success('Feuille de route enregistrée');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  return (
    <Page title="Feuille de Route Complète">
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-800 dark:text-primary-100">
            Feuille de Route
          </h1>
          <Button 
            variant="outline" 
            onClick={onSwitchMode}
            icon="smartphone"
          >
            Mode Driver
          </Button>
        </div>

        {/* Navigation par onglets */}
        <TabGroup>
          <TabItem
            active={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
            label="Général"
          />
          <TabItem
            active={activeTab === 'courses'}
            onClick={() => setActiveTab('courses')}
            label="Courses"
          />
          <TabItem
            active={activeTab === 'charges'}
            onClick={() => setActiveTab('charges')}
            label="Dépenses"
          />
        </TabGroup>

        {/* Contenu des onglets */}
        <div className="space-y-4">
          {activeTab === 'general' && (
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Informations Générales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="header.date"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      label="Date"
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  )}
                />
                
                <Controller
                  name="header.chauffeur.id"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      label="Chauffeur"
                      options={chauffeurs.map(c => ({
                        value: c.id,
                        label: `${c.prenom} ${c.nom}`
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Controller
                  name="header.vehicule.id"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      label="Véhicule"
                      options={vehicules.map(v => ({
                        value: v.id,
                        label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  name="shift.interruptions"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Interruptions (minutes)"
                      type="number"
                      {...field}
                    />
                  )}
                />
              </div>
            </Card>
          )}

          {/* Autres onglets... */}
        </div>

        {/* Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-800 p-4 border-t flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => control.reset()}
          >
            Réinitialiser
          </Button>
          <Button 
            color="primary"
            onClick={() => handleFormSubmit(control.getValues())}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </Page>
  );
}