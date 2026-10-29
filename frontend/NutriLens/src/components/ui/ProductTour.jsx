import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ProductTour({ steps = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Listen for custom trigger to start tour from anywhere (e.g. Account menu)
  useEffect(() => {
    const handleStartTour = () => {
      if (location.pathname !== "/landing") {
        navigate("/landing");
        setTimeout(() => {
          setCurrentStepIndex(0);
          setIsOpen(true);
        }, 300);
      } else {
        setCurrentStepIndex(0);
        setIsOpen(true);
      }
    };

    window.addEventListener("start-nutrilens-tour", handleStartTour);
    return () => window.removeEventListener("start-nutrilens-tour", handleStartTour);
  }, [location.pathname, navigate]);

  // First-time visitor auto-trigger on Dashboard
  useEffect(() => {
    if (location.pathname === "/landing") {
      const hasSeenTour = localStorage.getItem("nutrilens_tour_completed");
      if (!hasSeenTour) {
        const timer = setTimeout(() => {
          setCurrentStepIndex(0);
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname]);

  const currentStep = steps[currentStepIndex];

  // Update target bounding box
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !currentStep) return;
    const el = document.querySelector(currentStep.selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          viewportTop: rect.top,
          viewportLeft: rect.left,
        });
      }, 250);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect);
    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect);
    };
  }, [updateTargetRect]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    localStorage.setItem("nutrilens_tour_completed", "true");
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem("nutrilens_tour_completed", "true");
  };

  if (!isOpen || !currentStep) return null;

  const isLast = currentStepIndex === steps.length - 1;

  // Tooltip position calculation
  let tooltipTop = targetRect ? targetRect.viewportTop + targetRect.height + 16 : window.innerHeight / 2 - 120;
  let tooltipLeft = targetRect ? targetRect.viewportLeft + targetRect.width / 2 - 170 : window.innerWidth / 2 - 170;

  // Keep within screen edges
  if (tooltipLeft < 16) tooltipLeft = 16;
  if (tooltipLeft + 340 > window.innerWidth) tooltipLeft = window.innerWidth - 356;
  if (tooltipTop + 240 > window.innerHeight && targetRect) {
    tooltipTop = Math.max(16, targetRect.viewportTop - 240);
  }

  return (
    <div className="fixed inset-0 z-[100] font-manrope pointer-events-auto">
      {/* Dark backdrop with transparent spotlight cutout */}
      <svg className="fixed inset-0 w-full h-full pointer-events-auto" style={{ fillRule: "evenodd" }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.viewportLeft - 8}
                y={targetRect.viewportTop - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.65)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Target Pulsing Border */}
      {targetRect && (
        <div
          className="fixed rounded-2xl pointer-events-none ring-4 ring-primary/80 ring-offset-2 ring-offset-transparent animate-pulse"
          style={{
            top: targetRect.viewportTop - 8,
            left: targetRect.viewportLeft - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            transition: "all 0.3s ease-out",
          }}
        />
      )}

      {/* Interactive Tooltip Card */}
      <div
        className="fixed z-[101] w-[340px] bg-white rounded-3xl p-5 shadow-2xl border border-outline-variant/30 space-y-4 animate-scaleUp text-on-surface"
        style={{
          top: tooltipTop,
          left: tooltipLeft,
          transition: "top 0.3s ease-out, left 0.3s ease-out",
        }}
      >
        {/* Step Header */}
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/15">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Product Tour • Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-[11px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h4 className="text-base font-extrabold text-on-surface tracking-tight">
            {currentStep.title}
          </h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        {/* Progress dots & Navigation buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStepIndex
                    ? "w-5 bg-primary"
                    : i < currentStepIndex
                    ? "w-2 bg-primary/40"
                    : "w-2 bg-neutral-200"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handleBack}
                className="px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-xs font-bold transition-all active:scale-95"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1"
            >
              <span>{isLast ? "Finish Tour" : "Next"}</span>
              <span className="material-symbols-outlined text-[14px]">
                {isLast ? "check" : "arrow_forward"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

