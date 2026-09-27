import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { reportCorrection } from '../../services/investorsService';

export default function ReportCorrectionModal({ isOpen, onClose, investor, isDark }) {
    const [reporterName, setReporterName] = useState('');
    const [reporterEmail, setReporterEmail] = useState('');
    const [correctionType, setCorrectionType] = useState('INCORRECT_INFO');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reporterName.trim() || !reporterEmail.trim() || !description.trim()) {
            setError('Please complete all required fields.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            await reportCorrection({
                investorId: investor?.id,
                reporterName: reporterName.trim(),
                reporterEmail: reporterEmail.trim(),
                correctionType,
                description: description.trim(),
            });
            setSubmitted(true);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
                className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all ${
                    isDark ? 'bg-[#12131A] text-white border border-white/10' : 'bg-white text-gray-900 border border-gray-200'
                }`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                    <FaTimes size={16} />
                </button>

                {submitted ? (
                    <div className="text-center py-6">
                        <FaCheckCircle className="mx-auto text-emerald-500 mb-3" size={44} />
                        <h3 className="text-lg font-bold mb-2">Report Submitted</h3>
                        <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                            Thank you for helping keep EVOA accurate. Our integrity team will review this report and verify the information for <strong>{investor?.name || 'this profile'}</strong>.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-evoa text-white hover:bg-[#00a098]"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2.5 mb-1">
                            <FaExclamationTriangle className="text-amber-500" size={18} />
                            <h3 className="text-lg font-bold">Report Profile Issue</h3>
                        </div>
                        <p className={`text-xs mb-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                            Profile: <strong>{investor?.name}</strong> {investor?.companyName ? `(${investor.companyName})` : ''}
                        </p>

                        {error && (
                            <div className="p-3 mb-4 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-500">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Your Name *
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Your full name"
                                    value={reporterName}
                                    onChange={(e) => setReporterName(e.target.value)}
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-black'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Your Email *
                                </label>
                                <input
                                    required
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={reporterEmail}
                                    onChange={(e) => setReporterEmail(e.target.value)}
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-black'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Type of Issue
                                </label>
                                <select
                                    value={correctionType}
                                    onChange={(e) => setCorrectionType(e.target.value)}
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                        isDark ? 'bg-[#1a1b24] border-white/10 text-white' : 'bg-white border-gray-300 text-black'
                                    }`}
                                >
                                    <option value="INCORRECT_INFO">Incorrect Details / Designation</option>
                                    <option value="IMPERSONATION">Impersonation / Unauthorized Info</option>
                                    <option value="OUTDATED_DATA">Outdated Organization / Investment Focus</option>
                                    <option value="OTHER">Other / Request Removal</option>
                                </select>
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Description of Incorrect Information *
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Please describe what information needs correction and provide any public reference links if available."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-300 text-black'
                                    }`}
                                />
                            </div>

                            <div className="flex gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border ${
                                        isDark ? 'border-white/15 text-white hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-evoa text-white hover:bg-[#00a098] flex items-center justify-center gap-2"
                                >
                                    {submitting ? <FaSpinner className="animate-spin" size={14} /> : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
