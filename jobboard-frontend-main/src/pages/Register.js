import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import userApi from "../api/userApi";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// +84 912 345 678, 0912345678, +1-202-555-0170 ...
const phoneRegex = /^[0-9+\-\s()]{8,20}$/;

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "seeker", // UI only — BE should ignore/override on server
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setErr = (msg) => setError(msg || "Something went wrong.");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.email.trim()) return "Email is required.";
    if (!emailRegex.test(form.email)) return "Invalid email format.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setErr(v); return; }

    setLoading(true);
    try {
      const payload = {
        // ⚠️ khớp DB: full_name thay vì name
        full_name: form.name.trim(),
        email: form.email.trim(),
        username: form.email.trim(),   // nếu BE cần
        phone: form.phone.trim(),
        password: form.password,       // BE sẽ hash
        role: form.role,               // UI only — server nên bỏ qua/override
      };
      await userApi.register(payload);
      alert("🎉 Registered successfully!");
      navigate("/login");
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      if (status === 409) {
        setErr("Account already exists. Please log in.");
      } else if (status === 422 && Array.isArray(detail)) {
        // Pydantic validation error
        setErr(detail[0]?.msg || "Invalid input.");
      } else {
        setErr(typeof detail === "string" ? detail : (detail?.msg || "Registration failed."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        setErr("Google credential is missing.");
        return;
      }
      const decoded = jwtDecode(credentialResponse.credential);
      const name = decoded?.name || decoded?.given_name || "Google User";
      const email = decoded?.email;

      if (!email) {
        setErr("Google account has no email.");
        return;
      }

      // Google không cung cấp phone → để trống
      const payload = {
        full_name: name,
        email,
        username: email,
        phone: "",
        password: "google_oauth_user", // server nên nhận biết & xử lý riêng
        role: "seeker",
      };

      try {
        await userApi.register(payload);
        alert("🎉 Registered with Google successfully!");
        navigate("/login");
      } catch (err) {
        if (err?.response?.status === 409) {
          // Tài khoản đã tồn tại → thử login luôn
          try {
            await userApi.login({ username: email, password: "google_oauth_user" });
            navigate("/");
          } catch {
            setErr("Your account exists. Please log in.");
          }
        } else {
          const detail = err?.response?.data?.detail;
          setErr(Array.isArray(detail) ? (detail[0]?.msg || "Invalid input.") :
                (typeof detail === "string" ? detail : (detail?.msg || "Registration failed.")));
        }
      }
    } catch {
      setErr("Google Sign-In failed to decode token.");
    }
  };

  const handleGoogleError = () => setErr("Google Sign-In failed.");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Create an Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="email"
            disabled={loading}
          />


          <input
            type="password"
            name="password"
            placeholder="Password (≥ 6 chars)"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="new-password"
            disabled={loading}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          >
            <option value="seeker">Seeker</option>
            <option value="employer">Employer</option>
          </select>

          <button
            type="submit"
            className={`w-full text-white py-2 rounded-md transition ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Register"}
          </button>
        </form>

        <div className="flex flex-col items-center mt-6">
          <p className="text-sm text-gray-500 mb-2">or sign up with</p>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
