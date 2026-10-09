"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GetUploadUrl } from "@/api/storage";
import { MAX_BROWSER_UPLOAD_BYTES } from "@/core/storageApp";

export type UploadStatus = "waiting" | "uploading" | "done" | "failed";

/**
 * Why an upload failed: `blocked` is the browser refusing the PUT itself (no answer, status 0),
 * which is what the Team's own CORS rules replacing Nodera's looks like; `tooLarge` never left
 * the browser; `refused` is the Storage or the service saying no (full, stopped, 423, 403).
 */
export type UploadFailure = "blocked" | "tooLarge" | "refused";

export interface Upload {
  id: string;
  /** The object key the file lands under. */
  key: string;
  name: string;
  size: number;
  status: UploadStatus;
  /** 0 to 100 while uploading. */
  percent: number;
  failure: UploadFailure | null;
  /** The service's refusal, when it was the service and not the Storage that answered. */
  error: unknown;
}

export interface UploadsState {
  uploads: Upload[];
  /** Queues the files for `prefix`; each one starts at once and reports as it goes. */
  add: (files: readonly File[], prefix: string) => void;
  /** Starts the failed ones again, after browser access was restored or room was made. */
  retryFailed: () => void;
  /** Drops the finished and failed rows from the panel. */
  clearSettled: () => void;
  /** At least one upload failed without an answer from the Storage. */
  hasBlocked: boolean;
  isUploading: boolean;
}

let nextId = 0;

/** Sends the body straight to the presigned URL, never through Nodera, and reports progress. */
/** The file's type is signed into the URL, so the browser must send exactly that header. */
const uploadContentType = (file: File) => file.type || "application/octet-stream";

const putFile = (
  url: string,
  contentType: string | undefined,
  file: File,
  onProgress: (percent: number) => void
) =>
  new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url, true);
    if (contentType) request.setRequestHeader("Content-Type", contentType);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.floor((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new UploadError(request.status === 0 ? "blocked" : "refused"));
    };
    // A CORS refusal surfaces as a network error with status 0, indistinguishable from a
    // Storage that is down; both are told as "blocked" and offered the restore.
    request.onerror = () => reject(new UploadError("blocked"));
    request.onabort = () => reject(new UploadError("blocked"));
    request.send(file);
  });

class UploadError extends Error {
  constructor(readonly failure: UploadFailure) {
    super(failure);
  }
}

/**
 * The browser's uploads into one Storage: each file gets a presigned PUT from the service and
 * goes straight to the Storage with its progress shown. The list outlives the folder on screen
 * so an upload keeps reporting while the user browses elsewhere; `onDone` tells the caller
 * which folder gained a file.
 */
export const useUploads = (
  projectId: string,
  storageId: string,
  onDone: (key: string) => void
): UploadsState => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const files = useRef(new Map<string, File>());
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const patch = useCallback((id: string, update: Partial<Upload>) => {
    setUploads((list) => list.map((item) => (item.id === id ? { ...item, ...update } : item)));
  }, []);

  const start = useCallback(
    async (upload: Upload) => {
      const file = files.current.get(upload.id);
      if (!file) return;
      if (file.size > MAX_BROWSER_UPLOAD_BYTES) {
        patch(upload.id, { status: "failed", failure: "tooLarge" });
        return;
      }
      patch(upload.id, { status: "uploading", percent: 0, failure: null, error: null });
      try {
        const response = await GetUploadUrl(projectId, storageId, {
          key: upload.key,
          contentType: uploadContentType(file),
        });
        await putFile(response.data.url, response.data.contentType, file, (percent) =>
          patch(upload.id, { percent })
        );
        patch(upload.id, { status: "done", percent: 100 });
        files.current.delete(upload.id);
        onDoneRef.current(upload.key);
      } catch (err) {
        if (err instanceof UploadError) {
          patch(upload.id, { status: "failed", failure: err.failure });
        } else {
          patch(upload.id, { status: "failed", failure: "refused", error: err });
        }
      }
    },
    [projectId, storageId, patch]
  );

  const add = useCallback(
    (picked: readonly File[], prefix: string) => {
      const added: Upload[] = picked.map((file) => {
        const id = `upload-${++nextId}`;
        files.current.set(id, file);
        return {
          id,
          key: `${prefix}${file.name}`,
          name: file.name,
          size: file.size,
          status: "waiting",
          percent: 0,
          failure: null,
          error: null,
        };
      });
      setUploads((list) => [...list, ...added]);
      added.forEach((upload) => void start(upload));
    },
    [start]
  );

  const retryFailed = useCallback(() => {
    uploads
      .filter((upload) => upload.status === "failed" && upload.failure !== "tooLarge")
      .forEach((upload) => void start(upload));
  }, [uploads, start]);

  const clearSettled = useCallback(() => {
    setUploads((list) => {
      list
        .filter((item) => item.status === "failed")
        .forEach((item) => files.current.delete(item.id));
      return list.filter((item) => item.status === "waiting" || item.status === "uploading");
    });
  }, []);

  return {
    uploads,
    add,
    retryFailed,
    clearSettled,
    hasBlocked: uploads.some((upload) => upload.failure === "blocked"),
    isUploading: uploads.some(
      (upload) => upload.status === "waiting" || upload.status === "uploading"
    ),
  };
};
