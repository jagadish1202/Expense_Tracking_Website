// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    // ... rest of your existing DOMContentLoaded event handler
});

function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // If no user is logged in, redirect to login page
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check if session has expired
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (sessionExpiry && new Date() > new Date(sessionExpiry)) {
        // Session expired
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionExpiry');
        window.location.href = 'login.html';
        return;
    }
    
    // Update expenses to be user-specific
    initUserExpenses(currentUser.email);
    
    // Add user info to the page
    addUserInterface();
}

function initUserExpenses(userEmail) {
    // Use user-specific key for expenses
    const storageKey = `expenses_${userEmail}`;
    
    // Update references to use this key
    expenses = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // Update saveExpenses function to use user-specific key
    window.saveExpenses = function() {
        localStorage.setItem(storageKey, JSON.stringify(expenses));
    };
}

function addUserInterface() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Create user menu element
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.innerHTML = `
        <span class="user-name">Welcome, ${currentUser.name}</span>
        <button id="logout-btn" class="btn">Logout</button>
    `;
    
    // Add to DOM
    const header = document.querySelector('header');
    header.appendChild(userMenu);
    
    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionExpiry');
        window.location.href = 'login.html';
    });
}
    // Initialize expense data
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        let budget = parseFloat(localStorage.getItem('budget')) || 0;
        
        // Initialize charts
        let expenseChart;
        let categoryChart;
        
        // Set today's date as the default for the date input
        document.addEventListener('DOMContentLoaded', function() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('expense-date').value = today;
            
            // Set the current month in the filter
            const currentMonth = new Date().getMonth().toString();
            document.getElementById('filter-month').value = currentMonth;
            
            // Initialize budget display
            document.getElementById('current-budget').textContent = budget.toFixed(2);
            
            // Load and display expenses
            displayExpenses();
            updateStats();
            initializeCharts();
            updateBudgetStatus();
        });
        
        // Add expense form submission handler
        document.getElementById('expense-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const description = document.getElementById('expense-description').value;
            const amount = parseFloat(document.getElementById('expense-amount').value);
            const category = document.getElementById('expense-category').value;
            const date = document.getElementById('expense-date').value;
            
            if (description && amount && category && date) {
                const newExpense = {
                    id: Date.now(),  // Unique ID for expense
                    description,
                    amount,
                    category,
                    date
                };
                
                expenses.push(newExpense);
                saveExpenses();
                
                // Reset form
                this.reset();
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('expense-date').value = today;
                
                // Update UI
                displayExpenses();
                updateStats();
                updateCharts();
                updateBudgetStatus();
            }
        });
        
        // Set budget handler
        document.getElementById('set-budget').addEventListener('click', function() {
            const budgetInput = document.getElementById('budget-amount');
            const budgetValue = parseFloat(budgetInput.value);
            
            if (budgetValue && budgetValue > 0) {
                budget = budgetValue;
                localStorage.setItem('budget', budget.toString());
                document.getElementById('current-budget').textContent = budget.toFixed(2);
                updateBudgetStatus();
                budgetInput.value = '';
            }
        });
        
        // Filter change handlers
        document.getElementById('filter-month').addEventListener('change', function() {
            displayExpenses();
            updateStats();
            updateCharts();
        });
        
        document.getElementById('filter-category').addEventListener('change', function() {
            displayExpenses();
            updateStats();
            updateCharts();
        });
        
        // Save expenses to localStorage
        function saveExpenses() {
            localStorage.setItem('expenses', JSON.stringify(expenses));
        }
        
        // Display expenses based on filters
        function displayExpenses() {
            const expenseList = document.getElementById('expense-list');
            const filteredExpenses = getFilteredExpenses();
            
            // Sort expenses by date (newest first)
            filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Clear the expense list
            expenseList.innerHTML = '';
            
            if (filteredExpenses.length === 0) {
                expenseList.innerHTML = '<div class="no-expenses">No expenses found for the selected filters.</div>';
                return;
            }
            
            // Add each expense to the list
            filteredExpenses.forEach(expense => {
                const expenseItem = document.createElement('div');
                expenseItem.className = 'expense-item';
                
                const expenseDate = new Date(expense.date);
                const formattedDate = expenseDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                expenseItem.innerHTML = `
                    <div class="expense-info">
                        <strong>${expense.description}</strong>
                        <div>${formattedDate} <span class="category-tag">${expense.category}</span></div>
                    </div>
                    <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                    <button class="delete-btn" data-id="${expense.id}">Delete</button>
                `;
                
                expenseList.appendChild(expenseItem);
            });
            
            // Add delete event listeners
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    deleteExpense(id);
                });
            });
        }
        
        // Delete an expense
        function deleteExpense(id) {
            expenses = expenses.filter(expense => expense.id !== id);
            saveExpenses();
            displayExpenses();
            updateStats();
            updateCharts();
            updateBudgetStatus();
        }
        
        // Get expenses filtered by selected month and category
        function getFilteredExpenses() {
            const monthFilter = document.getElementById('filter-month').value;
            const categoryFilter = document.getElementById('filter-category').value;
            
            return expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                const matchMonth = monthFilter === 'all' || expenseDate.getMonth().toString() === monthFilter;
                const matchCategory = categoryFilter === 'all' || expense.category === categoryFilter;
                return matchMonth && matchCategory;
            });
        }
        
        // Update statistics based on filtered expenses
        function updateStats() {
            const filteredExpenses = getFilteredExpenses();
            const totalElement = document.getElementById('total-expenses');
            const averageElement = document.getElementById('average-expense');
            const countElement = document.getElementById('expense-count');
            
            if (filteredExpenses.length === 0) {
                totalElement.textContent = '$0.00';
                averageElement.textContent = '$0.00';
                countElement.textContent = '0';
                return;
            }
            
            const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            const average = total / filteredExpenses.length;
            
            totalElement.textContent = `$${total.toFixed(2)}`;
            averageElement.textContent = `$${average.toFixed(2)}`;
            countElement.textContent = filteredExpenses.length;
        }
        
        // Initialize charts
        function initializeCharts() {
            // Expense by date chart
            const expenseCtx = document.getElementById('expense-chart').getContext('2d');
            expenseChart = new Chart(expenseCtx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Daily Expenses',
                        backgroundColor: 'rgba(98, 0, 234, 0.2)',
                        borderColor: 'rgba(98, 0, 234, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(98, 0, 234, 1)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                tooltipFormat: 'll'
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount ()'
                            }
                        }
                    }
                }
            });
            
            // Category chart
            const categoryCtx = document.getElementById('category-chart').getContext('2d');
            categoryChart = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(199, 199, 199, 0.7)',
                            'rgba(83, 102, 255, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        title: {
                            display: true,
                            text: 'Expenses by Category'
                        }
                    }
                }
            });
            
            // Initial chart updates
            updateCharts();
        }
        
        // Update charts with filtered data
        function updateCharts() {
            const filteredExpenses = getFilteredExpenses();
            
            // Update expense by date chart
            const dateData = {};
            filteredExpenses.forEach(expense => {
                if (dateData[expense.date]) {
                    dateData[expense.date] += expense.amount;
                } else {
                    dateData[expense.date] = expense.amount;
                }
            });
            
            const sortedDates = Object.keys(dateData).sort();
            const chartData = sortedDates.map(date => ({
                x: date,
                y: dateData[date]
            }));
            
            expenseChart.data.datasets[0].data = chartData;
            expenseChart.update();
            
            // Update category chart
            const categoryData = {};
            filteredExpenses.forEach(expense => {
                if (categoryData[expense.category]) {
                    categoryData[expense.category] += expense.amount;
                } else {
                    categoryData[expense.category] = expense.amount;
                }
            });
            
            const categories = Object.keys(categoryData);
            const categoryAmounts = categories.map(cat => categoryData[cat]);
            
            categoryChart.data.labels = categories;
            categoryChart.data.datasets[0].data = categoryAmounts;
            categoryChart.update();
        }
        
        // Update budget status
        function updateBudgetStatus() {
            if (budget <= 0) {
                return;
            }
            
            // Get current month expenses only
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            const currentMonthExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            });
            
            const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            const percentage = (totalSpent / budget) * 100;
            
            document.getElementById('current-spent').textContent = totalSpent.toFixed(2);
            document.getElementById('budget-percentage').textContent = percentage.toFixed(1);
            
            const progressBar = document.getElementById('budget-progress');
            progressBar.style.width = `${Math.min(percentage, 100)}%`;
            
            // Change progress bar color based on percentage
            progressBar.className = 'progress-bar';
            if (percentage >= 90) {
                progressBar.classList.add('danger');
            } else if (percentage >= 75) {
                progressBar.classList.add('warning');
            }
        }