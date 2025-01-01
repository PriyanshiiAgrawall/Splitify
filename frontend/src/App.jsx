import ThemeProvider from './components/theme';
import Router from './routes.jsx';


function App() {


  return (
    <>
      <ThemeProvider>
        <Router />
      </ThemeProvider>

    </>
  )
}

export default App
