import { useEffect, useState } from "react";
import { useLaunchParams } from "@telegram-apps/sdk-react";
import { useTelegramMock } from "./hooks/useMockTelegramInitData";
import "./App.css";
import '@telegram-apps/telegram-ui/dist/styles.css';
import UploadFile from "./components /UploadFiles";
import Files from "./components /Files";
import { Pagination, Spinner, Title } from "@telegram-apps/telegram-ui";

function App() {
  const {initDataRaw, initData } = useLaunchParams() || {};
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const chatId = initData?.chatInstance!
  const chatType = initData?.chatType!
  const telegramId = initData?.user?.id.toString()!
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useTelegramMock();

  useEffect(() => {
    if (initDataRaw) {
      const fetchData = async () => {
        try {
          setIsLoading(true); 
          const payload: any = {
            initData: initDataRaw,
            isMocked: false,
          };

          const serverUrl = process.env.REACT_APP_SERVER_URL;
          const response = await fetch(
            `${serverUrl}/auth/telegram`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error(
              `Server error: ${response.status} ${response.statusText}`
            );
          }
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error during authentication:", error);
          setErrorMessage(`An error occurred during authentication: ${error}`);
        } finally {
          setIsLoading(false); 
        }
      };
      fetchData();
    } else {
      setIsLoading(false); 
    }
  }, [initDataRaw]);



  return (
    <div className="App">
      <header className="App-header">
        <div>
          <Title
            level="1"
            weight="1"
          >
          PinnieBox
          </Title>
          {isLoading ? (
            <Spinner size="l" />
          ) : isAuthenticated ? (
            <>
          <UploadFile telegramId={telegramId} chatId={chatId} chatType={chatType}/>
          <Files chatId={chatId}/>
          </>
          ) : errorMessage ? (
            <p>{errorMessage}</p>
          ) : (
            <p>User is not authenticated</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
