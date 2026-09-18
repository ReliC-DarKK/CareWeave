import React, { useState } from 'react';
import { Send, ShieldCheck, User, CheckCheck, Clock } from 'lucide-react';
import { DEMO_CONVERSATIONS } from '../data/mockData';
import styles from './Messages.module.css';

export function Messages() {
  const [activeConvId, setActiveConvId] = useState(DEMO_CONVERSATIONS[0].id);

  const activeConversation = DEMO_CONVERSATIONS.find((c) => c.id === activeConvId) || DEMO_CONVERSATIONS[0];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.visualAnchor} aria-hidden="true" />
          <div>
            <h1 className={styles.pageTitle}>Care Team Communications & Messages</h1>
            <p className={styles.pageSubtitle}>
              Secure clinical correspondence with attending specialists and care navigation
            </p>
          </div>
        </div>
      </header>

      <div className={styles.messagingShell}>
        {/* Left Column: Conversation List */}
        <aside className={styles.convListPanel} aria-label="Conversation list">
          <div className={styles.convListHeader}>
            <span className={styles.convListTitle}>Clinical Threads</span>
            <span className={styles.convCount}>{DEMO_CONVERSATIONS.length} active</span>
          </div>

          <div className={styles.convList}>
            {DEMO_CONVERSATIONS.map((conv) => {
              const isSelected = conv.id === activeConversation.id;

              return (
                <button
                  key={conv.id}
                  type="button"
                  className={`${styles.convItem} ${isSelected ? styles.convItemActive : ''}`}
                  onClick={() => setActiveConvId(conv.id)}
                  aria-selected={isSelected}
                >
                  <div className={styles.convAvatar}>
                    {conv.senderName.replace('Dr. ', '').replace('Nurse ', '').split(' ').map((n) => n[0]).join('')}
                  </div>

                  <div className={styles.convSummary}>
                    <div className={styles.convTopRow}>
                      <span className={styles.convName}>{conv.senderName}</span>
                      <span className={styles.convTime}>{conv.timestamp.split('·')[1]?.trim() || conv.timestamp}</span>
                    </div>

                    <span className={styles.convRole}>{conv.senderRole}</span>

                    <p className={styles.convSnippet}>{conv.lastMessage}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Active Conversation Thread */}
        <main className={styles.activeThreadPanel}>
          {/* Thread Header */}
          <div className={styles.threadHeader}>
            <div className={styles.headerParticipant}>
              <div className={styles.headerAvatar}>
                {activeConversation.senderName.replace('Dr. ', '').replace('Nurse ', '').split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h2 className={styles.headerName}>{activeConversation.senderName}</h2>
                <span className={styles.headerRole}>{activeConversation.senderRole} · Metro Health System</span>
              </div>
            </div>

            <div className={styles.securityBadge}>
              <ShieldCheck size={14} aria-hidden="true" />
              <span>HIPAA-Compliant Encrypted Channel</span>
            </div>
          </div>

          {/* Message Stream */}
          <div className={styles.messagesStream}>
            {activeConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageBubble} ${msg.isIncoming ? styles.bubbleIncoming : styles.bubbleOutgoing}`}
              >
                <div className={styles.messageMeta}>
                  <span className={styles.msgSender}>{msg.sender}</span>
                  <span className={styles.msgTime}>{msg.time}</span>
                </div>
                <p className={styles.msgText}>{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className={styles.inputBar}>
            <input
              type="text"
              className={styles.messageInput}
              placeholder={`Send a message to ${activeConversation.senderName}...`}
              aria-label="Message text"
              disabled
            />
            <button
              type="button"
              className={styles.sendButton}
              disabled
              aria-label="Send message (demo fixture)"
            >
              <Send size={14} aria-hidden="true" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
