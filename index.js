// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { html, render } from "lit-html";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  doc,
  runTransaction,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  getDatabase,
  child,
  get,
  onValue,
} from "firebase/database"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-OP6xCH6Mjk_fIjE72qlvkEe4cgST1k8",
  authDomain: "final-project-9900f.firebaseapp.com",
  projectId: "final-project-9900f",
  storageBucket: "final-project-9900f.appspot.com",
  messagingSenderId: "680888784335",
  appId: "1:680888784335:web:eae497e39825627ba06eba",
  measurementId: "G-BEGD4JP81N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

let aboutContent = [];
let recipeContent = [];
const aboutRef = collection(db, "about");
const recipeRef = collection(db, "newAllRecipes");

function view() {
  if (document.body.id === 'aboutMePage') {
    let aboutPageContent = document.getElementById("aboutPageContent");
    for (var i = 0; i < aboutContent.length; i++) {
      let p1 = document.createElement("p");
      console.log(aboutContent[i].content[0]);
      let p2 = document.createElement("p");
      p1.append(aboutContent[i].content[0]);
      p2.append(aboutContent[i].content[1]);
      aboutPageContent.append(p1);
      aboutPageContent.append(p2);
    }
  } else if (document.body.id === 'backendPage') {
    let submitAbout = document.getElementById("submitAbout");
    let submitRecipe = document.getElementById("submitRecipe");
    submitAbout.addEventListener("click", handleInput);
    submitRecipe.addEventListener("click", handleRecipeInput);

    let addAboutInputBtn = document.getElementById("addAboutInputBtn");
    let addRecipeInputBtn = document.getElementById("addRecipeInputBtn");
    addAboutInputBtn.addEventListener("click", addInputBox);
    addRecipeInputBtn.addEventListener("click", addRecipeInputBox);
  } else if (document.body.id === 'recipePage') {
    let recipePageContent = document.getElementById("recipePageContent");
    for (var i = 0; i < recipeContent.length; i++) {
      let p1 = document.createElement("p");
      let p2 = document.createElement("p");
      p1.append(recipeContent[i][0]);
      p2.append(recipeContent[i][1]);
      recipePageContent.append(p1);
      recipePageContent.append(p2);
    }
  } else if (document.body.id === 'allRecipesPage') {
    let allRecipesPageContent = document.getElementById("allRecipesPageContent");
    for (var i = 0 ; i < recipeContent.length; i++) {
      let p1 = document.createElement("p");
      let p2 = document.createElement("p");
      p1.append(recipeContent[i][0]);
      p2.append(recipeContent[i][1]);
      allRecipesPageContent.append(p1);
      allRecipesPageContent.append(p2);
    }
  }
}

// Add new input box when the user click the button
function addRecipeInputBox() {
  console.log("adding input box");
  let allchildren = [];
  let inputs = document.getElementById("recipeInputs");
  let inputCount = inputs.childElementCount + 1;

  let divInput = document.createElement("div");
  divInput.setAttribute("id", "step-"+inputCount);

  let newTitleP = document.createElement("p");
  newTitleP.textContent = "Step title";
  let newTitle = document.createElement("input");
  newTitle.setAttribute("type", "text");
  newTitle.setAttribute("class", "array");

  let newContentP = document.createElement("p");
  newContentP.textContent = "Step content";
  let newContent = document.createElement("input");
  newContent.setAttribute("type", "text");
  newContent.setAttribute("class", "array");

  allchildren.push(newTitleP, newTitle, newContentP, newContent);

  allchildren.forEach(element => {
    divInput.append(element);
  });
  inputs.appendChild(divInput);
}

// Add new input box when the user click the button
function addInputBox() {
  console.log("adding input box");
  let allchildren = [];
  let inputs = document.getElementById("aboutInputs");
  let inputCount = inputs.childElementCount + 1;

  let divInput = document.createElement("div");
  divInput.setAttribute("id", "about-"+inputCount);

  let newTitleP = document.createElement("p");
  newTitleP.textContent = "paragraph title";
  let newTitle = document.createElement("input");
  newTitle.setAttribute("type", "text");
  newTitle.setAttribute("class", "array");

  let newContentP = document.createElement("p");
  newContentP.textContent = "paragraph content";
  let newContent = document.createElement("input");
  newContent.setAttribute("type", "text");
  newContent.setAttribute("class", "array");

  allchildren.push(newTitleP, newTitle, newContentP, newContent);

  allchildren.forEach(element => {
    divInput.append(element);
  });
  inputs.appendChild(divInput);
}

render(view(), document.body);

function handleInput(e) {
  let returnAboutArray = [];
  let allInputs = document.getElementById("aboutInputs");
  for (var i = 0; i < allInputs.children.length; i++) {
    let currentAbout = allInputs.children[i].querySelectorAll(".array");
    let currentAboutArray = [];
    currentAboutArray.push(allInputs.children[i].id);
    let aboutContentArray = [];
    for (var k = 0; k < currentAbout.length; k++) {
      if (currentAbout[k].value != "") {
        aboutContentArray.push(currentAbout[k].value);
      }
    }
    currentAboutArray.push(aboutContentArray);
    returnAboutArray.push(currentAboutArray);
  }
  returnAboutArray.forEach((item) => sendMessage("about", item[0], item[1]));
}

function handleRecipeInput(e) {
  const map1 = new Map();
  let allRecipeInputs = document.getElementById("recipeInputs");
  let recipeName = document.getElementById("recipe-name").value;
  for (var i = 0; i < allRecipeInputs.children.length; i++) {
    let currentStep = allRecipeInputs.children[i].querySelectorAll(".array");
    let stepContentArray = [];
    for (var k = 0; k < currentStep.length; k++) {
      stepContentArray.push(currentStep[k].value);
    }
    map1.set(allRecipeInputs.children[i].id, stepContentArray);
  }
  sendMessage("newAllRecipes",recipeName, Object.fromEntries(map1));
}

async function sendMessage(collection, docID, message) {
  await setDoc(doc(db, collection, docID), {
    time: Date.now(),
    content: message
  });
}

async function getAllMessages() {
  const querySnapshot = await getDocs(
    query(aboutRef)
  );
  querySnapshot.forEach((doc) => {
    let msgData = doc.data();
    aboutContent.push(msgData);
  });

  let oneRecipeRef = doc(db, "newAllRecipes", "pizza");
  const docSnap = await getDoc(oneRecipeRef);
  let steps = docSnap.data();
  recipeContent.push(Object.values(steps['content']));
  console.log(recipeContent);
  render(view(), document.body);
}

getAllMessages();