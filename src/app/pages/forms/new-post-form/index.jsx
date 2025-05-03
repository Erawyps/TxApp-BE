// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { DocumentPlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { pdf, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

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
        <Text>(dénité de l&apos;exploitant)</Text>
      </View>
      
      {/* Section Véhicule */}
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Text>Date : {data.date}</Text>
        <Text style={{ marginLeft: 20 }}>Nom du chauffeur : {data.chauffeur}</Text>
      </View>
      
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.sectionTitle}>Véhicule</Text>
        <View style={{ flexDirection: 'row' }}>
          <Text>n° plaque d&apos;immatriculation : {data.plaque}</Text>
          <Text style={{ marginLeft: 20 }}>n° identification : {data.numero_identification}</Text>
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
              <Text style={styles.tableCell}>Début {data.heure_debut}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Fin {data.heure_fin}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Début {data.km_debut}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Interruptions</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Fin {data.km_fin}</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: '25%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Tableau Prise en charge */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.sectionTitle}>Prise en charge</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.tableCellHeader}>Prise en charge</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.tableCellHeader}>Index Km (Km totaux)</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.tableCellHeader}>Km en charge</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.tableCellHeader}>Chutes (€)</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '20%' }]}>
              <Text style={styles.tableCellHeader}>Recettes</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>Début</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{data.prise_en_charge_debut}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{data.km_debut}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{data.chutes_debut}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>Fin</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{data.prise_en_charge_fin}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{data.km_fin}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{data.chutes_fin}</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>Total</Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { width: '20%' }]}>
              <Text style={styles.tableCell}>{data.total}€</Text>
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
              <Text style={styles.tableCellHeader}>Prix taximètre</Text>
            </View>
            <View style={[styles.tableColHeader, { width: '10%' }]}>
              <Text style={styles.tableCellHeader}>Sommes perçues*</Text>
            </View>
          </View>
          
          {data.courses.map((course, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: '10%' }]}>
                <Text style={styles.tableCell}>{index + 1}</Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text style={styles.tableCell}>{course.index_depart}</Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text style={styles.tableCell}>
                  {course.lieu_embarquement} {course.heure_embarquement}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '25%' }]}>
                <Text style={styles.tableCell}>
                  {course.lieu_debarquement} {course.heure_debarquement}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: '15%' }]}>
                <Text style={styles.tableCell}>{course.prix_taximetre}€</Text>
              </View>
              <View style={[styles.tableCol, { width: '10%' }]}>
                <Text style={styles.tableCell}>
                  {course.prix_taximetre} {course.mode_paiement === 'facture' ? `(${course.client})` : '(cash)'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {/* Signature et calculs */}
      <View style={styles.signature}>
        <Text>Signature du chauffeur : {data.total} - {data.factures}</Text>
        <Text>- {data.factures} - {data.cash} = {data.salaire_cash}€</Text>
      </View>
      
      <View style={{ marginTop: 10 }}>
        <Text style={styles.sectionTitle}>COMPTE SALAIRE CASH</Text>
        <Text style={styles.calculation}>- {data.total}–180 = {data.salaire_part1} {">"} 30%</Text>
        <Text style={styles.calculation}>{data.salaire_part2}€ + 180 {'>'} 40% = {data.salaire_part3}€</Text>
        <Text style={styles.calculation}>= {data.salaire_total}€</Text>
        <Text style={styles.calculation}>= {data.salaire_cash}€</Text>
      </View>
      
      {data.notes && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.sectionTitle}>Notes:</Text>
          <Text>{data.notes}</Text>
        </View>
      )}
    </Page>
  </Document>
);

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
    watch,
    getValues
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

  const handlePreview = async () => {
    const formData = getValues();
    
    // Calcul des totaux
    const totalCourses = formData.courses.reduce((sum, course) => sum + parseFloat(course.prix_taximetre || 0), 0);
    const totalFactures = formData.courses
      .filter(c => c.mode_paiement === 'facture')
      .reduce((sum, course) => sum + parseFloat(course.prix_taximetre || 0), 0);
    const totalCash = formData.courses
      .filter(c => c.mode_paiement === 'cash')
      .reduce((sum, course) => sum + parseFloat(course.prix_taximetre || 0), 0);
    
    // Préparer les données pour le PDF
    const pdfData = {
      date: formData.date,
      chauffeur: chauffeurs.find(c => c.id === formData.chauffeur_id)?.name || '',
      plaque: vehicules.find(v => v.id === formData.vehicule_id)?.label.split(' - ')[0] || '',
      numero_identification: vehicules.find(v => v.id === formData.vehicule_id)?.label.split(' - ')[1] || '',
      heure_debut: formData.heure_debut,
      heure_fin: formData.heure_fin,
      km_debut: formData.km_debut,
      km_fin: formData.km_fin,
      prise_en_charge_debut: formData.prise_en_charge_debut,
      prise_en_charge_fin: formData.prise_en_charge_fin,
      chutes_debut: formData.chutes_debut,
      chutes_fin: formData.chutes_fin,
      courses: formData.courses.map(course => ({
        ...course,
        client: clients.find(cl => cl.id === course.client_id)?.name || ''
      })),
      total: totalCourses.toFixed(2),
      factures: totalFactures.toFixed(2),
      cash: totalCash.toFixed(2),
      salaire_part1: (totalCourses - 180).toFixed(2),
      salaire_part2: ((totalCourses - 180) * 0.3).toFixed(2),
      salaire_part3: (180 * 0.4).toFixed(2),
      salaire_total: ((totalCourses - 180) * 0.3 + 180 * 0.4).toFixed(2),
      salaire_cash: (totalCash - ((totalCourses - 180) * 0.3 + 180 * 0.4)).toFixed(2),
      notes: formData.notes
    };
    
    try {
      const blob = await pdf(<FeuilleRoutePDF data={pdfData} />).toBlob();
      saveAs(blob, `feuille_route_${formData.date || new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Une erreur est survenue lors de la génération du PDF");
    }
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
            <Button className="min-w-[7rem]" variant="outlined" onClick={() => reset()}>
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
    </PageComponent>
  );
};

export default NewFeuilleRouteForm;