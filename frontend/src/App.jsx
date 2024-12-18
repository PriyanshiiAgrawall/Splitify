import ThemeProvider from './components/theme';
import './App.css'

import Login from './components/login';

import Register from './components/register';


function App() {


  return (
    <>
      <ThemeProvider>
        {/* <Login /> */}
        <Register />
      </ThemeProvider>

    </>
  )
}

export default App
