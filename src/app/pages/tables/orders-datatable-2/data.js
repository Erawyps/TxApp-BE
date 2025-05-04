import{ CheckBadgeIcon, PencilSquareIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

export const feuilleStatusOptions = [
    { value: 'validée', label: 'Validée', color: 'success', icon: CheckBadgeIcon },
    { value: 'en_cours', label: 'En Cours', color: 'primary', icon: PencilSquareIcon },
    { value: 'en_attente', label: 'En Attente', color: 'warning', icon: ClockIcon },
    { value: 'annulée', label: 'Annulée', color: 'error', icon: XCircleIcon },
];

export const feuillesRouteList = [
    {
        id: 1001,
        date: '2023-05-15',
        chauffeur: {
            id: 1,
            nom: 'Hasler Tehou',
            avatar: '/avatars/chauffeur1.jpg'
        },
        vehicule: {
            id: 1,
            plaque: 'TXAA171',
            modele: 'Mercedes Classe E'
        },
        heure_debut: '08:00',
        heure_fin: '16:30',
        total_heures: '8h30',
        km_debut: 12500,
        km_fin: 12680,
        km_parcourus: 180,
        recette_totale: 420.50,
        salaires: 126.15,
        charges: 45.00,
        benefice: 249.35,
        statut: 'validée',
        courses: [
            {
                lieu_depart: 'Gare Centrale',
                lieu_arrivee: 'Aéroport',
                heure_depart: '08:15',
                distance: 25,
                prix: 45.00,
                mode_paiement: 'cash'
            },
            {
                lieu_depart: 'Aéroport',
                lieu_arrivee: 'Centre Ville',
                heure_depart: '09:00',
                distance: 15,
                prix: 30.00,
                mode_paiement: 'credit_card'
            },
            {
                lieu_depart: 'Centre Ville',
                lieu_arrivee: 'Hôpital',
                heure_depart: '10:00',
                distance: 10,
                prix: 20.00,
                mode_paiement: 'cash'
            },
            {
                lieu_depart: 'Hôpital',
                lieu_arrivee: 'Gare Routière',
                heure_depart: '11:00',
                distance: 5,
                prix: 10.00,
                mode_paiement: 'credit_card'
            },
            // ... autres courses
        ]
    },
    {
        id: 1002,
        date: '2023-05-16',
        chauffeur: {
            id: 2,
            nom: 'Kouadio Kouassi',
            avatar: '/avatars/chauffeur2.jpg'
        },
        vehicule: {
            id: 2,
            plaque: 'TXAA172',
            modele: 'Peugeot 508'
        },
        heure_debut: '09:00',
        heure_fin: '17:00',
        total_heures: '8h00',
        km_debut: 13000,
        km_fin: 13150,
        km_parcourus: 150,
        recette_totale: 350.00,
        salaires: 105.00,
        charges: 40.00,
        benefice: 205.00,
        statut: 'en_cours',
        courses: [
            {
                lieu_depart: 'Aéroport',
                lieu_arrivee: 'Centre Ville',
                heure_depart: '09:30',
                distance: 20,
                prix: 30.00,
                mode_paiement: 'credit_card'
            },

            // ... autres courses
        ]
    },
    {
        id: 1003,
        date: '2023-05-17',
        chauffeur: {
            id: 3,
            nom: 'François Dupont',
            avatar: '/avatars/chauffeur3.jpg'
        },
        vehicule: {
            id: 3,
            plaque: 'TXAA173',
            modele: 'Renault Clio'
        },
        heure_debut: '10:00',
        heure_fin: '18:00',
        total_heures: '8h00',
        km_debut: 13500,
        km_fin: 13650,
        km_parcourus: 150,
        recette_totale: 300.00,
        salaires: 90.00,
        charges: 35.00,
        benefice: 175.00,
        statut: 'en_attente',
        courses: [
            {
                lieu_depart: 'Gare Routière',
                lieu_arrivee: 'Hôpital',
                heure_depart: '10:30',
                distance: 15,
                prix: 25.00,
                mode_paiement: 'cash'
            },

            // ... autres courses
        ]
    },
    {
        id: 1004,
        date: '2023-05-18',
        chauffeur: {
            id: 4,
            nom: 'Eric Boulanger',
            avatar: '/avatars/chauffeur4.jpg'
        },
        vehicule: {
            id: 4,
            plaque: 'TXAA174',
            modele: 'Toyota Corolla'
        },
        heure_debut: '11:00',
        heure_fin: '19:00',
        total_heures: '8h00',
        km_debut: 14000,
        km_fin: 14150,
        km_parcourus: 150,
        recette_totale: 280.00,
        salaires: 84.00,
        charges: 30.00,
        benefice: 166.00,
        statut: 'annulée',
        courses: [
            {
                lieu_depart: 'Aéroport',
                lieu_arrivee: 'Plage',
                heure_depart: '11:30',
                distance: 10,
                prix: 20.00,
                mode_paiement: 'credit_card'
            },

            // ... autres courses
        ]
    },
    {
        id: 1005,
        date: '2023-05-19',
        chauffeur: {
            id: 5,
            nom: 'Yassine Ben Salah',
            avatar: '/avatars/chauffeur5.jpg'
        },
        vehicule: {
            id: 5,
            plaque: 'TXAA175',
            modele: 'Ford Focus'
        },
        heure_debut: '12:00',
        heure_fin: '20:00',
        total_heures: '8h00',
        km_debut: 14500,
        km_fin: 14650,
        km_parcourus: 150,
        recette_totale: 320.00,
        salaires: 96.00,
        charges: 35.00,
        benefice: 189.00,
        statut: 'validée',
        courses: [
            {
                lieu_depart: 'Centre Ville',
                lieu_arrivee: 'Gare Routière',
                heure_depart: '12:30',
                distance: 25,
                prix: 50.00,
                mode_paiement: 'cash'
            },

            // ... autres courses
        ]
    },
    {
        id: 1006,
        date: '2023-05-20',
        chauffeur: {
            id: 6,
            nom: 'François Martin',
            avatar: '/avatars/chauffeur6.jpg'
        },
        vehicule: {
            id: 6,
            plaque: 'TXAA176',
            modele: 'Nissan Qashqai'
        },
        heure_debut: '13:00',
        heure_fin: '21:00',
        total_heures: '8h00',
        km_debut: 15000,
        km_fin: 15150,
        km_parcourus: 150,
        recette_totale: 360.00,
        salaires: 108.00,
        charges: 40.00,
        benefice: 212.00,
        statut: 'en_cours',
        courses: [
            {
                lieu_depart: 'Hôpital',
                lieu_arrivee: 'Aéroport',
                heure_depart: '13:30',
                distance: 30,
                prix: 60.00,
                mode_paiement: 'credit_card'
            },

            // ... autres courses
        ]
    },
    {
        id: 1007,
        date: '2023-05-21',
        chauffeur: {
            id: 7,
            nom: 'Sophie Dubois',
            avatar: '/avatars/chauffeur7.jpg'
        },
        vehicule: {
            id: 7,
            plaque: 'TXAA177',
            modele: 'Volkswagen Golf'
        },
        heure_debut: '14:00',
        heure_fin: '22:00',
        total_heures: '8h00',
        km_debut: 15500,
        km_fin: 15650,
        km_parcourus: 150,
        recette_totale: 400.00,
        salaires: 120.00,
        charges: 45.00,
        benefice: 235.00,
        statut: 'en_attente',
        courses: [
            {
                lieu_depart: 'Plage',
                lieu_arrivee: 'Centre Ville',
                heure_depart: '14:30',
                distance: 20,
                prix: 40.00,
                mode_paiement: 'cash'
            },

            // ... autres courses
        ]
    },
    {
        id: 1008,
        date: '2023-05-22',
        chauffeur: {
            id: 8,
            nom: 'Julien Lefevre',
            avatar: '/avatars/chauffeur8.jpg'
        },
        vehicule: {
            id: 8,
            plaque: 'TXAA178',
            modele: 'BMW Série 3'
        },
        heure_debut: '15:00',
        heure_fin: '23:00',
        total_heures: '8h00',
        km_debut: 16000,
        km_fin: 16150,
        km_parcourus: 150,
        recette_totale: 380.00,
        salaires: 114.00,
        charges: 42.00,
        benefice: 224.00,
        statut: 'annulée',
        courses: [
            {
                lieu_depart: 'Gare Centrale',
                lieu_arrivee: 'Aéroport',
                heure_depart: '15:30',
                distance: 25,
                prix: 50.00,
                mode_paiement: 'credit_card'
            },

            // ... autres courses
        ]
    },
    {
        id: 1009,
        date: '2023-05-23',
        chauffeur: {
            id: 9,
            nom: 'Claire Bernard',
            avatar: '/avatars/chauffeur9.jpg'
        },
        vehicule: {
            id: 9,
            plaque: 'TXAA179',
            modele: 'Audi A4'
        },
        heure_debut: '16:00',
        heure_fin: '00:00',
        total_heures: '8h00',
        km_debut: 16500,
        km_fin: 16650,
        km_parcourus: 150,
        recette_totale: 440.00,
        salaires: 132.00,
        charges: 50.00,
        benefice: 258.00,
        statut: 'validée',
        courses: [
            {
                lieu_depart: 'Centre Ville',
                lieu_arrivee: 'Gare Routière',
                heure_depart: '16:30',
                distance: 30,
                prix: 70.00,
                mode_paiement: 'cash'
            },

            // ... autres courses
        ]
    },
    {
        id: 1010,
        date: '2023-05-24',
        chauffeur: {
            id: 10,
            nom: 'Nadia Moreau',
            avatar: '/avatars/chauffeur10.jpg'
        },
        vehicule: {
            id: 10,
            plaque: 'TXAA180',
            modele: 'Mercedes Classe C'
        },
        heure_debut: '17:00',
        heure_fin: '01:00',
        total_heures: '8h00',
        km_debut: 17000,
        km_fin: 17150,
        km_parcourus: 150,
        recette_totale: 420.00,
        salaires: 126.00,
        charges: 45.00,
        benefice: 249.00,
        statut: 'en_cours',
        courses: [
            {
                lieu_depart: 'Aéroport',
                lieu_arrivee: 'Plage',
                heure_depart: '17:30',
                distance: 20,
                prix: 50.00,
                mode_paiement: 'credit_card'
            },

            // ... autres courses
        ]
    },
    {
        id: 1011,
        date: '2023-05-25',
        chauffeur: {
            id: 11,
            nom: 'David Petit',
            avatar: '/avatars/chauffeur11.jpg'
        },
        vehicule: {
            id: 11,
            plaque: 'TXAA181',
            modele: 'Peugeot 3008'
        },
        heure_debut: '18:00',
        heure_fin: '02:00',
        total_heures: '8h00',
        km_debut: 17500,
        km_fin: 17650,
        km_parcourus: 150,
        recette_totale: 460.00,
        salaires: 138.00,
        charges: 52.00,
        benefice: 270.00,
        statut: 'en_attente',
        courses: [
            {
                lieu_depart: 'Gare Routière',
                lieu_arrivee: 'Centre Ville',
                heure_depart: '18:30',
                distance: 25,
                prix: 60.00,
                mode_paiement: 'cash'
            },

            // ... autres courses
        ]
    },
    {
        id: 1012,
        date: '2023-05-26',
        chauffeur: {
            id: 12,
            nom: 'Sophie Martin',
            avatar: '/avatars/chauffeur12.jpg'
        },
        vehicule: {
            id: 12,
            plaque: 'TXAA182',
            modele: 'Renault Captur'
        },
        heure_debut: '19:00',
        heure_fin: '03:00',
        total_heures: '8h00',
        km_debut: 18000,
        km_fin: 18150,
        km_parcourus: 150,
        recette_totale: 500.00,
        salaires: 150.00,
        charges: 60.00,
        benefice: 290.00,
        statut: 'annulée',
        courses: [
            {
                lieu_depart: 'Aéroport',
                lieu_arrivee: 'Gare Centrale',
                heure_depart: '19:30',
                distance: 30,
                prix: 80.00,
                mode_paiement: 'credit_card'
            },

            // ... autres courses
        ]
    },
    {
        id: 1013,
        date: '2023-05-27',
        chauffeur: {
            id: 13,
            nom: 'Julien Lefevre',
            avatar: '/avatars/chauffeur13.jpg'
        },
        vehicule: {
            id: 13,
            plaque: 'TXAA183',
            modele: 'Skoda Octavia'
        },
        heure_debut: '20:00',
        heure_fin: '04:00',
        total_heures: '8h00',
        km_debut: 18500,
        km_fin: 18650,
        km_parcourus: 150,
        recette_totale: 540.00,
        salaires: 162.00,
        charges: 65.00,
        benefice: 313.00,
        statut: 'validée',
        courses: [
            {
                lieu_depart: 'Centre Ville',
                lieu_arrivee: 'Aéroport',
                heure_depart: '20:30',
                distance: 35,
                prix: 90.00,
                mode_paiement: 'cash'
            },

            // ... autres courses
        ]
    },
    {
        id: 1014,
        date: '2023-05-28',
        chauffeur: {
            id: 14,
            nom: 'Claire Bernard',
            avatar: '/avatars/chauffeur14.jpg'
        },
        vehicule: {
            id: 14,
            plaque: 'TXAA184',
            modele: 'Fiat 500'
        },
        heure_debut: '21:00',
        heure_fin: '05:00',
        total_heures: '8h00',
        km_debut: 19000,
        km_fin: 19150,
        km_parcourus: 150,
        recette_totale: 580.00,
        salaires: 174.00,
        charges: 70.00,
        benefice: 336.00,
        statut: 'en_cours',
        courses: [
            {
                lieu_depart: 'Gare Centrale',
                lieu_arrivee: 'Plage',
                heure_depart: '21:30',
                distance: 40,
                prix: 100.00,
                mode_paiement: 'credit_card'
            },

            // ... autres courses
        ]
    },
    // ... autres feuilles de route
];