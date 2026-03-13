import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { IoWarning, IoClose } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { deleteAccount } from "../../services/usersService";
import { supabase } from "../../config/supabase";

/**
 * DeleteAccountDialog
 *
 * Confirmation bottom-sheet for permanent account deletion.
 * User must type "DELETE" before the confirm button is enabled.
 *
 * Props:
 *   isOpen  : boolean
 *   onClose : () => void
 */
export default function DeleteAccountDialog({ isOpen, onClose }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [confirmText, setConfirmText] = useState("");
    const [status, setStatus] = useState("idle"); // idle | deleting | error
    const [errorMsg, setErrorMsg] = useState("");

    const canDelete = confirmText.trim() === "DELETE";

    const handleDelete = async () => {
        if (!canDelete) return;
        setStatus("deleting");
        setErrorMsg("");
        try {
            await deleteAccount();
            // Sign out from Supabase locally
            await supabase.auth.signOut();
            // Clear any local state
            if (typeof logout === "function") logout();
            // Redirect to landing / login
            navigate("/", { replace: true });
        } catch (err) {
            console.error("[DeleteAccount]", err);
            setErrorMsg(err?.response?.data?.message || "Deletion failed. Please try again.");
            setStatus("error");
        }
    };

    const handleClose = () => {
        if (status === "deleting") return; // prevent closing while in-flight
        setConfirmText("");
        setStatus("idle");
        setErrorMsg("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                onClick={handleClose}
            />

            {/* Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[110] max-w-md mx-auto rounded-t-3xl shadow-2xl flex flex-col`}
                style={{ background: isDark ? "#0e0e0e" : "#ffffff" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-gray-200"}`} />
                </div>

                {/* Header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center">
                            <IoWarning size={18} className="text-red-500" />
                        </div>
                        <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                            Delete Account
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={status === "deleting"}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                    >
                        <IoClose size={16} className={isDark ? "text-white/60" : "text-gray-400"} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-5 space-y-5">
                    {/* Warning message */}
                    <div className={`rounded-2xl p-4 border ${isDark ? "bg-red-500/8 border-red-500/20" : "bg-red-50 border-red-100"}`}>
                        <p className={`text-sm font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}>
                            ⚠️ This action is permanent and cannot be undone.
                        </p>
                        <ul className={`mt-2 space-y-1 text-xs ${isDark ? "text-red-400/80" : "text-red-500"}`}>
                            <li>• Your profile, posts, and reels will be deleted</li>
                            <li>• All your comments, likes, and follows will be removed</li>
                            <li>• Your chat history will be permanently erased</li>
                            <li>• Your authentication account will be removed</li>
                        </ul>
                    </div>

                    {/* Type to confirm */}
                    <div>
                        <p className={`text-sm mb-2 ${isDark ? "text-white/70" : "text-gray-600"}`}>
                            Type <span className={`font-bold font-mono ${isDark ? "text-red-400" : "text-red-600"}`}>DELETE</span> to confirm:
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={e => setConfirmText(e.target.value)}
                            placeholder="Type DELETE here"
                            disabled={status === "deleting"}
                            className={`w-full px-4 py-3 rounded-xl text-sm border font-mono outline-none transition-all ${isDark
                                    ? "bg-gray-900 border-white/15 text-white placeholder:text-gray-600 focus:border-red-500/50"
                                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-300 focus:border-red-400"
                                }`}
                        />
                    </div>

                    {errorMsg && (
                        <p className="text-red-400 text-xs text-center">{errorMsg}</p>
                    )}

                    {/* Confirm button */}
                    <button
                        onClick={handleDelete}
                        disabled={!canDelete || status === "deleting"}
                        className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${canDelete && status !== "deleting"
                                ? "bg-red-500 text-white hover:bg-red-600 active:scale-95"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                            }`}
                    >
                        {status === "deleting" ? (
                            <><FaSpinner className="animate-spin" size={15} /> Deleting account…</>
                        ) : (
                            "Permanently Delete My Account"
                        )}
                    </button>

                    {/* Cancel */}
                    <button
                        onClick={handleClose}
                        disabled={status === "deleting"}
                        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${isDark
                                ? "text-white/50 hover:text-white hover:bg-white/8"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        Cancel
                    </button>
                </div>

                <div className="h-safe pb-6" />
            </div>
        </>
    );
}
