import { Button } from "components/ui";
import { Link } from "react-router";

export function ValidationComplete() {
  // Removed unused theme variable
  return (
    <div className="h-full text-center">
      <div className="mx-auto h-auto w-56 sm:w-64">
        <svg /* Icône de validation */ />
      </div>
      <p className="mt-6 pt-4 text-xl font-semibold text-gray-800 dark:text-dark-50">
        Feuille de route validée
      </p>
      <p className="mx-auto mt-2 max-w-(--breakpoint-lg) text-balance sm:px-5">
        La feuille de route a été enregistrée avec succès. Vous pouvez maintenant 
        consulter le récapitulatif ou retourner à l&apos;accueil.
      </p>
      <div className="mt-8 space-x-4">
        <Button
          color="primary"
          className="px-10"
          to="/feuilles-de-route"
        >
          Voir le récapitulatif
        </Button>
        <Button
          className="px-10"
          to="/"
          component={Link}
        >
          Retour à l&apos;accueil
        </Button>
      </div>
    </div>
  );
}