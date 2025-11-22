import React from 'react';
import DashboardPage from '@/pages/overview/dashboard';
import EditorPage from '@/pages/editor/blog-editor';
import AuthorGeneratorPage from '@/pages/generators/author-generator';
import BlogButtonPage from '@/pages/generators/blog-button';
import FaqsPage from '@/pages/generators/faqs';
import HtmlAlignmentPage from '@/pages/generators/html-alignment';

export const routes = [
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/author-generator',
    element: <AuthorGeneratorPage />,
  },
  {
    path: '/blog-button',
    element: <BlogButtonPage />,
  },
  {
    path: '/faqs',
    element: <FaqsPage />,
  },
  {
    path: '/editor',
    element: <EditorPage />,
  },
  {
    path: '/html-alignment',
    element: <HtmlAlignmentPage />,
  },
];

