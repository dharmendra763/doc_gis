// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANJs7tC9I2tcYbq8eUOP5NeJ-jimQSLQo",
  authDomain: "docgis-7b391.firebaseapp.com",
  projectId: "docgis-7b391",
  storageBucket: "docgis-7b391.appspot.com",
  messagingSenderId: "885431900095",
  appId: "1:885431900095:web:0502565004207afad2f30a",
  measurementId: "G-5GW4T8YG9G"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

