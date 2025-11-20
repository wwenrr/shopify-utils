import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout';
import { AuthorGenerator } from './features/author-generator';
import { BlogButtonGenerator } from './features/blog-button';
import { FaqsGenerator } from './features/faqs-generator';
import DashboardPage from './pages/dashboard/DashboardPage/DashboardPage';
import EditorPage from './pages/editor/EditorPage/EditorPage';
import HtmlAlignmentPage from './pages/html-structure/HtmlAlignmentPage/HtmlAlignmentPage';

const ROUTER_BASENAME =
  process.env.PUBLIC_URL && process.env.PUBLIC_URL !== '.'
    ? process.env.PUBLIC_URL
    : '/';

function App() {
  return (
    <Router basename={ROUTER_BASENAME}>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/author-generator" element={<AuthorGenerator />} />
          <Route path="/blog-button" element={<BlogButtonGenerator />} />
          <Route path="/faqs" element={<FaqsGenerator />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/html-alignment" element={<HtmlAlignmentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
