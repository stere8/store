"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Message {
  _id?: string;
  store: { _id: string; name?: string };
  userId: string;
  productId: string;
  sender: "user" | "store";
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const { StoreId } = useParams();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  interface Product {
    _id: string;
    name: string;
    images?: { url: string }[];
    store?: { name?: string };
    // Add other fields as needed
  }
  
    const [product, setProduct] = useState<Product | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load product info
  useEffect(() => {
    if (productId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`)
        .then((res) => res.json())
        .then((data) => setProduct(data))
        .catch(() => {});
    }
  }, [productId]);

  // Load chat messages
  useEffect(() => {
    if (user?.id && StoreId && productId) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat?storeId=${StoreId}&userId=${user.id}&productId=${productId}`
      )
        .then((res) => res.json())
        .then((data) => setMessages(data.messages || []))
        .catch(console.error);
    }
  }, [user?.id, StoreId, productId]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      storeId: StoreId,
      userId: user?.id,
      productId,
      sender: "user",
      content: input.trim(),
    };

    setMessages((prev) => [
      ...prev,
      {
        _id: undefined,
        store: { _id: typeof StoreId === "string" ? StoreId : StoreId[0], name: product?.store?.name || "" },
        userId: user?.id ?? "",
        productId: productId ?? "",
        sender: "user",
        content: input.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput("");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessage),
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardHeader className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-primary" />
            <div>
              <h2 className="text-lg font-semibold">
                Chat with Store #{StoreId}
              </h2>
              {product && (
                <p className="text-sm text-gray-500">
                  About: <span className="font-medium">{product.name}</span>
                </p>
              )}
            </div>
          </div>
          {product?.images?.[0]?.url && (
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={40}
              height={40}
              className="rounded-md"
            />
          )}
        </CardHeader>

        <CardContent className="h-[60vh] overflow-y-auto flex flex-col gap-3 p-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 mt-20">
              Start a conversation with the Store 👋
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id || msg.timestamp}
                className={cn(
                  "flex",
                  msg.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2 rounded-2xl max-w-[75%]",
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  )}
                >
                  <p>{msg.content}</p>
                  <span className="block text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </CardContent>

        <div className="flex items-center gap-2 p-4 border-t bg-white">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={!input.trim()}>
            <SendHorizonal className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
