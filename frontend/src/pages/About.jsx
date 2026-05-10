export default function About() {
    return (
        <div className="max-w-3xl mx-auto px-6 sm:px-10 pt-16 pb-24" data-testid="about-page">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta mb-4">about</p>
            <h1 className="font-serif text-5xl sm:text-6xl leading-[1.05]">
                All About <em className="font-handwriting text-terracotta not-italic ml-2">my blogs</em>
            </h1>

            <div className="prose-journal mt-12">
                <p>
                    I publish fun, online blogs that turn my experiences in university into entertaining reads.
                </p>
                <p>
                    From regrets to success and pleasant memories, I make my experiences and advice easy to
                    enjoy—anytime, anywhere.
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
