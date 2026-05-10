import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, LogOut } from "lucide-react";

const navLinkBase =
    "px-3 py-1.5 text-sm tracking-wide transition-colors text-sepia hover:text-terracotta";
const navLinkActive = "text-terracotta";

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const isAdminArea = location.pathname.startsWith("/admin");

    return (
        <div className="min-h-screen flex flex-col">
            <header
                className="sticky top-0 z-40 backdrop-blur-sm bg-cream/85 border-b border-pencil"
                data-testid="site-header"
            >
                <div className="max-w-5xl mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
                    <Link to="/" className="flex items-baseline gap-2 group" data-testid="brand-link">
                        <BookOpen className="w-5 h-5 text-terracotta -mb-0.5" strokeWidth={1.5} />
                        <span className="font-serif text-2xl tracking-tight text-foreground">
                            Margins &amp; <em className="font-handwriting text-terracotta not-italic text-3xl ml-1">memories</em>
                        </span>
                    </Link>
                    <nav className="flex items-center gap-1 sm:gap-2" data-testid="primary-nav">
                        <NavLink to="/" end className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : ""}`} data-testid="nav-home">Home</NavLink>
                        <NavLink to="/blog" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : ""}`} data-testid="nav-blog">Journal</NavLink>
                        <NavLink to="/about" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : ""}`} data-testid="nav-about">About</NavLink>
                        {user && user.role === "admin" ? (
                            <>
                                <NavLink to="/admin" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : ""}`} data-testid="nav-admin">Admin</NavLink>
                                <button
                                    onClick={logout}
                                    className="ml-2 px-3 py-1.5 text-xs font-mono text-sepia hover:text-terracotta inline-flex items-center gap-1.5"
                                    data-testid="nav-logout-btn"
                                >
                                    <LogOut className="w-3.5 h-3.5" /> sign out
                                </button>
                            </>
                        ) : (
                            !isAdminArea && (
                                <Link
                                    to="/admin/login"
                                    className="ml-2 text-xs font-mono text-muted-foreground hover:text-terracotta"
                                    data-testid="nav-login-link"
                                >
                                    ·
                                </Link>
                            )
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-pencil py-10 mt-16" data-testid="site-footer">
                <div className="max-w-5xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="font-handwriting text-2xl text-sepia">
                        — kept in pencil, never in stone.
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                        © {new Date().getFullYear()} · a personal journal
                    </p>
                </div>
            </footer>
        </div>
    );
}
