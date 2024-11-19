import { Button, Cell, List, Section } from "@telegram-apps/telegram-ui";
import { useEffect, useState } from "react";
import FileModal from "./FileModal";

interface FilesProps {
    chatId: string;
}

const Files: React.FC<FilesProps> = ({ chatId }: FilesProps) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [pageTokens, setPageTokens] = useState<string[]>(['']);
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

    useEffect(() => {
        console.log(chatId)
        getFiles(chatId, pageTokens[currentPageIndex]);
    }, [chatId]);

    const getFiles = async (chatId: string, pageToken: string) => {
        const serverUrl = process.env.REACT_APP_SERVER_URL;
        try {
            setIsLoading(true);
            const response = await fetch(`${serverUrl}/files/${chatId}?pageToken=${pageToken}`, {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data?.data?.files){
                setFiles(data?.data?.files);
                if (currentPageIndex === pageTokens.length - 1 && data?.data?.next_page_token) {
                    setPageTokens(prevTokens => [...prevTokens, data?.data?.next_page_token]);
                }
                console.log("Files retrieved successfully:", data.data.files);
            } else {
                console.error("Files failed:", data);
            }
        } catch (error) {
            console.error("Error during fetching files:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const truncateFileName = (fileName: string, maxLength: number) => {
        const extension = fileName.substring(fileName.lastIndexOf('.'));
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        if (nameWithoutExt.length > maxLength) {
            return `${nameWithoutExt.substring(0, maxLength)}...${extension}`;
        }
        return fileName;
    };

    return (
        <div>
            <div>
            `  <p>{errorMessage}</p>
                {isLoading && <p>Loading...</p>}
                <li>
                    {files.map((file, index) => (
                        <div key={index} style={{display: "flex", justifyContent: "space-between", padding: "15px", backgroundColor: "black", opacity: ".9", borderRadius: "20px"}}>
                            <p>{truncateFileName(file.name, 15)}</p> 
                            <FileModal file={file}  />  
                        </div>
                    ))}
                </li>
            </div>
            <div  style={{
                display: 'flex',  
                backgroundColor: 'white',
                marginTop: '20px',
                borderRadius: "10px"
            }}>
                <Button style={{ width: "50vw", backgroundColor: "#33f9a1", color: "black"}} disabled={currentPageIndex === 0} onClick={() => {
                        const newPageIndex = currentPageIndex - 1;
                        setCurrentPageIndex(newPageIndex);
                        getFiles(chatId, pageTokens[newPageIndex]);
                    }}>-</Button>
                <Button style={{ width: "50vw", backgroundColor: "#33f9a1", color: "black"}} disabled={files.length < 5} onClick={() => {
                    const newPageIndex = currentPageIndex + 1;
                    setCurrentPageIndex(newPageIndex);
                    const nextPageToken = pageTokens[newPageIndex];
                    if (nextPageToken !== undefined) {
                        getFiles(chatId, nextPageToken);
                    } else {
                        getFiles(chatId, pageTokens[currentPageIndex]);
                    }
                }}>+</Button>
            </div>
        </div>
    );
};

export default Files;
