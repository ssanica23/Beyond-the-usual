export default function About() {
    return (
        <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-16 pb-24" data-testid="about-page">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta mb-4">about</p>
            <h1 className="font-serif text-5xl sm:text-6xl leading-[0.95]">
                Hi, I'm the
                <em className="font-handwriting text-terracotta not-italic ml-3">narrator.</em>
            </h1>

            <div className="prose-journal mt-12">
                <p>
                    I started this journal somewhere around the middle of sophomore year, when I
                    realised I was already forgetting things. Names of professors. The exact joke
                    that made an entire dining hall go quiet. The version of myself who had not yet
                    bombed a midterm.
                </p>
                <p>
                    Most of what I write here is small. A coffee that mattered. A friendship that
                    didn't survive winter break. A regret I am only now able to put into words. I
                    think the best parts of college were never the things I planned — they were the
                    accidents, and the people who happened to be around when I tripped.
                </p>
                <p>
                    I post when I can, usually at night, usually after the last library has kicked
                    me out. If something here makes you remember something of your own — write it
                    down. The forgetting is the only enemy.
                </p>
            </div>

            <div className="mt-16 relative max-w-md">
                <div className="polaroid">
                    <span className="tape -top-3 left-10 w-20 h-6 rotate-[-6deg]" aria-hidden />
                    <div
                        className="aspect-[4/3] bg-gradient-to-br from-ecru via-pencil to-secondary flex items-center justify-center"
                    >
                        <span className="font-handwriting text-3xl text-sepia/80">[a self-portrait, allegedly]</span>
                    </div>
                    <p className="text-center font-handwriting text-2xl text-sepia mt-4">
                        the editor-in-chief of one (1) reader
                    </p>
                </div>
            </div>
        </div>
    );
}
