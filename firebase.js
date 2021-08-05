import firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBTZ_WQFZrxhSXEKqhkGpxnqqo984SOmbg",
  authDomain: "plnnr-6c1ae.firebaseapp.com",
  projectId: "plnnr-6c1ae",
  storageBucket: "plnnr-6c1ae.appspot.com",
  messagingSenderId: "860010174740",
  appId: "1:860010174740:web:ddf1641aeb354909294a01",
  measurementId: "G-BNTEKWKWYM"
}
firebase.initializeApp(firebaseConfig);

export default firebase