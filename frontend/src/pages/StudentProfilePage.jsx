import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const buildForm = (user) => ({
  fullName: user?.fullName || "",
  phone: user?.phone || "",
  alternatePhone: user?.alternatePhone || "",
  personalEmail: user?.personalEmail || "",
  address: user?.address || "",
  city: user?.city || "",
  state: user?.state || "",
  pincode: user?.pincode || "",
  rollNo: user?.rollNo || "",
  registerNo: user?.registerNo || "",
  degree: user?.degree || "",
  branch: user?.branch || "",
  department: user?.department || "",
  collegeName: user?.collegeName || "",
  academicYear: user?.academicYear || "",
  section: user?.section || "",
  dateOfBirth: user?.dateOfBirth || "",
  gender: user?.gender || "",
  skills: user?.skills || "",
  areaOfInterest: user?.areaOfInterest || "",
  portfolioUrl: user?.portfolioUrl || "",
  linkedinUrl: user?.linkedinUrl || "",
  githubUrl: user?.githubUrl || "",
  emergencyContactName: user?.emergencyContactName || "",
  emergencyContactPhone: user?.emergencyContactPhone || "",
  profileImage: null
});

const fieldClass = "input-field";
const textOrFallback = (value, fallback = "N/A") => value || fallback;
const getProfileImageUrl = (profileImage) =>
  typeof profileImage === "string" ? profileImage : profileImage?.url || "";

const StudentProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => buildForm(user));
  const [status, setStatus] = useState({ error: "", success: "", saving: false });
  const [previewUrl, setPreviewUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setForm(buildForm(user));
    setPreviewUrl(getProfileImageUrl(user?.profileImage));
  }, [user]);

  useEffect(() => {
    if (!(form.profileImage instanceof File)) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(form.profileImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [form.profileImage]);

  if (user?.role !== "student") {
    return (
      <div className="h-full overflow-y-auto p-6 md:p-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Profile</h2>
          <p className="mt-2 text-sm text-slate-400">This page is available only for student accounts.</p>
        </section>
      </div>
    );
  }

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const startEdit = () => {
    setForm(buildForm(user));
    setPreviewUrl(getProfileImageUrl(user?.profileImage));
    setStatus({ error: "", success: "", saving: false });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm(buildForm(user));
    setPreviewUrl(getProfileImageUrl(user?.profileImage));
    setStatus({ error: "", success: "", saving: false });
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ error: "", success: "", saving: true });

    try {
      const profileFormData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          profileFormData.append(key, value);
        }
      });

      await updateProfile(profileFormData);
      setStatus({ error: "", success: "Student profile saved successfully.", saving: false });
      setIsEditing(false);
    } catch (error) {
      setStatus({
        error: error.response?.data?.message || "Unable to save profile right now.",
        success: "",
        saving: false
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="space-y-8">
        {!isEditing ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Student profile details</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Read-only view of your student profile details.
                </p>
              </div>
              <button
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                type="button"
                onClick={startEdit}
              >
                Edit
              </button>
            </div>

            {status.success ? <p className="mt-4 text-sm text-emerald-400">{status.success}</p> : null}

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.35fr_0.65fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex flex-col items-center text-center">
                  {previewUrl ? (
                    <img className="h-32 w-32 rounded-3xl object-cover" src={previewUrl} alt={user.fullName || "Student"} />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-slate-800 text-4xl font-semibold text-white">
                      {(user?.fullName || "S").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="mt-4 text-xl font-semibold text-white">{textOrFallback(user.fullName)}</p>
                  <p className="mt-2 text-sm text-slate-400">{textOrFallback(user.personalEmail || user.email)}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <div className="grid grid-cols-[190px_minmax(0,1fr)] divide-y divide-slate-800 text-sm">
                  {[
                    ["Full Name", user.fullName],
                    ["Roll No", user.rollNo],
                    ["Register No", user.registerNo],
                    ["College Name", user.collegeName],
                    ["Department", user.department],
                    ["Degree", user.degree],
                    ["Branch", user.branch],
                    ["Academic Year", user.academicYear],
                    ["Section", user.section],
                    ["Date of Birth", user.dateOfBirth],
                    ["Gender", user.gender],
                    ["Phone", user.phone],
                    ["Alternate Phone", user.alternatePhone],
                    ["Personal Email", user.personalEmail],
                    ["Address", user.address],
                    ["City", user.city],
                    ["State", user.state],
                    ["Pincode", user.pincode],
                    ["Skills", user.skills],
                    ["Area of Interest", user.areaOfInterest],
                    ["Portfolio URL", user.portfolioUrl],
                    ["LinkedIn URL", user.linkedinUrl],
                    ["GitHub URL", user.githubUrl],
                    ["Emergency Contact Name", user.emergencyContactName],
                    ["Emergency Contact Phone", user.emergencyContactPhone]
                  ].map(([label, value]) => (
                    <>
                      <div key={`${label}-label`} className="bg-slate-900/80 px-5 py-4 text-slate-400">{label}</div>
                      <div key={`${label}-value`} className="bg-slate-900/30 px-5 py-4 text-slate-200">{textOrFallback(value)}</div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {isEditing ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-xl font-semibold text-white">Edit student profile</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Update the details most companies and college approvers usually ask for.
                </p>
              </div>
              <button
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-500 hover:text-white"
                type="button"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="md:col-span-2">
                <input
                  className={fieldClass}
                  type="file"
                  accept="image/*"
                  onChange={(event) => setField("profileImage", event.target.files?.[0] || null)}
                />
              </div>
              <input className={`${fieldClass} md:col-span-2`} placeholder="Full name" value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} />
              <input className={fieldClass} placeholder="Roll number" value={form.rollNo} onChange={(event) => setField("rollNo", event.target.value)} />
              <input className={fieldClass} placeholder="Register number" value={form.registerNo} onChange={(event) => setField("registerNo", event.target.value)} />
              <input className={fieldClass} placeholder="College name" value={form.collegeName} onChange={(event) => setField("collegeName", event.target.value)} />
              <input className={fieldClass} placeholder="Department" value={form.department} onChange={(event) => setField("department", event.target.value)} />
              <input className={fieldClass} placeholder="Degree" value={form.degree} onChange={(event) => setField("degree", event.target.value)} />
              <input className={fieldClass} placeholder="Branch" value={form.branch} onChange={(event) => setField("branch", event.target.value)} />
              <input className={fieldClass} placeholder="Academic year" value={form.academicYear} onChange={(event) => setField("academicYear", event.target.value)} />
              <input className={fieldClass} placeholder="Section" value={form.section} onChange={(event) => setField("section", event.target.value)} />
              <input className={fieldClass} type="date" value={form.dateOfBirth} onChange={(event) => setField("dateOfBirth", event.target.value)} />
              <select className={fieldClass} value={form.gender} onChange={(event) => setField("gender", event.target.value)}>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input className={fieldClass} placeholder="Phone" value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
              <input className={fieldClass} placeholder="Alternate phone" value={form.alternatePhone} onChange={(event) => setField("alternatePhone", event.target.value)} />
              <input className={fieldClass} type="email" placeholder="Personal email" value={form.personalEmail} onChange={(event) => setField("personalEmail", event.target.value)} />
              <input className={fieldClass} placeholder="Pincode" value={form.pincode} onChange={(event) => setField("pincode", event.target.value)} />
              <input className={`${fieldClass} md:col-span-2`} placeholder="Address" value={form.address} onChange={(event) => setField("address", event.target.value)} />
              <input className={fieldClass} placeholder="City" value={form.city} onChange={(event) => setField("city", event.target.value)} />
              <input className={fieldClass} placeholder="State" value={form.state} onChange={(event) => setField("state", event.target.value)} />
              <textarea className={`${fieldClass} min-h-28 md:col-span-2`} placeholder="Skills" value={form.skills} onChange={(event) => setField("skills", event.target.value)} />
              <textarea className={`${fieldClass} min-h-28 md:col-span-2`} placeholder="Area of interest" value={form.areaOfInterest} onChange={(event) => setField("areaOfInterest", event.target.value)} />
              <input className={fieldClass} placeholder="Portfolio URL" value={form.portfolioUrl} onChange={(event) => setField("portfolioUrl", event.target.value)} />
              <input className={fieldClass} placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={(event) => setField("linkedinUrl", event.target.value)} />
              <input className={`${fieldClass} md:col-span-2`} placeholder="GitHub URL" value={form.githubUrl} onChange={(event) => setField("githubUrl", event.target.value)} />
              <input className={fieldClass} placeholder="Emergency contact name" value={form.emergencyContactName} onChange={(event) => setField("emergencyContactName", event.target.value)} />
              <input className={fieldClass} placeholder="Emergency contact phone" value={form.emergencyContactPhone} onChange={(event) => setField("emergencyContactPhone", event.target.value)} />
              {status.error ? <p className="md:col-span-2 text-sm text-rose-400">{status.error}</p> : null}
              {status.success ? <p className="md:col-span-2 text-sm text-emerald-400">{status.success}</p> : null}
              <button className="primary-button md:col-span-2" type="submit" disabled={status.saving}>
                {status.saving ? "Saving..." : "Save student profile"}
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default StudentProfilePage;
