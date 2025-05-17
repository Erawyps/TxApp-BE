import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Button, Input, Card } from "components/ui";
import { vehicleSchema } from "../schema";
import { useKYCFormContext } from "../KYCFormContext";

export function VehicleInfo({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(vehicleSchema),
    defaultValues: kycFormCtx.state.etape2
  });

  const onSubmit = (data) => {
    kycFormCtx.dispatch({
      type: 'SET_ETAPE2_DATA',
      payload: data
    });
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Informations Véhicule</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            {...register('plaqueImmatriculation')}
            label="Plaque d'immatriculation"
            placeholder="AB-123-CD"
            error={errors.plaqueImmatriculation?.message}
          />
          <Input
            {...register('numeroIdentification')}
            label="Numéro d'identification"
            error={errors.numeroIdentification?.message}
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Taximètre</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            {...register('taximetre.kmChargeDebut', { valueAsNumber: true })}
            label="KM en charge début"
            type="number"
            error={errors.taximetre?.kmChargeDebut?.message}
          />
          <Input
            {...register('taximetre.kmChargeFin', { valueAsNumber: true })}
            label="KM en charge fin"
            type="number"
            error={errors.taximetre?.kmChargeFin?.message}
          />
          <Input
            {...register('taximetre.chutesDebut', { valueAsNumber: true })}
            label="Chutes début (€)"
            type="number"
            step="0.01"
            error={errors.taximetre?.chutesDebut?.message}
          />
          <Input
            {...register('taximetre.chutesFin', { valueAsNumber: true })}
            label="Chutes fin (€)"
            type="number"
            step="0.01"
            error={errors.taximetre?.chutesFin?.message}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" color="primary">
          Suivant
        </Button>
      </div>
    </form>
  );
}