import Router from './Router';
import ReactQueryProvider from './config/ReactQueryProvider';
import { useAuthStore } from './stores/useAuthStore';
import { getSession, onAuthChange } from './api/auth';

function App() {
  getSession().then((session) => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setInitialized(true);
  });

  onAuthChange((session) => {
    useAuthStore.getState().setSession(session);
  });

  return (
    <ReactQueryProvider>
      <Router />
    </ReactQueryProvider>
  );
}

export default App;
