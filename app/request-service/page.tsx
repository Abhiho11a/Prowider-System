"use client";

import { useState } from "react";
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

type FormData = {
  fullName: string;
  phone: string;
  city: string;
  serviceType: string;
  description: string;
};

type ToastType = "success" | "error" | null;

export default function RequestServicePage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    city: "",
    serviceType: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  }>({
    message: "",
    type: null,
  });

  const showToast = (
    message: string,
    type: "success" | "error"
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        message: "",
        type: null,
      });
    }, 4000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 10) {
        setFormData((prev) => ({
          ...prev,
          [name]: numbersOnly,
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.city.trim() ||
      !formData.serviceType.trim() ||
      !formData.description.trim()
    ) {
      showToast(
        "Please fill all required fields",
        "error"
      );
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      showToast(
        "Phone number must contain exactly 10 digits",
        "error"
      );
      return false;
    }

    return true;
  };

  const clearForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      city: "",
      serviceType: "",
      description: "",
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await fetch(
        "/api/leads",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            formData
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          data?.message
            ?.toLowerCase()
            .includes("duplicate")
        ) {
          showToast(
            "You have already submitted a request for this service",
            "error"
          );
        } else {
          showToast(
            data.message ||
              "Something went wrong",
            "error"
          );
        }

        return;
      }

      showToast(
        "Your request has been submitted successfully",
        "success"
      );

      clearForm();
    } catch (error) {
      console.log(error);

      showToast(
        "Unable to submit request",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">

      {/* Toast */}

      {toast.type && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl px-5 py-4 shadow-lg border backdrop-blur-md transition-all
          
          ${
            toast.type === "success"
              ? "bg-white border-green-200"
              : "bg-white border-red-200"
          }`}
        >
          {toast.type ===
          "success" ? (
            <CheckCircle2
              className="text-green-500"
              size={20}
            />
          ) : (
            <AlertCircle
              className="text-red-500"
              size={20}
            />
          )}

          <p className="text-sm font-medium text-slate-700">
            {toast.message}
          </p>
        </div>
      )}

      <div className="w-full max-w-2xl">

        {/* Header */}

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Request a Service
          </h1>

          <p className="mt-2 text-slate-500">
            Submit your request and we
            will connect you with a
            provider.
          </p>
        </div>

        {/* Card */}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Full Name */}

            <InputField
              icon={
                <User size={18} />
              }
              label="Full Name"
            >
              <input
                type="text"
                name="fullName"
                value={
                  formData.fullName
                }
                onChange={
                  handleChange
                }
                placeholder="John Doe"
                className="w-full bg-transparent outline-none"
              />
            </InputField>

            {/* Phone */}

            <InputField
              icon={
                <Phone size={18} />
              }
              label="Phone Number"
            >
              <input
                type="text"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                placeholder="9876543210"
                className="w-full bg-transparent outline-none"
              />
            </InputField>

            {/* City */}

            <InputField
              icon={
                <MapPin size={18} />
              }
              label="City"
            >
              <input
                type="text"
                name="city"
                value={
                  formData.city
                }
                onChange={
                  handleChange
                }
                placeholder="Bangalore"
                className="w-full bg-transparent outline-none"
              />
            </InputField>

            {/* Service */}

            <InputField
              icon={
                <Briefcase size={18} />
              }
              label="Service Type"
            >
              <select
                name="serviceType"
                value={
                  formData.serviceType
                }
                onChange={
                  handleChange
                }
                className="w-full bg-transparent outline-none text-slate-700"
              >
                <option value="">
                  Select Service
                </option>

                <option>
                  Service 1
                </option>

                <option>
                  Service 2
                </option>

                <option>
                  Service 3
                </option>
              </select>
            </InputField>

            {/* Description */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText
                  size={18}
                />
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                rows={5}
                placeholder="Describe your request..."
                className="w-full rounded-2xl border text-neutral-700 border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            {/* Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
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

      <div className="flex items-center gap-3 rounded-2xl border text-neutral-700 border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-slate-400 focus-within:bg-white">
        <div className="text-slate-400">
          {icon}
        </div>

        {children}
      </div>
    </div>
  );
}