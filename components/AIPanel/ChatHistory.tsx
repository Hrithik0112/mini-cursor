'use client';

import { Search, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  name: string;
  isCurrent?: boolean;
  timeAgo?: string;
  hasDot?: boolean;
}

interface ChatHistoryProps {
  chats: Chat[];
  currentChatId?: string;
  onChatSelect?: (chatId: string) => void;
  onChatEdit?: (chatId: string) => void;
  onChatDelete?: (chatId: string) => void;
  onNewChat?: () => void;
  children: React.ReactNode;
}

export default function ChatHistory({
  chats,
  currentChatId,
  onChatSelect,
  onChatEdit,
  onChatDelete,
  onNewChat,
  children,
}: ChatHistoryProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        sideOffset={4}
        align="end"
        className="w-[320px] p-0 bg-background border border-border rounded-lg shadow-xl"
      >
        {/* Search Bar */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-aiPanel-text/40" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 bg-muted/30 border border-border rounded text-xs text-aiPanel-text placeholder:text-aiPanel-text/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Today Section */}
        <div className="p-2">
          <div className="text-xs text-aiPanel-text/50 px-2 py-1.5">
            Today
          </div>
          
          {/* Chat List */}
          <div className="max-h-[300px] overflow-y-auto space-y-0.5">
            {chats.map((chat) => {
              const isCurrent = chat.id === currentChatId || chat.isCurrent;
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-center gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer",
                    isCurrent && "bg-yellow-50/80"
                  )}
                  onClick={() => onChatSelect?.(chat.id)}
                >
                  <MessageSquare size={14} className="text-aiPanel-text/60 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "text-xs truncate block",
                      isCurrent ? "text-aiPanel-text font-medium" : "text-aiPanel-text/80"
                    )}>
                      {chat.name}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] text-aiPanel-text/50 whitespace-nowrap flex-shrink-0">
                      Current
                    </span>
                  )}
                  {chat.hasDot && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  )}
                  {chat.timeAgo && (
                    <span className="text-[10px] text-aiPanel-text/50 whitespace-nowrap flex-shrink-0">
                      {chat.timeAgo}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChatEdit?.(chat.id);
                      }}
                      className="p-1 hover:bg-muted/50 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChatDelete?.(chat.id);
                      }}
                      className="p-1 hover:bg-muted/50 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Chat Option */}
        <div className="p-2 border-t border-border">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/30 transition-colors text-xs text-aiPanel-text/60 hover:text-aiPanel-text"
          >
            <MessageSquare size={14} />
            <span>New Chat</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

