'use client';

import { X, Plus, Clock, MoreVertical, Settings, Trash2, Download, Keyboard, HelpCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatHistory from './ChatHistory';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onClose: () => void;
}

const ChatTabs = [
  {
    id: 1,
    name: 'New Chat',
    isCurrent: true,
    hasDot: true,
  },
  {
    id: 2,
    name: 'Create a theme and apply it to the website',
    isCurrent: false,
    hasDot: false,
    timeAgo: '1h',
  },
  {
    id: 3,
    name: 'Build a minimalist website',
    isCurrent: false,
    hasDot: false,
    timeAgo: '1h',
  },
  
 
];


export default function Header({ onClose }: HeaderProps) {
  return (
    <div className="flex items-center  px-4 py-3 border-b border-border">
      <div className="flex items-center  flex-1 min-w-0 relative">
        {/* Scrollable tabs container with fade */}
        <div className="flex-1 min-w-0 relative">
          <div className="overflow-x-auto scrollbar-hide w-full flex items-center gap-2 pr-4">
            {ChatTabs.map((tab) => (
              <div key={tab.id} className={cn("px-2.5 py-1 text-xs font-medium rounded bg-background/50 text-aiPanel-text/60 whitespace-nowrap", tab.isCurrent && "bg-background text-aiPanel-text border border-border")}>
                {tab.name}
              </div>
            ))}
          </div>
          {/* Fade gradient on the right */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-aiPanel via-aiPanel/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="p-1.5 hover:bg-primary/10 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
        >
          <Plus size={16} />
        </button>
        <ChatHistory
          chats={ChatTabs.map((tab) => ({
            id: tab.id.toString(),
            name: tab.name,
            isCurrent: tab.isCurrent,
            hasDot: tab.hasDot,
            timeAgo: tab.timeAgo,
          }))}
          currentChatId={ChatTabs.find(tab => tab.isCurrent)?.id.toString()}
          onChatSelect={(id) => console.log('Select chat:', id)}
          onChatEdit={(id) => console.log('Edit chat:', id)}
          onChatDelete={(id) => console.log('Delete chat:', id)}
          onNewChat={() => console.log('New chat')}
        >
          <button
            className="p-1.5 hover:bg-primary/10 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
          >
            <Clock size={16} />
          </button>
        </ChatHistory>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 hover:bg-primary/10 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
            >
              <MoreVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Settings size={14} className="mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Keyboard size={14} className="mr-2" />
              <span>Keyboard Shortcuts</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Trash2 size={14} className="mr-2" />
              <span>Clear Chat</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Download size={14} className="mr-2" />
              <span>Export Chat</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <FileText size={14} className="mr-2" />
              <span>Documentation</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <HelpCircle size={14} className="mr-2" />
              <span>Help & Support</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-primary/10 rounded transition-colors text-aiPanel-text/60 hover:text-aiPanel-text"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

