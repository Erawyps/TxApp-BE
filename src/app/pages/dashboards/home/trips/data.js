import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export const tripStatusOptions = [
  {
    value: "completed",
    label: "Terminée",
    color: "success",
    icon: CheckCircleIcon,
  },
  {
    value: "in_progress",
    label: "En cours",
    color: "warning",
    icon: ClockIcon,
  },
  {
    value: "cancelled",
    label: "Annulée",
    color: "danger",
    icon: XCircleIcon,
  },
  {
    value: "to_invoice",
    label: "À facturer",
    color: "info",
    icon: DocumentTextIcon,
  },
  {
    value: "paid",
    label: "Payée",
    color: "primary",
    icon: BanknotesIcon,
  },
];

export const paymentMethods = [
  { value: "cash", label: "Espèces", icon: BanknotesIcon },
  { value: "invoice", label: "Facture", icon: DocumentTextIcon },
];

export const tripsList = [
  {
    trip_id: "TAXI-1001",
    start_time: new Date("2023-10-15T08:30:00").getTime(),
    driver: {
      id: "DRV-001",
      name: "Martin Dupont",
      avatar: "/avatars/driver-1.jpg",
    },
    vehicle: {
      id: "VH-001",
      plate: "TX-458-BE",
      model: "Toyota Prius"
    },
    client: {
      id: "CLT-001",
      name: "Hôpital Saint-Luc",
      type: "company"
    },
    pickup_location: "Gare Centrale",
    dropoff_location: "Hôpital Saint-Luc",
    earnings: 85.50,
    commission: 17.10, // 20% of earnings
    distance: 12.5, // km
    duration: 25, // minutes
    trip_status: "completed",
    payment: {
      method: "card",
      status: "paid",
      reference: "PAY-123456"
    },
    notes: "Patient avec équipement médical"
  },
  {
    trip_id: "TAXI-1002",
    start_time: new Date("2023-10-15T09:45:00").getTime(),
    driver: {
      id: "DRV-002",
      name: "Sophie Lambert",
      avatar: "/avatars/driver-2.jpg",
    },
    vehicle: {
      id: "VH-002", 
      plate: "TX-459-BE",
      model: "Mercedes Vito"
    },
    client: {
      id: "CLT-002",
      name: "Jean Dubois",
      type: "particulier"
    },
    pickup_location: "Aéroport",
    dropoff_location: "Centre Ville",
    earnings: 62.40,
    commission: 12.48,
    distance: 18.2,
    duration: 35,
    trip_status: "paid",
    payment: {
      method: "cash",
      status: "paid"
    }
  },
  {
    trip_id: "TAXI-1003",
    start_time: new Date("2023-10-15T11:20:00").getTime(),
    driver: {
      id: "DRV-001",
      name: "Martin Dupont",
      avatar: "/avatars/driver-1.jpg",
    },
    vehicle: {
      id: "VH-003",
      plate: "TX-460-BE",
      model: "BMW 5 Series"
    },
    client: {
      id: "CLT-003",
      name: "SNCB",
      type: "company"
    },
    pickup_location: "Gare du Midi",
    dropoff_location: "Gare Centrale",
    earnings: 45.00,
    commission: 9.00,
    distance: 8.5,
    duration: 15,
    trip_status: "to_invoice",
    payment: {
      method: "invoice",
      status: "pending"
    }
  },
];

export const driversList = [
  {
    id: "DRV-001",
    name: "Martin Dupont",
    phone: "+32 123 45 67 89",
    email: "m.dupont@taxi.be",
    license: "TAXI-12345",
    status: "active",
    avatar: "/avatars/driver-1.jpg"
  },
  {
    id: "DRV-002",
    name: "Sophie Lambert",
    phone: "+32 987 65 43 21", 
    email: "s.lambert@taxi.be",
    license: "TAXI-54321",
    status: "active",
    avatar: "/avatars/driver-2.jpg"
  },
  {
    id: "DRV-003",
    name: "Jean-Pierre Martin",
    phone: "+32 456 78 90 12",
    email: "jp.martin@taxi.be",
    license: "TAXI-67890",
    status: "inactive",
    avatar: "/avatars/driver-3.jpg"
  },
];

export const vehiclesList = [
  {
    id: "VH-001",
    plate: "TX-458-BE",
    model: "Toyota Prius",
    type: "Standard",
    year: 2020,
    capacity: 4
  },
  {
    id: "VH-002",
    plate: "TX-459-BE",
    model: "Mercedes Vito",
    type: "Van",
    year: 2021,
    capacity: 8
  },
  {
    id: "VH-003",
    plate: "TX-460-BE",
    model: "BMW 5 Series",
    type: "Luxury",
    year: 2022,
    capacity: 4
  }
];