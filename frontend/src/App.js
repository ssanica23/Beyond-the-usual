import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Blog from "@/pages/Blog";
import Post from "@/pages/Post";
import About from "@/pages/About";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Editor from "@/pages/admin/Editor";

export default function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:slug" element={<Post />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/admin/login" element={<Login />} />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/new"
                                element={
                                    <ProtectedRoute>
                                        <Editor />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <Editor />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}
