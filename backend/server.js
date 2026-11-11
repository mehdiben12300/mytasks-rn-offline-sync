const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

// Données initiales conformes à la maquette de l'Image 1
const initialTasks = [
  {
    id: '1',
    title: 'Préparer la présentation',
    description: 'Réaliser les diapositives pour la présentation du projet.',
    priority: 'Élevée',
    status: 'À faire',
    createdAt: '12/04/2025',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Répondre aux emails',
    description: 'Traiter les messages urgents des clients et partenaires.',
    priority: 'Moyenne',
    status: 'À faire',
    createdAt: '12/04/2025',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Lire la documentation',
    description: 'Consulter la documentation officielle de React Native et AsyncStorage.',
    priority: 'Faible',
    status: 'Terminée',
    createdAt: '11/04/2025',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Développer la fonctionnalité',
    description: 'Implémenter la gestion de la persistance locale avec les filtres.',
    priority: 'Élevée',
    status: 'À faire',
    createdAt: '10/04/2025',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Tester l’application',
    description: 'Vérifier la création, modification et suppression des tâches.',
    priority: 'Faible',
    status: 'Terminée',
    createdAt: '09/04/2025',
    updatedAt: new Date().toISOString(),
  },
];

// Lecture des données
function getTasks() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialTasks, null, 2), 'utf-8');
    return initialTasks;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erreur lecture tasks.json, réinitialisation :', err);
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialTasks, null, 2), 'utf-8');
    return initialTasks;
  }
}

// Écriture des données
function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

// 1. Lister toutes les tâches
app.get('/api/tasks', (req, res) => {
  const tasks = getTasks();
  res.json(tasks);
});

// 2. Obtenir une tâche par son ID
app.get('/api/tasks/:id', (req, res) => {
  const tasks = getTasks();
  const task = tasks.find((t) => String(t.id) === String(req.params.id));
  if (!task) {
    return res.status(404).json({ message: 'Tâche non trouvée' });
  }
  res.json(task);
});

// 3. Créer une nouvelle tâche
app.post('/api/tasks', (req, res) => {
  const { title, description, priority, status } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Le titre est obligatoire' });
  }

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(
    today.getMonth() + 1
  ).padStart(2, '0')}/${today.getFullYear()}`;

  const tasks = getTasks();
  const newTask = {
    id: Date.now().toString(),
    title: title.trim(),
    description: description ? description.trim() : '',
    priority: priority || 'Moyenne',
    status: status || 'À faire',
    createdAt: formattedDate,
    updatedAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  saveTasks(tasks);

  res.status(201).json(newTask);
});

// 4. Modifier une tâche existante
app.put('/api/tasks/:id', (req, res) => {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => String(t.id) === String(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Tâche non trouvée' });
  }

  const existing = tasks[index];
  const updatedTask = {
    ...existing,
    ...req.body,
    id: existing.id, // Ne pas écraser l'ID
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updatedTask;
  saveTasks(tasks);

  res.json(updatedTask);
});

// 5. Supprimer une tâche
app.delete('/api/tasks/:id', (req, res) => {
  let tasks = getTasks();
  const exists = tasks.some((t) => String(t.id) === String(req.params.id));

  if (!exists) {
    return res.status(404).json({ message: 'Tâche non trouvée' });
  }

  tasks = tasks.filter((t) => String(t.id) !== String(req.params.id));
  saveTasks(tasks);

  res.json({ message: 'Tâche supprimée avec succès', id: req.params.id });
});

// 6. Synchronisation par lot (utilisé par le projet local+enligne)
app.post('/api/tasks/sync', (req, res) => {
  const { changes = [] } = req.body;
  let tasks = getTasks();

  changes.forEach((action) => {
    if (action.type === 'create') {
      const exists = tasks.some((t) => t.id === action.task.id);
      if (!exists) {
        tasks.unshift({
          ...action.task,
          updatedAt: new Date().toISOString(),
        });
      }
    } else if (action.type === 'update') {
      const idx = tasks.findIndex((t) => String(t.id) === String(action.task.id));
      if (idx !== -1) {
        tasks[idx] = {
          ...tasks[idx],
          ...action.task,
          updatedAt: new Date().toISOString(),
        };
      }
    } else if (action.type === 'delete') {
      tasks = tasks.filter((t) => String(t.id) !== String(action.id));
    }
  });

  saveTasks(tasks);
  res.json({ success: true, tasks });
});

// 7. Réinitialiser les données aux tâches par défaut
app.post('/api/tasks/reset', (req, res) => {
  saveTasks(initialTasks);
  res.json({ message: 'Données réinitialisées avec succès', tasks: initialTasks });
});

// Trouver l'adresse IP locale Wi-Fi de la machine
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && !name.toLowerCase().includes('vmware') && !name.toLowerCase().includes('vethernet')) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================================');
  console.log(`🚀 Serveur API REST MyTasks démarré avec succès !`);
  console.log(`📡 URL Locale (PC)   : http://localhost:${PORT}/api/tasks`);
  console.log(`📱 URL Réseau (Mobile): http://${localIp}:${PORT}/api/tasks`);
  console.log('========================================================');
});
