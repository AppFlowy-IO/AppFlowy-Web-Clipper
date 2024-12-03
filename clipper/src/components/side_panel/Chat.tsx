import { MainContainer, Message, MessageInput, MessageList } from "@chatscope/chat-ui-kit-react";

import { ChatContainer } from "@chatscope/chat-ui-kit-react";


export function Chat(): JSX.Element {
  return (
    <div className="chat">
      <MainContainer className="chat-container">
        <ChatContainer className="chat-container">
          <MessageList className="chat-message-list">
            <Message
              model={{
                message: "Hello my friend",
                sentTime: "just now",
                sender: "Joe",
                direction: "outgoing",
                position: "single",
              }}
            />
          </MessageList>
          <MessageInput className="chat-message-input" placeholder="Type message here" />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default Chat;