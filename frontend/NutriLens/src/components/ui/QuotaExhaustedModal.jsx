import React from "react";
import Button from "./Button";

export default function QuotaExhaustedModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-scaleUp font-manrope"
        role="dialog"
        aria-modal="true"
      >
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-3xl text-white">
              verified_user
            </span>
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/25 text-xs font-bold tracking-wide uppercase mb-1">
            Free Preview Quota
          </span>
          <h2 className="text-2xl font-bold">Complimentary Scan Limit Reached</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 mt-0.5 shrink-0">
              info
            </span>
            <p>
              To ensure high availability and equitable access across our automated food safety and clinical dietary intelligence infrastructure, each free test account includes <strong>2 complimentary comprehensive scans</strong>.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Unlocked with unlimited access:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/15">
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                <span>Unlimited OCR Label Scans</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/15">
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                <span>Allergen Radar & INS Decoders</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/15">
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                <span>Ask Nutrii AI Companion</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/15">
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                <span>Clinical PDF & DOCX Dossiers</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:aradwadtushar72@gmail.com?subject=NutriLens%20Demo%20Quota%20Increase&body=Hi%20Tushar,%0A%0AI'm%20evaluating%20NutriLens%20and%20would%20like%20my%20scan%20quota%20increased.%0A%0AMy%20registered%20email%20is:%20"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95 text-center"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Request Top-up
            </a>
            <Button
              variant="secondary"
              onClick={onClose}
              className="sm:w-auto w-full py-3"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
