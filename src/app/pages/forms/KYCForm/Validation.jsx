import { Link } from "react-router";
import { Button } from "components/ui";

export function Validation() {
  // Removed unused theme variable
  return (
    <div className="h-full text-center">
      <p className="mt-6 pt-4 text-xl font-semibold text-gray-800 dark:text-dark-50">
        Feuille de route validée avec succès
      </p>
      <p className="mx-auto mt-2 max-w-(--breakpoint-lg) text-balance sm:px-5">
        La feuille de route a été enregistrée dans le système. Vous pouvez 
        maintenant consulter l&apos;historique ou créer une nouvelle feuille de route.
      </p>
      <div className="mt-8 flex justify-center space-x-4">
        <Button
          color="primary"
          className="px-10"
          to="/feuilles-route"
          component={Link}
        >
          Voir l&apos;historique
        </Button>
        <Button
          color="primary"
          variant="outline"
          className="px-10"
          to="/nouvelle-feuille-route"
          component={Link}
        >
          Nouvelle feuille
        </Button>
      </div>
    </div>
  );
}