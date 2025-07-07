// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useRef } from "react";
import { DocumentPlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { pdf, Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { SignaturePad } from "components/form/SignaturePad";

// Local Imports
import { schema } from "./schema";
import { Page as PageComponent } from "components/shared/Page";
import { Button, Card, Input, Select } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";
import { Listbox } from "components/shared/form/Listbox";
import { Combobox } from "components/shared/form/Combobox";
import { TimePicker } from "./components/TimePicker";

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    fontSize: 8
  },
  title: {
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: 'bold'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0'
  },
  tableCol: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCellHeader: {
    padding: 5,
    fontSize: 10,
    fontWeight: 'bold'
  },
  tableCell: {
    padding: 5,
    fontSize: 10
  },
  signature: {
    marginTop: 20,
    borderTop: 1,
    borderColor: '#000',
    paddingTop: 10
  },
  calculation: {
    marginTop: 5,
    fontStyle: 'italic'
  }
});

// Composant PDF
const FeuilleRoutePDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* En-tête officiel */}
      <View style={styles.header}>
        <Text>MONITEUR BELGE — 19.08.2013 – Ed. 2 — BELGISCH STAATSBLAD</Text>
      </View>
      
      <Text>Annexe 2</Text>
      <Text>Annexe 1/1 de l&apos;arrêté du Gouvernement wallon du 3 juin 2009</Text>
      
      {/* Titre */}
      <View style={styles.title}>
        <Text>FEUILLE DE ROUTE</Text>
      </View>
      <View style={styles.subtitle}>
        <Text>(Identité de l&apos;exploitant)</Text>
      </View>
      
      {/* Section Véhicule */}
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Text>Date : {new Date(data.header.date).toLocaleDateString()}</Text>
        <Text style={{ marginLeft: 20 }}>Nom du chauffeur : {data.header.chauffeur.prenom} {data.header.chauffeur.nom}</Text>
      </View>
      
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.sectionTitle}>Véhicule</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text>n° plaque d&apos;immatriculation : {data.header.vehicule.plaque}</Text>
          <Text style={{ marginLeft: 20 }}>n° identification : {data.header.vehicule.numero}</Text>
        </View>
      </View>
      
      {/* Tableau Service */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionTitle}>Service</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text style={styles.tableCellHeader}>Heures des prestations</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text style={styles.tableCellHeader}>Index km</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text style={styles.tableCellHeader}>Tableau de bord</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text style={styles.tableCellHeader}>Taximètre</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Début {data.shift.start}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Fin {data.shift.end || '-'}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Début {data.kilometers.start}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Interruptions: {data.shift.interruptions || 0} min</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Fin {data.kilometers.end || '-'}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Tableau Courses */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionTitle}>Courses</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '10%' }]}>
              <Text style={styles.tableCellHeader}>N° ordre</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text style={styles.tableCellHeader}>Index départ</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text style={styles.tableCellHeader}>Embarquement</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '25%' }]}>
              <Text style={styles.tableCellHeader}>Débarquement</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '15%' }]}>
              <Text style={styles.tableCellHeader}>Prix</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '10%' }]}>
              <Text style={styles.tableCellHeader}>Paiement</Text>
            </View>
          </View>
          
          {data.courses.map((course, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '10%' }]}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text style={styles.tableCell}>{course.depart.index}</Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text style={styles.tableCell}>
                  {course.depart.lieu} {course.depart.heure}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text style={styles.tableCell}>
                  {course.arrivee.lieu} {course.arrivee.heure || '-'}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text style={styles.tableCell}>{course.prix.toFixed(2)}€</Text>
              </View>
              <View style={[styles.tableCol, { width: '10%' }]}>
                <Text style={styles.tableCell}>
                  {course.mode_paiement === 'facture' ? `(${course.client})` : course.mode_paiement}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Tableau Charges */}
      {data.charges.length > 0 && (
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.sectionTitle}>Charges</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, { width: '30%' }]}>
                <Text style={styles.tableCellHeader}>Type</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '30%' }]}>
                <Text style={styles.tableCellHeader}>Description</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '20%' }]}>
                <Text style={styles.tableCellHeader}>Montant</Text>
              </View>
              <View style={[styles.tableColHeader, { width: '20%' }]}>
                <Text style={styles.tableCellHeader}>Paiement</Text>
              </View>
            </View>
            
            {data.charges.map((charge, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text style={styles.tableCell}>{charge.type}</Text>
                </View>
                <View style={[styles.tableCol, { width: '30%' }]}>
                  <Text style={styles.tableCell}>{charge.description || '-'}</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>{charge.montant.toFixed(2)}€</Text>
                </View>
                <View style={[styles.tableCol, { width: '20%' }]}>
                  <Text style={styles.tableCell}>{charge.mode_paiement}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Totaux */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionTitle}>Totaux</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>Recettes totales: {data.totals.recettes.toFixed(2)}€</Text>
          <Text>Charges totales: {data.totals.charges.toFixed(2)}€</Text>
          <Text>Salaire calculé: {data.totals.salaire.toFixed(2)}€</Text>
        </View>
      </View>
      
      {/* Signature */}
      <View style={styles.signature}>
        <Text>Signature du chauffeur :</Text>
        {data.validation.signature && (
          <Image 
            src={data.validation.signature} 
            style={{ width: 150, height: 50 }} 
          />
        )}
        <Text>Date de validation : {new Date(data.validation.date_validation).toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

// ----------------------------------------------------------------------

const initialState = {
  header: {
    date: new Date(),
    chauffeur: {
      id: "",
      nom: "",
      prenom: "",
      badge: ""
    },
    vehicule: {
      id: "",
      plaque: "",
      numero: ""
    }
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
    signature: "",
    date_validation: null
  }
};

const modesPaiement = [
  { value: "cash", label: "Cash" },
  { value: "bancontact", label: "Bancontact" },
  { value: "facture", label: "Facture" }
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
    watch,
    getValues,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialState,
  });

  const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({
    control,
    name: "courses"
  });

  const sigPadRef = useRef();

  const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
    control,
    name: "charges"
  });

  const onSubmit = async (data) => {
    try {
      // Calcul des totaux
      const recettes = data.courses.reduce((sum, c) => sum + (Number(c.prix) || 0), 0);
      const charges = data.charges.reduce((sum, c) => sum + (Number(c.montant) || 0), 0);
      
      // Règle de calcul du salaire (40% jusqu'à 180€, 30% au-delà)
      const base = Math.min(recettes, 180);
      const surplus = Math.max(recettes - 180, 0);
      const salaire = (base * 0.4) + (surplus * 0.3);

      // Mettre à jour les totaux
      setValue('totals', { 
        recettes: Number(recettes.toFixed(2)),
        charges: Number(charges.toFixed(2)),
        salaire: Number(salaire.toFixed(2))
      });

      console.log("Data to save:", data);
      toast.success("Feuille de route enregistrée avec succès");
      
      // Générer le PDF automatiquement après enregistrement
      handlePreview();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    }
  };

  const handlePreview = async () => {
    const formData = getValues();
    
    try {
      const blob = await pdf(<FeuilleRoutePDF data={formData} />).toBlob();
      saveAs(blob, `feuille_route_${new Date(formData.header.date).toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Une erreur est survenue lors de la génération du PDF");
    }
  };

  // Données simulées - à remplacer par des appels API
  const chauffeurs = [
    { id: "CH001", nom: "Tehou", prenom: "Hasler", badge: "TX-2023-001" },
    { id: "CH002", nom: "Mohamed", prenom: "Yasser", badge: "TX-2023-002" },
    { id: "CH003", nom: "Martin", prenom: "Luc", badge: "TX-2023-003" },
  ];

  const vehicules = [
    { id: "VH001", plaque: "TX-AA-171", numero: "10", label: "TX-AA-171 - Mercedes Classe E" },
    { id: "VH002", plaque: "TX-AB-751", numero: "4", label: "TX-AB-751 - Volkswagen Touran" },
    { id: "VH003", plaque: "TX-AC-123", numero: "7", label: "TX-AC-123 - Toyota Prius" },
  ];

  // Removed unused 'clients' variable

  return (
    <PageComponent title="Nouvelle Feuille de Route">
      <div className="transition-content px-(--margin-x) pb-6">
        <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
          <div className="flex items-center gap-1">
            <DocumentPlusIcon className="size-6" />
            <h2 className="line-clamp-1 text-xl font-medium text-gray-700 dark:text-dark-50">
              Nouvelle Feuille de Route
            </h2>
          </div>
          <div className="flex gap-2">
            <Button className="min-w-[7rem]" variant="outlined" onClick={() => reset(initialState)}>
              Annuler
            </Button>
            <Button
              className="min-w-[7rem]"
              variant="outlined"
              onClick={handlePreview}
            >
              Prévisualiser PDF
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
                          error={errors?.header?.date?.message}
                          options={{ disableMobile: true }}
                          placeholder="Sélectionner une date..."
                          {...field}
                        />
                      )}
                      control={control}
                      name="header.date"
                    />

                    <Input
                      label="Interruptions (minutes)"
                      placeholder="0"
                      type="number"
                      {...register("shift.interruptions")}
                      error={errors?.shift?.interruptions?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      render={({ field }) => (
                        <TimePicker
                          onChange={field.onChange}
                          value={field.value || ""}
                          label="Heure de début"
                          error={errors?.shift?.start?.message}
                          placeholder="HH:MM"
                          {...field}
                        />
                      )}
                      control={control}
                      name="shift.start"
                    />

                    <Controller
                      render={({ field }) => (
                        <TimePicker
                          onChange={field.onChange}
                          value={field.value || ""}
                          label="Heure de fin"
                          error={errors?.shift?.end?.message}
                          placeholder="HH:MM"
                          {...field}
                        />
                      )}
                      control={control}
                      name="shift.end"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Index km début"
                      placeholder="000000"
                      type="number"
                      {...register("kilometers.start")}
                      error={errors?.kilometers?.start?.message}
                    />

                    <Input
                      label="Index km fin"
                      placeholder="000000"
                      type="number"
                      {...register("kilometers.end")}
                      error={errors?.kilometers?.end?.message}
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
                          label="Lieu embarquement"
                          placeholder="Adresse de départ"
                          {...register(`courses.${index}.depart.lieu`)}
                          error={errors?.courses?.[index]?.depart?.lieu?.message}
                        />

                        <Input
                          label="Lieu débarquement"
                          placeholder="Adresse d'arrivée"
                          {...register(`courses.${index}.arrivee.lieu`)}
                          error={errors?.courses?.[index]?.arrivee?.lieu?.message}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <Input
                          label="Heure embarquement"
                          placeholder="HH:MM"
                          {...register(`courses.${index}.depart.heure`)}
                          error={errors?.courses?.[index]?.depart?.heure?.message}
                        />

                        <Input
                          label="Heure débarquement"
                          placeholder="HH:MM"
                          {...register(`courses.${index}.arrivee.heure`)}
                          error={errors?.courses?.[index]?.arrivee?.heure?.message}
                        />

                        <Input
                          label="Prix (€)"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          {...register(`courses.${index}.prix`)}
                          error={errors?.courses?.[index]?.prix?.message}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Input
                          label="Index départ"
                          placeholder="000"
                          type="number"
                          {...register(`courses.${index}.depart.index`)}
                          error={errors?.courses?.[index]?.depart?.index?.message}
                        />

                        <Input
                          label="Index arrivée"
                          placeholder="000"
                          type="number"
                          {...register(`courses.${index}.arrivee.index`)}
                          error={errors?.courses?.[index]?.arrivee?.index?.message}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

                        {watch(`courses.${index}.mode_paiement`) === "facture" && (
                          <Input
                            label="Client (pour facture)"
                            placeholder="Nom du client"
                            {...register(`courses.${index}.client`)}
                            error={errors?.courses?.[index]?.client?.message}
                          />
                        )}
                      </div>

                      <div className="mt-4">
                        <Input
                          label="Notes"
                          placeholder="Informations complémentaires"
                          {...register(`courses.${index}.notes`)}
                          error={errors?.courses?.[index]?.notes?.message}
                          as="textarea"
                          rows={2}
                        />
                      </div>
                    </Card>
                  ))}

                  <Button 
                    variant="outlined" 
                    className="w-full"
                    onClick={() => appendCourse({
                      depart: {
                        lieu: "",
                        index: 0,
                        heure: ""
                      },
                      arrivee: {
                        lieu: "",
                        index: 0,
                        heure: ""
                      },
                      prix: "",
                      mode_paiement: "cash",
                      client: "",
                      notes: ""
                    })}
                  >
                    + Ajouter une course
                  </Button>
                </div>
              </Card>

              {/* Section Charges */}
              <Card className="mt-4 p-4 sm:px-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                  Charges ({chargeFields.length})
                </h3>
                <div className="mt-5 space-y-5">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Controller
                          control={control}
                          name={`charges.${index}.mode_paiement`}
                          render={({ field }) => (
                            <Select
                              options={[
                                { value: "cash", label: "Cash" },
                                { value: "bancontact", label: "Bancontact" }
                              ]}
                              value={modesPaiement.find(m => m.value === field.value) || null}
                              onChange={(val) => field.onChange(val?.value)}
                              label="Mode paiement"
                              placeholder="Sélectionner"
                              getOptionLabel={(option) => option.label}
                              getOptionValue={(option) => option.value}
                              error={errors?.charges?.[index]?.mode_paiement?.message}
                            />
                          )}
                        />

                        <Input
                          label="Date"
                          type="date"
                          {...register(`charges.${index}.date`)}
                          error={errors?.charges?.[index]?.date?.message}
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
                      type: "divers",
                      montant: "",
                      mode_paiement: "cash",
                      description: "",
                      date: new Date().toISOString().split('T')[0]
                    })}
                  >
                    + Ajouter une charge
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
                      onChange={(val) => {
                        field.onChange(val.id);
                        setValue('header.vehicule', {
                          id: val.id,
                          plaque: val.plaque,
                          numero: val.numero
                        });
                      }}
                      name={field.name}
                      label="Véhicule"
                      placeholder="Sélectionner un véhicule"
                      displayField="label"
                      error={errors?.header?.vehicule?.id?.message}
                    />
                  )}
                  control={control}
                  name="header.vehicule.id"
                />

                <Controller
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Combobox
                      data={chauffeurs}
                      displayField={(item) => `${item.prenom} ${item.nom} (${item.badge})`}
                      value={chauffeurs.find((c) => c.id === value) || null}
                      onChange={(val) => {
                        onChange(val?.id);
                        setValue('header.chauffeur', {
                          id: val.id,
                          nom: val.nom,
                          prenom: val.prenom,
                          badge: val.badge
                        });
                      }}
                      placeholder="Sélectionner un chauffeur"
                      label="Chauffeur"
                      searchFields={["nom", "prenom", "badge"]}
                      error={errors?.header?.chauffeur?.id?.message}
                      highlight
                      {...rest}
                    />
                  )}
                  control={control}
                  name="header.chauffeur.id"
                />
              </Card>

              <Card className="p-4 sm:px-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                  Totaux calculés
                </h3>
                <div className="mt-3 space-y-3">
                  <div className="flex justify-between">
                    <Text>Recettes totales:</Text>
                    <Text>{watch('totals.recettes')?.toFixed(2) || '0.00'}€</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Charges totales:</Text>
                    <Text>{watch('totals.charges')?.toFixed(2) || '0.00'}€</Text>
                  </div>
                  <div className="flex justify-between font-bold">
                    <Text>Salaire calculé:</Text>
                    <Text>{watch('totals.salaire')?.toFixed(2) || '0.00'}€</Text>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:px-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
                  Validation
                </h3>
                <div className="mt-3 space-y-5">
                  <Controller
                  control={control}
                  name="validation.signature"
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Signature
                      </label>
                      <SignaturePad
                        ref={sigPadRef}
                        onSave={(signature) => {
                          field.onChange(signature);
                        }}
                        penColor="#000"
                        backgroundColor="#f9fafb"
                        height={120}
                      />
                      {errors?.validation?.signature?.message && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.validation.signature.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                  <Input
                    label="Notes"
                    placeholder="Informations complémentaires"
                    {...register("header.notes")}
                    error={errors?.header?.notes?.message}
                    as="textarea"
                    rows={3}
                  />
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </PageComponent>
  );
};

export default NewFeuilleRouteForm;