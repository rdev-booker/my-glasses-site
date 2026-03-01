import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function AuthPage({ navigate }) {
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [form, setForm]       = useState({ email: '', name: '', password: '' });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const { token, user } = await fn(payload);
      login(token, user);
      navigate('store');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Mode toggle */}
        <div className="flex mb-10 border-b border-zinc-200">
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`flex-1 pb-3 text-xs tracking-[0.3em] uppercase transition-colors ${
                mode === m
                  ? 'border-b-2 border-zinc-900 text-zinc-900 -mb-px'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-5">
          {mode === 'register' && (
            <Field label="Full Name" type="text" value={form.name} onChange={set('name')} required />
          )}
          <Field label="Email"    type="email"    value={form.email}    onChange={set('email')}    required />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} required
                 hint={mode === 'register' ? 'Minimum 8 characters' : undefined} />

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-900 text-white text-xs tracking-[0.35em] uppercase
                       hover:bg-zinc-700 disabled:opacity-50 transition-colors duration-300"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-400">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="underline hover:text-zinc-700 transition-colors"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, hint, ...inputProps }) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-zinc-500 mb-2">{label}</label>
      <input
        {...inputProps}
        className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900
                   focus:outline-none focus:border-zinc-900 transition-colors placeholder-zinc-300"
      />
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}
