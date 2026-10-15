let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let expenseChart = null;
let editingId = null;

const form = document.getElementById("expenseForm");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("transactionDate");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList =
    document.getElementById("transactionList");

const categorySummary =
    document.getElementById("categorySummary");

const searchInput =
    document.getElementById("searchInput");

const filterType =
    document.getElementById("filterType");

const filterCategory =
    document.getElementById("filterCategory");

const submitButton =
    document.getElementById("submitButton");

const cancelEdit =
    document.getElementById("cancelEdit");

const formTitle =
    document.getElementById("formTitle");

const clearAll =
    document.getElementById("clearAll");


dateInput.value =
    new Date().toISOString().split("T")[0];


form.addEventListener("submit", function(e) {

    e.preventDefault();

    const description =
        descriptionInput.value.trim();

    const amount =
        Number(amountInput.value);

    const type =
        typeInput.value;

    const category =
        categoryInput.value;

    const date =
        dateInput.value;

    if (
        description === "" ||
        amount <= 0 ||
        date === ""
    ) {
        alert("Please enter valid details.");
        return;
    }


    if (editingId !== null) {

        transactions =
            transactions.map(function(transaction) {

                if (transaction.id === editingId) {

                    return {
                        ...transaction,
                        description: description,
                        amount: amount,
                        type: type,
                        category: category,
                        date: formatDate(date)
                    };

                }

                return transaction;

            });

        editingId = null;

        submitButton.textContent =
            "Add Transaction";

        formTitle.textContent =
            "➕ Add Transaction";

        cancelEdit.style.display =
            "none";

    } else {

        transactions.push({

            id: Date.now(),

            description: description,

            amount: amount,

            type: type,

            category: category,

            date: formatDate(date)

        });

    }


    saveTransactions();

    form.reset();

    dateInput.value =
        new Date().toISOString().split("T")[0];

    displayTransactions();
    updateSummary();
    updateChart();
    updateCategorySummary();

});


function displayTransactions() {

    transactionList.innerHTML = "";

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedType =
        filterType.value;

    const selectedCategory =
        filterCategory.value;


    const filteredTransactions =
        transactions.filter(function(transaction) {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchText);

            const matchesType =
                selectedType === "all" ||
                transaction.type === selectedType;

            const matchesCategory =
                selectedCategory === "all" ||
                transaction.category === selectedCategory;

            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


    if (filteredTransactions.length === 0) {

        transactionList.innerHTML =
            '<p class="empty">No matching transactions found.</p>';

        return;
    }


    filteredTransactions
        .slice()
        .reverse()
        .forEach(function(transaction) {

            const div =
                document.createElement("div");

            div.className =
                "transaction " + transaction.type;

            const sign =
                transaction.type === "income"
                    ? "+"
                    : "-";


            div.innerHTML = `

                <div class="transaction-info">

                    <h3>
                        ${escapeHTML(transaction.description)}
                    </h3>

                    <p>
                        ${escapeHTML(transaction.category)}
                        •
                        ${transaction.date}
                    </p>

                </div>

                <div class="transaction-right">

                    <span class="transaction-amount">
                        ${sign} ₹${transaction.amount.toFixed(2)}
                    </span>

                    <button
                        class="edit-btn"
                        onclick="editTransaction(${transaction.id})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">
                        Delete
                    </button>

                </div>

            `;

            transactionList.appendChild(div);

        });

}


function editTransaction(id) {

    const transaction =
        transactions.find(function(item) {
            return item.id === id;
        });


    if (!transaction) {
        return;
    }


    editingId = id;

    descriptionInput.value =
        transaction.description;

    amountInput.value =
        transaction.amount;

    typeInput.value =
        transaction.type;

    categoryInput.value =
        transaction.category;


    const parts =
        transaction.date.split("/");

    if (parts.length === 3) {

        dateInput.value =
            `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;

    }


    submitButton.textContent =
        "Update Transaction";

    formTitle.textContent =
        "✏️ Edit Transaction";

    cancelEdit.style.display =
        "block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


cancelEdit.addEventListener("click", function() {

    editingId = null;

    form.reset();

    dateInput.value =
        new Date().toISOString().split("T")[0];

    submitButton.textContent =
        "Add Transaction";

    formTitle.textContent =
        "➕ Add Transaction";

    cancelEdit.style.display =
        "none";

});


function deleteTransaction(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this transaction?");

    if (!confirmDelete) {
        return;
    }

    transactions =
        transactions.filter(function(transaction) {
            return transaction.id !== id;
        });

    saveTransactions();

    displayTransactions();
    updateSummary();
    updateChart();
    updateCategorySummary();

}


clearAll.addEventListener("click", function() {

    if (transactions.length === 0) {
        return;
    }

    const confirmClear =
        confirm("Delete all transactions?");

    if (!confirmClear) {
        return;
    }

    transactions = [];

    saveTransactions();

    displayTransactions();
    updateSummary();
    updateChart();
    updateCategorySummary();

});


function updateSummary() {

    let income = 0;
    let expense = 0;

    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            income += transaction.amount;

        } else {

            expense += transaction.amount;

        }

    });


    const balance =
        income - expense;


    incomeElement.textContent =
        "₹" + income.toFixed(2);

    expenseElement.textContent =
        "₹" + expense.toFixed(2);

    balanceElement.textContent =
        "₹" + balance.toFixed(2);

}


function updateChart() {

    const categories = {};

    transactions.forEach(function(transaction) {

        if (transaction.type === "expense") {

            if (!categories[transaction.category]) {

                categories[transaction.category] = 0;

            }

            categories[transaction.category] +=
                transaction.amount;

        }

    });


    const labels =
        Object.keys(categories);

    const data =
        Object.values(categories);


    const canvas =
        document.getElementById("expenseChart");

    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    if (expenseChart) {

        expenseChart.destroy();

        expenseChart = null;

    }


    if (data.length === 0) {
        return;
    }


    expenseChart =
        new Chart(ctx, {

            type: "doughnut",

            data: {

                labels: labels,

                datasets: [{

                    data: data,

                    backgroundColor: [

                        "#4f46e5",
                        "#16a34a",
                        "#f59e0b",
                        "#ef4444",
                        "#06b6d4",
                        "#8b5cf6",
                        "#ec4899",
                        "#14b8a6",
                        "#64748b"

                    ],

                    borderColor: "#ffffff",

                    borderWidth: 3

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                cutout: "60%",

                plugins: {

                    legend: {
                        position: "bottom"
                    }

                }

            }

        });

}


function updateCategorySummary() {

    const categories = {};

    transactions.forEach(function(transaction) {

        if (transaction.type === "expense") {

            if (!categories[transaction.category]) {

                categories[transaction.category] = 0;

            }

            categories[transaction.category] +=
                transaction.amount;

        }

    });


    categorySummary.innerHTML = "";

    const categoryNames =
        Object.keys(categories);


    if (categoryNames.length === 0) {

        categorySummary.innerHTML =
            '<p class="empty">No expenses yet.</p>';

        return;

    }


    categoryNames.forEach(function(category) {

        const div =
            document.createElement("div");

        div.className =
            "category-item";


        div.innerHTML = `

            <span class="category-name">
                ${escapeHTML(category)}
            </span>

            <span class="category-amount">
                ₹${categories[category].toFixed(2)}
            </span>

        `;


        categorySummary.appendChild(div);

    });

}


searchInput.addEventListener(
    "input",
    displayTransactions
);

filterType.addEventListener(
    "change",
    displayTransactions
);

filterCategory.addEventListener(
    "change",
    displayTransactions
);


function formatDate(date) {

    const parts =
        date.split("-");

    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


displayTransactions();
updateSummary();
updateChart();
updateCategorySummary();
