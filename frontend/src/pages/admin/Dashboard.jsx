import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate, formatApiErrorDetail } from "../../lib/api";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/posts");
            setPosts(data);
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const onDelete = async (post) => {
        if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/posts/${post.id}`);
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
        } catch (e) {
            alert(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-12 pb-24" data-testid="admin-dashboard">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta">editor's desk</p>
                    <h1 className="font-serif text-5xl mt-2">Your entries</h1>
                </div>
                <Link
                    to="/admin/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-cream font-mono text-xs uppercase tracking-[0.2em] hover:bg-terracotta transition-colors self-start sm:self-auto"
                    data-testid="admin-new-post-btn"
                >
                    <Plus className="w-3.5 h-3.5" /> new entry
                </Link>
            </div>

            {error && (
                <p className="font-mono text-xs text-destructive mb-6" data-testid="admin-error">{error}</p>
            )}

            {loading ? (
                <p className="font-handwriting text-2xl text-muted-foreground">scribbling…</p>
            ) : posts.length === 0 ? (
                <div className="paper-bg border border-pencil p-12 text-center">
                    <p className="font-handwriting text-3xl text-muted-foreground mb-6">
                        the notebook is empty.
                    </p>
                    <Link
                        to="/admin/new"
                        className="font-mono text-xs uppercase tracking-[0.2em] underline text-terracotta"
                    >
                        write the first entry →
                    </Link>
                </div>
            ) : (
                <div className="border-t border-pencil">
                    {posts.map((p) => (
                        <div
                            key={p.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-pencil gap-4"
                            data-testid={`admin-post-row-${p.slug}`}
                        >
                            <div className="min-w-0">
                                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                                    {formatDate(p.created_at)} · {p.tag}
                                </p>
                                <Link
                                    to={`/blog/${p.slug}`}
                                    className="font-serif text-2xl truncate hover:text-terracotta transition-colors block mt-1"
                                >
                                    {p.title}
                                </Link>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    to={`/admin/edit/${p.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-pencil hover:border-foreground font-mono text-[10px] uppercase tracking-[0.2em]"
                                    data-testid={`admin-edit-${p.slug}`}
                                >
                                    <Pencil className="w-3 h-3" /> edit
                                </Link>
                                <button
                                    onClick={() => onDelete(p)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-pencil hover:border-destructive hover:text-destructive font-mono text-[10px] uppercase tracking-[0.2em]"
                                    data-testid={`admin-delete-${p.slug}`}
                                >
                                    <Trash2 className="w-3 h-3" /> delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
