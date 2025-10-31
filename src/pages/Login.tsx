import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../firebaseClient";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate("/"); 
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      alert("Login successful!");
      navigate("/");
    } catch (error: any) {
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1FC7D4] to-[#0a2540]">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 space-y-6 border border-white/20"
      >
        <h1 className="text-3xl font-bold text-white text-center">Welcome Back 👋</h1>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-white/20 bg-white/10 text-white placeholder-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FC7D4] transition"
        />
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border border-white/20 bg-white/10 text-white placeholder-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FC7D4] transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1FC7D4] text-white p-3 rounded-lg font-semibold hover:bg-[#17a8b4] transition-all shadow-md"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm text-gray-200 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#1FC7D4] hover:underline font-medium">
            Signup here
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

export default Login;