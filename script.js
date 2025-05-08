// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDF6cOt8GqGNa3n3WSDx_UXjuLvDFL2_ow",
  authDomain: "ramkrishna-pharmacy.firebaseapp.com",
  projectId: "ramkrishna-pharmacy",
  storageBucket: "ramkrishna-pharmacy.firebasestorage.app",
  messagingSenderId: "658048554480",
  appId: "1:658048554480:web:ea82a8a8f82590eef53935",
  measurementId: "G-P0K9JN0D0L"
};

  // Initialize Firebase App & Firestore
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);


// Redirect to login if not logged in
if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
  window.location.href = 'login.html';
}



// sidebar toggle
const toggleBtn = document.getElementById('toggleBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('active');
});


//Log out
document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("isAdminLoggedIn");
  window.location.href = "login.html";
});




// Doctor available section
const doctorCollection = collection(db, "doctors");

// DOM Elements
const doctorSlider = document.getElementById("doctorSlider");
const addDoctorBtn = document.getElementById("addDoctorBtn");
const addDoctorModal = document.getElementById("addDoctorModal");
const closeModal = document.getElementById("closeModal");
const doctorForm = document.getElementById("doctorForm");

const docId = document.getElementById("docId");
const docNameInput = document.getElementById("docName");
const docSpecializationInput = document.getElementById("docSpecialization");
const docImageInput = document.getElementById("docImage");
const docFeesInput = document.getElementById("docFees");
const docDescriptionInput = document.getElementById("docDescription");

let editDocId = null; // Tracks if we're editing

// Open Modal
addDoctorBtn.addEventListener("click", () => {
  editDocId = null;
  doctorForm.reset();
  addDoctorModal.style.display = "flex";
  docId.disabled = false; // Enable ID input when adding new doctor
});

// Close Modal
closeModal.addEventListener("click", () => {
  addDoctorModal.style.display = "none";
});

// Handle Form Submission
doctorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const doctorId = docId.value.trim(); // Ensure no leading/trailing whitespace

  if (!doctorId) {
    alert("Please provide a valid Doctor ID.");
    return;
  }

  const doctorData = {
    doctorId,
    name: docNameInput.value,
    specialization: docSpecializationInput.value,
    imageUrl: docImageInput.value,
    fees: docFeesInput.value,
    description: docDescriptionInput.value
  };

  try {
    const docRef = doc(db, "doctors", doctorId); // Use doctorId as document ID
    await setDoc(docRef, doctorData);
    
    doctorForm.reset();
    addDoctorModal.style.display = "none";
    editDocId = null;
  } catch (error) {
    console.error("Error saving doctor data:", error);
    alert("Failed to save doctor. Please try again.");
  }
});


// Render Doctor Card to DOM
function renderDoctorCard(id, data) {
  const { name, specialization, imageUrl, fees, description } = data;

  const card = document.createElement("div");
  card.className = "doctor-card";
  card.setAttribute("data-id", id);
  card.innerHTML = `
    <img src="${imageUrl}" alt="${name}">
    <h4>${name}</h4>  
    <p class="desc">${description}</p>
    <p class="spec"><strong>Specialization: </strong>${specialization}</p>
    <p class="fees"><strong>Fees: </strong>₹${fees}</p>
    <button class="edit-btn"><i class="fas fa-edit"></i></button>
    <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
  `;

  // Delete Button
  card.querySelector(".delete-btn").addEventListener("click", async () => {
    await deleteDoc(doc(db, "doctors", id));
  });

  // Edit Button
  card.querySelector(".edit-btn").addEventListener("click", () => {
    docId.value = id;
    docId.disabled = true; // Prevent changing ID during edit
    docNameInput.value = name;
    docSpecializationInput.value = specialization;
    docImageInput.value = imageUrl;
    docFeesInput.value = fees;
    docDescriptionInput.value = description;
    editDocId = id;
    addDoctorModal.style.display = "flex";
  });

  return card;
}

// Load and Sync Doctors Realtime
onSnapshot(doctorCollection, (snapshot) => {
  doctorSlider.innerHTML = ""; // Clear previous cards
  snapshot.forEach((docSnap) => {
    const card = renderDoctorCard(docSnap.id, docSnap.data());
    doctorSlider.appendChild(card);
  });
  updateDoctorCount();
});



// Update Total Doctor Count
function updateDoctorCount() {
  const total = doctorSlider.querySelectorAll(".doctor-card").length;
  document.getElementById("totalDoctorsCount").textContent = total;
}







//Product available section
const productCollection = collection(db, "products");

// UI Elements
const productSlider = document.getElementById("productSlider");
const addProductBtn = document.getElementById("addProductBtn");
const addProductModal = document.getElementById("addProductModal");
const closeProductModal = document.getElementById("closeProductModal");
const productForm = document.getElementById("productForm");

let editProductId = null; // Track document ID when editing

// Load all products from Firebase
async function renderProducts() {
  productSlider.innerHTML = "";
  // const q = query(productCollection, orderBy("timestamp", "desc"));
  const q = query(productCollection); // no sorting

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const prod = docSnap.data();
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
  <img src="${prod.imageUrl}" alt="${prod.name}" />
  <h4>${prod.name}</h4> 
  <p class="description">
  <span class="short-text">${prod.description.slice(0, 80)}...</span>
  <span class="full-text">${prod.description}</span>
  <button class="toggle-description">Show More</button>
</p>

  <p><strong>Manufacturer:</strong> ${prod.manufacturer}</p>
  <p><strong>MRP:</strong> ₹${prod.mrp}</p>
  <p><strong>Rate:</strong> ₹${prod.rate}</p>
  <p><strong>Volume:</strong> ${prod.volume}</p>
  <div class="card-actions">
    <button class="edit-btn"><i class="fas fa-edit"></i></button>
    <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
  </div>
`;

    // Show more option in Description
    const toggleBtn = card.querySelector(".toggle-description");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const descriptionP = card.querySelector(".description");
        const isExpanded = descriptionP.classList.toggle("show-more-visible");

        toggleBtn.textContent = isExpanded ? "Show Less" : "Show More";
      });
    }

    // Edit Product
    card.querySelector(".edit-btn").addEventListener("click", () => {
      document.getElementById("productId").value = docSnap.id; // Set the product ID as the document ID
      document.getElementById("productName").value = prod.name;
      document.getElementById("productDescription").value = prod.description;
      document.getElementById("productManufacturer").value = prod.manufacturer;
      document.getElementById("productImageURL").value = prod.imageUrl;
      document.getElementById("productMRP").value = prod.mrp;
      document.getElementById("productRate").value = prod.rate;
      document.getElementById("productVolume").value = prod.volume;
      document.getElementById("productModalTitle").innerText = "Edit Product";
      editProductId = docSnap.id;
      addProductModal.style.display = "flex";
    });

    // Delete Product
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      await deleteDoc(doc(db, "products", docSnap.id));
      renderProducts(); // Refresh
    });

    productSlider.insertBefore(card, productSlider.firstChild);
  });

  updateProductCount();
}

// Open modal to add new product
addProductBtn.addEventListener("click", () => {
  productForm.reset();
  editProductId = null;
  document.getElementById("productModalTitle").innerText = "Add Product";
  addProductModal.style.display = "flex";
  productId.disabled = false;
});

// Close modal
closeProductModal.addEventListener("click", () => {
  addProductModal.style.display = "none";
});

// Submit form to add or update product
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newProduct = {
    name: document.getElementById("productName").value,
    description: document.getElementById("productDescription").value,
    manufacturer: document.getElementById("productManufacturer").value,
    imageUrl: document.getElementById("productImageURL").value,
    mrp: document.getElementById("productMRP").value,
    rate: document.getElementById("productRate").value,
    volume: document.getElementById("productVolume").value,
    timestamp: new Date(), // Add timestamp for sorting
  };

  const productId = document.getElementById("productId").value; // Take productId from the input field

  try {
      const productRef = doc(db, "products", productId); // Create doc reference with productId as document ID
      await setDoc(productRef, newProduct); // Manually set the product data
    

    productForm.reset();
    addProductModal.style.display = "none";
    document.getElementById("productModalTitle").innerText = "Add Product";
    renderProducts(); // Refresh the UI
  } catch (err) {
    console.error("Error saving product:", err);
    alert("Failed to save product. Try again.");
  }
});





// Update product count
function updateProductCount() {
  const countElement = document.getElementById("totalProductCount");
  if (countElement) {
    getDocs(productCollection).then(snapshot => {
      countElement.textContent = snapshot.size;
    });
  }
}

//  Load on page
window.addEventListener("DOMContentLoaded", renderProducts);




// Update Appointment Count 
  window.addEventListener("DOMContentLoaded", () => {
    const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    document.getElementById("totalAppointmentsCount").textContent = appointments.length;
    // console.log(appointments.length);
  });
  


// Update Test Count
window.addEventListener("DOMContentLoaded", () => {
  const tests = JSON.parse(localStorage.getItem("tests")) || [];
  document.getElementById("totalTestCount").textContent = tests.length;
});


//Update Orders Count
window.addEventListener("DOMContentLoaded", () => {
  const tests = JSON.parse(localStorage.getItem("orders")) || [];
  document.getElementById("totalOrdersCount").textContent = tests.length;
});


//Upadte Total Sales
window.addEventListener("DOMContentLoaded", () => {
  const total = localStorage.getItem("totalSales") || 0;
  document.getElementById("totalSalesDisplay").textContent = `₹${total}`;
});
