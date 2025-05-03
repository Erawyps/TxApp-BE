// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { DocumentPlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

// Local Imports
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { Button, Card, Input, Select } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";
import { Listbox } from "components/shared/form/Listbox";
import { Combobox } from "components/shared/form/Combobox";
import { TimePicker } from "./components/TimePicker";

// ----------------------------------------------------------------------

const initialState = {
  date: "",
  chauffeur_id: "",
  vehicule_id: "",
  heure_debut: "",
  heure_fin: "",
  interruptions: "",
  km_debut: "",
  km_fin: "",
  prise_en_charge_debut: "",
  prise_en_charge_fin: "",
  chutes_debut: "",
  chutes_fin: "",
  courses: [],
  charges: [],
  salaire_cash: "",
  notes: ""
};

const modesPaiement = [
  { value: "cash", label: "Cash" },
  { value: "bancontact", label: "Bancontact" },
  { value: "facture", label: "Facture" },
  { value: "avance", label: "Avance" }
];

const typesCharge = [
  { value: "carburant", label: "Carburant" },
  { value: "peage", label: "Péage" },
  { value: "entretien", label: "Entretien" },
  { value: "carwash", label: "Carwash" },
  { value: "divers", label: "Divers" }
];

const NewFeuilleRouteForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialState,
  });

  const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({
    control,
    name: "courses"
  });

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: "charges"
  });

  const onSubmit = (data) => {
    console.log(data);
    toast.success("Feuille de route enregistrée avec succès");
    reset();
  };

  // Données simulées - à remplacer par des appels API
  const chauffeurs = [
    { id: 1, name: "Hasler Tehou" },
    { id: 2, name: "Yasser Mohamed" },
    { id: 3, name: "Luc Martin" },
  ];

  const vehicules = [
    { id: 1, label: "TXAA171 - Mercedes Classe E" },
    { id: 2, label: "TXAB751 - Volkswagen Touran" },
    { id: 3, label: "TXAC123 - Toyota Prius" },
  ];

  const clients = [
    { id: 1, name: "SNCB" },
    { id: 2, name: "William Lenox" },
    { id: 3, name: "Particulier" },
  ];

  return (
    <Page title="Nouvelle Feuille de Route">
      <div className="transition-content px-(--margin-x) pb-6">
        <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
          <div className="flex items-center gap-1">
            <DocumentPlusIcon className="size-6" />
            <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-dark-50">
              Nouvelle Feuille de Route
            </h2>
          </div>
          <div className="flex gap-2">
            <Button className="min-w-[7rem]" variant="outlined" onClick={() => reset()}>
              Annuler
            </Button>
            <Button
              className="min-w-[7rem]"
              color="primary"
              type="submit"
              form="feuille-route-form"
            >
              Enregistrer
            </Button>
          </div>
        </div>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          id="feuille-route-form"
        >
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-8">
              <Card className="p-4 sm:px-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                  Informations de base
                </h3>
                <div className="mt-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      render={({ field }) => (
                        <DatePicker
                          onChange={field.onChange}
                          value={field.value || ""}
                          label="Date"
                          error={errors?.date?.message}
                          options={{ disableMobile: true }}
                          placeholder="Sélectionner une date..."
                          {...field}
                        />
                      )}
                      control={control}
                      name="date"
                    />

                    <Input
                      label="Interruptions (minutes)"
                      placeholder="0"
                      type="number"
                      {...register("interruptions")}
                      error={errors?.interruptions?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      render={({ field }) => (
                        <TimePicker
                          onChange={field.onChange}
                          value={field.value || ""}
                          label="Heure de début"
                          error={errors?.heure_debut?.message}
                          placeholder="HH:MM"
                          {...field}
                        />
                      )}
                      control={control}
                      name="heure_debut"
                    />

                    <Controller
                      render={({ field }) => (
                        <TimePicker
                          onChange={field.onChange}
                          value={field.value || ""}
                          label="Heure de fin"
                          error={errors?.heure_fin?.message}
                          placeholder="HH:MM"
                          {...field}
                        />
                      )}
                      control={control}
                      name="heure_fin"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Index km début"
                      placeholder="000000"
                      type="number"
                      {...register("km_debut")}
                      error={errors?.km_debut?.message}
                    />

                    <Input
                      label="Index km fin"
                      placeholder="000000"
                      type="number"
                      {...register("km_fin")}
                      error={errors?.km_fin?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Prise en charge début"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      {...register("prise_en_charge_debut")}
                      error={errors?.prise_en_charge_debut?.message}
                    />

                    <Input
                      label="Prise en charge fin"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      {...register("prise_en_charge_fin")}
                      error={errors?.prise_en_charge_fin?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Chutes début (€)"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      {...register("chutes_debut")}
                      error={errors?.chutes_debut?.message}
                    />

                    <Input
                      label="Chutes fin (€)"
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      {...register("chutes_fin")}
                      error={errors?.chutes_fin?.message}
                    />
                  </div>
                </div>
              </Card>

              {/* Section Courses */}
              <Card className="mt-4 p-4 sm:px-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                  Courses ({courseFields.length})
                </h3>
                <div className="mt-5 space-y-5">
                  {courseFields.map((field, index) => (
                    <Card key={field.id} className="p-4 mb-4 relative">
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCourse(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Index départ"
                          placeholder="000"
                          type="number"
                          {...register(`courses.${index}.index_depart`)}
                          error={errors?.courses?.[index]?.index_depart?.message}
                        />

                        <Input
                          label="Index arrivée"
                          placeholder="000"
                          type="number"
                          {...register(`courses.${index}.index_arrivee`)}
                          error={errors?.courses?.[index]?.index_arrivee?.message}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Input
                          label="Lieu embarquement"
                          placeholder="Adresse de départ"
                          {...register(`courses.${index}.lieu_embarquement`)}
                          error={errors?.courses?.[index]?.lieu_embarquement?.message}
                        />

                        <Input
                          label="Lieu débarquement"
                          placeholder="Adresse d'arrivée"
                          {...register(`courses.${index}.lieu_debarquement`)}
                          error={errors?.courses?.[index]?.lieu_debarquement?.message}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <Controller
                          control={control}
                          name={`courses.${index}.client_id`}
                          render={({ field }) => (
                            <Select
                              options={clients}
                              value={clients.find(c => c.id === field.value) || null}
                              onChange={(val) => field.onChange(val?.id)}
                              label="Client"
                              placeholder="Sélectionner un client"
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.id}
                              error={errors?.courses?.[index]?.client_id?.message}
                            />
                          )}
                        />

                        <Input
                          label="Prix taximètre (€)"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          {...register(`courses.${index}.prix_taximetre`)}
                          error={errors?.courses?.[index]?.prix_taximetre?.message}
                        />

                        <Controller
                          control={control}
                          name={`courses.${index}.mode_paiement`}
                          render={({ field }) => (
                            <Select
                              options={modesPaiement}
                              value={modesPaiement.find(m => m.value === field.value) || null}
                              onChange={(val) => field.onChange(val?.value)}
                              label="Mode paiement"
                              placeholder="Sélectionner"
                              getOptionLabel={(option) => option.label}
                              getOptionValue={(option) => option.value}
                              error={errors?.courses?.[index]?.mode_paiement?.message}
                            />
                          )}
                        />
                      </div>

                      {watch(`courses.${index}.mode_paiement`) === "facture" && (
                        <div className="mt-4">
                          <Input
                            label="Numéro de bon"
                            placeholder="Référence"
                            {...register(`courses.${index}.numero_bon`)}
                            error={errors?.courses?.[index]?.numero_bon?.message}
                          />
                        </div>
                      )}
                    </Card>
                  ))}

                  <Button 
                    variant="outlined" 
                    className="w-full"
                    onClick={() => appendCourse({
                      index_depart: "",
                      index_arrivee: "",
                      lieu_embarquement: "",
                      lieu_debarquement: "",
                      client_id: "",
                      prix_taximetre: "",
                      mode_paiement: "",
                      numero_bon: ""
                    })}
                  >
                    + Ajouter une course
                  </Button>
                </div>
              </Card>
            </div>

            <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-4 lg:space-y-6">
              <Card className="space-y-5 p-4 sm:px-5">
                <Controller
                  render={({ field }) => (
                    <Listbox
                      data={vehicules}
                      value={
                        vehicules.find((v) => v.id === field.value) || null
                      }
                      onChange={(val) => field.onChange(val.id)}
                      name={field.name}
                      label="Véhicule"
                      placeholder="Sélectionner un véhicule"
                      displayField="label"
                      error={errors?.vehicule_id?.message}
                    />
                  )}
                  control={control}
                  name="vehicule_id"
                />

                <Controller
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Combobox
                      data={chauffeurs}
                      displayField="name"
                      value={chauffeurs.find((c) => c.id === value) || null}
                      onChange={(val) => onChange(val?.id)}
                      placeholder="Sélectionner un chauffeur"
                      label="Chauffeur"
                      searchFields={["name"]}
                      error={errors?.chauffeur_id?.message}
                      highlight
                      {...rest}
                    />
                  )}
                  control={control}
                  name="chauffeur_id"
                />
              </Card>

              <Card className="p-4 sm:px-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                  Charges ({chargeFields.length})
                </h3>
                <div className="mt-3 space-y-5">
                  {chargeFields.map((field, index) => (
                    <Card key={field.id} className="p-4 mb-4 relative">
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCharge(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                          control={control}
                          name={`charges.${index}.type`}
                          render={({ field }) => (
                            <Select
                              options={typesCharge}
                              value={typesCharge.find(t => t.value === field.value) || null}
                              onChange={(val) => field.onChange(val?.value)}
                              label="Type de charge"
                              placeholder="Sélectionner"
                              getOptionLabel={(option) => option.label}
                              getOptionValue={(option) => option.value}
                              error={errors?.charges?.[index]?.type?.message}
                            />
                          )}
                        />

                        <Input
                          label="Montant (€)"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          {...register(`charges.${index}.montant`)}
                          error={errors?.charges?.[index]?.montant?.message}
                        />
                      </div>

                      <div className="mt-4">
                        <Input
                          label="Description"
                          placeholder="Détails de la charge"
                          {...register(`charges.${index}.description`)}
                          error={errors?.charges?.[index]?.description?.message}
                        />
                      </div>
                    </Card>
                  ))}

                  <Button 
                    variant="outlined" 
                    className="w-full"
                    onClick={() => appendCharge({
                      type: "",
                      montant: "",
                      description: ""
                    })}
                  >
                    + Ajouter une charge
                  </Button>
                </div>
              </Card>

              <Card className="p-4 sm:px-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                  Récapitulatif
                </h3>
                <div className="mt-3 space-y-5">
                  <Input
                    label="Salaire en cash (€)"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    {...register("salaire_cash")}
                    error={errors?.salaire_cash?.message}
                  />

                  <Input
                    label="Notes"
                    placeholder="Informations complémentaires"
                    {...register("notes")}
                    error={errors?.notes?.message}
                    as="textarea"
                    rows={3}
                  />
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Page>
  );
};

export default NewFeuilleRouteForm;