import { Modal, Button, Placeholder, FixedLayout } from "@telegram-apps/telegram-ui";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";
import { useState } from "react";

const FileModal = ({ file }: any) => {
    const [open, setOpen] = useState(false);
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loadingUrl, setLoadingUrl] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
    const handleOpenChange = async (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        setLoadingUrl(true);
        const url = await getSignedUrl(file);
        if (url) {
          setSignedUrl(url);
        } else {
          setErrorMessage("Failed to load image.");
        }
        setLoadingUrl(false);
      } else {
        setSignedUrl(null);
        setErrorMessage(null);
      }
    };

  
    const getSignedUrl = async (file: any) => {
      const serverUrl = process.env.REACT_APP_SERVER_URL;
      try {
        const response = await fetch(
          `${serverUrl}/files/signedUrl/${file.cid}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(
            `Failed to get signed URL: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        return data.url; 
      } catch (error) {
        console.error("Error getting signed URL:", error);
        return null;
      }
    };
  
    return (
        <Modal
          header={<ModalHeader>{file.name}</ModalHeader>}
          trigger={<Button style={{backgroundColor: "#33f9a1", color: "black"}}>View</Button>}
          open={open}
          onOpenChange={handleOpenChange}
        >
          <Placeholder>
            {loadingUrl ? (
              <p>Loading image...</p>
            ) : signedUrl ? (
                <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleOpenChange(false)}
                >
                <img
                    alt={file.name}
                    src={signedUrl}
                    style={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    }}
                />
              </a>
            ) : (
              <p>{errorMessage}</p>
            )}
          </Placeholder>
        </Modal>
    );
  };

  export default FileModal;