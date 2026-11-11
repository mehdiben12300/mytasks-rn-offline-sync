import { Platform } from 'react-native';

// Sur navigateur Web (PC), localhost fonctionne toujours (aucun souci de changement d'IP Wi-Fi).
// Sur téléphone (Expo Go), utilisez l'adresse IP affichée par le serveur backend (ex: 192.168.0.189).
export const DEFAULT_API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:3000/api'
    : 'http://192.168.0.189:3000/api';

let currentApiUrl = DEFAULT_API_URL;

export const getApiUrl = () => currentApiUrl;

export const setApiUrl = (newUrl) => {
  currentApiUrl = newUrl;
};
