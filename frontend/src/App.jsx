import ThemeProvider from './components/theme';
import './App.css'

import Login from './components/login';

import Register from './components/register';
import { RecentTransactions } from './components/dashboard/RecentTransactions';


function App() {


  return (
    <>
      <ThemeProvider>
        {/* <Login /> */}
        {/* <Register /> */}
        <RecentTransactions />
      </ThemeProvider>

    </>
  )
}

export default App
