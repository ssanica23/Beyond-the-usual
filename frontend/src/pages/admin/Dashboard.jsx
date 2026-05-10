import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatDate, formatApiErrorDetail } from "../../lib/api";
import { Pencil, Plus, Trash2 } from "lucide-react";

const FILTERS = [
    { key: "all", label: "all" },
    { key: "published", label: "published" },
    { key: "draft", label: "drafts" },
];

export default function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/admin/posts");
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

    const visible = useMemo(() => {
        if (filter === "all") return posts;
        return posts.filter((p) => (p.status || "published") === filter);
    }, [posts, filter]);

    const draftCount = useMemo(
        () => posts.filter((p) => p.status === "draft").length,
        [posts]
    );

    return (
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-12 pb-24" data-testid="admin-dashboard">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta">editor's desk</p>
                    <h1 className="font-serif text-5xl mt-2">Your entries</h1>
                    {draftCount > 0 && (
                        <p className="font-handwriting text-2xl text-muted-foreground mt-2">
                            {draftCount} draft{draftCount === 1 ? "" : "s"} waiting for you ✎
                        </p>
                    )}
                </div>
                <Link
                    to="/admin/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-cream font-mono text-xs uppercase tracking-[0.2em] hover:bg-terracotta transition-colors self-start sm:self-auto"
                    data-testid="admin-new-post-btn"
                >
                    <Plus className="w-3.5 h-3.5" /> new entry
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-8" data-testid="status-filter">
                {FILTERS.map((f) => {
                    const active = f.key === filter;
                    const count =
                        f.key === "all"
                            ? posts.length
                            : posts.filter((p) => (p.status || "published") === f.key).length;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] border transition-colors ${
                                active
                                    ? "bg-foreground text-cream border-foreground"
                                    : "border-pencil text-sepia hover:border-foreground"
                            }`}
                            data-testid={`filter-${f.key}`}
                        >
                            {f.label} ({count})
                        </button>
                    );
                })}
            </div>

            {error && (
                <p className="font-mono text-xs text-destructive mb-6" data-testid="admin-error">{error}</p>
            )}

            {loading ? (
                <p className="font-handwriting text-2xl text-muted-foreground">scribbling…</p>
            ) : visible.length === 0 ? (
                <div className="paper-bg border border-pencil p-12 text-center">
                    <p className="font-handwriting text-3xl text-muted-foreground mb-6">
                        {filter === "draft"
                            ? "no drafts. you finished them all!"
                            : filter === "published"
                            ? "nothing published yet."
                            : "the notebook is empty."}
                    </p>
                    <Link
                        to="/admin/new"
                        className="font-mono text-xs uppercase tracking-[0.2em] underline text-terracotta"
                    >
                        write a new entry →
                    </Link>
                </div>
            ) : (
                <div className="border-t border-pencil">
                    {visible.map((p) => {
                        const isDraft = p.status === "draft";
                        return (
                            <div
                                key={p.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-b border-pencil gap-4"
                                data-testid={`admin-post-row-${p.slug}`}
                            >
                                <div className="min-w-0">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2 flex-wrap">
                                        <span>{formatDate(p.created_at)} · {p.tag}</span>
                                        {isDraft && (
                                            <span
                                                className="bg-terracotta text-cream px-2 py-0.5 tracking-[0.18em]"
                                                data-testid={`draft-badge-${p.slug}`}
                                            >
                                                draft
                                            </span>
                                        )}
                                    </p>
                                    {isDraft ? (
                                        <span className="font-serif text-2xl text-foreground/70 italic block mt-1 truncate">
                                            {p.title || "(untitled)"}
                                        </span>
                                    ) : (
                                        <Link
                                            to={`/blog/${p.slug}`}
                                            className="font-serif text-2xl truncate hover:text-terracotta transition-colors block mt-1"
                                        >
                                            {p.title}
                                        </Link>
                                    )}
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
                        );
                    })}
                </div>
            )}
        </div>
    );
}
