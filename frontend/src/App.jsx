import ThemeProvider from './components/theme';
import './App.css'

import Login from './components/login';

import Register from './components/register';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { ViewExpense } from './components/expense/ViewExpense';
import AddExpense from './components/expense/AddExpense';
import EditExpense from './components/expense/EditExpense';
import Creategroup from './components/groups/createGroup';
import Group from './components/groups';

import Router from './routes.jsx';


function App() {


  return (
    <>
      <ThemeProvider>
        {/* <Login /> */}
        {/* <Register /> */}
        {/* <RecentTransactions /> */}
        {/* <ViewExpense /> */}
        {/* <AddExpense /> */}
        {/* <EditExpense /> */}
        {/* <Creategroup /> */}
        {/* <Group /> */}
        {/* <EditGroup /> */}
        <Router />
      </ThemeProvider>

    </>
  )
}

export default App
