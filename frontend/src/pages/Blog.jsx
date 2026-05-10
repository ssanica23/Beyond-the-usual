import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import PolaroidCard from "../components/PolaroidCard";

const TAGS = [
    { key: "all", label: "everything" },
    { key: "memories", label: "memories" },
    { key: "regrets", label: "regrets" },
    { key: "fun", label: "fun" },
];

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tag, setTag] = useState("all");

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            try {
                const params = tag !== "all" ? { tag } : {};
                const { data } = await api.get("/posts", { params });
                if (!cancel) setPosts(data);
            } catch {
                if (!cancel) setPosts([]);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [tag]);

    const grouped = useMemo(() => posts, [posts]);

    return (
        <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-16 pb-24" data-testid="blog-index-page">
            <header className="mb-14">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta">the journal</p>
                <h1 className="font-serif text-5xl sm:text-6xl mt-3 leading-[0.95]">
                    Every entry,
                    <em className="font-handwriting text-terracotta not-italic ml-3">in order of confession.</em>
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-sepia">
                    Sort by what you came here for. The regrets are usually the shortest. The fun ones
                    have the worst grammar.
                </p>
            </header>

            <div className="flex flex-wrap items-center gap-3 mb-14 border-b border-pencil pb-6" data-testid="tag-filter">
                {TAGS.map((t) => {
                    const active = t.key === tag;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTag(t.key)}
                            className={`px-4 py-1.5 font-handwriting text-2xl transition-colors ${
                                active
                                    ? "text-terracotta ink-underline"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                            data-testid={`filter-${t.key}`}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <p className="font-handwriting text-2xl text-muted-foreground">scribbling…</p>
            ) : grouped.length === 0 ? (
                <div className="text-center py-20">
                    <p className="font-handwriting text-3xl text-muted-foreground">
                        nothing under <em className="text-terracotta">{tag}</em> yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                    {grouped.map((p, i) => (
                        <PolaroidCard key={p.id} post={p} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
}
