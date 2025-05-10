import React, { useState, useEffect, useRef, FormEvent } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Avatar,
  useTheme,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AndroidIcon from "@mui/icons-material/Android";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import MuiLink from "@mui/material/Link";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const LOCAL_STORAGE_KEY = "chatHistory";
const linkifyText = (text: string): string => text;

// Styled container for the chat messages
const ChatContainer = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "auto",
  background:
    theme.palette.mode === "light"
      ? "linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)"
      : "linear-gradient(180deg, #1e1e1e 0%, #121212 100%)",
  margin: 0,
  borderRadius: theme.shape.borderRadius,
  "&::-webkit-scrollbar": { width: "8px" },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.background.default,
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.divider,
    borderRadius: 4,
  },
  transition: "background 0.3s ease",
}));

// Message row wrapper for aligning user vs bot
const MessageRow = styled(Box)<{ sender: "user" | "bot" }>(({ sender }) => ({
  display: "flex",
  flexDirection: sender === "user" ? "row-reverse" : "row",
  alignItems: "flex-start",
  marginBottom: 12,
}));

// Message bubble with tail, shadow, hover lift, and forced child-color inheritance
const MessageBubble = styled(Box)<{ sender: "user" | "bot" }>(({
  theme,
  sender,
}) => {
  const isUser = sender === "user";
  const bgColor = isUser
    ? theme.palette.primary.main
    : theme.palette.mode === "light"
      ? ""
      : theme.palette.grey[800];
  const color = isUser ? "#ffffff" : theme.palette.text.primary;

  return {
    maxWidth: "70%",
    padding: theme.spacing(1.5),
    borderRadius: "16px",
    backgroundColor: bgColor,
    color,
    // make sure all nested elements inherit the bubble's color
    "& *": {
      color,
    },
    boxShadow: theme.shadows[1],
    position: "relative",
    transition: "transform 0.1s ease",
    paddingBottom: 0,
    "&:hover": { transform: "translateY(-2px)" },
    "&:before": {
      content: '""',
      position: "absolute",
      top: 0,
      [isUser ? "right" : "left"]: -8,
      width: 0,
      height: 0,
      borderTop: `8px solid ${bgColor}`,
      borderLeft: isUser ? "none" : "8px solid transparent",
      borderRight: isUser ? "8px solid transparent" : "none",
    },
  };
});

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [chatHistory, setChatHistory] = useState<Message[]>(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as Message[];
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Always scroll to bottom when history changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Helper to append and immediately persist
  const appendMessage = (msg: Message) => {
    setChatHistory((prev) => {
      const next = [...prev, msg];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Helper to clear and immediately persist
  const clearHistory = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setChatHistory([]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    setIsLoading(true);

    // 1) add user message
    appendMessage({ sender: "user", text });

    // prepare payload (use the fresh array by reading localStorage)
    const fresh: Message[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || "[]",
    );
    const payload = fresh.map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // 2) call backend
    try {
      const res = await fetch(
        "https://fred-data-analysis-backend.vercel.app/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history: payload }),
        },
      );
      const { response } = await res.json();

      // 3) append bot
      appendMessage({ sender: "bot", text: response });
    } catch {
      appendMessage({ sender: "bot", text: "⚠️ Error connecting to server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        p: 2,
      }}
    >
      {/* Chat messages area */}
      <ChatContainer ref={containerRef}>
        {chatHistory.length === 0 && !isLoading && (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <ChatBubbleOutlineIcon
              sx={{ fontSize: 64, mb: 2, color: theme.palette.text.secondary }}
            />
            <Typography variant="h5" color="text.secondary">
              Send a message to get started! 👋
            </Typography>
          </Box>
        )}

        {chatHistory.map((msg, idx) => (
          <MessageRow key={idx} sender={msg.sender}>
            <Avatar sx={{ mr: 1, bgcolor: "transparent" }}>
              {msg.sender === "user" ? (
                <AccountCircleIcon color="primary" />
              ) : (
                <AndroidIcon color="action" />
              )}
            </Avatar>
            <MessageBubble sender={msg.sender}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({ children, ...props }) => (
                    <Box
                      component="h1"
                      sx={{
                        fontSize: "2rem",
                        margin: "1rem 0",
                        fontWeight: "bold",
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        paddingBottom: "0.5rem",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  h2: ({ children, ...props }) => (
                    <Box
                      component="h2"
                      sx={{
                        fontSize: "1.75rem",
                        margin: "1rem 0",
                        fontWeight: "bold",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        paddingBottom: "0.5rem",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  p: ({ children, ...props }) => (
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
                  a: ({ ...props }) => (
                    <MuiLink
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        textDecoration: "underline",
                        "&:hover": {
                          cursor: "pointer",
                        },
                      }}
                    />
                  ),
                  blockquote: ({ children, ...props }) => (
                    <Box
                      component="blockquote"
                      sx={{
                        borderLeft: `4px solid ${theme.palette.divider}`,
                        margin: "1rem 0",
                        paddingLeft: "1rem",
                        fontStyle: "italic",
                        backgroundColor:
                          theme.palette.mode === "light"
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  code: ({ inline, children, ...props }: any) => {
                    if (inline) {
                      return (
                        <Box
                          component="code"
                          sx={{
                            background:
                              theme.palette.mode === "light"
                                ? theme.palette.grey[300]
                                : theme.palette.grey[700],
                            padding: "0.2rem 0.4rem",
                            borderRadius: "4px",
                            fontFamily: "monospace",
                            whiteSpace: "nowrap",
                          }}
                          {...(props as any)}
                        >
                          {children}
                        </Box>
                      );
                    }
                    return (
                      <Box
                        component="pre"
                        sx={{
                          background:
                            theme.palette.mode === "light"
                              ? theme.palette.grey[300]
                              : theme.palette.grey[700],
                          padding: "1rem",
                          borderRadius: "4px",
                          overflowX: "auto",
                          margin: "1rem 0",
                          fontFamily: "monospace",
                        }}
                        {...(props as any)}
                      >
                        {children}
                      </Box>
                    );
                  },
                  table: ({ children, ...props }) => (
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
                          width: "100%",
                          borderCollapse: "collapse",
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {children}
                      </Box>
                    </Box>
                  ),
                  thead: ({ children, ...props }) => (
                    <Box
                      component="thead"
                      sx={{ backgroundColor: theme.palette.action.hover }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  tbody: ({ children, ...props }) => (
                    <Box component="tbody" {...(props as any)}>
                      {children}
                    </Box>
                  ),
                  tr: ({ children, ...props }) => (
                    <Box
                      component="tr"
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: theme.palette.action.selected,
                        },
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  th: ({ children, ...props }) => (
                    <Box
                      component="th"
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        padding: "0.5rem",
                        fontWeight: "bold",
                        textAlign: "left",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                  td: ({ children, ...props }) => (
                    <Box
                      component="td"
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        padding: "0.5rem",
                        textAlign: "left",
                      }}
                      {...(props as any)}
                    >
                      {children}
                    </Box>
                  ),
                }}
              >
                {linkifyText(msg.text)}
              </ReactMarkdown>
            </MessageBubble>
          </MessageRow>
        ))}

        {/* Thinking indicator */}
        {isLoading && (
          <MessageRow sender="bot">
            <Avatar sx={{ mr: 1, bgcolor: "transparent" }}>
              <AndroidIcon color="action" />
            </Avatar>
            <MessageBubble sender="bot" sx={{ pb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Thinking...
              </Box>
            </MessageBubble>
          </MessageRow>
        )}
      </ChatContainer>

      {/* Input form */}
      <Box
        component="form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          sendMessage();
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 2,
        }}
      >
        <IconButton onClick={clearHistory} disabled={isLoading} sx={{ mr: 0 }}>
          <DeleteIcon color="error" />
        </IconButton>
        <TextField
          placeholder="Type your message…"
          variant="outlined"
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          sx={{ mr: 1, ml: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
          disabled={isLoading || !input.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatPage;
