
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message..."
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end space-x-2">
        {/* Attachment button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="self-end mb-1"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            disabled={disabled || isSending}
            className="min-h-[40px] max-h-[120px] resize-none pr-12"
            rows={1}
          />
          
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 bottom-1"
            disabled={disabled}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          className="self-end mb-1 bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <span>Press Enter to send, Shift + Enter for new line</span>
        <span>{message.length}/1000</span>
      </div>
    </div>
  );
};

export default MessageInput;
