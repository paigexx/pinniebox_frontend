import { useQuery } from "@tanstack/react-query";

export const useGetFiles = (chatId: string, pageToken: string) => {
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  return useQuery({
    queryKey: ["getFiles", chatId, pageToken],
    queryFn: async () => {
      const response = await fetch(
        `${serverUrl}/files/${chatId}?pageToken=${pageToken}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    },
  });
};
