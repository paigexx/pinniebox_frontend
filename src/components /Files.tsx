import { Button } from "@telegram-apps/telegram-ui";
import FileModal from "./FileModal";
import { useGetFiles } from "../hooks/queries/UseFiles";
import { useState } from "react";

interface FilesProps {
  chatId: string;
}

const Files: React.FC<FilesProps> = ({ chatId }) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageTokens, setPageTokens] = useState<string[]>([""]);

  const pageToken = pageTokens[currentPage];
  const { data: files, isLoading, error, isFetching } = useGetFiles(chatId, pageToken);

  const handleNextPage = () => {
    const nextPageToken = files?.data?.next_page_token;
    if (nextPageToken) {
      if (!pageTokens.includes(nextPageToken)) {
        setPageTokens((prev) => [...prev, nextPageToken]);
      }
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const truncateFileName = (fileName: string, maxLength: number) => {
    const extension = fileName.substring(fileName.lastIndexOf("."));
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    if (nameWithoutExt.length > maxLength) {
      return `${nameWithoutExt.substring(0, maxLength)}...${extension}`;
    }
    return fileName;
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "white",
          marginTop: "20px",
          borderRadius: "10px",
        }}
      >
        <Button
          style={{
            width: "50%",
            backgroundColor: "#33f9a1",
            color: "black",
          }}
          disabled={currentPage === 0 || isFetching}
          onClick={handlePrevPage}
        >
          Prev
        </Button>
        <Button
          style={{
            width: "50%",
            backgroundColor: "#33f9a1",
            color: "black",
          }}
          disabled={files?.data?.files.length < 5  || isFetching}
          onClick={handleNextPage}
        >
          Next
        </Button>
      </div>
      <div>
        {error && <p>{`Error: ${error.message}`}</p>}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
        <div style={{marginTop: "10px"}}>
            {files?.data?.files?.map((file: any, fileIndex: number) => (
              <div
                key={fileIndex}
                style={{
                  display: "flex",
                  marginTop: "5px",
                  justifyContent: "space-between",
                  padding: "15px",
                  backgroundColor: "black",
                  opacity: ".9",
                  borderRadius: "20px",
                }}
              >
                <p>{truncateFileName(file.name, 15)}</p>
                <FileModal file={file} />
              </div>
            ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Files;
