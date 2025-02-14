import React from 'react';
import './SessionSlider.css';

const SessionSlider = ({ chatSessions, currentSessionId, switchSession, startNewSession, showSessions }) => {
  return (
    <div className={`session-slider ${showSessions ? 'visible' : ''}`}>
      <h2>Chat Sessions</h2>
      <ul>
        <li><button onClick={startNewSession}>New Session</button></li>
        {chatSessions.map(session => (
          <li key={session.id} onClick={() => switchSession(session.id)}>
            Session {session.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionSlider;
