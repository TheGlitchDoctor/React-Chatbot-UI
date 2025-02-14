import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser, faPaperPlane, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import SessionSlider from './components/SessionSlider';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showSessions, setShowSessions] = useState(false);
  const [sessionId, setSessionId] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorder = useRef(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [chatSessions, setChatSessions] = useState([{ id: 1, messages: [] }]);
  const [currentSessionId, setCurrentSessionId] = useState(1);

  useEffect(() => {
    const currentSession = chatSessions.find(session => session.id === currentSessionId);
    if (currentSession) {
      setMessages(currentSession.messages);
    } else {
      setMessages([]);
    }
  }, [currentSessionId, chatSessions]);

  useEffect(() => {
    if (!chatSessions.find(session => session.id === sessionId)) {
      setMessages([{ text: "Hello! How can I help you today?", sender: 'bot' }]);
    }
  }, [sessionId, chatSessions]);

  const handleSend = () => {
    if (input.trim() !== '') {
      const newMessage = { text: input, sender: 'user' };
      const botMessage = { text: `Echo: ${input}`, sender: 'bot' };

      setMessages(prevMessages => [...prevMessages, newMessage]);

      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, newMessage, botMessage]);
      }, 500);

      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === currentSessionId
            ? { ...session, messages: [...session.messages, newMessage, botMessage] }
            : session
        )
      );
      setInput('');
    }
  };

  const toggleSessions = () => {
    setShowSessions(!showSessions);
  };

  const startNewSession = () => {
    const newSessionId = chatSessions.length > 0 ? Math.max(...chatSessions.map(s => s.id)) + 1 : 1;
    setChatSessions([...chatSessions, { id: newSessionId, messages: [] }]);
    setCurrentSessionId(newSessionId);
    setSessionId(newSessionId);
    setMessages([{ text: "Hello! How can I help you today?", sender: 'bot' }]);
  };

  const switchSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    toggleSessions();
  };

  const handleVoiceRecord = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
          chunks.push(event.data);
        };
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/wav' });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          const confirmSend = window.confirm("Do you want to send the recording?");
          if (confirmSend) {
            const newMessage = { text: "Voice Message", sender: 'user', audio: url };
            setMessages(prevMessages => [...prevMessages, newMessage]);
            setChatSessions(prevSessions =>
              prevSessions.map(session =>
                session.id === currentSessionId
                  ? { ...session, messages: [...session.messages, newMessage] }
                  : session
              )
            );
            setAudioURL('');
          }
        };
        mediaRecorder.current.start();
        setIsRecording(true);
        setAudioChunks([]);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    } else {
      if (mediaRecorder.current) {
        mediaRecorder.current.stop();
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <FontAwesomeIcon icon={faBars} className="header-icon" onClick={toggleSessions} />
          <img src="/company_icon.png" alt="Company Icon" className="company-icon" />
        </div>
        <div className="header-right">
          <button className="login-button">Log In</button>
          <button className="signup-button">Sign Up</button>
        </div>
      </header>

      <div className={`app-content ${showSessions ? 'sessions-open' : ''}`}>
        <SessionSlider
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          switchSession={switchSession}
          startNewSession={startNewSession}
          showSessions={showSessions}
        />

        <div className="chat-area">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
              <FontAwesomeIcon icon={message.sender === 'user' ? faUser : faMicrophone} className="message-icon" />
              {message.text}
              {message.audio && (
                <audio controls src={message.audio}></audio>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="app-footer">
        <div className="user-profile">
          <FontAwesomeIcon icon={faUser} className="user-icon" />
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
          />
          <div className="input-buttons">
            <button className="send-button" onClick={handleSend}>
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
            <button
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceRecord}
            >
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
