import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Select, Textarea } from "components/ui";
import { chauffeurSchema } from "../schema";
import { useKYCFormContext } from "../KYCFormContext";
import { DatePicker } from "components/shared/form/Datepicker";

const REMUNERATION_TYPES = [
  { value: 'fixe', label: 'Contrat fixe' },
  { value: '40percent', label: '40% sur tout' },
  { value: '30percent', label: '30% sur tout' },
  { value: 'mixte', label: '40% jusqu\'à 180€ puis 30%' },
  { value: 'heure10', label: 'Heure 10€' },
  { value: 'heure12', label: 'Heure 12€' }
];

// Simuler des données de chauffeurs
const CHAUFFEURS = [
  { id: '1', nom: 'Hasler Tehou' },
  { id: '2', nom: 'Yasser' },
  { id: '3', nom: 'Luc Martin' }
];

export function ChauffeurInfo({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(chauffeurSchema),
    defaultValues: kycFormCtx.state.etape1
  });

  const onSubmit = (data) => {
    kycFormCtx.dispatch({
      type: 'SET_ETAPE1_DATA',
      payload: data
    });
    setCurrentStep(1);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Select
        {...register('chauffeurId')}
        label="Chauffeur"
        options={CHAUFFEURS.map(c => ({ value: c.id, label: c.nom }))}
        error={errors.chauffeurId?.message}
      />

      <Controller
        name="periodeService.date"
        control={control}
        render={({ field }) => (
          <DatePicker
            {...field}
            label="Date"
            error={errors.periodeService?.date?.message}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('periodeService.heureDebut')}
          type="time"
          label="Heure début"
          error={errors.periodeService?.heureDebut?.message}
        />
        <Input
          {...register('periodeService.heureFin')}
          type="time"
          label="Heure fin"
          error={errors.periodeService?.heureFin?.message}
        />
      </div>

      <Select
        {...register('remunerationType')}
        label="Type de rémunération"
        options={REMUNERATION_TYPES}
        error={errors.remunerationType?.message}
      />

      <Textarea
        {...register('notes')}
        label="Notes supplémentaires"
      />

      <div className="flex justify-end">
        <Button type="submit" color="primary">
          Suivant
        </Button>
      </div>
    </form>
  );
}