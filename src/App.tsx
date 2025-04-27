import Header from './components/Header';
import Main from './pages/Main';
import Footer from './components/Footer';

import './index.css';

function App() {
  return (
    <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

export default App;
