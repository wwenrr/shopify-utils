import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/main-layout';
import { routes } from './routes';

const ROUTER_BASENAME =
  process.env.PUBLIC_URL && process.env.PUBLIC_URL !== '.'
    ? process.env.PUBLIC_URL
    : '/';

function App() {
  return (
    <Router basename={ROUTER_BASENAME}>
      <MainLayout>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
