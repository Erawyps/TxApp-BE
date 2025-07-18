import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export const tripStatusOptions = [
  {
    value: "En attente",
    label: "En attente",
    color: "warning",
    icon: ClockIcon,
  },
  {
    value: "Confirmée",
    label: "Confirmée",
    color: "info",
    icon: DocumentTextIcon,
  },
  {
    value: "En cours",
    label: "En cours",
    color: "primary",
    icon: ClockIcon,
  },
  {
    value: "Terminée",
    label: "Terminée",
    color: "success",
    icon: CheckCircleIcon,
  },
  {
    value: "Annulée",
    label: "Annulée",
    color: "danger",
    icon: XCircleIcon,
  },
  {
    value: "Facturée",
    label: "Facturée",
    color: "success",
    icon: DocumentTextIcon,
  },
];

export const paymentMethods = [
  { value: "Cash", label: "Espèces", color: "success" },
  { value: "Bancontact", label: "Bancontact", color: "primary" },
  { value: "Facture", label: "Facture", color: "info" },
  { value: "Virement", label: "Virement", color: "primary" },
];

export const tripsList = [
  {
    id: 1,
    feuille_route_id: 1,
    client_id: 1,
    reference: "TR-001",
    lieu_embarquement: "Gare Centrale, Bruxelles",
    lieu_debarquement: "Hôpital Saint-Luc",
    heure_embarquement: new Date("2023-10-15T08:30:00").getTime(),
    heure_debarquement: new Date("2023-10-15T08:55:00").getTime(),
    prix_base: 80.00,
    supplement: 5.50,
    remise: 0.00,
    prix_final: 85.50,
    distance_km: 12.5,
    duree_minutes: 25,
    mode_paiement: "Bancontact",
    type_course: "Normal",
    statut: "Terminée",
    notes: "Patient avec équipement médical",
    chauffeur: {
      id: 1,
      nom: "Martin Dupont",
      avatar: "/avatars/driver-1.jpg",
    },
    vehicule: {
      id: 1,
      plaque_immatriculation: "TX-458-BE",
      modele: "Toyota Prius"
    },
    client: {
      id: 1,
      nom: "Hôpital Saint-Luc",
      type_client: "Société"
    }
  },
  {
    id: 2,
    feuille_route_id: 1,
    client_id: 2,
    reference: "TR-002",
    lieu_embarquement: "Aéroport de Bruxelles",
    lieu_debarquement: "Grand Place, Bruxelles",
    heure_embarquement: new Date("2023-10-15T09:45:00").getTime(),
    heure_debarquement: new Date("2023-10-15T10:20:00").getTime(),
    prix_base: 60.00,
    supplement: 2.40,
    remise: 0.00,
    prix_final: 62.40,
    distance_km: 18.2,
    duree_minutes: 35,
    mode_paiement: "Cash",
    type_course: "Aéroport",
    statut: "Terminée",
    chauffeur: {
      id: 2,
      nom: "Sophie Lambert",
      avatar: "/avatars/driver-2.jpg",
    },
    vehicule: {
      id: 2,
      plaque_immatriculation: "TX-459-BE",
      modele: "Mercedes Vito"
    },
    client: {
      id: 2,
      nom: "Jean Dubois",
      type_client: "Particulier"
    }
  }
];

export const driversList = [
  {
    id: 1,
    nom: "Martin Dupont",
    telephone: "+32 123 45 67 89",
    email: "m.dupont@taxi.be",
    numero_badge: "CH-001",
    status: "active",
    avatar: "/avatars/driver-1.jpg"
  },
  {
    id: 2,
    nom: "Sophie Lambert", 
    telephone: "+32 987 65 43 21",
    email: "s.lambert@taxi.be",
    numero_badge: "CH-002",
    status: "active",
    avatar: "/avatars/driver-2.jpg"
  }
];

export const vehiclesList = [
  {
    id: 1,
    plaque_immatriculation: "TX-458-BE",
    numero_identification: "VH-001",
    marque: "Toyota",
    modele: "Prius",
    type_vehicule: "Eco",
    annee: 2020,
    capacite: 4
  },
  {
    id: 2,
    plaque_immatriculation: "TX-459-BE",
    numero_identification: "VH-002",
    marque: "Mercedes",
    modele: "Vito",
    type_vehicule: "Van",
    annee: 2021,
    capacite: 8
  }
];