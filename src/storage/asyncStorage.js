import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mytasks_tasks_local';

export const initialTasks = [
  {
    id: '1',
    title: 'Préparer la présentation',
    description: 'Réaliser les diapositives pour la présentation du projet.',
    priority: 'Élevée',
    status: 'À faire',
    createdAt: '12/04/2025',
  },
  {
    id: '2',
    title: 'Répondre aux emails',
    description: 'Traiter les messages urgents des clients et partenaires.',
    priority: 'Moyenne',
    status: 'À faire',
    createdAt: '12/04/2025',
  },
  {
    id: '3',
    title: 'Lire la documentation',
    description: 'Consulter la documentation officielle de React Native et AsyncStorage.',
    priority: 'Faible',
    status: 'Terminée',
    createdAt: '11/04/2025',
  },
  {
    id: '4',
    title: 'Développer la fonctionnalité',
    description: 'Implémenter la gestion de la persistance locale avec les filtres.',
    priority: 'Élevée',
    status: 'À faire',
    createdAt: '10/04/2025',
  },
  {
    id: '5',
    title: 'Tester l’application',
    description: 'Vérifier la création, modification et suppression des tâches.',
    priority: 'Faible',
    status: 'Terminée',
    createdAt: '09/04/2025',
  },
];

export const loadTasksFromStorage = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    // Premier lancement : charger les données d'exemple et les sauvegarder
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
    return initialTasks;
  } catch (e) {
    console.error('Erreur lors du chargement des tâches :', e);
    return initialTasks;
  }
};

export const saveTasksToStorage = async (tasks) => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Erreur lors de la sauvegarde des tâches :', e);
  }
};
