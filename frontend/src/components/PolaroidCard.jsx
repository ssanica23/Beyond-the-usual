import { Link } from "react-router-dom";
import { shortDate } from "../lib/api";

const TAG_LABEL = {
    memories: "memory",
    regrets: "regret",
    fun: "fun",
};

const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "-rotate-3", "rotate-3"];

export default function PolaroidCard({ post, index = 0 }) {
    const rot = ROTATIONS[index % ROTATIONS.length];
    return (
        <Link
            to={`/blog/${post.slug}`}
            className={`group relative block transform ${rot} hover:rotate-0 transition-transform duration-500 ease-out`}
            data-testid={`polaroid-${post.slug}`}
        >
            <div className="polaroid relative">
                <span
                    className="tape -top-3 left-6 w-20 h-6 rotate-[-6deg]"
                    aria-hidden
                />
                {post.cover_image ? (
                    <div className="overflow-hidden bg-ecru" style={{ aspectRatio: "4 / 3" }}>
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <div
                        className="bg-gradient-to-br from-ecru to-pencil flex items-center justify-center"
                        style={{ aspectRatio: "4 / 3" }}
                    >
                        <span className="font-handwriting text-4xl text-sepia/70">{post.tag}</span>
                    </div>
                )}
                <div className="pt-4 px-1 pb-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {shortDate(post.created_at)} · {TAG_LABEL[post.tag] || post.tag}
                    </p>
                    <h3 className="font-handwriting text-2xl leading-tight text-foreground mt-1 line-clamp-2">
                        {post.title}
                    </h3>
                </div>
            </div>
        </Link>
    );
}
