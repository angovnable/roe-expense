/* ============================ */
/*     ROE Expense app.js       */
/* ============================ */

/* 1️⃣  IMPORT SDKs (modular v9) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc,
         doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* 2️⃣  YOUR CONFIG (copy from Firebase Console > Project Settings > Web app) */
const firebaseConfig = {
  aapiKey: "AIzaSyDZV79Oqv0vO8ssquSr_le1w_Za0vJT6JE",
  authDomain: "roe-expense.firebaseapp.com",
  projectId: "roe-expense",
  storageBucket: "roe-expense.firebasestorage.app",
  messagingSenderId: "1009693087819",
  appId: "1:1009693087819:web:c4e3a256c7ead97a6e15ce",
  measurementId: "G-6YFC12KCFJ"
};

/* 3️⃣  INITIALIZE */
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const provider = new GoogleAuthProvider();

/* 4️⃣  DOM SHORTCUTS */
const $ = id => document.getElementById(id);
const toast = msg => Toastify({text:msg,duration:3000,gravity:"bottom",style:{background:"#28a745"}}).showToast();

/* elements */
const authCard  = $("auth-section");
const appCard   = $("app-section");
const listBody  = $("expense-list");
const form      = $("expense-form");
const totalOut  = $("total-amount");
const progress  = $("budget-progress");
const exportBtn = $("export-btn");
const nameEl    = $("user-name");
const emailEl   = $("user-email");
const photoEl   = $("user-photo");

const MONTHLY_BUDGET = 50000;

/* 5️⃣  SIGN‑IN / SIGN‑OUT */
$("google-btn").onclick = () => signInWithPopup(auth, provider).catch(e=>toast(e.message));
$("logout-btn").onclick = () => signOut(auth);

/* 6️⃣  AUTH STATE LISTENER */
onAuthStateChanged(auth, async user => {
  if (!user){
    authCard.style.display="block";
    appCard.style.display="none";
    return;
  }
  nameEl.textContent  = user.displayName || "";
  emailEl.textContent = user.email;
  photoEl.src         = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName||"U")}`;

  authCard.style.display="none";
  appCard.style.display="block";

  await loadExpenses(user.uid);
  form.onsubmit = e => { e.preventDefault(); addExpense(user.uid); };
  exportBtn.onclick = () => downloadCSV(user.uid);
});

/* 7️⃣  FIRESTORE PATH */
const col = uid => collection(db, `users/${uid}/expenses`);
const fmt = iso => new Date(iso).toLocaleDateString("en-GB");

/* 8️⃣  LOAD & RENDER */
async function loadExpenses(uid){
  const snap = await getDocs(query(col(uid), orderBy("date","desc")));
  listBody.innerHTML = "";
  let total = 0, idx = 1;

  snap.forEach(d=>{
    const e=d.data(); total += Number(e.amount);
    listBody.insertAdjacentHTML("beforeend",`
      <tr>
        <td>${idx++}</td>
        <td>${e.name}</td>
        <td>KSH ${Number(e.amount).toFixed(2)}</td>
        <td>${e.category}</td>
        <td>${fmt(e.date)}</td>
        <td><button style="background:#e74c3c;color:#fff"
                    onclick="delExp('${uid}','${d.id}')">Delete</button></td>
      </tr>
    `);
  });
  totalOut.textContent = total.toFixed(2);
  updateBudgetBar(total);
}

/* 9️⃣  ADD / DELETE */
async function addExpense(uid){
  const name = $("expense-name").value.trim(),
        amt  = parseFloat($("expense-amount").value),
        cat  = $("expense-category").value,
        date = $("expense-date").value;
  if(!name||!amt||!cat||!date) return toast("Fill all fields!");
  await addDoc(col(uid), { name, amount: amt, category: cat, date });
  toast("Expense added");
  form.reset();
  loadExpenses(uid);
}
window.delExp = async (uid,id)=>{
  if(!confirm("Delete?")) return;
  await deleteDoc(doc(db,`users/${uid}/expenses/${id}`));
  toast("Deleted");
  loadExpenses(uid);
};

/* 🔟  CSV EXPORT */
async function downloadCSV(uid){
  const snap = await getDocs(query(col(uid), orderBy("date","desc")));
  if (snap.empty) return toast("No data to export!");
  let csv = "Name,Amount,Category,Date\\n";
  snap.forEach(d=>{const e=d.data(); csv+=\`"\${e.name}",\${e.amount},"$\{e.category\}","\${fmt(e.date)}"\\n\`;});
  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "expenses.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast("CSV downloaded");
}

/* 11️⃣  BUDGET BAR */
function updateBudgetBar(total){
  progress.style.width = Math.min(100,(total/MONTHLY_BUDGET)*100) + "%";
}
