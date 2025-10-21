'use client';

import { memo, useCallback, useRef } from 'react';

import Button from '@/components/global/Button';
import { Textarea } from '@/components/ui/textarea';

import { Send } from 'lucide-react';

interface ChatInputProps {
    onSubmit: (value: string) => void;
    disabled: boolean;
    onInputChange?: (value: string) => void;
}

const ChatInput = memo(({ onSubmit, disabled, onInputChange }: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey && !disabled) {
                e.preventDefault();
                const value = textareaRef.current?.value || '';
                if (value.trim()) {
                    onSubmit(value);
                    if (textareaRef.current) {
                        textareaRef.current.value = '';
                        textareaRef.current.style.height = 'auto';
                    }
                }
            }
        },
        [disabled, onSubmit]
    );

    const handleSubmit = useCallback(() => {
        const value = textareaRef.current?.value || '';
        if (value.trim() && !disabled) {
            onSubmit(value);
            if (textareaRef.current) {
                textareaRef.current.value = '';
                textareaRef.current.style.height = 'auto';
            }
        }
    }, [disabled, onSubmit]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (onInputChange) {
                onInputChange(e.target.value);
            }

            // Auto-resize textarea
            const textarea = e.target;
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        },
        [onInputChange]
    );

    return (
        <div>
            <div className='relative flex items-end'>
                <Textarea
                    ref={textareaRef}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder='Ask about coffee brewing...'
                    disabled={disabled}
                    className='max-h-[120px] min-h-[48px] w-full resize-none pr-12 text-lg placeholder:text-customLightGray md:min-h-[52px] md:pr-14'
                    rows={1}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={disabled}
                    className='absolute bottom-2 right-3 h-8 w-8 rounded-full p-0 md:right-3 md:h-9 md:w-9'>
                    <Send className='h-4 w-4 md:h-5 md:w-5' />
                </Button>
            </div>
            <div className='mt-1 text-xs text-customLightGray'>Shift+Enter for new line</div>
        </div>
    );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
