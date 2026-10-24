import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import './App.css'

function App() {
const [walletBalance, setWalletBalance] = useState(()=>{
  const savedBalance = localStorage.getItem("walletBalance");
  return savedBalance !==null ? Number(savedBalance):5000;
})
const [showIncomeForm, setShowIncomeForm] = useState(false);
const [showExpenseForm, setShowExpenseForm] = useState(false);
const [incomeAmount, setIncomeAmount] = useState("");
const [expenseList, setExpenseList] = useState(()=>{
  const savedExpenses = localStorage.getItem("expenses");
  return savedExpenses ?JSON.parse(savedExpenses):[];
});
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 3;
const [editingExpenseId, setEditingExpenseId] = useState(null);
const [expense,setExpense] = useState({
      title:"",
      price:"",
      category:"",
      date:""

})
const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#A28BFF", // Purple
  "#FF6384", // Pink
];
const categoryData = expenseList.reduce((result, item) => {
  const existingCategory = result.find(
    (category) => category.name === item.category
  );

  if (existingCategory) {
    existingCategory.value += item.price;
  } else {
    result.push({
      name: item.category,
      value: item.price,
    });
  }

  return result;
}, []);

const trendData = expenseList.reduce((result,item)=>{
  const existingData = result.find((entry)=>entry.date===item.date);
  if(existingData){
    existingData.amount +=item.price
  }else{
    result.push({
      date:item.date,
      amount:item.price
    })
  }
  return result
},[])
trendData.sort((a,b)=>a.date.localeCompare(b.date));

const totalPages = Math.ceil(expenseList.length / itemsPerPage);

const currentTransactions = expenseList.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

useEffect(()=>{
  localStorage.setItem("walletBalance", String(walletBalance));
},[walletBalance])
 
useEffect(()=>{
  localStorage.setItem("expenses",JSON.stringify(expenseList));
},[expenseList]);

const handleAddExpense = (event) => {
  event.preventDefault();

  const expenseAmountValue = Number(expense.price);

  if (!expense.title.trim() || !expense.price || expenseAmountValue <= 0 ||
      !expense.category || !expense.date) {
    alert("Please fill in all fields with valid values.");
    return;
  }

  const oldExpense = expenseList.find(
    (item) => item.id === editingExpenseId
  );

  const availableBalance = oldExpense
    ? walletBalance + oldExpense.price
    : walletBalance;

  if (expenseAmountValue > availableBalance) {
    alert("Insufficient wallet balance!");
    return;
  }

  if (oldExpense) {
    setExpenseList((previousList) =>
      previousList.map((item) =>
        item.id === editingExpenseId
          ? {
              ...item,
              title: expense.title.trim(),
              price: expenseAmountValue,
              category: expense.category,
              date: expense.date,
            }
          : item
      )
    );

    setWalletBalance(
      (previousBalance) =>
        previousBalance + oldExpense.price - expenseAmountValue
    );
  } else {
    const newExpense = {
      id: Date.now(),
      title: expense.title.trim(),
      price: expenseAmountValue,
      category: expense.category,
      date: expense.date,
    };

    setExpenseList((previousList) => [
      ...previousList,
      newExpense,
    ]);

    setWalletBalance(
      (previousBalance) => previousBalance - expenseAmountValue
    );
  }

  setExpense({
    title: "",
    price: "",
    category: "",
    date: "",
  });

  setEditingExpenseId(null);
  setShowExpenseForm(false);
};


const handleDeleteExpense =(expenseId)=>{
  const expenseToDelete =expenseList.find((item)=>item.id===expenseId)
  if(!expenseToDelete){
    return;
  }
  setExpenseList((previousList)=>previousList.filter((item)=>item.id!==expenseId));
  setWalletBalance((previousBalance)=>previousBalance+expenseToDelete.price);
}

const handleEditExpense =(item) =>{
  setExpense({
    title:item.title,
    price:String(item.price),
    category:item.category,
    date:item.date
  })
  setEditingExpenseId(item.id);
  setShowExpenseForm(true)
}
const handleIncome =(event)=>{
  event.preventDefault();
  const amount= Number(incomeAmount);

  if(!incomeAmount || amount<=0){
    alert("Please enter a valid income amount");
    return
  }
  setWalletBalance((prev)=>prev+amount)
  setIncomeAmount("")
  setShowIncomeForm(false);
}


  return (
    <>
      <h1 className="app-heading">Expense Tracker</h1>
      <div className="top-dashboard">
        {/* Section 1: Wallet Balance */}
        <div className="wallet-card">
          <h2>
            Wallet Balance:{" "}
            <span className="wallet-amount">₹{walletBalance.toFixed(0)}</span>
          </h2>

          <button
            type="button"
            className="add-income-btn"
            onClick={() => setShowIncomeForm(!showIncomeForm)}
          >
            + Add Income
          </button>
        </div>

        {showIncomeForm && (
          <div className="modal-overlay">
            <form onSubmit={handleIncome} className="income-form modal-content">
              <h3>Add Balance</h3>

              <input
                type="number"
                placeholder="Income Amount"
                value={incomeAmount}
                onChange={(event) => setIncomeAmount(event.target.value)}
                min="0.01"
                step="0.01"
                required
              />

              <button type="submit">Add Balance</button>

              <button type="button" onClick={() => setShowIncomeForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        )}
        {/* Section 2: Total Expenses */}
        <div className="wallet-card">
          <h2>
            Expenses:{" "}
            <span className="expense-amount">
              ₹
              {expenseList
                .reduce((total, item) => total + item.price, 0)
                .toFixed(0)}
            </span>
          </h2>

          <button
            type="button"
            className="add-expense-btn"
            onClick={() => setShowExpenseForm(!showExpenseForm)}
          >
            + Add Expense
          </button>
        </div>
        {showExpenseForm && (
          <div className="modal-overlay">
            <form
              onSubmit={handleAddExpense}
              className="expense-form modal-content"
            >
              <h3>{editingExpenseId ? "Edit Expenses" : "Add Expenses"}</h3>

              <input
                type="text"
                placeholder="Title"
                value={expense.title}
                onChange={(event) =>
                  setExpense({ ...expense, title: event.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={expense.price}
                onChange={(event) =>
                  setExpense({ ...expense, price: event.target.value })
                }
                min="0.01"
                step="0.01"
                required
              />

              <select
                value={expense.category}
                onChange={(event) =>
                  setExpense({ ...expense, category: event.target.value })
                }
                required
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="date"
                value={expense.date}
                onChange={(event) =>
                  setExpense({ ...expense, date: event.target.value })
                }
                required
              />

              <button type="submit">
                {editingExpenseId ? "Update Expenses" : "Add Expenses"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExpenseForm(false);
                  setEditingExpenseId(null);
                  setExpense({ title: "", price: "", category: "", date: "" });
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Section 3: Pie Chart */}
        <div className="chart-card expense-summary-card">
          <h2>Expense Summary</h2>

          {categoryData.length === 0 ? (
            <p>Add expenses to see your summary.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.55;
                    const angle = (-midAngle * Math.PI) / 180;

                    const x = cx + radius * Math.cos(angle);
                    const y = cy + radius * Math.sin(angle);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#ffffff"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {categoryData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {/*Recent Transaction block */}
        <div className="bottom-dashboard">
          <div className="transactions-section">
            <h2 className="transactions-heading">Recent Transactions</h2>

            <div className="transactions-card">
              {expenseList.length === 0 ? (
                <p className="empty-message">No transactions!</p>
              ) : (
                currentTransactions.map((item) => (
                  <div className="transaction-item" key={item.id}>
                    <div className="transaction-info">
                      <div className="transaction-icon">
                        {item.category === "Food"
                          ? "🍽️"
                          : item.category === "Travel"
                            ? "🚗"
                            : item.category === "Shopping"
                              ? "🛍️"
                              : item.category === "Bills"
                                ? "🧾"
                                : "📦"}
                      </div>

                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.date}</p>
                      </div>
                    </div>

                    <div className="transaction-actions">
                      <strong className="transaction-amount">
                        ₹{item.price.toFixed(0)}
                      </strong>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDeleteExpense(item.id)}
                        aria-label={`Delete ${item.title}`}
                      >
                        ×
                      </button>

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEditExpense(item)}
                        aria-label={`Edit ${item.title}`}
                      >
                        ✎
                      </button>
                    </div>
                  </div>
                ))
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      type="button"
                      className={currentPage === index + 1 ? "active" : ""}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    type="button"
                    className={currentPage === index + 1 ? "active" : ""}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )} */}
          </div>
        </div>

        <div className="top-expenses-section">
          <h2 className="top-expenses-heading">Top Expenses</h2>

          <div className="top-expenses-card">
            <div className="top-expenses-card">
              {categoryData.length === 0 ? (
                <p>No expenses yet.</p>
              ) : (
                categoryData.map((item) => (
                  <div className="expense-bar-item" key={item.name}>
                    <div className="expense-bar-label">
                      <span>{item.name}</span>
                      <span>₹{item.value}</span>
                    </div>

                    <div className="expense-bar-track">
                      <div
                        className="expense-bar-fill"
                        style={{
                          width: `${
                            (item.value /
                              Math.max(
                                ...categoryData.map((cat) => cat.value),
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App
