import busboy from "busboy";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";

export type ParsedUploadPart = {
  fieldName: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
};

/**
 * Parse multipart/form-data from the raw request body using busboy.
 * Next.js `request.formData()` can mis-handle large/binary parts on some serverless hosts;
 * streaming the body into busboy matches how Node expects multipart data.
 */
export function parseMultipartUpload(
  request: NextRequest,
  options?: { fileFieldName?: string },
): Promise<ParsedUploadPart[]> {
  const fileFieldName = options?.fileFieldName ?? "files";
  const contentType = request.headers.get("content-type");

  if (
    !contentType ||
    !contentType.toLowerCase().includes("multipart/form-data")
  ) {
    return Promise.reject(
      new Error("Expected Content-Type: multipart/form-data."),
    );
  }

  const webBody = request.body;
  if (!webBody) {
    return Promise.reject(new Error("Request has no body."));
  }

  const nodeReadable = Readable.fromWeb(
    webBody as import("node:stream/web").ReadableStream<Uint8Array>,
  );

  return new Promise((resolve, reject) => {
    const bb = busboy({
      headers: { "content-type": contentType },
      defParamCharset: "utf8",
      limits: {
        files: 20,
        fileSize: 48 * 1024 * 1024,
      },
    });

    const fileReads: Promise<ParsedUploadPart>[] = [];

    bb.on("file", (name, file, info) => {
      if (name !== fileFieldName) {
        file.resume();
        return;
      }

      fileReads.push(
        new Promise((res, rej) => {
          const chunks: Buffer[] = [];
          file.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
          });
          file.on("error", rej);
          file.on("limit", () => {
            rej(new Error(`File exceeds size limit: ${info.filename || "upload"}`));
          });
          file.on("end", () => {
            res({
              fieldName: name,
              filename: (info.filename && info.filename.trim()) || "upload.pdf",
              mimeType: info.mimeType || "application/octet-stream",
              buffer: Buffer.concat(chunks),
            });
          });
        }),
      );
    });

    bb.on("error", reject);
    bb.on("finish", () => {
      Promise.all(fileReads)
        .then(resolve)
        .catch(reject);
    });

    nodeReadable.on("error", reject);
    nodeReadable.pipe(bb);
  });
}
