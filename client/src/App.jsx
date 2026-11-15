import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import GuestRoute from './routes/GuestRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Concerns from './pages/public/Concerns';
import ConcernDetail from './pages/public/ConcernDetail';
import Videos from './pages/public/Videos';
import VideoDetail from './pages/public/VideoDetail';
import Articles from './pages/public/Articles';
import ArticleDetail from './pages/public/ArticleDetail';
import Shops from './pages/public/Shops';
import ShopDetail from './pages/public/ShopDetail';
import Contact from './pages/public/Contact';
import NotFound from './pages/public/NotFound';
import Profile from './pages/user/Profile';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminConcerns from './pages/admin/AdminConcerns';
import AdminConcernForm from './pages/admin/AdminConcernForm';
import AdminVideos from './pages/admin/AdminVideos';
import AdminVideoForm from './pages/admin/AdminVideoForm';
import AdminVideoCategories from './pages/admin/AdminVideoCategories';
import AdminArticles from './pages/admin/AdminArticles';
import AdminArticleForm from './pages/admin/AdminArticleForm';
import AdminShops from './pages/admin/AdminShops';
import AdminShopForm from './pages/admin/AdminShopForm';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminEnquiryDetail from './pages/admin/AdminEnquiryDetail';
import AdminReports from './pages/admin/AdminReports';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Anyone */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/concerns" element={<Concerns />} />
        <Route path="/concerns/:slug" element={<ConcernDetail />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/videos/:slug" element={<VideoDetail />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/shops/:id" element={<ShopDetail />} />
        <Route path="/contact" element={<Contact />} />

        {/* Only visitors who are NOT logged in */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Logged-in users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admins only. Later phases add their screens inside AdminLayout. */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="concerns" element={<AdminConcerns />} />
            <Route path="concerns/new" element={<AdminConcernForm />} />
            <Route path="concerns/:id/edit" element={<AdminConcernForm />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="videos/new" element={<AdminVideoForm />} />
            <Route path="videos/:id/edit" element={<AdminVideoForm />} />
            <Route path="video-categories" element={<AdminVideoCategories />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="articles/new" element={<AdminArticleForm />} />
            <Route path="articles/:id/edit" element={<AdminArticleForm />} />
            <Route path="shops" element={<AdminShops />} />
            <Route path="shops/new" element={<AdminShopForm />} />
            <Route path="shops/:id/edit" element={<AdminShopForm />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="enquiries/:id" element={<AdminEnquiryDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}