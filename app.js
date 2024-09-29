// scripts/app.js

const API_URL = 'http://localhost:8080/api'; // Adjust based on backend server

// Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const transactionForm = document.getElementById('transaction-form');
const transactionsTableBody = document.querySelector('#transactions-table tbody');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showDashboard();
        fetchTransactions();
    }
});

// Handle Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showDashboard();
            fetchTransactions();
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showDashboard();
            fetchTransactions();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Handle Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    authSection.classList.remove('d-none');
    dashboardSection.classList.add('d-none');
});

// Show Dashboard
function showDashboard() {
    authSection.classList.add('d-none');
    dashboardSection.classList.remove('d-none');
    // Decode JWT to get user name (optional)
    const token = localStorage.getItem('token');
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userNameSpan.textContent = payload.name;
    }
}

// Handle Add Transaction
transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('transaction-type').value;
    const category = document.getElementById('transaction-category').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const date = document.getElementById('transaction-date').value;
    const description = document.getElementById('transaction-description').value;

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type, category, amount, date, description })
        });

        const data = await response.json();
        if (response.ok) {
            fetchTransactions();
            transactionForm.reset();
        } else {
            alert(data.message || 'Failed to add transaction');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Fetch Transactions
async function fetchTransactions() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/transactions`, {
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            populateTransactions(data.transactions);
        } else {
            alert(data.message || 'Failed to fetch transactions');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Populate Transactions Table
function populateTransactions(transactions) {
    transactionsTableBody.innerHTML = '';
    transactions.forEach(tx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tx.type}</td>
            <td>${tx.category}</td>
            <td>${tx.amount.toFixed(2)}</td>
            <td>${tx.date}</td>
            <td>${tx.description || ''}</td>
        `;
        transactionsTableBody.appendChild(row);
    });
}
