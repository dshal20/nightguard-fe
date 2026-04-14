"use client";

import { useRef, useState } from "react";
import { Parse, type ParsedLicense } from "aamva-parser";
import dayjs from "dayjs";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { auth } from "../../../../src/lib/firebase";
import { createPatronLog, type CreatePatronLogRequest } from "@/lib/api";

const LICENSE_KEY =
  "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTA1NDAxMjg1LU1UQTFOREF4TWpnMUxYZGxZaTFVY21saGJGQnliMm8iLCJtYWluU2VydmVyVVJMIjoiaHR0cHM6Ly9tZGxzLmR5bmFtc29mdG9ubGluZS5jb20vIiwib3JnYW5pemF0aW9uSUQiOiIxMDU0MDEyODUiLCJzdGFuZGJ5U2VydmVyVVJMIjoiaHR0cHM6Ly9zZGxzLmR5bmFtc29mdG9ubGluZS5jb20vIiwiY2hlY2tDb2RlIjo4NDczMTgxNjF9";

let routerPromise: Promise<import("dynamsoft-barcode-reader-bundle").CaptureVisionRouter> | null = null;

async function getRouter() {
  if (!routerPromise) {
    const { CoreModule, LicenseManager, CaptureVisionRouter } = await import(
      "dynamsoft-barcode-reader-bundle"
    );
    CoreModule.engineResourcePaths = {
      dbrBundle:
        "https://cdn.jsdelivr.net/npm/dynamsoft-barcode-reader-bundle@11.2.4000/dist/",
    };
    LicenseManager.initLicense(LICENSE_KEY);
    routerPromise = CaptureVisionRouter.createInstance();
  }
  return routerPromise;
}

type ScanState = "idle" | "decoding" | "parsed" | "error";

const LABEL = "mb-1 block text-[10px] font-bold uppercase tracking-wide text-[#8B8B9D]";

export default function IDScannerModal({
  open,
  onClose,
  venueId,
}: {
  open: boolean;
  onClose: () => void;
  venueId: string;
}) {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [licenseData, setLicenseData] = useState<ParsedLicense | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<"ADMITTED" | "DENIED" | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFrontPreview(URL.createObjectURL(file));
  };

  const handleBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackPreview(URL.createObjectURL(file));
  };

  const scan = async () => {
    const backFile = backInputRef.current?.files?.[0];
    if (!backFile) return;

    setScanState("decoding");
    setErrorMsg("");

    try {
      const { EnumBarcodeFormat } = await import("dynamsoft-barcode-reader-bundle");
      const router = await getRouter();
      const result = await router.capture(backFile, "ReadBarcodes_Default");
      const items = result.decodedBarcodesResult?.barcodeResultItems ?? [];
      const pdf417 = items.find((item) => item.format === EnumBarcodeFormat.BF_PDF417);

      if (!pdf417?.text) {
        throw new Error("No barcode found. Make sure the back of the license is clear and in focus.");
      }

      const license = Parse(pdf417.text);
      setLicenseData(license);
      setScanState("parsed");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to read the license. Please try again.");
      setScanState("error");
    }
  };

  const reset = () => {
    setLicenseData(null);
    setErrorMsg("");
    setFrontPreview(null);
    setBackPreview(null);
    setScanState("idle");
    setSubmitResult(null);
    if (frontInputRef.current) frontInputRef.current.value = "";
    if (backInputRef.current) backInputRef.current.value = "";
  };

  const handleDecision = async (decision: "ADMITTED" | "DENIED") => {
    if (!licenseData) return;
    setSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const payload: CreatePatronLogRequest = {
        firstName: licenseData.firstName ?? null,
        lastName: licenseData.lastName ?? null,
        middleName: licenseData.middleName ?? null,
        driversLicenseId: licenseData.driversLicenseId ?? null,
        dateOfBirth: licenseData.dateOfBirth ? dayjs(licenseData.dateOfBirth).format("YYYY-MM-DD") : null,
        expirationDate: licenseData.expirationDate ? dayjs(licenseData.expirationDate).format("YYYY-MM-DD") : null,
        state: licenseData.state ?? null,
        streetAddress: licenseData.streetAddress ?? null,
        city: licenseData.city ?? null,
        postalCode: licenseData.postalCode ?? null,
        gender: licenseData.gender ?? null,
        eyeColor: licenseData.eyeColor ?? null,
        decision,
      };

      await createPatronLog(token, venueId, payload);
      setSubmitResult(decision);
      setTimeout(() => {
        reset();
      }, 1500);
    } catch {
      // keep parsed state so user can retry
    } finally {
      setSubmitting(false);
    }
  };

  const canScan = !!backPreview && (scanState === "idle" || scanState === "error");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border border-[#2A2A34] bg-[#0F0F19] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E2E]">
          <p className="text-sm font-bold text-[#E2E2E2]">ID Scanner</p>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B6B7D] transition hover:bg-[#1E1E2E] hover:text-[#DDDBDB]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {(scanState === "idle" || scanState === "error" || scanState === "decoding") && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <PhotoSlot
                  label="Front"
                  preview={frontPreview}
                  inputRef={frontInputRef}
                  onChange={handleFront}
                />
                <PhotoSlot
                  label="Back"
                  preview={backPreview}
                  inputRef={backInputRef}
                  onChange={handleBack}
                />
              </div>

              {scanState === "error" && (
                <p className="text-center text-sm text-red-400">{errorMsg}</p>
              )}

              <button
                onClick={scan}
                disabled={!canScan}
                className="w-full rounded-xl bg-[#2B36CD] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3340d8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {scanState === "decoding" ? "Reading barcode…" : "Scan License"}
              </button>
            </div>
          )}

          {scanState === "parsed" && licenseData && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#2A2A34] bg-[#11111B] p-5">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <p className={LABEL}>Scanned License</p>
                    <p className="mt-1 text-xl font-bold text-[#E2E2E2]">
                      {[licenseData.firstName, licenseData.middleName, licenseData.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                  {licenseData.expired && (
                    <span className="mt-1 rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-400">
                      Expired
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <LicenseField label="License #" value={licenseData.driversLicenseId} />
                  <LicenseField
                    label="Date of Birth"
                    value={licenseData.dateOfBirth ? dayjs(licenseData.dateOfBirth).format("MM/DD/YYYY") : undefined}
                  />
                  <LicenseField
                    label="Expires"
                    value={licenseData.expirationDate ? dayjs(licenseData.expirationDate).format("MM/DD/YYYY") : undefined}
                  />
                  <LicenseField label="State" value={licenseData.state} />
                  {licenseData.streetAddress && (
                    <div className="col-span-2">
                      <p className={LABEL}>Address</p>
                      <p className="text-sm text-[#E2E2E2]">
                        {licenseData.streetAddress}
                        {licenseData.streetAddressSupplement ? `, ${licenseData.streetAddressSupplement}` : ""}
                      </p>
                      {(licenseData.city || licenseData.postalCode) && (
                        <p className="text-sm text-[#E2E2E2]">
                          {[licenseData.city, licenseData.state, licenseData.postalCode].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                  <LicenseField label="Gender" value={licenseData.gender} />
                  <LicenseField label="Eye Color" value={licenseData.eyeColor} />
                </div>
              </div>

              {submitResult ? (
                <div
                  className={`flex items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold ${
                    submitResult === "ADMITTED"
                      ? "border border-[#75FB94]/20 bg-[#75FB94]/10 text-[#75FB94]"
                      : "border border-[#E84868]/20 bg-[#E84868]/10 text-[#E84868]"
                  }`}
                >
                  {submitResult === "ADMITTED" ? (
                    <><CheckCircle2 className="h-4 w-4" /> Admitted</>
                  ) : (
                    <><XCircle className="h-4 w-4" /> Denied</>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDecision("ADMITTED")}
                    disabled={submitting}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#75FB94]/30 bg-[#75FB94]/10 text-sm font-bold text-[#75FB94] transition hover:bg-[#75FB94]/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Admit
                  </button>
                  <button
                    onClick={() => handleDecision("DENIED")}
                    disabled={submitting}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E84868]/30 bg-[#E84868]/10 text-sm font-bold text-[#E84868] transition hover:bg-[#E84868]/20 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Deny
                  </button>
                </div>
              )}

              <button
                onClick={reset}
                className="w-full rounded-xl border border-[#2A2A34] bg-[#11111B] py-3 text-sm font-medium text-[#8B8B9D] transition-colors hover:text-[#E2E2E2]"
              >
                Scan Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PhotoSlot({
  label,
  preview,
  inputRef,
  onChange,
}: {
  label: string;
  preview: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="group relative flex aspect-3/2 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#2A2A34] bg-[#0F0F19] transition-colors hover:border-[#3A3A48]"
    >
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={`License ${label}`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="text-xs font-medium text-white">Change</p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2A2A34] bg-[#1A1A28]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6B6B7D]">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-[11px] font-medium text-[#6B6B7D]">{label}</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onChange}
      />
    </button>
  );
}

function LicenseField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className={LABEL}>{label}</p>
      <p className="text-sm text-[#E2E2E2]">{value}</p>
    </div>
  );
}
