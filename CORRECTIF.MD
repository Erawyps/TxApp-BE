# Résumé du Test de l'Application Chauffeur du 25/10

### Introduction

Ce document est un résumé étape par étape du test de l'application chauffeur. L'objectif était de simuler une journée de travail complète d'un chauffeur de taxi, depuis le début de son service jusqu'à sa fin, afin d'identifier les bugs, les problèmes d'ergonomie et les points d'amélioration critiques pour rendre l'application fonctionnelle et fiable.

---

### 1. Création de la Feuille de Route

La première étape du test a consisté à créer une nouvelle feuille de route pour la journée de travail. Cette action a immédiatement révélé un premier bug de calcul.

* **Action Effectuée :** Saisie des informations de début de service, incluant la date, les heures de début et de fin, le kilométrage du véhicule et le type de rémunération.
* **Premier Bug Identifié :** Le système calcule incorrectement la durée totale du service lorsque celui-ci se termine le lendemain de son commencement (par exemple, à minuit). Dans le cas testé, pour un service se terminant à minuit (J+1), l'application a affiché une durée négative de `-17h30`. Cet erreur de calcul fondamentale rend impossible la saisie correcte des heures pour les chauffeurs travaillant de nuit — un cas d'usage courant — bloquant de fait une part importante des utilisateurs.

Une fois la feuille de route créée, l'étape suivante a été d'y ajouter la première course de la journée.

---

### 2. Ajout de la Première Course : Une Cascade de Problèmes

L'ajout de la première course a mis en évidence une série d'anomalies, allant de données pré-remplies incorrectes à des notifications en double, créant une expérience utilisateur confuse et inefficace.

#### 2.1 Le Problème des Données Fantômes

Le formulaire pour enregistrer une nouvelle course n'était pas vide. Il contenait des informations issues d'un test précédent (des "placeholders"). Idéalement, ce formulaire devrait être vierge à chaque nouvelle saisie pour éviter que le chauffeur n'enregistre des données erronées par inadvertance.

#### 2.2 Une Saisie Redondante et Inefficace

Le chauffeur a dû de nouveau sélectionner le "type de rémunération" pour la course, alors que cette information avait déjà été définie lors de la création de la feuille de route. L'utilisateur suggère que le type de rémunération défini pour l'ensemble de la feuille de route soit appliqué par défaut à chaque course. L'interface devrait alors offrir une simple option de dérogation (par exemple, une case à cocher) pour les cas exceptionnels, plutôt que de forcer l'utilisateur à saisir la même information à plusieurs reprises.

#### 2.3 Erreurs de Validation et Notifications en Double

Le processus de validation lui-même est défaillant, présentant deux bugs consécutifs :

* **Champ Facultatif Requis :** Le système a bloqué l'enregistrement en exigeant de remplir le champ "index de départ", bien que celui-ci soit explicitement marqué comme "facultatif".
* **Notifications Dupliquées :** Une fois le formulaire correctement rempli et validé, l'application a affiché deux notifications identiques "Course ajoutée avec succès", ce qui peut faire douter l'utilisateur et lui faire croire que la course a été enregistrée en double.

Après avoir surmonté ces difficultés pour enregistrer la course, la tentative de la modifier a révélé des problèmes encore plus graves.

---

### 3. La Modification de Course : Des Données Perdues et un Ordre Bouleversé

La tentative de modification de la première course enregistrée a échoué et a mis en lumière trois bugs majeurs qui compromettent l'intégrité des données.

1. **Perte de Données :** En ouvrant le formulaire de modification, plusieurs informations qui venaient d'être saisies avaient disparu ou avaient été réinitialisées. Par exemple, le champ "index d'embarquement" était vide et le mode de paiement était revenu à une valeur incorrecte.
2. **Modification non Appliquée :** Après avoir corrigé les informations manquantes et validé les changements, l'affichage principal de la liste des courses n'a pas été mis à jour. Les anciennes données erronées étaient toujours visibles.
3. **Numéro d'Ordre Modifié :** C'est le bug le plus critique. En modifiant la course `001`, son numéro d'ordre a été changé en `002`. Ce bug corrompt l'intégrité légale et chronologique du journal de bord du chauffeur. Une feuille de route est un document officiel où la séquence des événements est non négociable. La renumérotation automatique des entrées rend l'ensemble du journal non fiable et potentiellement non conforme.

Ces problèmes ne sont pas des cas isolés, mais semblent révéler un problème plus profond dans la conception même du processus de création de course.

---

### 4. Suggestion d'Amélioration Majeure : Repenser le Processus de Création de Course

Le problème fondamental soulevé est que le processus actuel, qui oblige à saisir toutes les informations d'une course en une seule fois (du départ à l'arrivée), n'est pas adapté à la réalité du terrain, notamment à cause des coupures de réseau fréquentes. Cela engendre deux risques majeurs :

* Le risque pour le chauffeur de **perdre les données d'embarquement** s'il est contrôlé avant la fin de la course, ce qui peut lui valoir une amende de 180 €.
* L'impossibilité pour l'administration d'avoir une **vue en temps réel** de l'activité des chauffeurs, car les courses n'apparaissent dans le système qu'une fois terminées.

La solution proposée consiste à diviser la création d'une course en deux étapes distinctes pour sécuriser les données et permettre un suivi en direct.

1. **Étape 1 : Débuter une Course.** Le chauffeur clique sur "Débuter une course" et enregistre uniquement les informations de départ : `index de départ`, `index d'embarquement`, `lieu d'embarquement`, `heure d'embarquement` et `lieu de débarquement` (la destination). La course est alors immédiatement enregistrée dans le système avec un statut "En cours". Cela sécurise les informations initiales en cas de contrôle et informe l'administration qu'une course a commencé.
2. **Étape 2 : Terminer la Course.** Une fois arrivé à destination, le chauffeur sélectionne la course "En cours" dans sa liste. Il ajoute alors les informations de fin : `index de débarquement`, `heure de débarquement` et les détails de la tarification (`prix taximètre`, `somme perçue`, `mode de paiement`). La course passe alors au statut "Terminée".

Ce flux de travail en deux temps est non seulement plus sûr pour le chauffeur, mais il est aussi plus logique et permet un véritable suivi administratif.

---

### 5. Autres Bugs et Suggestions d'Amélioration

D'autres problèmes et suggestions ont été relevés au cours du test. Ils sont synthétisés dans le tableau ci-dessous.

| Fonctionnalité                  | Problème Identifié                                                                                    | Suggestion d'Amélioration                                                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Affichage des Courses**  | La vue actuelle est chargée et peu lisible (blocs larges, informations superflues).                    | Adopter un affichage en ligne, comme un tableau compact, montrant les informations essentielles de chaque course sur une seule ligne pour une meilleure vue d'ensemble.                              |
| **Modification de Course** | Une erreur générique "Erreur lors de l'enregistrement" bloque la modification de la deuxième course. | Investiguer et corriger la fonctionnalité de modification qui semble instable.                                                                                                                      |
| **Suppression de Course**  | La suppression d'une course échoue avec une erreur.                                                    | Rendre la fonctionnalité de suppression opérationnelle.                                                                                                                                            |
| **Tableau de Bord**        | La navigation n'est pas intuitive. Il n'y a pas de vue d'ensemble des feuilles de route.                | Créer une vue principale listant toutes les feuilles de route (en cours et terminées). Un clic sur une feuille mènerait à sa vue détaillée.                                                    |
| **Ajout d'une Dépense**   | Le champ "description" est obligatoire pour le carburant, ce qui n'est pas nécessaire.                 | Rendre le champ "description" facultatif pour les dépenses.                                                                                                                                         |
| **Fin de Service**         | Le processus pour terminer une feuille de route ouvre une nouvelle page.                                | Intégrer la fin de service dans une simple boîte de dialogue sur la page de la feuille de route. Cela rompt le flux de l'utilisateur en le forçant à changer de contexte pour une tâche simple. |

Ces différents points montrent que l'application nécessite des ajustements significatifs à la fois sur le plan technique et ergonomique.

---

### Conclusion et Prochaines Étapes

Le test révèle que, bien qu'une structure de base soit en place, l'application est actuellement inutilisable en conditions réelles. Les nombreux bugs, les problèmes de perte de données et, surtout, le défaut de conception fondamental du flux de création de course la rendent peu fiable et dangereuse pour un usage professionnel.

L'instruction finale est claire : il est  **impératif de se concentrer sur la correction et la refonte de la feuille de route chauffeur** . C'est le cœur de l'application et sa fonctionnalité principale. Tant que ce module n'est pas stable, fiable et adapté à la réalité du métier, il est impossible de poursuivre le développement d'autres fonctionnalités.

Il ne s'agit pas simplement d'une condition technique préalable, mais d'un impératif commercial critique. Un module de feuille de route fonctionnel et fiable est essentiel pour une prochaine démonstration à la "région Wallon", et tout retard supplémentaire risque de nous faire perdre cette opportunité stratégique au profit de concurrents.
