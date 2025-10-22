import Router from './Router';
import ReactQueryProvider from './config/ReactQueryProvider';
import supabase from './utils/supabase';
import { useAuthStore } from './stores/useAuthStore';

function App() {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.getState().setSession(data.session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });

  return (
    <ReactQueryProvider>
      <Router />
    </ReactQueryProvider>
  );
}

export default App;
