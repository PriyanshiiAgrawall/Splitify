import ThemeProvider from './components/theme';
import './App.css'
import LoginForm from './components/login/LoginForm'

function App() {


  return (
    <>
      <ThemeProvider>
        <LoginForm />
      </ThemeProvider>

    </>
  )
}

export default App
