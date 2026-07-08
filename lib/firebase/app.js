/**
 * Firebase App Initialization
 * Initializes Firebase app with configuration
 */

import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./config";

/**
 * Initialize Firebase App
 * Checks if already initialized to prevent duplicate initialization
 */
const firebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export default firebaseApp;