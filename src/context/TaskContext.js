import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import syncService from '../services/syncService';
import { initialTasks } from '../storage/asyncStorage';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'offline'
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Mettre à jour le compteur d'actions hors-ligne en attente
  const updatePendingCount = async () => {
    const queue = await syncService.getPendingQueue();
    setPendingCount(queue.length);
  };

  // Synchronisation avec l'API
  const triggerSync = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const result = await syncService.synchronize();
      setTasks(result.tasks);
      setLastSyncTime(result.lastSync);
      setPendingCount(0);
      setSyncStatus('synced');
      return true;
    } catch (err) {
      console.log('Mode hors-ligne ou serveur inaccessible:', err.message);
      setSyncStatus('offline');
      await updatePendingCount();
      return false;
    }
  }, []);

  // Chargement initial (Offline-first : lecture locale immédiate, puis sync en arrière-plan)
  useEffect(() => {
    const initialize = async () => {
      try {
        let localTasks = await syncService.getLocalTasks();
        if (!localTasks || localTasks.length === 0) {
          // Premier lancement : sauvegarder les données initiales
          localTasks = initialTasks;
          await syncService.saveLocalTasks(initialTasks);
        }
        setTasks(localTasks);

        const lastSync = await syncService.getLastSyncTime();
        if (lastSync) setLastSyncTime(lastSync);

        await updatePendingCount();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        // Tenter une synchronisation dès le démarrage
        triggerSync();
      }
    };

    initialize();
  }, [triggerSync]);

  // Ajouter une tâche
  const addTask = async ({ title, description, priority }) => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(
      today.getMonth() + 1
    ).padStart(2, '0')}/${today.getFullYear()}`;

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Moyenne',
      status: 'À faire',
      createdAt: formattedDate,
    };

    // 1. Sauvegarde locale immédiate (instantané pour l'utilisateur)
    const updated = [newTask, ...tasks];
    setTasks(updated);
    await syncService.saveLocalTasks(updated);

    // 2. Enregistrement de l'action dans la file de sync
    await syncService.addPendingAction({ type: 'create', task: newTask });
    await updatePendingCount();

    // 3. Tenter la synchronisation en arrière-plan
    triggerSync();

    return newTask;
  };

  // Modifier une tâche
  const updateTask = async (id, updatedFields) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTasks(updated);
    await syncService.saveLocalTasks(updated);

    await syncService.addPendingAction({
      type: 'update',
      task: { id, ...updatedFields },
    });
    await updatePendingCount();

    triggerSync();
  };

  // Supprimer une tâche
  const deleteTask = async (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    await syncService.saveLocalTasks(updated);

    await syncService.addPendingAction({ type: 'delete', id });
    await updatePendingCount();

    triggerSync();
  };

  const getTask = (id) => {
    return tasks.find((t) => String(t.id) === String(id));
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Terminée').length;
    const pending = tasks.filter((t) => t.status === 'À faire').length;
    return { total, completed, pending };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        syncStatus,
        lastSyncTime,
        pendingCount,
        stats,
        triggerSync,
        addTask,
        updateTask,
        deleteTask,
        getTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
