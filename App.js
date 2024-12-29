// Full Frontend Code for Adithya's Bill Manager

import React from 'react';
import { legacy_createStore as createStore} from 'redux'
import { applyMiddleware } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { thunk } from 'redux-thunk';
import { Line } from 'react-chartjs-2';
import './App.css';

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register required modules
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

// Initial State
const initialState = {
  bills: [
    { id: 1, description: "Dominoes", category: "FoodNDining", amount: 430, date: "01-02-2020" },
    { id: 2, description: "Car wash", category: "Utility", amount: 500, date: "01-06-2020" },
    { id: 3, description: "Amazon", category: "Shopping", amount: 2030, date: "01-07-2020" },
    { id: 4, description: "House rent", category: "FoodNDining", amount: 35900, date: "01-03-2020" },
    { id: 5, description: "Tuition", category: "Education", amount: 2200, date: "01-12-2020" },
    { id: 6, description: "Laundry", category: "Personal Care", amount: 320, date: "01-14-2020" },
    { id: 7, description: "Vacation", category: "Travel", amount: 3430, date: "01-18-2020" },
  ],
  filter: "All",
  monthlyBudget: 50000,
  highlightedBills: [],
};

// Actions
const ADD_BILL = "ADD_BILL";
const EDIT_BILL = "EDIT_BILL";
const REMOVE_BILL = "REMOVE_BILL";
const SET_FILTER = "SET_FILTER";
const CALCULATE_MINIMUM_BILLS = "CALCULATE_MINIMUM_BILLS";

// Action Creators
const addBill = (bill) => ({ type: ADD_BILL, payload: bill });
const editBill = (bill) => ({ type: EDIT_BILL, payload: bill });
const removeBill = (id) => ({ type: REMOVE_BILL, payload: id });
const setFilter = (category) => ({ type: SET_FILTER, payload: category });
const calculateMinimumBills = () => ({ type: CALCULATE_MINIMUM_BILLS });

// Reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_BILL:
      return { ...state, bills: [...state.bills, action.payload] };
    case EDIT_BILL:
      return {
        ...state,
        bills: state.bills.map((bill) => (bill.id === action.payload.id ? action.payload : bill)),
      };
    case REMOVE_BILL:
      return { ...state, bills: state.bills.filter((bill) => bill.id !== action.payload) };
    case SET_FILTER:
      return { ...state, filter: action.payload };
    case CALCULATE_MINIMUM_BILLS:
      const sortedBills = [...state.bills].sort((a, b) => a.amount - b.amount);
      let total = 0;
      let highlighted = [];
      for (let bill of sortedBills) {
        if (total + bill.amount <= state.monthlyBudget) {
          total += bill.amount;
          highlighted.push(bill.id);
        } else {
          break;
        }
      }
      return { ...state, highlightedBills: highlighted };
    default:
      return state;
  }
};

// Store
const store = createStore(reducer, applyMiddleware(thunk));

// Components
const BillManager = () => {
  const { bills, filter, highlightedBills, monthlyBudget } = useSelector((state) => state);
  const dispatch = useDispatch();

  const filteredBills = filter === "All" ? bills : bills.filter((bill) => bill.category === filter);

  const handleAddBill = () => {
    const newBill = {
      id: Date.now(),
      description: prompt("Enter description:"),
      category: prompt("Enter category:"),
      amount: parseFloat(prompt("Enter amount:")),
      date: prompt("Enter date (MM-DD-YYYY):"),
    };
    dispatch(addBill(newBill));
  };

  const handleEditBill = (id) => {
    const billToEdit = bills.find((bill) => bill.id === id);
    const updatedBill = {
      ...billToEdit,
      description: prompt("Edit description:", billToEdit.description),
      category: prompt("Edit category:", billToEdit.category),
      amount: parseFloat(prompt("Edit amount:", billToEdit.amount)),
      date: prompt("Edit date (MM-DD-YYYY):", billToEdit.date),
    };
    dispatch(editBill(updatedBill));
  };

  const handleRemoveBill = (id) => {
    dispatch(removeBill(id));
  };

  const handleFilterChange = (e) => {
    dispatch(setFilter(e.target.value));
  };

  const handleCalculate = () => {
    dispatch(calculateMinimumBills());
  };

  const chartData = {
    labels: bills.map((bill) => bill.date),
    datasets: [
      {
        label: "Monthly Billing Cycle",
        data: bills.map((bill) => bill.amount),
        borderColor: "#3e95cd",
        fill: false,
      },
    ],
  };

  return (
    <div className="container">
      <h1 className="header">Bill Manager</h1>
      <div className="controls">
        <button className="btn" onClick={handleAddBill}>Add Bill</button>
        <select className="dropdown" onChange={handleFilterChange} value={filter}>
          <option value="All">All</option>
          <option value="FoodNDining">Food & Dining</option>
          <option value="Utility">Utility</option>
          <option value="Shopping">Shopping</option>
          <option value="Education">Education</option>
          <option value="Personal Care">Personal Care</option>
          <option value="Travel">Travel</option>
        </select>
        <button className="btn calculate" onClick={handleCalculate}>Calculate Minimum Bills</button>
      </div>
      <ul className="bill-list">
        {filteredBills.map((bill) => (
          <li
            key={bill.id}
            className={`bill-item ${highlightedBills.includes(bill.id) ? "highlight" : ""}`}
          >
            {bill.description} - {bill.category} - ${bill.amount} - {bill.date}
            <div className="actions">
              <button className="btn edit" onClick={() => handleEditBill(bill.id)}>Edit</button>
              <button className="btn remove" onClick={() => handleRemoveBill(bill.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="budget">Total Monthly Budget: ${monthlyBudget}</h2>
      <div className="chart">
        <Line data={chartData} />
      </div>
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <BillManager />
  </Provider>
);

export default App;
