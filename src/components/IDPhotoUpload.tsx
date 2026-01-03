"use client";

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "./ui/button";

interface IDPhotoUploadProps {
  onUploadComplete: (url: string, fileName: string) => void;
  onUploadRemove: () => void;
  uploadedUrl?: string;
  uploadedFileName?: string;
  disabled?: boolean;
  sessionId: string;
}

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.pdf";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function IDPhotoUpload({
  onUploadComplete,
  onUploadRemove,
  uploadedUrl,
  uploadedFileName,
  disabled,
  sessionId,
}: IDPhotoUploadProps) {
  const t = useTranslations("VirtualVisitInfoPage.idUpload");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPDF = uploadedFileName?.toLowerCase().endsWith(".pdf");

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        return t("errors.invalidFileType");
      }
      if (file.size > MAX_FILE_SIZE) {
        return t("errors.fileTooLarge");
      }
      return null;
    },
    [t]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      // Create local preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sessionId", sessionId);

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch("/api/upload-id-document", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        setUploadProgress(100);
        onUploadComplete(data.url, data.fileName);
        setUploading(false);
        toast.success(t("success.uploaded"));
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(t("errors.uploadFailed"));
        setUploading(false);
        setPreviewUrl(null);
      }
    },
    [sessionId, validateFile, onUploadComplete, t]
  );

  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled || uploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [disabled, uploading, uploadFile]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [uploadFile]
  );

  const handleRemove = useCallback(async () => {
    // Delete from blob storage if there's an uploaded URL
    if (uploadedUrl) {
      try {
        await fetch("/api/upload-id-document", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: uploadedUrl }),
        });
      } catch (error) {
        console.error("Failed to delete file from storage:", error);
        // Continue with removal even if delete fails
      }
    }

    onUploadRemove();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onUploadRemove, uploadedUrl]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Show uploaded state
  if (uploadedUrl && !uploading) {
    return (
      <div className="relative border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {isPDF ? (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-red-500" />
              </div>
            ) : (
              <Image
                src={previewUrl || uploadedUrl}
                alt="ID Document"
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">{t("uploaded")}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{uploadedFileName}</p>
          </div>

          {/* Remove button */}
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">{t("remove")}</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show upload zone
  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200",
        dragActive
          ? "border-bnoon-teal bg-bnoon-teal/5 dark:bg-bnoon-teal/10"
          : "border-gray-300 dark:border-gray-600 hover:border-bnoon-teal/50",
        disabled && "opacity-50 cursor-not-allowed",
        uploading && "pointer-events-none"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      <div className="flex flex-col items-center text-center">
        {uploading ? (
          <>
            <div className="relative w-16 h-16 mb-4">
              <Loader2 className="w-16 h-16 text-bnoon-teal animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-bnoon-teal">
                {uploadProgress}%
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t("uploading")}</p>
          </>
        ) : (
          <>
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                dragActive ? "bg-bnoon-teal/20" : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <Upload className={cn("w-8 h-8", dragActive ? "text-bnoon-teal" : "text-gray-400 dark:text-gray-500")} />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t("dropzone")}</p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBrowseClick}
              disabled={disabled}
              className="mb-3"
            >
              {t("browseFiles")}
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-500">{t("acceptedFormats")}</p>
          </>
        )}
      </div>
    </div>
  );
}
