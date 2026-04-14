"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Ban, ShieldX, X, ChevronLeft, ChevronRight, Pencil, Plus, Loader2, Trash2, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { auth } from "@/app/src/lib/firebase";
import { updateOffender, uploadFile, createOffenderComment, deleteOffenderComment } from "@/lib/api";
import type { OffenderResponse } from "@/lib/api";
import Link from "next/link";
import { ColorTag, severityVariant } from "@/components/ui/color-tag";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOffenderIncidentsQuery, useOffenderCommentsQuery } from "@/lib/queries";
import { useVenueContext } from "../context/VenueContext";


function formatType(type: string) {
  return type.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
}

const labelClass = "mb-1 block text-[10px] font-bold uppercase tracking-wide text-[#8B8B9D]";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

type ActionType = "ban" | "trespass";

interface IssueActionDialogProps {
  open: boolean;
  type: ActionType;
  offenderName: string;
  onConfirm: (expiresAt: string | null) => void;
  onCancel: () => void;
}

function IssueActionDialog({ open, type, offenderName, onConfirm, onCancel }: IssueActionDialogProps) {
  const [expiresAt, setExpiresAt] = useState("");

  const label = type === "ban" ? "Ban" : "Trespass";
  const description =
    type === "ban"
      ? "This will issue a ban for this offender. They will not be permitted entry."
      : "This will issue a trespass notice for this offender. This is a formal legal notice.";

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <AlertDialogContent className="border-[#2A2A34] bg-[#11111D] text-[#DDDBDB]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#E2E2E2]">
            Issue {label} — {offenderName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#8B8B9D]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-1">
          <label className={labelClass}>Expiration Date (optional)</label>
          <Input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] [color-scheme:dark] focus-visible:ring-[#3B3B5A]"
          />
          <p className="mt-1 text-[10px] text-[#6B6B7D]">Leave blank for an indefinite {label.toLowerCase()}.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="border-[#2A2A34] bg-transparent text-[#8B8B9D] hover:bg-white/5 hover:text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(expiresAt || null)}
            className={
              type === "ban"
                ? "bg-[#E84868] text-white hover:bg-[#c73355]"
                : "bg-[#DBA940] text-black hover:bg-[#c49535]"
            }
          >
            Confirm {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface Props {
  offender: OffenderResponse | null;
  onClose: () => void;
  initialEditing?: boolean;
}

type EditForm = {
  firstName: string;
  lastName: string;
  physicalMarkers: string;
  riskScore: string;
  currentStatus: string;
  notes: string;
};

function buildForm(o: OffenderResponse): EditForm {
  return {
    firstName: o.firstName,
    lastName: o.lastName,
    physicalMarkers: o.physicalMarkers ?? "",
    riskScore: o.riskScore?.toString() ?? "",
    currentStatus: o.currentStatus ?? "",
    notes: o.notes ?? "",
  };
}

export default function OffenderDetailModal({ offender, onClose, initialEditing = false }: Props) {
  const { selectedVenue } = useVenueContext();
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({ firstName: "", lastName: "", physicalMarkers: "", riskScore: "", currentStatus: "", notes: "" });
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<{ file: File; preview: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const { data: incidents = [], isLoading: incidentsLoading } = useOffenderIncidentsQuery(offender?.id);
  const { data: comments = [], isLoading: commentsLoading } = useOffenderCommentsQuery(offender?.id);

  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const currentUserId = auth.currentUser?.uid;

  const [localPhotoUrls, setLocalPhotoUrls] = useState<string[]>(offender?.photoUrls ?? []);
  const photos = localPhotoUrls;

  // Reset state whenever the displayed offender changes
  useEffect(() => {
    setLightboxIndex(null);
    setEditing(initialEditing);
    setSaveError(false);
    if (offender) {
      setForm(buildForm(offender));
      setEditPhotos(offender.photoUrls ?? []);
      setLocalPhotoUrls(offender.photoUrls ?? []);
      setNewFiles([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offender?.id]);

  // Clean up blob URLs when component unmounts or files change
  useEffect(() => {
    return () => { newFiles.forEach((f) => URL.revokeObjectURL(f.preview)); };
  }, [newFiles]);

  function openLightbox(index: number) { setLightboxIndex(index); }
  function closeLightbox() { setLightboxIndex(null); }
  function prevPhoto() { setLightboxIndex((i) => (i != null ? (i - 1 + photos.length) % photos.length : 0)); }
  function nextPhoto() { setLightboxIndex((i) => (i != null ? (i + 1) % photos.length : 0)); }

  function handleConfirmAction(expiresAt: string | null) {
    console.log(`${pendingAction} issued for ${offender?.id}, expires: ${expiresAt ?? "never"}`);
    setPendingAction(null);
  }

  function startEditing() {
    if (!offender) return;
    setForm(buildForm(offender));
    setEditPhotos(offender.photoUrls ?? []);
    setNewFiles([]);
    setSaveError(false);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setSaveError(false);
    newFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setNewFiles([]);
  }

  function handlePhotoFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const entries = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setNewFiles((prev) => [...prev, ...entries]);
  }

  function removeExistingPhoto(index: number) {
    setEditPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSave() {
    if (!offender) return;
    setSaving(true);
    setSaveError(false);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const uploadedUrls = await Promise.all(newFiles.map((f) => uploadFile(token, f.file)));
      const allPhotoUrls = [...editPhotos, ...uploadedUrls];

      await updateOffender(token, offender.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        physicalMarkers: form.physicalMarkers || undefined,
        riskScore: form.riskScore ? Number(form.riskScore) : null,
        currentStatus: form.currentStatus || undefined,
        notes: form.notes || undefined,
        photoUrls: allPhotoUrls,
      });

      setLocalPhotoUrls(allPhotoUrls);
      await queryClient.invalidateQueries({ queryKey: ["offenders"] });
      setEditing(false);
      newFiles.forEach((f) => URL.revokeObjectURL(f.preview));
      setNewFiles([]);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handlePostComment() {
    if (!offender || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      await createOffenderComment(token, offender.id, commentText.trim());
      setCommentText("");
      await queryClient.invalidateQueries({ queryKey: ["offenderComments", offender.id] });
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!offender) return;
    setDeletingCommentId(commentId);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      await deleteOffenderComment(token, commentId);
      await queryClient.invalidateQueries({ queryKey: ["offenderComments", offender.id] });
    } finally {
      setDeletingCommentId(null);
    }
  }

  function field(key: keyof EditForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  const initials = offender
    ? `${offender.firstName[0] ?? ""}${offender.lastName[0] ?? ""}`.toUpperCase()
    : "";

  const fullName = offender ? `${offender.firstName} ${offender.lastName}` : "";

  // All photos in edit mode = existing retained + new previews
  const editAllPreviews = [
    ...editPhotos.map((url) => ({ url, isNew: false as const })),
    ...newFiles.map((f) => ({ url: f.preview, isNew: true as const })),
  ];

  return (
    <>
      <Dialog open={!!offender} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#2A2A34] bg-[#11111D] text-[#DDDBDB] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#E2E2E2]">
              Offender Profile
            </DialogTitle>
          </DialogHeader>

          {offender && (
            <div className="space-y-5">

              {/* ── VIEW MODE ── */}
              {!editing && (
                <>
                  {/* Avatar + name */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => photos.length > 0 && openLightbox(0)}
                      className="shrink-0 overflow-hidden rounded-full focus:outline-none"
                      style={{ cursor: photos.length > 0 ? "pointer" : "default" }}
                    >
                      {photos.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photos[0]}
                          alt={fullName}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-[#2A2A34]"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#26262F] text-lg font-bold text-[#8B8B9D]">
                          {initials}
                        </div>
                      )}
                    </button>
                    <div>
                      <p className="text-base font-bold text-white">{fullName}</p>
                      {offender.currentStatus && (
                        <span className="mt-1 inline-block rounded-md border border-[#2A2A34] bg-[#1a1a28] px-2 py-0.5 text-[11px] text-[#DDDBDB]">
                          {offender.currentStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {photos.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {photos.slice(1).map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => openLightbox(i + 1)}
                          className="h-16 w-16 overflow-hidden rounded-lg border border-[#2A2A34] transition hover:border-[#3B3B5A] hover:opacity-90 focus:outline-none"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
                    <div>
                      <p className={labelClass}>Risk Score</p>
                      <p className="text-sm text-[#DDDBDB]">
                        {offender.riskScore != null ? offender.riskScore : "—"}
                      </p>
                    </div>
                    <div>
                      <p className={labelClass}>Added</p>
                      <p className="text-sm text-[#DDDBDB]">{formatDate(offender.createdAt)}</p>
                    </div>
                    <div>
                      <p className={labelClass}>Last Updated</p>
                      <p className="text-sm text-[#DDDBDB]">{formatDate(offender.updatedAt)}</p>
                    </div>
                    <div>
                      <p className={labelClass}>Global ID</p>
                      <p className="truncate font-mono text-[11px] text-[#6B6B7D]">
                        {offender.globalId ?? "—"}
                      </p>
                    </div>
                  </div>

                  {offender.physicalMarkers && (
                    <div>
                      <p className={labelClass}>Physical Markers</p>
                      <p className="text-sm text-[#DDDBDB]">{offender.physicalMarkers}</p>
                    </div>
                  )}

                  {offender.notes && (
                    <div>
                      <p className={labelClass}>Notes</p>
                      <p className="text-sm text-[#DDDBDB]">{offender.notes}</p>
                    </div>
                  )}

                  {/* Incidents */}
                  <div>
                    <p className={labelClass}>Linked Incidents</p>
                    {incidentsLoading ? (
                      <div className="space-y-2">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3">
                            <Skeleton className="h-3 w-24 rounded bg-[#26262F]" />
                            <Skeleton className="h-4 w-14 rounded-md bg-[#26262F]" />
                            <Skeleton className="ml-auto h-3 w-16 rounded bg-[#1E1E2C]" />
                          </div>
                        ))}
                      </div>
                    ) : incidents.length === 0 ? (
                      <p className="text-sm text-[#4A4A5A]">No incidents linked.</p>
                    ) : (
                      <div className="space-y-2">
                        {incidents.map((inc) => (
                          <Link
                            key={inc.id}
                            href={`/venue/${selectedVenue?.id}/incidents?id=${inc.id}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg border border-[#2A2A34] bg-[#0F0F19] px-3 py-2.5 transition hover:border-[#3B3B5A] hover:bg-white/3"
                          >
                            <p className="min-w-0 flex-1 truncate text-xs font-medium text-[#DDDBDB]">
                              {formatType(inc.type)}
                            </p>
                            <ColorTag variant={severityVariant[inc.severity]}>{inc.severity}</ColorTag>
                            <span className="shrink-0 text-[10px] text-[#4A4A5A]">
                              {formatDate(inc.createdAt)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <p className={labelClass}>Comments</p>

                    {/* Existing comments */}
                    {commentsLoading ? (
                      <div className="space-y-2">
                        {[0, 1].map((i) => (
                          <div key={i} className="rounded-lg border border-[#2A2A34] bg-[#0F0F19] p-3 space-y-1.5">
                            <Skeleton className="h-3 w-28 rounded bg-[#26262F]" />
                            <Skeleton className="h-3 w-full rounded bg-[#1E1E2C]" />
                          </div>
                        ))}
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="mb-3 text-sm text-[#4A4A5A]">No comments yet.</p>
                    ) : (
                      <div className="mb-3 space-y-2">
                        {comments.map((c) => (
                          <div key={c.id} className="group relative rounded-lg border border-[#2A2A34] bg-[#0F0F19] px-3 py-2.5">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-[#8B8B9D]">
                                {c.author.firstName ?? ""} {c.author.lastName ?? ""}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#4A4A5A]">
                                  {new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                                {c.author.id === currentUserId && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(c.id)}
                                    disabled={deletingCommentId === c.id}
                                    className="flex h-5 w-5 items-center justify-center rounded text-[#4A4A5A] opacity-0 transition hover:text-[#E84868] group-hover:opacity-100 disabled:opacity-50"
                                  >
                                    {deletingCommentId === c.id
                                      ? <Loader2 className="h-3 w-3 animate-spin" />
                                      : <Trash2 className="h-3 w-3" />
                                    }
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-[#DDDBDB]">{c.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add comment */}
                    <div className="flex gap-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handlePostComment();
                          }
                        }}
                        rows={2}
                        placeholder="Add a comment…"
                        disabled={submittingComment}
                        className="flex-1 resize-none rounded-md border border-[#2A2A34] bg-[#0F0F19] px-3 py-2 text-sm text-[#E2E2E2] placeholder:text-[#3B3B5A] focus:outline-none focus:ring-1 focus:ring-[#3B3B5A] disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={handlePostComment}
                        disabled={submittingComment || !commentText.trim()}
                        className="flex h-auto w-9 shrink-0 items-center justify-center self-stretch rounded-md border border-[#2A2A34] bg-[#0F0F19] text-[#8B8B9D] transition hover:border-[#3B3B5A] hover:text-white disabled:opacity-40"
                      >
                        {submittingComment
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Send className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 border-t border-[#2A2A34] pt-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setPendingAction("ban")}
                        className="flex-1 gap-2 border border-[#6B2233] bg-[#E84868]/10 text-[#E84868] hover:border-[#E84868]/50 hover:bg-[#E84868]/20 hover:text-[#E84868]"
                      >
                        <Ban className="h-4 w-4" />
                        Issue Ban
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setPendingAction("trespass")}
                        className="flex-1 gap-2 border border-[#6B5320] bg-[#DBA940]/10 text-[#DBA940] hover:border-[#DBA940]/50 hover:bg-[#DBA940]/20 hover:text-[#DBA940]"
                      >
                        <ShieldX className="h-4 w-4" />
                        Issue Trespass
                      </Button>
                    </div>
                    <Button
                      type="button"
                      onClick={startEditing}
                      className="w-full gap-2 border border-[#2A2A34] bg-transparent text-[#8B8B9D] hover:bg-white/5 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Profile
                    </Button>
                  </div>
                </>
              )}

              {/* ── EDIT MODE ── */}
              {editing && (
                <>
                  {/* Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <Input
                        value={form.firstName}
                        onChange={field("firstName")}
                        className="border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] focus-visible:ring-[#3B3B5A]"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <Input
                        value={form.lastName}
                        onChange={field("lastName")}
                        className="border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] focus-visible:ring-[#3B3B5A]"
                      />
                    </div>
                  </div>

                  {/* Risk score + Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Risk Score</label>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={form.riskScore}
                        onChange={field("riskScore")}
                        placeholder="0–10"
                        className="border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] focus-visible:ring-[#3B3B5A]"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Status</label>
                      <Input
                        value={form.currentStatus}
                        onChange={field("currentStatus")}
                        placeholder="e.g. Banned"
                        className="border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] focus-visible:ring-[#3B3B5A]"
                      />
                    </div>
                  </div>

                  {/* Physical Markers */}
                  <div>
                    <label className={labelClass}>Physical Markers</label>
                    <Input
                      value={form.physicalMarkers}
                      onChange={field("physicalMarkers")}
                      placeholder="e.g. Tattoo on left arm"
                      className="border-[#2A2A34] bg-[#0F0F19] text-[#E2E2E2] focus-visible:ring-[#3B3B5A]"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className={labelClass}>Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={field("notes")}
                      rows={3}
                      placeholder="Additional notes..."
                      className="w-full resize-none rounded-md border border-[#2A2A34] bg-[#0F0F19] px-3 py-2 text-sm text-[#E2E2E2] placeholder:text-[#3B3B5A] focus:outline-none focus:ring-1 focus:ring-[#3B3B5A]"
                    />
                  </div>

                  {/* Photos */}
                  <div>
                    <label className={labelClass}>Photos</label>
                    <div className="flex flex-wrap gap-2">
                      {editAllPreviews.map((item, i) => (
                        <div key={i} className="relative h-16 w-16 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.url}
                            alt=""
                            className="h-full w-full rounded-lg border border-[#2A2A34] object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              item.isNew
                                ? removeNewFile(newFiles.findIndex((f) => f.preview === item.url))
                                : removeExistingPhoto(editPhotos.indexOf(item.url))
                            }
                            className="absolute -right-1.5 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E84868] text-white shadow"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add photo button */}
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#2A2A34] text-[#4A4A5A] transition hover:border-[#3B3B5A] hover:text-[#8B8B9D]"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoFileSelect}
                    />
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-2 border-t border-[#2A2A34] pt-4">
                    <Button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="flex-1 border border-[#2A2A34] bg-transparent text-[#8B8B9D] hover:bg-white/5 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 gap-2 border border-primary bg-primary/50 text-white hover:bg-primary/70"
                    >
                      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {saving ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                  {saveError && (
                    <p className="text-center text-xs text-red-400">Failed to save. Please try again.</p>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {offender && pendingAction && (
        <IssueActionDialog
          open
          type={pendingAction}
          offenderName={fullName}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {lightboxIndex !== null && photos.length > 0 && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[lightboxIndex]}
            alt=""
            className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <p className="absolute bottom-4 text-xs text-white/50">
            {lightboxIndex + 1} / {photos.length}
          </p>
        </div>,
        document.body
      )}
    </>
  );
}
