import { Spinner } from "@telegram-apps/telegram-ui";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileUpload,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useGetFiles } from "../hooks/queries/UseFiles";

interface UploadFileProps {
  chatId: string;
}

const UploadFile: React.FC<UploadFileProps> = ({ chatId}) => {
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { refetch } = useGetFiles(chatId, "");

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    const serverUrl = process.env.REACT_APP_SERVER_URL;

    try {
      setUploadStatus("uploading");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chat_id", chatId);

      const response = await fetch(`${serverUrl}/files`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("File uploaded successfully:", data);
      setUploadStatus("success");

      // Refetch files after successful upload
      await refetch();
    } catch (error) {
      console.error("Error during file upload:", error);
      setUploadStatus("error");
    }
  };

  useEffect(() => {
    if (uploadStatus === "success" || uploadStatus === "error") {
      const timer = setTimeout(() => {
        setUploadStatus("idle");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  return (
    <div style={{ textAlign: "center" }}>
      {uploadStatus === "idle" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: "pointer" }}
        >
          <FontAwesomeIcon icon={faFileUpload} size="2x" />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
          />
        </div>
      )}
      {uploadStatus === "uploading" && <Spinner size="l" />}
      {uploadStatus === "success" && (
        <div>
          <FontAwesomeIcon icon={faCheckCircle} size="2x" color="green" />
        </div>
      )}
      {uploadStatus === "error" && (
        <div>
          <FontAwesomeIcon icon={faTimesCircle} size="2x" color="red" />
        </div>
      )}
    </div>
  );
};

export default UploadFile;
