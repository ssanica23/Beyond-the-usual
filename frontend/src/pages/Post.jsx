import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatDate } from "../lib/api";
import { ArrowLeft } from "lucide-react";

export default function Post() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancel = false;
        (async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/posts/${slug}`);
                if (!cancel) setPost(data);
            } catch (e) {
                if (!cancel) setNotFound(true);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, [slug]);

    if (loading) return <div className="max-w-3xl mx-auto px-6 py-24 font-handwriting text-2xl text-muted-foreground">scribbling…</div>;
    if (notFound) return (
        <div className="max-w-3xl mx-auto px-6 py-24 text-center" data-testid="post-not-found">
            <h1 className="font-serif text-5xl mb-4">page torn out.</h1>
            <p className="font-handwriting text-2xl text-muted-foreground mb-8">
                this entry has gone missing — or maybe was never written.
            </p>
            <Link to="/blog" className="font-mono text-xs uppercase tracking-[0.2em] underline">
                back to the journal
            </Link>
        </div>
    );

    return (
        <article className="max-w-3xl mx-auto px-6 sm:px-10 pt-12 pb-24" data-testid="post-detail">
            <Link
                to="/blog"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-terracotta mb-12"
                data-testid="back-to-blog"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> back to the journal
            </Link>

            <header className="mb-12">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta mb-4">
                   written {new Date(post.created_at).toLocaleDateString("en-GB")} · filed under {post.tag}
                </p>
                <h1 className="font-serif text-5xl sm:text-6xl leading-[1] tracking-tight" data-testid="post-title">
                    {post.title}
                </h1>
                {post.excerpt && (
                    <p className="mt-6 font-handwriting text-3xl text-sepia leading-snug">
                        {post.excerpt}
                    </p>
                )}
            </header>

            {post.cover_image && (
                <figure className="relative mb-14 mx-auto" style={{ maxWidth: "92%" }}>
                    <span className="tape -top-4 left-10 w-28 h-7 rotate-[-4deg]" aria-hidden />
                    <span className="tape -top-3 right-10 w-24 h-6 rotate-[6deg]" aria-hidden />
                    <div className="polaroid !pb-6">
                        <img src={post.cover_image} alt={post.title} className="w-full h-auto object-cover" />
                    </div>
                </figure>
            )}

            <div className="prose-journal" data-testid="post-content">
                {post.content.split(/\n\n+/).map((para, idx) => (
                    <p key={idx}>{para}</p>
                ))}
            </div>

            <div className="mt-20 pt-10 border-t border-pencil flex items-center justify-between">
                <p  className="font-handwriting text-2xl text-muted-foreground">
                    — written {new Date(post.created_at).toLocaleDateString("en-GB")}
                </p>
                <Link to="/blog" className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta hover:underline">
                    next entry →
                </Link>
            </div>
        </article>
    );
}
