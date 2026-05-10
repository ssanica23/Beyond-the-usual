import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import PolaroidCard from "../components/PolaroidCard";
import { ArrowRight } from "lucide-react";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                const { data } = await api.get("/posts");
                if (!cancel) setPosts(data);
            } catch {
                if (!cancel) setPosts([]);
            } finally {
                if (!cancel) setLoading(false);
            }
        })();
        return () => { cancel = true; };
    }, []);

    const latest = posts.slice(0, 6);

    return (
        <div data-testid="home-page">
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-20 grid md:grid-cols-12 gap-10 items-center">
                    <div className="md:col-span-7 fade-rise">
                        <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta mb-6" data-testid="hero-eyebrow">
                            volume one · the journal
                        </p>
                        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-foreground">
                            my own
                            <br />
                            <span className="ink-underline">experiences</span>
                            <br />
                            <em className="font-handwriting text-terracotta not-italic text-6xl sm:text-7xl lg:text-8xl">
                                of university.
                            </em>
                        </h1>
                        <p className="mt-8 max-w-xl text-lg text-sepia leading-relaxed">
                            experiences, opinions and advices.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center gap-6">
                            <Link
                                to="/blog"
                                className="group inline-flex items-center gap-2 px-6 py-3 bg-foreground text-cream font-mono text-xs uppercase tracking-[0.2em] hover:bg-terracotta transition-colors"
                                data-testid="hero-cta-read"
                            >
                                read the journal
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                to="/about"
                                className="font-handwriting text-2xl text-sepia hover:text-terracotta transition-colors"
                                data-testid="hero-cta-about"
                            >
                                or first, who am I? →
                            </Link>
                        </div>
                    </div>

                    <div className="md:col-span-5 relative h-[420px] hidden md:block">
                        <div className="absolute top-2 right-6 polaroid wiggle-in" style={{ "--start-rot": "5deg", "--end-rot": "5deg" }}>
                            <span className="tape -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rotate-[-3deg]" aria-hidden />
                            <img
                                src="https://i.postimg.cc/bwJT7g0D/image.jpg"
                                alt="journal"
                                className="w-56 h-72 object-cover"
                            />
                            <p className="absolute bottom-3 left-0 right-0 text-center font-handwriting text-xl text-sepia">
                                week 1, dorm desk
                            </p>
                        </div>
                        <div className="absolute bottom-0 left-2 polaroid wiggle-in" style={{ animationDelay: "200ms", "--start-rot": "-7deg", "--end-rot": "-7deg" }}>
                            <span className="tape -top-3 left-6 w-20 h-6 rotate-[-12deg]" aria-hidden />
                            <img
                                src="https://i.postimg.cc/sXQfqk1C/mail-google.jpg"
                                alt="campus"
                                className="w-52 h-64 object-cover"
                            />
                            <p className="absolute bottom-3 left-0 right-0 text-center font-handwriting text-xl text-sepia">
                                The rare times I played badminton
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest posts */}
            <section className="border-t border-pencil bg-secondary/40">
                <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">recent entries</p>
                            <h2 className="font-serif text-4xl sm:text-5xl mt-2">From the back pocket</h2>
                        </div>
                        <Link to="/blog" className="font-handwriting text-2xl text-terracotta hover:text-foreground transition-colors hidden sm:inline" data-testid="home-see-all">
                            see all entries →
                        </Link>
                    </div>

                    {loading ? (
                        <p className="font-handwriting text-2xl text-muted-foreground">scribbling…</p>
                    ) : latest.length === 0 ? (
                        <p className="font-handwriting text-2xl text-muted-foreground">no entries yet — the ink is still wet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 pt-4">
                            {latest.map((p, i) => (
                                <PolaroidCard key={p.id} post={p} index={i} />
                            ))}
                        </div>
                    )}

                    <div className="sm:hidden mt-12 text-center">
                        <Link to="/blog" className="font-handwriting text-2xl text-terracotta">see all entries →</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
