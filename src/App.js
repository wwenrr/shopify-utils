import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout/MainLayout';
import DashboardPage from './pages/overview/dashboard';
import EditorPage from './pages/editor/blog-editor';
import AuthorGeneratorPage from './pages/generators/author-generator';
import BlogButtonPage from './pages/generators/blog-button';
import FaqsPage from './pages/generators/faqs';
import HtmlAlignmentPage from './pages/generators/html-alignment';

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
          <Route path="/author-generator" element={<AuthorGeneratorPage />} />
          <Route path="/blog-button" element={<BlogButtonPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/html-alignment" element={<HtmlAlignmentPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
