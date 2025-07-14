/* ---------- Firebase & Toast logic (modular) ---------- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZV79Oqv0vO8ssquSr_le1w_Za0vJT6JE",
  authDomain: "roe-expense.firebaseapp.com",
  projectId: "roe-expense",
  storageBucket: "roe-expense.appspot.com",
  messagingSenderId: "1009693087819",
  appId: "1:1009693087819:web:c4e3a256c7ead97a6e15ce"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const provider = new GoogleAuthProvider();

/* ---- DOM refs ---- */
const authCard=document.getElementById("auth-section"),
      appCard =document.getElementById("app-section"),
      signBtn =document.getElementById("google-btn"),
      logoutBtn=document.getElementById("logout-btn"),
      listBody=document.getElementById("expense-list"),
      form   =document.getElementById("expense-form"),
      totalSpan=document.getElementById("total-amount"),
      exportBtn=document.getElementById("export-btn"),
      progress=document.getElementById("budget-progress"),
      nameEl=document.getElementById("user-name"),
      emailEl=document.getElementById("user-email"),
      photoEl=document.getElementById("user-photo");

const toast = msg => Toastify({text:msg,duration:3000,gravity:"bottom",style:{background:"#28a745"}}).showToast();
const MONTHLY_BUDGET = 50000;

/* ---- Helpers ---- */
const fmt = iso => new Date(iso).toLocaleDateString("en-GB");
const col = uid => collection(db,`users/${uid}/expenses`);

/* ---- Auth handlers ---- */
signBtn.onclick   = () => signInWithPopup(auth,provider).catch(e=>toast(e.message));
logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, async user=>{
  if(!user){authCard.style.display="block";appCard.style.display="none";return;}
  nameEl.textContent=user.displayName||""; emailEl.textContent=user.email;
  photoEl.src=user.photoURL||`https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName||"U")}`;
  authCard.style.display="none"; appCard.style.display="block";
  await loadExpenses(user.uid);
  form.onsubmit=e=>{e.preventDefault(); addExpense(user.uid);};
  exportBtn.onclick=()=>downloadCSV(user.uid);
});

/* ---- Load / render ---- */
async function loadExpenses(uid){
  listBody.innerHTML="";
  const snap=await getDocs(query(col(uid),orderBy("date","desc")));
  let tot=0,i=1;
  snap.forEach(d=>{
    const e=d.data(); tot+=Number(e.amount);
    listBody.insertAdjacentHTML("beforeend",`
     <tr>
      <td>${i++}</td><td>${e.name}</td><td>KSH ${Number(e.amount).toFixed(2)}</td>
      <td>${e.category}</td><td>${fmt(e.date)}</td>
      <td><button style="background:#e74c3c;color:#fff"
                  onclick="delExp('${uid}','${d.id}')">Delete</button></td>
     </tr>
    `);
  });
  totalSpan.textContent=tot.toFixed(2);
  updateBudgetBar(tot);
}

window.delExp = async (uid,id)=>{
  if(!confirm("Delete?"))return;
  await deleteDoc(doc(db,`users/${uid}/expenses/${id}`));
  toast("Deleted");
  loadExpenses(uid);
};

async function addExpense(uid){
  const name=document.getElementById("expense-name").value.trim(),
        amt=parseFloat(document.getElementById("expense-amount").value),
        cat=document.getElementById("expense-category").value,
        date=document.getElementById("expense-date").value;
  if(!name||!amt||!cat||!date)return toast("Fill all fields!");
  await addDoc(col(uid),{name,amount:amt,category:cat,date});
  toast("Expense added");
  form.reset();
  loadExpenses(uid);
}

/* ---- CSV Export ---- */
async function downloadCSV(uid){
  const snap=await getDocs(query(col(uid),orderBy("date","desc")));
  if(snap.empty)return toast("No data to export!");
  let csv="Name,Amount,Category,Date\n";
  snap.forEach(d=>{const e=d.data();csv+=`"${e.name}",${e.amount},"${e.category}","${fmt(e.date)}"\n`;});
  const blob=new Blob([csv],{type:"text/csv"}),url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="expenses.csv";document.body.appendChild(a);a.click();document.body.removeChild(a);
  toast("CSV downloaded");
}

/* ---- Budget progress ---- */
function updateBudgetBar(current){
  progress.style.width=Math.min(100,(current/MONTHLY_BUDGET)*100)+"%";
}
