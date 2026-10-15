import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ResourceDetailsPage from './pages/ResourceDetailsPage';
import AddResourcePage from './pages/AddResourcePage';
import EditResourcePage from './pages/EditResourcePage';
import UserDashboardPage from './pages/UserDashboardPage';
import FavouritesPage from './pages/FavouritesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="resources/:id" element={<ResourceDetailsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Authenticated Protected Routes */}
        <Route
          path="add-resource"
          element={
            <ProtectedRoute>
              <AddResourcePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="resources/edit/:id"
          element={
            <ProtectedRoute>
              <EditResourcePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="favourites"
          element={
            <ProtectedRoute>
              <FavouritesPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Route */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
