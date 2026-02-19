import React, { useEffect, useState, useRef } from 'react';
import { X, Mail, Check, Trash2, User, Send, MessageCircle, Clock, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const MessageListModal = ({ onClose, targetUser }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const [replyContent, setReplyContent] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [admins, setAdmins] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const url = targetUser
                ? `http://localhost:5000/api/messages?otherUserId=${targetUser.id}`
                : 'http://localhost:5000/api/messages?senderRole=admin';

            const { data } = await axios.get(url, config);
            const sortedMessages = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessages(sortedMessages);

            // Mark all unread messages as read
            const unreadIds = data.filter(m => {
                const recipientId = m.recipient?._id ? m.recipient._id.toString() : m.recipient?.toString();
                return !m.isRead && recipientId === user._id.toString();
            }).map(m => m._id);
            if (unreadIds.length > 0) {
                Promise.all(unreadIds.map(id => markAsRead(id))).catch(err => console.error('Error marking messages read:', err));
            }

            // If it's an admin chat and no messages exist, fetch admins to enable staff-initiated chat
            if (!targetUser && data.length === 0) {
                const adminResponse = await axios.get('http://localhost:5000/api/messages/admins', config);
                setAdmins(adminResponse.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const markAsRead = async (messageId) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.put(`http://localhost:5000/api/messages/${messageId}/read`, {}, config);
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSendingReply(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            let recipientId = null;

            if (targetUser) {
                recipientId = targetUser.id;
            } else {
                // If no target student, we assume it's the admin chat (top bar button)
                // Search for any admin message to find the admin's ID
                const adminMessage = messages.find(m => m.sender.role === 'admin' || m.recipient.role === 'admin');
                if (adminMessage) {
                    recipientId = adminMessage.sender.role === 'admin' ? adminMessage.sender._id : adminMessage.recipient._id;
                } else if (admins.length > 0) {
                    // Start new conversation with the first admin found
                    recipientId = admins[0]._id;
                }
            }

            if (!recipientId) {
                alert("Cannot find recipient to reply to.");
                return;
            }

            await axios.post('http://localhost:5000/api/messages', {
                recipientId,
                content: replyContent
            }, config);

            setReplyContent('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setSendingReply(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#efe7dd] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[85vh] border border-gray-300">
                {/* Header - WhatsApp Green Style */}
                <div className="bg-[#075e54] p-4 flex justify-between items-center text-white shrink-0 shadow-lg z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <Mail className="w-6 h-6 text-blue-200" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-wide">
                                {targetUser ? `Chat with ${targetUser.name}` : 'Consistify Support'}
                            </h3>
                            <p className="text-[10px] text-blue-100 opacity-80 uppercase font-medium">
                                {targetUser ? 'Student Doubt Discussion' : 'Direct Admin Chat'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors text-white/70 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Message List - Chat Style Background */}
                <div
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar"
                    style={{
                        backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                        backgroundBlendMode: 'overlay'
                    }}
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#075e54]"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500/60 font-medium italic">
                            <Mail className="w-12 h-12 mb-3 opacity-20" />
                            <p>{targetUser ? `No messages with ${targetUser.name} yet.` : (admins.length > 0 ? 'Start a conversation with Consistify Support.' : 'No messages from Admin yet.')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {messages.map((msg) => {
                                const isOwnMessage = msg.sender._id === user._id;
                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex flex-col max-w-[85%] ${isOwnMessage ? 'self-end' : 'self-start'}`}
                                    >
                                        <div
                                            className={`p-2.5 px-4 rounded-xl shadow-sm relative ${isOwnMessage
                                                ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none'
                                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                                }`}
                                        >
                                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            <div className="flex items-center gap-1 mt-1 justify-end text-[10px] text-gray-400 select-none">
                                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isOwnMessage && (
                                                    msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5" />
                                                )}
                                            </div>
                                            {/* Tail */}
                                            <div className={`absolute top-0 ${isOwnMessage ? '-right-2' : '-left-2'}`}>
                                                <svg width="10" height="15" viewBox="0 0 10 15">
                                                    <path
                                                        d={isOwnMessage ? "M0 0 L10 0 L0 15 Z" : "M10 0 L0 0 L10 15 Z"}
                                                        fill={isOwnMessage ? "#dcf8c6" : "white"}
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Reply Section / Chat Input */}
                <div className="p-3 bg-[#f0f0f0] border-t border-gray-200 shrink-0">
                    <form onSubmit={handleSendReply} className="flex gap-2 items-end">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendReply(e);
                                }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-white border-0 rounded-2xl py-3 px-5 text-gray-800 leading-tight focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all resize-none max-h-32 text-[15px] shadow-sm"
                            rows="1"
                        />
                        <button
                            type="submit"
                            disabled={sendingReply || !replyContent.trim()}
                            className="bg-[#128c7e] hover:bg-[#075e54] text-white p-3.5 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shrink-0"
                        >
                            {sendingReply ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <Send className="w-5 h-5 ml-1" />
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
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}} />
        </div>
    );
};

export default MessageListModal;
