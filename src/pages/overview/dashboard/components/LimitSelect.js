import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styles from './LimitSelect.module.css';

const LIMIT_OPTIONS = [
  { value: '10', label: '10 bản ghi' },
  { value: '50', label: '50 bản ghi' },
  { value: '100', label: '100 bản ghi' },
  { value: 'all', label: 'Tất cả' },
];

function LimitSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  
  const selectedOption = LIMIT_OPTIONS.find((opt) => opt.value === value) || LIMIT_OPTIONS[0];
  
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className={styles.trigger} type="button">
          <span>{selectedOption.label}</span>
          <svg
            className={styles.icon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} sideOffset={8}>
          {LIMIT_OPTIONS.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              className={`${styles.item} ${value === option.value ? styles.itemActive : ''}`}
              onSelect={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
              {value === option.value && (
                <svg
                  className={styles.checkIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 4L6 11L3 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default LimitSelect;

