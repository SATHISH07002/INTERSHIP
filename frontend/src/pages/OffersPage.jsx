import { useEffect, useState } from "react";
import api from "../lib/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const defaultOffer = {
  title: "",
  type: "internship",
  location: "",
  stipend: "",
  description: "",
  applicationStartDate: "",
  applicationEndDate: ""
};

const getOfferWindowStatus = (offer) => {
  if (offer.isClosed) {
    return "closed";
  }

  const now = new Date();
  const start = new Date(`${offer.applicationStartDate}T00:00:00`);
  const end = new Date(`${offer.applicationEndDate}T23:59:59`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "open";
  }

  if (now < start) {
    return "upcoming";
  }

  if (now > end) {
    return "expired";
  }

  return "open";
};

const hasAppliedToOffer = (offer, userId) =>
  offer.applications?.some((application) => application.student === userId || application.student?._id === userId);

const getApplicant = (application) =>
  typeof application.student === "object" && application.student !== null ? application.student : null;

const OffersPage = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [offerForm, setOfferForm] = useState(defaultOffer);
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [offerActionFeedback, setOfferActionFeedback] = useState("");
  const [offerActionError, setOfferActionError] = useState("");

  const loadOffers = () => {
    api.get("/offers").then((response) => setOffers(response.data.data));
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const submitOffer = async (event) => {
    event.preventDefault();
    setFeedback("");
    setSubmitError("");

    if (
      offerForm.applicationStartDate &&
      offerForm.applicationEndDate &&
      new Date(`${offerForm.applicationEndDate}T23:59:59`) < new Date(`${offerForm.applicationStartDate}T00:00:00`)
    ) {
      setSubmitError("Application end date must be after the start date.");
      return;
    }

    try {
      await api.post("/offers", offerForm);
      setOfferForm(defaultOffer);
      setFeedback("Offer published successfully. It is now visible to students and college users.");
      loadOffers();
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Offer publishing failed.");
    }
  };

  const apply = async (offerId) => {
    setFeedback("");
    setSubmitError("");
    setOfferActionFeedback("");
    setOfferActionError("");

    try {
      await api.post(`/offers/${offerId}/apply`);
      setFeedback("Application submitted successfully.");
      loadOffers();
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Application failed.");
    }
  };

  const closeOffer = async (offerId) => {
    setOfferActionFeedback("");
    setOfferActionError("");

    try {
      await api.put(`/offers/${offerId}/close`);
      setOffers((current) =>
        current.map((offer) =>
          offer._id === offerId
            ? {
                ...offer,
                isClosed: true,
                closedAt: new Date().toISOString()
              }
            : offer
        )
      );
      setOfferActionFeedback("Offer closed successfully. Students can no longer apply.");
      loadOffers();
    } catch (error) {
      setOfferActionError(error.response?.data?.message || "Unable to close offer.");
    }
  };

  const toggleApplicants = (offerId) => {
    setExpandedOfferId((current) => (current === offerId ? null : offerId));
    setSelectedApplicant(null);
  };

  const isOfferOwner = (offer) => user?.role === "company" && offer.postedBy?._id === user?._id;

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {user?.role === "company" ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Post offer</h2>
            <p className="mt-2 text-sm text-slate-400">Publish internship or job notices for direct student applications.</p>
            <form className="mt-6 space-y-4" onSubmit={submitOffer}>
              <input className="input-field" placeholder="Title" value={offerForm.title} onChange={(event) => setOfferForm((current) => ({ ...current, title: event.target.value }))} />
              <select className="input-field" value={offerForm.type} onChange={(event) => setOfferForm((current) => ({ ...current, type: event.target.value }))}>
                <option value="internship">Internship</option>
                <option value="job">Job</option>
              </select>
              <input className="input-field" placeholder="Location" value={offerForm.location} onChange={(event) => setOfferForm((current) => ({ ...current, location: event.target.value }))} />
              <input className="input-field" placeholder="Stipend / CTC" value={offerForm.stipend} onChange={(event) => setOfferForm((current) => ({ ...current, stipend: event.target.value }))} />
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-300">Applications Open From</span>
                  <input
                    className="input-field"
                    type="date"
                    required
                    value={offerForm.applicationStartDate}
                    onChange={(event) => setOfferForm((current) => ({ ...current, applicationStartDate: event.target.value }))}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-300">Applications Close On</span>
                  <input
                    className="input-field"
                    type="date"
                    required
                    value={offerForm.applicationEndDate}
                    onChange={(event) => setOfferForm((current) => ({ ...current, applicationEndDate: event.target.value }))}
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500">
                The offer closes automatically on the end date. You can also close it manually anytime, and manual close overrides the date window.
              </p>
              <textarea className="input-field min-h-32" placeholder="Description" value={offerForm.description} onChange={(event) => setOfferForm((current) => ({ ...current, description: event.target.value }))} />
              {submitError ? <p className="text-sm text-rose-400">{submitError}</p> : null}
              {feedback ? <p className="text-sm text-emerald-400">{feedback}</p> : null}
              <button className="primary-button w-full" type="submit">Publish offer</button>
            </form>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Student applications</h2>
            <p className="mt-2 text-sm text-slate-400">
              Browse company notices and apply directly from the offer list.
            </p>
            {submitError ? <p className="mt-4 text-sm text-rose-400">{submitError}</p> : null}
            {feedback ? <p className="mt-4 text-sm text-emerald-400">{feedback}</p> : null}
          </section>
        )}

        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Open notices</h2>
          {offerActionError ? <p className="mt-4 text-sm text-rose-400">{offerActionError}</p> : null}
          {offerActionFeedback ? <p className="mt-4 text-sm text-emerald-400">{offerActionFeedback}</p> : null}
          <div className="mt-6 space-y-4">
            {offers.map((offer) => (
              <div key={offer._id} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-medium text-white">{offer.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {offer.company.name} - {offer.type} - {offer.location || "Remote / flexible"}
                    </p>
                    <p className="mt-3 text-sm text-slate-300">{offer.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                      {offer.stipend || "Compensation not specified"}
                    </p>
                    {offer.applicationStartDate && offer.applicationEndDate ? (
                      <p className="mt-3 text-sm text-slate-400">
                        Apply from {offer.applicationStartDate} to {offer.applicationEndDate}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-slate-400">No application deadline specified for this offer.</p>
                    )}
                    <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.24em] ${
                      getOfferWindowStatus(offer) === "closed"
                        ? "text-rose-400"
                        :
                      getOfferWindowStatus(offer) === "expired"
                        ? "text-rose-400"
                        : getOfferWindowStatus(offer) === "upcoming"
                          ? "text-amber-300"
                          : "text-emerald-400"
                    }`}>
                      {getOfferWindowStatus(offer)}
                    </p>
                  </div>
                  {user?.role === "student" ? (
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => apply(offer._id)}
                      disabled={getOfferWindowStatus(offer) !== "open" || hasAppliedToOffer(offer, user?._id)}
                    >
                      {hasAppliedToOffer(offer, user?._id)
                        ? "Applied"
                        : getOfferWindowStatus(offer) === "closed"
                        ? "Closed"
                        : getOfferWindowStatus(offer) === "expired"
                        ? "Expired"
                        : getOfferWindowStatus(offer) === "upcoming"
                          ? "Not Open Yet"
                          : "Apply"}
                    </button>
                  ) : isOfferOwner(offer) ? (
                    <div className="flex flex-wrap gap-3">
                      <button
                        className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-white"
                        type="button"
                        onClick={() => toggleApplicants(offer._id)}
                      >
                        View applicants ({offer.applications.length})
                      </button>
                      {!offer.isClosed ? (
                        <button
                          className="rounded-2xl border border-rose-500/40 px-4 py-3 text-sm text-rose-300 transition hover:border-rose-400 hover:text-white"
                          type="button"
                          onClick={() => closeOffer(offer._id)}
                        >
                          Close offer
                        </button>
                      ) : (
                        <span className="rounded-2xl border border-rose-500/30 px-4 py-3 text-sm text-rose-300">
                          Closed
                        </span>
                      )}
                    </div>
                  ) : null}
                  {user?.role === "college" ? (
                    <span className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-300">
                      Visible to students and college
                    </span>
                  ) : null}
                </div>
                {isOfferOwner(offer) && expandedOfferId === offer._id ? (
                  <div className="mt-5 border-t border-slate-800 pt-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Candidates</h3>
                    <div className="mt-4 space-y-3">
                      {offer.applications.length ? offer.applications.map((application, index) => (
                        <div key={application.student?._id || index} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                          <p className="font-medium text-white">{getApplicant(application)?.fullName || "Student"}</p>
                          <button
                            className="mt-3 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-white"
                            type="button"
                            onClick={() => setSelectedApplicant({ ...getApplicant(application), appliedAt: application.appliedAt })}
                          >
                            View details
                          </button>
                        </div>
                      )) : <p className="text-sm text-slate-400">No candidates have applied yet.</p>}
                    </div>
                    {selectedApplicant ? (
                      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-4">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Candidate Details</h4>
                          <button
                            className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-rose-500 hover:text-white"
                            type="button"
                            onClick={() => setSelectedApplicant(null)}
                          >
                            Close
                          </button>
                        </div>
                        <div className="grid grid-cols-[190px_minmax(0,1fr)] divide-y divide-slate-800 text-sm">
                          {[
                            ["Name", selectedApplicant.fullName],
                            ["Email", selectedApplicant.email],
                            ["Degree", selectedApplicant.degree],
                            ["Department", selectedApplicant.department],
                            ["College", selectedApplicant.collegeName],
                            ["Roll No", selectedApplicant.rollNo],
                            ["Register No", selectedApplicant.registerNo],
                            ["Phone", selectedApplicant.phone],
                            ["Applied On", selectedApplicant.appliedAt ? new Date(selectedApplicant.appliedAt).toLocaleString() : "N/A"]
                          ].map(([label, value]) => (
                            <>
                              <div key={`${label}-label`} className="bg-slate-900/80 px-5 py-4 text-slate-400">{label}</div>
                              <div key={`${label}-value`} className="bg-slate-900/30 px-5 py-4 text-slate-200">{value || "N/A"}</div>
                            </>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
            {!offers.length ? <p className="text-sm text-slate-400">No offers available.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OffersPage;
