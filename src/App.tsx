import Router from './Router';
import ReactQueryProvider from './config/ReactQueryProvider';

function App() {
  return (
    <ReactQueryProvider>
      <Router />
    </ReactQueryProvider>
  );
}

export default App;
