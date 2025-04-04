import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MuiLink from "@mui/material/Link";

// Styled container for the chat messages
const ChatContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "63vh",
  overflowY: "auto",
  backgroundColor: theme.palette.background.default,
  margin: 0,
  marginBottom: theme.spacing(2),
}));

// Message bubble styling – color depends on sender
const MessageBubble = styled(Box)<{ sender: string }>(({ theme, sender }) => ({
  maxWidth: "70%",
  padding: theme.spacing(1),
  paddingBottom: 0,
  marginBottom: theme.spacing(1),
  borderRadius: "16px",
  backgroundColor:
    sender === "user" ? theme.palette.primary.light : theme.palette.grey[200],
  color:
    sender === "user"
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
  alignSelf: sender === "user" ? "flex-end" : "flex-start",
}));

// Define the message type
interface Message {
  sender: "user" | "bot";
  text: string;
}

const LOCAL_STORAGE_KEY = "chatHistory";

const linkifyText = (text: string): string => {
  return text;
};

const ChatPage: React.FC = () => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversation history from local storage on component mount.
  useEffect(() => {
    const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Save chatHistory to local storage whenever it changes.
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chatHistory));
  }, [chatHistory]);

  const clearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    // Append user's message to local history
    const newUserMessage: Message = { sender: "user", text: input };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    // Convert local chat history into the format expected by the backend.
    // Map "user" messages to role "user" and "bot" messages to role "model".
    const conversationHistoryPayload = updatedHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: conversationHistoryPayload,
        }),
      });
      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: data.response },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to server." },
      ]);
    }
    setInput("");
    setIsLoading(false);
  };

  return (
    <Paper sx={{ m: 0, p: 2 }}>
      <ChatContainer>
        {chatHistory.map((msg, idx) => (
          <Box key={idx} sx={{ display: "flex", flexDirection: "column" }}>
            <MessageBubble sender={msg.sender}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, children, ...props }) => (
                    <Box
                      component="h1"
                      sx={{
                        fontSize: "2rem",
                        margin: "1rem 0",
                        fontWeight: "bold",
                        borderBottom: "2px solid #eee",
                        paddingBottom: "0.5rem",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  h2: ({ node, children, ...props }) => (
                    <Box
                      component="h2"
                      sx={{
                        fontSize: "1.75rem",
                        margin: "1rem 0",
                        fontWeight: "bold",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "0.5rem",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  p: ({ node, children, ...props }) => (
                    <Box
                      component="p"
                      sx={{
                        margin: 0,
                        marginBottom: "0.75rem",
                        lineHeight: 1.5,
                        fontFamily: "Poppins, sans-serif",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  a: ({ node, ...props }) => (
                    <MuiLink
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: "#f57c00",
                        textDecoration: "underline",
                        "&:hover": { color: "#188bfb", cursor: "pointer" },
                      }}
                    />
                  ),
                  blockquote: ({ node, children, ...props }) => (
                    <Box
                      component="blockquote"
                      sx={{
                        borderLeft: "4px solid #ddd",
                        margin: "1rem 0",
                        paddingLeft: "1rem",
                        fontStyle: "italic",
                        color: "#555",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  // @ts-ignore
                  code: ({ inline, children, ...props }) => {
                    if (inline) {
                      return (
                        <Box
                          component="code"
                          sx={{
                            background: "#f5f5f5",
                            color: "#333",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "4px",
                            fontFamily: "monospace",
                            whiteSpace: "nowrap",
                          }}
                          {...props}
                        >
                          {children}
                        </Box>
                      );
                    }
                    return <code {...props}>{children}</code>;
                  },
                  table: ({ node, children, ...props }) => (
                    <Box
                      sx={{
                        overflowX: "auto",
                        mb: "1rem",
                      }}
                      {...(props as any)}
                    >
                      <Box
                        component="table"
                        sx={{
                          border: "1px solid black",
                          padding: "0.5rem",
                          backgroundColor: "#f5f5f5",
                          textAlign: "left",
                          fontWeight: "bold",
                          color: "black",
                        }}
                      >
                        {children}
                      </Box>
                    </Box>
                  ),
                  thead: ({ node, children, ...props }) => (
                    <Box component="thead" {...(props as any)}>
                      {children}
                    </Box>
                  ),
                  tbody: ({ node, children, ...props }) => (
                    <Box component="tbody" {...(props as any)}>
                      {children}
                    </Box>
                  ),
                  tr: ({ node, children, ...props }) => (
                    <tr {...(props as any)}>{children}</tr>
                  ),
                  th: ({ node, children, ...props }) => (
                    <Box
                      component="th"
                      sx={{
                        border: "1px solid black",
                        padding: "0.5rem",
                        backgroundColor: "#f5f5f5",
                        textAlign: "left",
                        fontWeight: "bold",
                        color: "black",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  td: ({ node, children, ...props }) => (
                    <Box
                      component="td"
                      sx={{
                        border: "1px solid black",
                        padding: "0.5rem",
                        backgroundColor: "#f5f5f5",
                        textAlign: "left",
                        fontWeight: "bold",
                        color: "black",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  pre: ({ node, children, ...props }) => (
                    <Box
                      component="pre"
                      sx={{
                        background: "#f5f5f5",
                        color: "#333",
                        padding: "1rem",
                        borderRadius: "4px",
                        overflowX: "auto",
                        margin: "1rem 0",
                      }}
                      {...props}
                    >
                      {children}
                    </Box>
                  ),
                }}
              >
                {linkifyText(msg.text)}
              </ReactMarkdown>
            </MessageBubble>
          </Box>
        ))}
      </ChatContainer>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={clearHistory} sx={{ mr: 2 }}>
          <DeleteIcon style={{ color: "red" }} />
        </IconButton>
        <TextField
          label="Type your message..."
          fullWidth
          multiline
          minRows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ mr: 2 }}
          disabled={isLoading}
        />
        <Button variant="contained" onClick={sendMessage} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Send"}
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatPage;
