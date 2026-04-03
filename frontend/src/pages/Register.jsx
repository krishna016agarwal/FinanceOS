import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/auth.api';
import toast from 'react-hot-toast';
import { TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Register = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'VIEWER',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name            = 'Name is required';
    else if (form.name.length < 2) e.name            = 'Name must be at least 2 characters';
    if (!form.email)               e.email           = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password)            e.password        = 'Password is required';
    else if (form.password.length < 8)  e.password   = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Must contain an uppercase letter';
    else if (!/[0-9]/.test(form.password)) e.password = 'Must contain a number';
    if (!form.confirmPassword)     e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { name, email, password, role } = form;
      const res = await registerApi({ name, email, password, role });
      const { user, accessToken, refreshToken } = res.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      login({ user, tokens: { accessToken, refreshToken } });

      toast.success(`Account created! Welcome, ${user.name}`);

      if (user.role === 'VIEWER') navigate('/viewer');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mb-4">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1">Join FinanceOS today</p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              label="Full name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={set('name')}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              error={errors.email}
              autoComplete="email"
            />

            {/* Role selector */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Register as
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['VIEWER', 'ANALYST', 'ADMIN'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, role: r }))}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors
                      ${form.role === r
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {form.role === 'VIEWER'  && 'Read-only access. Admin can upgrade later.'}
                {form.role === 'ANALYST' && 'Can view records and dashboard analytics.'}
                {form.role === 'ADMIN'   && 'Full access including user management.'}
              </p>
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              autoComplete="new-password"
            />

            {/* Password strength indicator */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[
                    form.password.length >= 8,
                    /[A-Z]/.test(form.password),
                    /[0-9]/.test(form.password),
                    form.password.length >= 12,
                  ].map((met, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        met ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {[
                    !(/[A-Z]/.test(form.password)) && 'uppercase letter',
                    !(/[0-9]/.test(form.password)) && 'number',
                    form.password.length < 8 && '8+ characters',
                  ].filter(Boolean).join(', ')
                    ? `Missing: ${[
                        !(/[A-Z]/.test(form.password)) && 'uppercase letter',
                        !(/[0-9]/.test(form.password)) && 'number',
                        form.password.length < 8 && '8+ characters',
                      ].filter(Boolean).join(', ')}`
                    : '✓ Password looks good'
                  }
                </p>
              </div>
            )}

            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create account
            </Button>
          </form>
        </div>

        {/* Link to login */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;