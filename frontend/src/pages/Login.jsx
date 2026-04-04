import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as loginApi } from "../api/auth.api";
import toast from "react-hot-toast";
import { TrendingUp } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await loginApi(form);
      const { user, accessToken, refreshToken } = res.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      login({ user, tokens: { accessToken, refreshToken } });

      toast.success(`Welcome back, ${user.name}!`);

      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill for evaluators
  const fillRole = (role) => {
    const creds = {
      ADMIN: { email: "admin@example.com", password: "Password@123" },
      ANALYST: { email: "analyst@example.com", password: "Password@123" },
      VIEWER: { email: "viewer@example.com", password: "Password@123" },
    };
    setForm(creds[role]);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mb-4">
            <TrendingUp className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FinanceOS</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Quick fill — helpful for evaluator */}
        <div className="card p-4 mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Quick login (demo)
          </p>
          <div className="flex gap-2">
            {["ADMIN", "ANALYST", "VIEWER"].map((role) => (
              <button
                key={role}
                onClick={() => fillRole(role)}
                className="flex-1 text-xs py-1.5 px-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              Sign in
            </Button>
          </form>
          {/* Already at bottom of Login.jsx — add this */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-600 font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
