# MyTasks React Native — Version Hybride (Local + Synchronisation API)

Application mobile de gestion de tâches utilisant une architecture **Offline-First** : stockage local immédiat via **AsyncStorage** couplé à une synchronisation automatique et par lot avec l'**API REST** (`backend/`).

## Fonctionnalités
- **Lecture & écriture locales instantanées** : fonctionne même sans connexion Internet (mode hors-ligne).
- **File d'attente hors-ligne** : toute création, modification ou suppression effectuée hors-ligne est mise en file d'attente dans `AsyncStorage`.
- **Synchronisation automatique & manuelle** : badge d'état en direct (`Synchronisé`, `Sync...`, `Hors-ligne (N)`), pull-to-refresh et bouton *Forcer la synchronisation* dans l'onglet **Profil**.

## Installation & Lancement

### 1. Démarrer le serveur Backend API
```bash
cd backend
npm install
npm start
```

### 2. Démarrer l'application React Native
Dans un autre terminal (à la racine du projet) :
```bash
npm install
npx expo start
```
- Appuyez sur `w` pour lancer dans le navigateur web (`http://localhost:3000/api`), ou scannez le QR code avec **Expo Go**.
