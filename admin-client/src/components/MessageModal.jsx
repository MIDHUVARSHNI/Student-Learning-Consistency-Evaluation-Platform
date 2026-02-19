import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaSpinner, FaClock, FaCheck, FaCheckDouble } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MessageModal = ({ recipient, onClose }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const { data } = await axios.get(`http://localhost:5001/api/admin/messages/${recipient._id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const sortedMessages = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessages(sortedMessages);

            // Mark unread messages received BY the admin AS read
            const unreadIds = data
                .filter(m => {
                    const recipientId = m.recipient?._id ? m.recipient._id.toString() : m.recipient?.toString();
                    return !m.isRead && recipientId === user._id.toString();
                })
                .map(m => m._id);

            if (unreadIds.length > 0) {
                // Non-blocking parallel update
                Promise.all(unreadIds.map(id =>
                    axios.put(`http://localhost:5001/api/admin/messages/${id}/read`, {}, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    })
                )).catch(err => console.error('Error marking messages read:', err));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    useEffect(() => {
        if (recipient) {
            fetchMessages();
        }
    }, [recipient]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            await axios.post(
                'http://localhost:5001/api/admin/messages',
                {
                    recipientId: recipient._id,
                    content: message,
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );
            setMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (!recipient) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-[#efe7dd] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[85vh] border border-gray-300">
                {/* Header - WhatsApp Green */}
                <div className="bg-[#075e54] p-4 flex justify-between items-center text-white shrink-0 shadow-lg z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <FaPaperPlane className="text-blue-200" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight uppercase tracking-wide">
                                {recipient.name}
                            </h3>
                            <p className="text-[10px] text-blue-100 opacity-80 uppercase font-medium">Consistify {recipient.role}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Message History - WhatsApp Style Background */}
                <div
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar"
                    style={{
                        backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                        backgroundBlendMode: 'overlay'
                    }}
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <FaSpinner className="animate-spin text-[#075e54] size-10" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500/60 font-medium italic">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex flex-col max-w-[85%] ${msg.sender._id === user._id ? 'self-end' : 'self-start'
                                    }`}
                            >
                                <div
                                    className={`p-2.5 px-4 rounded-xl shadow-sm relative ${msg.sender._id === user._id
                                        ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none'
                                        : 'bg-white text-gray-800 rounded-tl-none'
                                        }`}
                                >
                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <div
                                        className={`flex items-center gap-1 mt-1 justify-end text-[10px] text-gray-400 select-none`}
                                    >
                                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {msg.sender._id === user._id && (
                                            msg.isRead ? <FaCheckDouble className="text-blue-500 size-3" /> : <FaCheck className="size-3" />
                                        )}
                                    </div>
                                    {/* Tail */}
                                    <div className={`absolute top-0 ${msg.sender._id === user._id ? '-right-2' : '-left-2'}`}>
                                        <svg width="10" height="15" viewBox="0 0 10 15">
                                            <path
                                                d={msg.sender._id === user._id ? "M0 0 L10 0 L0 15 Z" : "M10 0 L0 0 L10 15 Z"}
                                                fill={msg.sender._id === user._id ? "#dcf8c6" : "white"}
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Footer Input Area */}
                <div className="p-3 bg-[#f0f0f0] border-t border-gray-200 shrink-0">
                    <form onSubmit={handleSend} className="flex gap-2 items-end">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            className="flex-1 bg-white border-0 rounded-2xl py-3 px-5 text-gray-800 leading-tight focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all resize-none max-h-32 text-[15px] shadow-sm"
                            placeholder="Type a message..."
                            rows="1"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            disabled={sending || !message.trim()}
                            className="bg-[#128c7e] hover:bg-[#075e54] text-white p-3.5 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shrink-0"
                        >
                            {sending ? (
                                <FaSpinner className="animate-spin" size={20} />
                            ) : (
                                <FaPaperPlane size={20} className="ml-0.5" />
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.2);
                }
            `}} />
        </div>
    );
};

export default MessageModal;
