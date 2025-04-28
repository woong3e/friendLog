import Header from './components/Header';
import Footer from './components/Footer';
import Router from './Router';
import './index.css';

function App() {
  return (
    <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <Header />
      <Router />
      <Footer />
    </div>
  );
}

export default App;
