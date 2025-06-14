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

let editProductId = null;

let allProducts = [];
let productsDisplayed = 0;
let PRODUCTS_PER_BATCH = 3;
let currentRenderedBatch = 0;

function calculateProductsPerBatch() {
  const containerWidth = productSlider.offsetWidth;
  const cardWidth = 270; // Approx width incl margin/padding
  const newBatch = Math.floor(containerWidth / cardWidth) || 1;
  
  // If batch changed, update and re-render
  if (newBatch !== PRODUCTS_PER_BATCH) {
    PRODUCTS_PER_BATCH = newBatch;
    renderVisibleProducts();
  }
}

// Listen to resize & adjust product batches without reload
window.addEventListener("resize", calculateProductsPerBatch);

// Fetch products once from Firebase
async function fetchAllProducts() {
  allProducts = [];
  const q = query(productCollection);
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    allProducts.push({
      id: docSnap.id,
      data: docSnap.data(),
    });
  });

  productsDisplayed = 0;
  currentRenderedBatch = 0;
  productSlider.innerHTML = "";
  document.getElementById("seeMoreBtn").style.display = "none";

  calculateProductsPerBatch();
  showNextProducts();
}

// Show next batch of products
function showNextProducts() {
  const nextBatch = allProducts.slice(productsDisplayed, productsDisplayed + PRODUCTS_PER_BATCH);
  nextBatch.forEach(({ id, data }) => {
    createProductCard(id, data);
  });

  productsDisplayed += nextBatch.length;
  currentRenderedBatch = Math.ceil(productsDisplayed / PRODUCTS_PER_BATCH);

  if (productsDisplayed < allProducts.length) {
    document.getElementById("seeMoreBtn").style.display = "block";
  } else {
    document.getElementById("seeMoreBtn").style.display = "none";
  }

  updateProductCount();
}

// Re-render visible batch on screen resize
function renderVisibleProducts() {
  productSlider.innerHTML = "";
  productsDisplayed = 0;

  for (let i = 0; i < currentRenderedBatch; i++) {
    const batchStart = i * PRODUCTS_PER_BATCH;
    const batchEnd = batchStart + PRODUCTS_PER_BATCH;
    const batch = allProducts.slice(batchStart, batchEnd);

    batch.forEach(({ id, data }) => {
      createProductCard(id, data);
    });

    productsDisplayed += batch.length;
  }

  if (productsDisplayed < allProducts.length) {
    document.getElementById("seeMoreBtn").style.display = "block";
  } else {
    document.getElementById("seeMoreBtn").style.display = "none";
  }
}

// Create a single card
function createProductCard(id, data) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <img src="${data.imageUrl}" alt="${data.name}" />
    <h4>${data.name}</h4> 
    <p class="description">
      <span class="short-text">${data.description.slice(0, 80)}...</span>
      <span class="full-text">${data.description}</span>
      <button class="toggle-description">Show More</button>
    </p>
    <p><strong>Manufacturer:</strong> ${data.manufacturer}</p>
    <p><strong>MRP:</strong> ₹${data.mrp}</p>
    <p><strong>Rate:</strong> ₹${data.rate}</p>
    <p><strong>Volume:</strong> ${data.volume}</p>
    <div class="card-actions">
      <button class="edit-btn"><i class="fas fa-edit"></i></button>
      <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
    </div>
  `;

  // Toggle Description
  const toggleBtn = card.querySelector(".toggle-description");
  toggleBtn.addEventListener("click", () => {
    const descriptionP = card.querySelector(".description");
    const isExpanded = descriptionP.classList.toggle("show-more-visible");
    toggleBtn.textContent = isExpanded ? "Show Less" : "Show More";
  });

  // Edit Product
  card.querySelector(".edit-btn").addEventListener("click", () => {
    document.getElementById("productId").value = id;
    document.getElementById("productName").value = data.name;
    document.getElementById("productDescription").value = data.description;
    document.getElementById("productManufacturer").value = data.manufacturer;
    document.getElementById("productImageURL").value = data.imageUrl;
    document.getElementById("productMRP").value = data.mrp;
    document.getElementById("productRate").value = data.rate;
    document.getElementById("productVolume").value = data.volume;
    document.getElementById("productModalTitle").innerText = "Edit Product";
    editProductId = id;
    addProductModal.style.display = "flex";
  });

  // Delete Product
  card.querySelector(".delete-btn").addEventListener("click", async () => {
    await deleteDoc(doc(db, "products", id));
    fetchAllProducts();
  });

  productSlider.appendChild(card);
}

// See More Button
document.getElementById("seeMoreBtn").addEventListener("click", () => {
  const slider = document.getElementById("productSlider");
  slider.classList.add("grid-layout"); // switch to grid layout
  showNextProducts(); //  load next batch
});


// Add Product Modal
addProductBtn.addEventListener("click", () => {
  productForm.reset();
  editProductId = null;
  document.getElementById("productModalTitle").innerText = "Add Product";
  addProductModal.style.display = "flex";
  document.getElementById("productId").disabled = false;
});

// Close Modal
closeProductModal.addEventListener("click", () => {
  addProductModal.style.display = "none";
});

// Submit Product Form
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
    timestamp: new Date(),
  };

  const productId = document.getElementById("productId").value;

  try {
    const productRef = doc(db, "products", productId);
    await setDoc(productRef, newProduct);
    productForm.reset();
    addProductModal.style.display = "none";
    document.getElementById("productModalTitle").innerText = "Add Product";
    fetchAllProducts();
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

// Load on page
window.addEventListener("DOMContentLoaded", fetchAllProducts);




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
