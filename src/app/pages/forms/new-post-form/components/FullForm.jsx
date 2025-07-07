import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from './schema';
import { Button, Card, Input, Select } from "components/ui";
import { DocumentPlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { SignaturePad } from "components/form/SignaturePad";
import { DatePicker } from "components/shared/form/Datepicker";
import { TimePicker } from "./components/TimePicker";

export function FullForm({ chauffeurs, vehicules, control, onSwitchMode }) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      header: {
        date: new Date(),
        chauffeur: null,
        vehicule: null
      },
      shift: {
        start: "",
        end: "",
        interruptions: 0
      },
      kilometers: {
        start: 0,
        end: null
      },
      courses: [],
      charges: [],
      totals: {
        recettes: 0,
        charges: 0,
        salaire: 0
      },
      validation: {
        signature: null,
        date_validation: null
      }
    }
  });

  const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({
    control,
    name: "courses"
  });

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: "charges"
  });

  const onSubmit = async (data) => {
    try {
      // Calcul des totaux
      const recettes = data.courses.reduce((sum, c) => sum + (Number(c.prix_taximetre) || 0), 0);
      const charges = data.charges.reduce((sum, c) => sum + (Number(c.montant) || 0), 0);
      
      // Règle de calcul du salaire (40% jusqu'à 180€, 30% au-delà)
      const base = Math.min(recettes, 180);
      const surplus = Math.max(recettes - 180, 0);
      const salaire = (base * 0.4) + (surplus * 0.3);

      setValue('totals', { 
        recettes: Number(recettes.toFixed(2)),
        charges: Number(charges.toFixed(2)),
        salaire: Number(salaire.toFixed(2))
      });

      console.log("Data to save:", data);
      toast.success("Feuille de route enregistrée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    }
  };

  const handleReset = () => {
    reset();
    toast.info("Formulaire réinitialisé");
  };

  return (
    <div className="full-form-container">
      <div className="form-header">
        <h2>Feuille de Route Complète</h2>
        <Button variant="outline" onClick={onSwitchMode}>
          Mode Conduite
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section En-tête */}
        <Card className="section-card">
          <h3>Informations Générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="header.date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.header?.date?.message}
                />
              )}
            />

            <Controller
              name="header.chauffeur.id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Chauffeur"
                  options={chauffeurs.map(c => ({
                    value: c.id,
                    label: `${c.prenom} ${c.nom} (${c.numero_badge})`
                  }))}
                  value={field.value}
                  onChange={(value) => {
                    const selected = chauffeurs.find(c => c.id === value);
                    field.onChange(value);
                    setValue('header.chauffeur', selected);
                  }}
                  error={errors.header?.chauffeur?.id?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Controller
              name="header.vehicule.id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Véhicule"
                  options={vehicules.map(v => ({
                    value: v.id,
                    label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
                  }))}
                  value={field.value}
                  onChange={(value) => {
                    const selected = vehicules.find(v => v.id === value);
                    field.onChange(value);
                    setValue('header.vehicule', selected);
                  }}
                  error={errors.header?.vehicule?.id?.message}
                />
              )}
            />

            <Input
              label="Interruptions (minutes)"
              type="number"
              {...register("shift.interruptions", { valueAsNumber: true })}
              error={errors.shift?.interruptions?.message}
            />
          </div>
        </Card>

        {/* Section Shift */}
        <Card className="section-card">
          <h3>Période de Service</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="shift.start"
              control={control}
              render={({ field }) => (
                <TimePicker
                  label="Heure de début"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.shift?.start?.message}
                />
              )}
            />

            <Controller
              name="shift.end"
              control={control}
              render={({ field }) => (
                <TimePicker
                  label="Heure de fin"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.shift?.end?.message}
                />
              )}
            />
          </div>
        </Card>

        {/* Section Kilométrage */}
        <Card className="section-card">
          <h3>Kilométrage</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Km de début"
              type="number"
              {...register("kilometers.start", { valueAsNumber: true })}
              error={errors.kilometers?.start?.message}
            />

            <Input
              label="Km de fin"
              type="number"
              {...register("kilometers.end", { valueAsNumber: true })}
              error={errors.kilometers?.end?.message}
            />
          </div>
        </Card>

        {/* Section Courses */}
        <Card className="section-card">
          <div className="flex justify-between items-center">
            <h3>Courses ({courseFields.length})</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => appendCourse({
                depart: {
                  lieu: "",
                  index: 0,
                  heure: "",
                  position: null
                },
                arrivee: {
                  lieu: "",
                  index: 0,
                  heure: "",
                  position: null
                },
                prix_taximetre: 0,
                somme_percue: 0,
                mode_paiement_id: "cash",
                client_id: null,
                notes: ""
              })}
              icon={<DocumentPlusIcon className="h-4 w-4" />}
            >
              Ajouter Course
            </Button>
          </div>

          {courseFields.map((field, index) => (
            <Card key={field.id} className="course-card">
              <div className="flex justify-between items-center mb-4">
                <h4>Course #{index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCourse(index)}
                  icon={<TrashIcon className="h-4 w-4 text-red-500" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Lieu de départ"
                  {...register(`courses.${index}.depart.lieu`)}
                  error={errors.courses?.[index]?.depart?.lieu?.message}
                />

                <Input
                  label="Heure départ"
                  {...register(`courses.${index}.depart.heure`)}
                  error={errors.courses?.[index]?.depart?.heure?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="Lieu d'arrivée"
                  {...register(`courses.${index}.arrivee.lieu`)}
                  error={errors.courses?.[index]?.arrivee?.lieu?.message}
                />

                <Input
                  label="Heure arrivée"
                  {...register(`courses.${index}.arrivee.heure`)}
                  error={errors.courses?.[index]?.arrivee?.heure?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Index départ"
                  type="number"
                  {...register(`courses.${index}.depart.index`, { valueAsNumber: true })}
                  error={errors.courses?.[index]?.depart?.index?.message}
                />

                <Input
                  label="Index arrivée"
                  type="number"
                  {...register(`courses.${index}.arrivee.index`, { valueAsNumber: true })}
                  error={errors.courses?.[index]?.arrivee?.index?.message}
                />

                <Input
                  label="Prix taximètre (€)"
                  type="number"
                  step="0.01"
                  {...register(`courses.${index}.prix_taximetre`, { valueAsNumber: true })}
                  error={errors.courses?.[index]?.prix_taximetre?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Controller
                  name={`courses.${index}.mode_paiement_id`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Mode de paiement"
                      options={[
                        { value: "cash", label: "Cash" },
                        { value: "bancontact", label: "Bancontact" },
                        { value: "facture", label: "Facture" }
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.courses?.[index]?.mode_paiement_id?.message}
                    />
                  )}
                />

                {watch(`courses.${index}.mode_paiement_id`) === "facture" && (
                  <Input
                    label="Client (pour facture)"
                    {...register(`courses.${index}.client_id`)}
                    error={errors.courses?.[index]?.client_id?.message}
                  />
                )}
              </div>

              <div className="mt-4">
                <Input
                  label="Notes"
                  {...register(`courses.${index}.notes`)}
                  as="textarea"
                  rows={2}
                />
              </div>
            </Card>
          ))}
        </Card>

        {/* Section Charges */}
        <Card className="section-card">
          <div className="flex justify-between items-center">
            <h3>Charges ({chargeFields.length})</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => appendCharge({
                type_charge: "divers",
                montant: 0,
                mode_paiement_id: "cash",
                description: "",
                date: new Date().toISOString().split('T')[0]
              })}
              icon={<DocumentPlusIcon className="h-4 w-4" />}
            >
              Ajouter Charge
            </Button>
          </div>

          {chargeFields.map((field, index) => (
            <Card key={field.id} className="charge-card">
              <div className="flex justify-between items-center mb-4">
                <h4>Charge #{index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCharge(index)}
                  icon={<TrashIcon className="h-4 w-4 text-red-500" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name={`charges.${index}.type_charge`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Type de charge"
                      options={[
                        { value: "carburant", label: "Carburant" },
                        { value: "peage", label: "Péage" },
                        { value: "entretien", label: "Entretien" },
                        { value: "carwash", label: "Carwash" },
                        { value: "divers", label: "Divers" }
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.charges?.[index]?.type_charge?.message}
                    />
                  )}
                />

                <Input
                  label="Montant (€)"
                  type="number"
                  step="0.01"
                  {...register(`charges.${index}.montant`, { valueAsNumber: true })}
                  error={errors.charges?.[index]?.montant?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Controller
                  name={`charges.${index}.mode_paiement_id`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Mode de paiement"
                      options={[
                        { value: "cash", label: "Cash" },
                        { value: "bancontact", label: "Bancontact" }
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.charges?.[index]?.mode_paiement_id?.message}
                    />
                  )}
                />

                <Input
                  label="Date"
                  type="date"
                  {...register(`charges.${index}.date`)}
                  error={errors.charges?.[index]?.date?.message}
                />
              </div>

              <div className="mt-4">
                <Input
                  label="Description"
                  {...register(`charges.${index}.description`)}
                  error={errors.charges?.[index]?.description?.message}
                />
              </div>
            </Card>
          ))}
        </Card>

        {/* Section Validation */}
        <Card className="section-card">
          <h3>Validation</h3>
          
          <div className="signature-section">
            <Controller
              name="validation.signature"
              control={control}
              render={({ field }) => (
                <SignaturePad
                  onSave={field.onChange}
                  penColor="#000"
                  backgroundColor="#f9fafb"
                  height={200}
                />
              )}
            />
            {errors.validation?.signature?.message && (
              <p className="error-message">{errors.validation.signature.message}</p>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button type="submit" color="primary">
            Enregistrer
          </Button>
        </div>
      </form>

      <style>{`
        .full-form-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .section-card {
          margin-bottom: 20px;
          padding: 20px;
        }
        
        .course-card, .charge-card {
          margin-bottom: 15px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        
        .signature-section {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 8px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        
        .error-message {
          color: #e74c3c;
          margin-top: 5px;
          font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
          .full-form-container {
            padding: 10px;
          }
          
          .section-card {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}