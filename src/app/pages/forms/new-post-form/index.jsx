// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { DocumentTextIcon, PrinterIcon, ShareIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

// Local Imports
import { shiftSchema } from "./schema";
import { Page } from "components/shared/Page";
import { Button } from "components/ui";
import { DriverInfo } from "./components/DriverInfo";
import { VehiculeInfo } from "./components/VehiculeInfo";
import { ServiceHours } from "./components/ServiceHours";
import { IndexReadings } from "./components/IndexReadings";
import { CourseForm } from "./components/CourseForm";
import { Summary } from "./components/Summary";



// ----------------------------------------------------------------------

const initialState = {
  date: new Date().toISOString().split('T')[0],
  chauffeur: {
    nom: "",
    prenom: "",
    numero_badge: ""
  },
  vehicule: {
    plaque_immatriculation: "",
    numero_identification: ""
  },
  service: {
    heure_debut: "",
    heure_fin: "",
    interruptions: "00:00",
    total_heures: "00:00"
  },
  index: {
    km_tableau_bord_debut: "",
    km_tableau_bord_fin: "",
    taximetre_debut: "",
    taximetre_fin: "",
    km_en_charge: "",
    chutes: "",
    recettes: ""
  },
  courses: []
};

const TxAppFeuilleRoute = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(shiftSchema),
    defaultValues: initialState,
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    try {
      console.log("Données de la feuille de route:", data);
      
      // Simulation d'une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Feuille de route sauvegardée avec succès! 📋", {
        description: `${data.courses.length} course(s) enregistrée(s)`,
        duration: 4000,
      });
      
      // Option de réinitialiser ou garder les données
      const keepDriverInfo = window.confirm(
        "Voulez-vous conserver les informations du chauffeur et du véhicule pour la prochaine feuille de route ?"
      );
      
      if (keepDriverInfo) {
        reset({
          ...initialState,
          chauffeur: data.chauffeur,
          vehicule: data.vehicule,
        });
      } else {
        reset();
      }
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde", {
        description: "Veuillez réessayer ou contacter le support technique",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const data = watch();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feuille-route-${data.date}-${data.chauffeur.nom}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Feuille de route exportée! 💾");
  };

  const courses = watch("courses") || [];
  const totalRecettes = courses.reduce((sum, course) => {
    return sum + (parseFloat(course.sommes_percues) || 0);
  }, 0);

  return (
    <Page title="Feuille de Route Taxi">
      <div className="transition-content px-(--margin-x) pb-6">
        {/* Header */}
        <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <DocumentTextIcon className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-dark-100">
                Feuille de Route Taxi
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gestion numérique des courses de taxi
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outlined" 
              onClick={handlePrint}
              icon={<PrinterIcon className="h-4 w-4" />}
              size="sm"
            >
              Imprimer
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleExport}
              icon={<ShareIcon className="h-4 w-4" />}
              size="sm"
            >
              Exporter
            </Button>
            <Button
              type="submit"
              form="feuille-route-form"
              disabled={isSubmitting}
              className="min-w-[8rem]"
            >
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {courses.length}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Course{courses.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalRecettes.toFixed(2)}€
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Recettes
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {watch("service.total_heures") || "00:00"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Durée service
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {watch("date") && new Date(watch("date")).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Feuille de route
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          id="feuille-route-form"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className="grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            {/* Left Column - Main Information */}
            <div className="col-span-12 lg:col-span-8 space-y-4 sm:space-y-5 lg:space-y-6">
              {/* Driver and Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                <DriverInfo 
                  register={register}
                  errors={errors}
                />
                <VehiculeInfo 
                  register={register}
                  errors={errors}
                />
              </div>

              {/* Service Hours */}
              <ServiceHours 
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />

              {/* Index Readings */}
              <IndexReadings 
                register={register}
                errors={errors}
              />

              {/* Courses */}
              <CourseForm 
                control={control}
                register={register}
                errors={errors}
                watch={watch}
              />
            </div>

            {/* Right Column - Summary */}
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-4">
                <Summary watch={watch} />
              </div>
            </div>
          </div>
        </form>

        {/* Mobile Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden">
          <Button
            type="submit"
            form="feuille-route-form"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Sauvegarde..." : "💾 Sauvegarder la feuille de route"}
          </Button>
        </div>
      </div>
    </Page>
  );
};

export default TxAppFeuilleRoute;