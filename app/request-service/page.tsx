"use client";

import BackToHomeLink from '@/components/BackToHomeLink'
import { FormEvent, useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function RequestServicePage() {
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: null }), 4000);
  }

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 10) setPhoneNumber(digits);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (
      !customerName.trim() ||
      !phoneNumber.trim() ||
      !city.trim() ||
      !serviceId ||
      !description.trim()
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      showToast("Phone number must contain exactly 10 digits", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          phone_number: phoneNumber,
          city,
          service_id: parseInt(serviceId, 10),
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Something went wrong", "error");
        return;
      }

      showToast(
        "Your request has been submitted successfully",
        "success"
      );
      setCustomerName("");
      setPhoneNumber("");
      setCity("");
      setServiceId("");
      setDescription("");
    } catch {
      showToast("Unable to submit request", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      {toast.type && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl border px-5 py-4 shadow-lg backdrop-blur-md ${
            toast.type === "success"
              ? "border-green-200 bg-white"
              : "border-red-200 bg-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="text-green-500" size={20} />
          ) : (
            <AlertCircle className="text-red-500" size={20} />
          )}
          <p className="text-sm font-medium text-slate-700">{toast.message}</p>
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl">
        <BackToHomeLink />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Request a Service
          </h1>
          <p className="mt-2 text-slate-500">
            Submit your request and we will connect you with a provider.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField icon={<User size={18} />} label="Full Name">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-transparent outline-none text-slate-800"
              />
            </InputField>

            <InputField icon={<Phone size={18} />} label="Phone Number">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-transparent outline-none text-slate-800"
              />
            </InputField>

            <InputField icon={<MapPin size={18} />} label="City">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bangalore"
                className="w-full bg-transparent outline-none text-slate-800"
              />
            </InputField>

            <InputField icon={<Briefcase size={18} />} label="Service Type">
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-700"
              >
                <option value="">Select Service</option>
                <option value="1">Service 1</option>
                <option value="2">Service 2</option>
                <option value="3">Service 3</option>
              </select>
            </InputField>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText size={18} />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe your request..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function InputField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        {icon}
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-slate-400 focus-within:bg-white">
        <div className="text-slate-400">{icon}</div>
        {children}
      </div>
    </div>
  );
}
