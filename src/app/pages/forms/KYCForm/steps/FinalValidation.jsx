import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Button, Input } from "components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { validationSchema } from "../schema";
import { DatePicker } from "components/shared/form/Datepicker";
import { RouteSheetSummary } from "../components/RouteSheetSummary";

export function FinalValidation({ setCompleted }) {
  const kycFormCtx = useKYCFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: kycFormCtx.state.formData.finalValidation,
  });

  const onSubmit = (data) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      kycFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { finalValidation: data },
      });
      kycFormCtx.dispatch({
        type: "SET_STEP_STATUS",
        payload: { finalValidation: { isDone: true } },
      });
      setCompleted(true);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <RouteSheetSummary formData={kycFormCtx.state.formData} />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          {...register("salaireCash")}
          label="Salaire en cash (€)"
          type="number"
          error={errors?.salaireCash?.message}
        />

        <Controller
          control={control}
          name="dateSignature"
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Date signature"
              error={errors?.dateSignature?.message}
            />
          )}
        />

        <div className="md:col-span-2">
          <Input
            {...register("signature")}
            label="Signature"
            error={errors?.signature?.message}
            placeholder="Votre nom complet"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" onClick={() => kycFormCtx.dispatch({ type: "SET_CURRENT_STEP", payload: 1 })}>
          Retour
        </Button>
        <Button type="submit" color="primary" loading={isSubmitting}>
          Valider la feuille de route
        </Button>
      </div>
    </form>
  );
}