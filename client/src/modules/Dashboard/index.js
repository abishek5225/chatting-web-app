import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "./style.css";
import Img1 from '../../assets/img1.jpg'
import Logo from "../../assets/logo.png";
import { io } from 'socket.io-client'

const Dashboard = () => {
    console.log('Dashboard component rendering...');
    
    const navigate = useNavigate()
    const [user] = useState(JSON.parse(localStorage.getItem('user:detail')))
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState({})
    const [message, setMessage] = useState('')
    const [users, setUsers] = useState([])
    const [socket, setSocket] = useState(null)
    const messageRef = useRef(null)

    console.log('User:', user);

    const handleLogout = () => {
        localStorage.removeItem('user:token')
        localStorage.removeItem('user:detail')
        socket?.disconnect()
        navigate('/users/sign_in')
    }

    useEffect(() => {
        setSocket(io('http://localhost:8080'))
    }, [])

    useEffect(() => {
        socket?.emit('addUser', user?.id);
        socket?.on('getUsers', users => {
            console.log('activeUsers :>> ', users);
        })
        socket?.on('getMessage', data => {
            setMessages(prev => ({
                ...prev,
                messages: [...(prev.messages || []), { user: data.user, message: data.message }]
            }))
        })

        return () => {
            socket?.off('getUsers');
            socket?.off('getMessage');
        };
    }, [socket, user?.id])

    useEffect(() => {
        messageRef?.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages?.messages])

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user:detail'))
        const fetchConversations = async () => {
            const res = await fetch(`http://localhost:8000/api/conversations/${loggedInUser?.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const resData = await res.json()
            setConversations(resData)
        }
        fetchConversations()
    }, [])

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const resData = await res.json();
            setUsers(resData);
        }
        if (user?.id) {
            fetchUsers();
        }
    }, [user?.id])

    const fetchMessages = async (conversationId, receiver) => {
        const res = await fetch(`http://localhost:8000/api/message/${conversationId}?senderId=${user?.id}&receiverId=${receiver?.receiverId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const resData = await res.json();
        setMessages({ messages: resData, receiver, conversationId });
    }

    const sendMessage = async (e) => {
        if (!message.trim()) return;
        
        const messageText = message;
        setMessage('');
        
        socket?.emit('sendMessage', {
            senderId: user?.id,
            receiverId: messages?.receiver?.receiverId,
            message: messageText,
            conversationId: messages?.conversationId
        });
        
        const res = await fetch(`http://localhost:8000/api/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: messages?.conversationId,
                senderId: user?.id,
                message: messageText,
                receiverId: messages?.receiver?.receiverId
            })
        });
        
        if (res.ok) {
            // Refresh messages to get the latest
            fetchMessages(messages?.conversationId, messages?.receiver);
        }
    }

    return (
        <div className="chat-container w-screen flex">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="profile-section flex items-center">
                    <img src={Logo} className="profile-pic" alt="Profile" />
                    <div className="profile-info ml-4">
                        <h3>{user?.fullName}</h3>
                        <p>My Account</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="logout-btn"
                        title="Logout"
                    >
                        🚪
                    </button>
                </div>
                
                <div className="messages-section">
                    <div className="section-title">💬 Messages</div>
                    {conversations.length > 0 ? (
                        conversations.map(({ conversationId, user }) => (
                            <div 
                                key={conversationId}
                                className="conversation-item"
                                onClick={() => fetchMessages(conversationId, user)}
                            >
                                <img src={Img1} className="conversation-avatar" alt="User" />
                                <div className="conversation-info">
                                    <h4>{user?.fullName}</h4>
                                    <p>Click to chat</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 mt-8">
                            No conversations yet
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-main">
                {messages?.receiver?.fullName ? (
                    <>
                        <div className="chat-header">
                            <img src={Img1} className="chat-header-avatar" alt="User" />
                            <div className="chat-header-info">
                                <h3>{messages?.receiver?.fullName}</h3>
                                <p>{messages?.receiver?.email}</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
                            {messages?.messages?.length > 0 ? (
                                messages.messages.map(({ message, user: { id } = {} }, index) => {
                                    const isSent = id === user?.id;
                                    return (
                                        <div 
                                            key={index} 
                                            className={`w-full flex mb-3 ${isSent ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words ${
                                                    isSent 
                                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm" 
                                                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
                                               }`}
                                            >
                                                {message}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 text-white text-3xl">
                                        💬
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                                    <p className="text-sm">Send a message to begin chatting</p>
                                </div>
                            )}
                            <div ref={messageRef}></div>
                        </div>
                        
                        <div className="message-input-container">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="message-input"
                                onKeyPress={(e) => e.key === 'Enter' && message.trim() && sendMessage()}
                            />
                            <button
                                className="send-button"
                                onClick={sendMessage}
                                disabled={!message.trim()}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-chat">
                        <div className="empty-chat-icon">🚀</div>
                        <h3>Welcome to Chat App</h3>
                        <p>Select a conversation or start a new one</p>
                    </div>
                )}
            </div>

            {/* Users Section */}
            <div className="users-section">
                <div className="users-title">Connect with people</div>
                {users.length > 0 ? (
                    users.map(({ user }) => (
                        <div 
                            key={user.receiverId}
                            className="user-item"
                            onClick={() => fetchMessages("new", user)}
                        >
                            <img src={Img1} className="user-avatar" alt="User" />
                            <div className="user-info">
                                <h4>{user?.fullName}</h4>
                                <p>{user?.email}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 mt-8">
                        No users available
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard
