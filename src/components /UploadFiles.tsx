import { Button, FileInput, Spinner } from "@telegram-apps/telegram-ui";
import { InlineButtonsItem } from "@telegram-apps/telegram-ui/dist/components/Blocks/InlineButtons/components/InlineButtonsItem/InlineButtonsItem";
import { useState } from "react";


interface UploadFileProps {
    telegramId: string;
    chatId: string;
    chatType: string;
  }


const UploadFile: React.FC<UploadFileProps> = ({ telegramId, chatId, chatType })  => {
    const [isUploading, setIsUploading] = useState(false); 
    const [uploaded, setUploaded] = useState(false);

    const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    const serverUrl = process.env.REACT_APP_SERVER_URL;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("chat_id", chatId)
      formData.append("chat_type", chatType);

      const response = await fetch(`${serverUrl}/files`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.ok) {
        console.log("File uploaded successfully:", data);
      } else {
        console.error("File upload failed:", data);
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    } finally {
      setIsUploading(false);
      setUploaded(true);
    }
  };

    return (
        <div>
            {uploaded &&
            <>
              <p>Success 💫 </p>
              <Button onClick={() => setUploaded(false)}>Upload more</Button>  
            </>
            }
            {!isUploading && !uploaded && (
              <FileInput label="upload"
               onChange={(e) => handleFileUpload(e.target.files?.[0])}
                 />
            )}
            {isUploading && <Spinner size="l" />
}
        </div>
    )
}

export default UploadFile