import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        const res = await login(email.trim().toLowerCase(), password);
        setSubmitting(false);
        if (res.ok) navigate("/admin", { replace: true });
        else setError(res.error || "Could not sign in.");
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-16" data-testid="login-page">
            <div className="w-full max-w-md">
                <div className="paper-bg border border-pencil shadow-sm p-10 relative">
                    <span className="tape -top-3 left-1/2 -translate-x-1/2 w-32 h-7 rotate-[-2deg]" aria-hidden />
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-terracotta mb-3">
                        for the editor only
                    </p>
                    <h1 className="font-serif text-4xl mb-2">Sign in to the journal</h1>
                    <p className="font-handwriting text-xl text-muted-foreground mb-8">
                        only the writer gets the pencil.
                    </p>

                    <form onSubmit={onSubmit} className="space-y-5" data-testid="login-form">
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-sepia block mb-2">
                                email
                            </label>
                            <input
                                type="email"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-pencil focus:border-terracotta outline-none py-2 font-body text-lg"
                                data-testid="login-email-input"
                            />
                        </div>
                        <div>
                            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-sepia block mb-2">
                                password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-pencil focus:border-terracotta outline-none py-2 font-body text-lg"
                                data-testid="login-password-input"
                            />
                        </div>

                        {error && (
                            <p className="font-mono text-xs text-destructive" data-testid="login-error">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-foreground text-cream font-mono text-xs uppercase tracking-[0.25em] py-3 hover:bg-terracotta transition-colors disabled:opacity-60"
                            data-testid="login-submit-btn"
                        >
                            {submitting ? "opening the notebook…" : "open the notebook"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
