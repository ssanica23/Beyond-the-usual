import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, formatApiErrorDetail } from "../../lib/api";

const TAGS = ["memories", "regrets", "fun"];

export default function Editor() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [tag, setTag] = useState("memories");
    const [coverImage, setCoverImage] = useState("");
    const [status, setStatus] = useState("draft"); // new entries start as draft
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const { data: post } = await api.get(`/admin/posts/${id}`);
                setTitle(post.title);
                setExcerpt(post.excerpt || "");
                setContent(post.content);
                setTag(post.tag);
                setCoverImage(post.cover_image || "");
                setStatus(post.status || "published");
            } catch (e) {
                setError(formatApiErrorDetail(e.response?.data?.detail) || e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isEdit]);

    const onPickImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) {
            alert("Please pick an image under 4MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setCoverImage(reader.result);
        reader.readAsDataURL(file);
    };

    const save = async (targetStatus) => {
        setError("");
        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                excerpt: excerpt.trim(),
                content: content.trim(),
                tag,
                cover_image: coverImage || null,
                status: targetStatus,
            };
            if (isEdit) {
                await api.put(`/posts/${id}`, payload);
            } else {
                await api.post("/posts", payload);
            }
            navigate("/admin", { replace: true });
        } catch (err) {
            setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="max-w-3xl mx-auto px-6 py-16 font-handwriting text-2xl text-muted-foreground">
                loading…
            </div>
        );

    return (
        <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-12 pb-24" data-testid="admin-editor-page">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta">
                {isEdit ? "edit entry" : "new entry"}
                {isEdit && status === "draft" && (
                    <span className="ml-3 inline-block bg-secondary text-foreground px-2 py-0.5 text-[10px]">
                        draft
                    </span>
                )}
            </p>
            <h1 className="font-serif text-5xl mt-2 mb-10">
                {isEdit ? "Tidy up the page" : "What happened today?"}
            </h1>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-8" data-testid="post-form">
                <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-sepia block mb-2">
                        title
                    </label>
                    <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent border-b-2 border-pencil focus:border-terracotta outline-none py-2 font-serif text-3xl"
                        data-testid="post-title-input"
                    />
                </div>

                <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-sepia block mb-2">
                        tag
                    </label>
                    <div className="flex flex-wrap gap-2" data-testid="post-tag-group">
                        {TAGS.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTag(t)}
                                className={`px-4 py-1.5 font-handwriting text-2xl border transition-colors ${
                                    tag === t
                                        ? "bg-foreground text-cream border-foreground"
                                        : "border-pencil text-sepia hover:border-foreground"
                                }`}
                                data-testid={`post-tag-${t}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-sepia block mb-2">
                        excerpt <span className="normal-case text-muted-foreground">— a one-liner for the polaroid back</span>
                    </label>
                    <input
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full bg-transparent border-b-2 border-pencil focus:border-terracotta outline-none py-2 font-handwriting text-2xl"
                        data-testid="post-excerpt-input"
                    />
                </div>

                <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-sepia block mb-2">
                        cover image
                    </label>
                    {coverImage && (
                        <div className="mb-3 relative inline-block">
                            <img src={coverImage} alt="cover" className="max-h-60 object-cover border border-pencil" />
                            <button
                                type="button"
                                onClick={() => setCoverImage("")}
                                className="absolute top-2 right-2 bg-foreground text-cream font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-1"
                                data-testid="post-remove-image"
                            >
                                remove
                            </button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onPickImage}
                        className="block font-mono text-xs"
                        data-testid="post-image-input"
                    />
                    <p className="font-mono text-[10px] text-muted-foreground mt-2">
                        or paste an image URL:
                    </p>
                    <input
                        type="url"
                        placeholder="https://…"
                        value={coverImage.startsWith("data:") ? "" : coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full bg-transparent border-b border-pencil focus:border-terracotta outline-none py-1 font-mono text-xs mt-1"
                        data-testid="post-image-url-input"
                    />
                </div>

                <div>
                    <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-sepia block mb-2">
                        the entry — separate paragraphs with a blank line
                    </label>
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={16}
                        className="w-full bg-paper border border-pencil focus:border-terracotta outline-none p-4 font-body text-lg leading-relaxed"
                        data-testid="post-content-input"
                    />
                    <p className="font-mono text-[10px] text-muted-foreground mt-2 text-right">
                        {content.trim() ? content.trim().split(/\s+/).length : 0} words
                    </p>
                </div>

                {error && (
                    <p className="font-mono text-xs text-destructive" data-testid="post-error">{error}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-pencil">
                    <button
                        type="button"
                        onClick={() => save("draft")}
                        disabled={submitting || !title.trim() || !content.trim()}
                        className="px-5 py-3 border-2 border-foreground text-foreground font-mono text-xs uppercase tracking-[0.25em] hover:bg-foreground hover:text-cream transition-colors disabled:opacity-60"
                        data-testid="post-save-draft-btn"
                    >
                        {submitting ? "saving…" : "save as draft"}
                    </button>
                    <button
                        type="button"
                        onClick={() => save("published")}
                        disabled={submitting || !title.trim() || !content.trim()}
                        className="px-6 py-3 bg-terracotta text-cream font-mono text-xs uppercase tracking-[0.25em] hover:bg-foreground transition-colors disabled:opacity-60"
                        data-testid="post-publish-btn"
                    >
                        {submitting ? "saving…" : isEdit && status === "published" ? "save changes" : "publish entry"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/admin")}
                        className="ml-auto font-handwriting text-2xl text-sepia hover:text-terracotta"
                        data-testid="post-cancel-btn"
                    >
                        cancel
                    </button>
                </div>
                {!isEdit && (
                    <p className="font-handwriting text-xl text-muted-foreground">
                        drafts stay private — only published entries show up on your blog.
                    </p>
                )}
            </form>
        </div>
    );
}
