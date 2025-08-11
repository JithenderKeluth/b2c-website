importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBBg0vwu574qvfa9DtUqGLkpDKm7xLBWZE",
  authDomain: "travelstart-b2c.firebaseapp.com",
  databaseURL: "https://travelstart-b2c-default-rtdb.firebaseio.com",
  projectId: "travelstart-b2c",
  storageBucket: "travelstart-b2c.firebasestorage.app",
  messagingSenderId: "944782183574",
  appId: "1:944782183574:web:2e9add407d2d83fcba86b7",
  measurementId: "G-645FYX81MG",
    vapidKey: "BFIS2bJmBSKfvRu6IKFHgoYyPwEnZVxy6oOsbD-clo-zPxoq1wue0W-HGRawg7j4xwcKEnefWVYl6iNSn0pAguI"
});

const messaging = firebase.messaging();
