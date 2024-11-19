import { Avatar, Button, ButtonCell, Cell, List, Modal, Pagination, Placeholder, Section } from "@telegram-apps/telegram-ui";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";
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
        <div style={{ alignContent: "center" }}>
            <p>{errorMessage}</p>
            {isLoading && <p>Loading...</p>}
            <List>
                {files.map((file, index) => (
                    <div key={index}>
                        <Section>
                            <Cell after={<FileModal file={file} />}>
                                <p>{truncateFileName(file.name, 13)}</p>
                            </Cell>
                        </Section>
                    </div>
                ))}
                <Button disabled={currentPageIndex === 0} onClick={() => {
                    const newPageIndex = currentPageIndex - 1;
                    setCurrentPageIndex(newPageIndex);
                    getFiles(chatId, pageTokens[newPageIndex]);
                }}>prev</Button>
                <Button disabled={files.length < 5} onClick={() => {
                    const newPageIndex = currentPageIndex + 1;
                    setCurrentPageIndex(newPageIndex);
                    const nextPageToken = pageTokens[newPageIndex];
                    if (nextPageToken !== undefined) {
                        getFiles(chatId, nextPageToken);
                    } else {
                        getFiles(chatId, pageTokens[currentPageIndex]);
                    }
                }}>more</Button>
            </List>
        </div>
    );
};

export default Files;
