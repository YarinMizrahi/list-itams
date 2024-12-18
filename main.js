// Global Variables
const UNSPLASH_ACCESS_KEY = "KhVq4qlkIFGNiJKZhgQWL18FIKN0uP4HshkTCGVA_gM"; 
let inventory = [];
let currentUser = null;




// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById("login-section");
    const registerSection = document.getElementById("register-section");
    const dashboard = document.getElementById("dashboard");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const addItemBtn = document.getElementById("add-item-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const inventoryTableBody = document.querySelector("#inventory-table tbody");
    const showRegisterBtn = document.getElementById("show-register-btn");
    const showLoginBtn = document.getElementById("show-login-btn");

    const savedUsers = JSON.parse(localStorage.getItem("users")) || {};

    // Toggle between Login and Register
    showRegisterBtn.addEventListener("click", () => {
        loginSection.style.display = "none";
        registerSection.style.display = "block";
    });

    showLoginBtn.addEventListener("click", () => {
        registerSection.style.display = "none";
        loginSection.style.display = "block";
    });

    // REGISTER LOGIC
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newUsername = document.getElementById("new-username").value.trim();
        const newPassword = document.getElementById("new-password").value.trim();
        if (!newUsername || !newPassword) {
            alert("Username and password are required.");
            return;
        }
        if (savedUsers[newUsername]) {
            alert("This username already exists.");
            return;
        }
        savedUsers[newUsername] = { password: newPassword, inventory: [] };
        localStorage.setItem("users", JSON.stringify(savedUsers));
        alert("Account created successfully. You can now log in.");
        registerSection.style.display = "none";
        loginSection.style.display = "block";
    });

    // LOGIN LOGIC
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        if (savedUsers[username] && savedUsers[username].password === password) {
            currentUser = username;
            loadUserInventory();
            loginSection.style.display = "none";
            dashboard.style.display = "block";
        } else {
            alert("Incorrect username or password.");
        }
    });

    // LOGOUT LOGIC
    logoutBtn.addEventListener("click", () => {
        currentUser = null;
        inventory = [];
        dashboard.style.display = "none";
        loginSection.style.display = "block";
    });

    // Add New Item
    addItemBtn.addEventListener("click", async () => {
        const itemName = prompt("Enter the item name");
        const itemQuantity = parseInt(prompt("Enter the item quantity"));
        const itemPrice = parseFloat(prompt("Enter the item price"));

        if (!itemName || isNaN(itemQuantity) || isNaN(itemPrice)) {
            alert("Please enter valid item details.");
            return;
        }

        // Determine the status based on the quantity
        let status = itemQuantity <= 5 ? "Low Stock" : "In Stock";

        // Fetch the image based on item name
        const image = await fetchItemImage(itemName);

        const newItem = {
            name: itemName,
            quantity: itemQuantity,
            price: itemPrice,
            totalCost: (itemPrice * itemQuantity).toFixed(2),  // Calculate total cost based on quantity and price
            status: status,  // Correctly set the status
            image: image, // Use the fetched image URL
        };

        inventory.push(newItem);
        saveUserInventory();
        updateInventoryTable();
    });

    async function fetchItemImage(itemName) {
        // Remove translation function, just use the itemName directly
        const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(itemName)}&client_id=${UNSPLASH_ACCESS_KEY}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Error fetching image: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                console.log("Image URL:", data.results[0].urls.small);
                return data.results[0].urls.small;
            } else {
                console.warn(`No images found for "${itemName}".`);
                return "https://via.placeholder.com/150?text=No+Image"; // Return a placeholder
            }
        } catch (error) {
            console.error("Error fetching image:", error);
            return "https://via.placeholder.com/150?text=Error";
        }
    }
    

    function updateInventoryTable() {
        inventoryTableBody.innerHTML = "";
        inventory.forEach((item, index) => {
            const row = document.createElement("tr");
    
            row.innerHTML = `
                <td><img src="${item.image}" alt="${item.name}" width="50"></td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.status}</td>
                <td>${item.price}</td>
                <td>${item.totalCost}</td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            `;
            inventoryTableBody.appendChild(row);
        });
    
        // Add Event Listener for Delete Button
        const deleteButtons = document.querySelectorAll(".delete-btn");
        deleteButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                const index = event.target.getAttribute("data-index");
                deleteItem(index);  // Pass index properly to the deleteItem function
            });
        });
    }
    // Global deleteItem function
function deleteItem(index) {
    if (confirm("Are you sure you want to delete this item?")) {
        inventory.splice(index, 1);
        saveUserInventory();
        updateInventoryTable();  // Re-render the table after deletion
    }
}
    // Save User Inventory
    function saveUserInventory() {
        if (currentUser) {
            savedUsers[currentUser].inventory = inventory;
            localStorage.setItem("users", JSON.stringify(savedUsers));
        }
    }

    // Load User Inventory
    function loadUserInventory() {
        if (savedUsers[currentUser]) {
            inventory = savedUsers[currentUser].inventory;
            updateInventoryTable();
        }
    }
});
