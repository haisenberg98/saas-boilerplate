'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '@/components/global/Button';

import ChatInput from './ChatInput';
import { ChatMessage } from './types';
import { formatAIResponse } from './utils';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { IoSparkles } from 'react-icons/io5';
import { toast } from 'react-toastify';

interface ChatModeProps {
    onReset?: () => void;
}

const ChatMode = ({ onReset }: ChatModeProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessages, setCopiedMessages] = useState<Set<string>>(new Set());
    const latestAIMessageRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the latest AI response
    const scrollToLatestAIMessage = () => {
        // Small delay to ensure the message is rendered
        setTimeout(() => {
            latestAIMessageRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start' // Align to the start of the AI response
            });
        }, 100);
    };

    useEffect(() => {
        // Only scroll when there's a new AI message (not user messages or loading)
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.type === 'ai') {
                scrollToLatestAIMessage();
            }
        }
    }, [messages]); // Only trigger on message changes

    const handleAIQuery = async (query: string) => {
        if (!query.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: query,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/coffee-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('AI API Response:', data);

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content:
                    data.response || 'Sorry, I had trouble processing that. Could you try rephrasing your question?',
                timestamp: new Date()
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Coffee AI Error:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: "Sorry, I'm having connectivity issues. Please try again in a moment.",
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputSubmit = useCallback((value: string) => {
        handleAIQuery(value);
    }, []);

    const handleCopyMessage = async (messageId: string, content: string) => {
        try {
            // For AI messages, remove HTML formatting; for user messages, use as-is
            const message = messages.find((m) => m.id === messageId);
            const isUserMessage = message?.type === 'user';
            const cleanContent = isUserMessage
                ? content
                : content
                      .replace(/<[^>]*>/g, '')
                      .replace(/&nbsp;/g, ' ')
                      .trim();

            await navigator.clipboard.writeText(cleanContent);
            setCopiedMessages((prev) => new Set(prev).add(messageId));
            toast.success(`${isUserMessage ? 'Prompt' : 'Response'} copied to clipboard!`);

            // Reset copy state after 2 seconds
            setTimeout(() => {
                setCopiedMessages((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(messageId);

                    return newSet;
                });
            }, 2000);
        } catch (error) {
            console.error('Failed to copy message:', error);
            toast.error('Failed to copy message');
        }
    };

    return (
        <div className='flex flex-col'>
            {/* Chat Messages */}
            <div className='mb-4 max-h-[40rem] min-h-96 overflow-y-auto rounded-lg border border-customGray p-4'>
                {messages.length === 0 ? (
                    <div className='flex h-32 flex-col items-center justify-center text-center'>
                        <div className='mb-3 text-3xl'>
                            <IoSparkles />
                        </div>
                        <p className='mb-2 text-sm text-customDarkGray'>Ask me anything about coffee brewing!</p>
                        <div className='text-xs text-customLightGray'>
                            Try: &quot;My coffee tastes bitter, help!&quot;
                            <br />
                            or &quot;I like 18g Colombian beans, 36g espresso, 30s brew - how do I mimic this with pour
                            over?&quot;
                        </div>
                    </div>
                ) : (
                    <div className='space-y-2'>
                        {messages.map((message, index) => {
                            // Check if this is the latest AI message
                            const isLatestAIMessage = message.type === 'ai' && index === messages.length - 1;

                            return (
                                <div
                                    key={message.id}
                                    ref={isLatestAIMessage ? latestAIMessageRef : null}
                                    className={`group flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`rounded-lg px-3 py-2 text-sm ${
                                            message.type === 'user'
                                                ? 'max-w-xs bg-customTertiary text-white'
                                                : 'max-w-sm bg-customSecondary text-customPrimary'
                                        }`}>
                                        {message.type === 'user' ? (
                                            message.content
                                        ) : (
                                            <div
                                                className='whitespace-pre-wrap'
                                                dangerouslySetInnerHTML={{
                                                    __html: formatAIResponse(message.content)
                                                }}
                                            />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleCopyMessage(message.id, message.content)}
                                        className='mt-1 flex items-center space-x-1 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[8px] opacity-0 shadow-sm transition-opacity duration-200 hover:border-gray-300 hover:shadow-md group-hover:opacity-100'
                                        title={`Copy ${message.type === 'user' ? 'prompt' : 'response'}`}>
                                        {copiedMessages.has(message.id) ? (
                                            <>
                                                <FiCheck className='h-3 w-3 text-green-600' />
                                                <span className='text-[12px] text-green-600'>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiCopy className='h-3 w-3 text-gray-600' />
                                                <span className='text-[12px] text-gray-600'>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                        {isLoading && (
                            <div className='flex justify-start'>
                                <div className='rounded-lg bg-customSecondary px-3 py-2 text-sm text-customPrimary'>
                                    <div className='flex items-center space-x-1'>
                                        <div className='h-2 w-2 animate-pulse rounded-full bg-customDarkGray'></div>
                                        <div
                                            className='h-2 w-2 animate-pulse rounded-full bg-customDarkGray'
                                            style={{ animationDelay: '0.2s' }}></div>
                                        <div
                                            className='h-2 w-2 animate-pulse rounded-full bg-customDarkGray'
                                            style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input */}
            <ChatInput onSubmit={handleInputSubmit} disabled={isLoading} />

            {messages.length > 0 && (
                <div className='mt-4 flex justify-center'>
                    <Button
                        onClick={() => setMessages([])}
                        className='bg-customDarkGray px-4 py-2 text-sm hover:border-customPrimary hover:bg-customPrimary hover:text-white'>
                        Clear Chat
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ChatMode;
