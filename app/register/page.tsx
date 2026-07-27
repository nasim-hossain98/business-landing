"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, User, Store, Mail, Phone, MapPin, Home, Building2, Lock, Eye, EyeOff, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const roleConfig = {
  customer: {
    title: "Customer Registration",
    subtitle: "Create your account to shop and track orders",
    icon: User,
    color: "from-amber-400 to-amber-600",
  },
  vendor: {
    title: "Vendor Registration",
    subtitle: "Start selling on LUXE — grow your business with us",
    icon: Store,
    color: "from-amber-400 to-amber-600",
  },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as "customer" | "vendor") || "customer";
  const config = roleConfig[role];

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  });

  const fields = [
    { key: "firstName", label: "First Name", icon: User, type: "text", required: true, half: true },
    { key: "lastName", label: "Last Name", icon: User, type: "text", required: true, half: true },
    { key: "email", label: "Email Address", icon: Mail, type: "email", required: true, half: true },
    { key: "phone", label: "Phone Number", icon: Phone, type: "tel", required: true, half: true },
    { key: "address", label: "Street Address", icon: MapPin, type: "text", required: true, full: true },
    { key: "city", label: "City", icon: Home, type: "text", required: true, half: true },
    { key: "companyName", label: "Company Name", icon: Building2, type: "text", required: role === "vendor", half: true, vendorOnly: true },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  return (
    <>
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-6">
            <Check size={48} className="text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-stone-900 dark:text-white mb-2">
            Registration Successful!
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-md">
            Your account has been created. You can now start shopping on LUXE.
          </p>
        </motion.div>
      ) : (
        <div className="rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 sm:p-10">
          <div className="mb-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mx-auto mb-4 shadow-lg">
              <config.icon size={28} className="text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-stone-900 dark:text-white mb-2">
              {config.title}
            </h1>
            <p className="text-stone-500 dark:text-stone-400">
              {config.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {fields.filter(f => !f.vendorOnly || role === "vendor").map((f) => (
                <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {f.label}
                  </label>
                  <div className="relative">
                    <f.icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-3 pl-10 pr-4 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-3 pl-10 pr-12 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-3 pl-10 pr-12 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-slide py-3.5 text-sm font-semibold text-white tracking-wider uppercase"
            >
              Create Account
            </button>

            <p className="text-center text-sm text-stone-500 dark:text-stone-400">
              Already have an account?{" "}
              <Link href="/" className="font-medium text-amber-500 hover:text-amber-600 transition-colors duration-200">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      )}
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-white dark:bg-stone-950">
        <div className="mx-auto max-w-3xl px-6">
          <div className="py-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-amber-500 transition-colors duration-300"
            >
              <ChevronLeft size={16} />
              Back to Home
            </Link>
          </div>

          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
