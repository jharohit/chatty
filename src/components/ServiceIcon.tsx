import React from 'react';
import { ServiceType } from '../types';
import { Globe } from 'lucide-react';

interface ServiceIconProps {
  type: ServiceType;
  className?: string;
  size?: number;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ type, className = 'w-6 h-6', size = 24 }) => {
  switch (type) {
    case 'whatsapp':
    case 'whatsapp_business':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill={type === 'whatsapp_business' ? '#0F766E' : '#25D366'} />
          <path
            d="M23.5 8.5C21.5 6.5 18.8 5.4 16 5.4C10.2 5.4 5.4 10.2 5.4 16C5.4 17.9 5.9 19.7 6.8 21.3L5.3 26.7L10.9 25.2C12.4 26 14.2 26.5 16 26.5C21.8 26.5 26.6 21.8 26.6 16C26.6 13.2 25.5 10.5 23.5 8.5ZM16 24.7C14.4 24.7 12.8 24.3 11.4 23.5L11.1 23.3L7.7 24.2L8.6 20.9L8.3 20.5C7.4 19.1 7 17.5 7 16C7 11 11 7 16 7C18.4 7 20.7 7.9 22.4 9.6C24.1 11.3 25 13.6 25 16C25 21 21 24.7 16 24.7ZM20.9 18.3C20.6 18.1 19.3 17.5 19.1 17.4C18.8 17.3 18.7 17.3 18.5 17.5C18.3 17.8 17.8 18.3 17.7 18.5C17.5 18.7 17.3 18.7 17 18.6C16.8 18.4 15.8 18.1 14.7 17.1C13.8 16.3 13.2 15.3 13 15C12.8 14.8 13 14.6 13.1 14.5C13.2 14.4 13.4 14.2 13.5 14.1C13.6 14 13.7 13.9 13.8 13.7C13.9 13.5 13.8 13.4 13.8 13.3C13.7 13.2 13.2 11.9 13 11.4C12.8 10.9 12.6 11 12.4 11H11.9C11.7 11 11.4 11.1 11.2 11.3C10.9 11.6 10.3 12.2 10.3 13.4C10.3 14.6 11.2 15.8 11.3 15.9C11.5 16.1 13 18.4 15.3 19.4C15.9 19.7 16.3 19.8 16.7 20C17.3 20.1 17.8 20.1 18.3 20C18.8 19.9 19.9 19.3 20.1 18.7C20.3 18.1 20.3 17.6 20.3 17.5C20.2 17.3 20.1 17.3 20.9 18.3Z"
            fill="white"
          />
        </svg>
      );

    case 'telegram':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#2AABEE" />
          <path
            d="M8.2 15.6L22.8 9.9C23.5 9.6 24.1 10.1 23.9 10.8L21.4 22.4C21.2 23.2 20.7 23.4 20 23L16.2 20.2L14.4 21.9C14.2 22.1 14 22.3 13.6 22.3L13.9 18.3L21.1 11.8C21.4 11.5 21.1 11.3 20.7 11.6L11.8 17.2L7.9 15.9C7.1 15.6 7.1 15 8.2 15.6Z"
            fill="white"
          />
        </svg>
      );

    case 'slack':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#4A154B" />
          <path
            d="M11 16.5C11 17.3 10.3 18 9.5 18C8.7 18 8 17.3 8 16.5C8 15.7 8.7 15 9.5 15C10.3 15 11 15.7 11 16.5ZM12.5 16.5C12.5 15.7 13.2 15 14 15C14.8 15 15.5 15.7 15.5 16.5V20.5C15.5 21.3 14.8 22 14 22C13.2 22 12.5 21.3 12.5 20.5V16.5Z"
            fill="#E01E5A"
          />
          <path
            d="M15.5 11C14.7 11 14 10.3 14 9.5C14 8.7 14.7 8 15.5 8C16.3 8 17 8.7 17 9.5C17 10.3 16.3 11 15.5 11ZM15.5 12.5C16.3 12.5 17 13.2 17 14C17 14.8 16.3 15.5 15.5 15.5H11.5C10.7 15.5 10 14.8 10 14C10 13.2 10.7 12.5 11.5 12.5H15.5Z"
            fill="#36C5F0"
          />
          <path
            d="M21 15.5C21 14.7 21.7 14 22.5 14C23.3 14 24 14.7 24 15.5C24 16.3 23.3 17 22.5 17C21.7 17 21 16.3 21 15.5ZM19.5 15.5C19.5 16.3 18.8 17 18 17C17.2 17 16.5 16.3 16.5 15.5V11.5C16.5 10.7 17.2 10 18 10C18.8 10 19.5 10.7 19.5 11.5V15.5Z"
            fill="#2EB67D"
          />
          <path
            d="M16.5 21C17.3 21 18 21.7 18 22.5C18 23.3 17.3 24 16.5 24C15.7 24 15 23.3 15 22.5C15 21.7 15.7 21 16.5 21ZM16.5 19.5C15.7 19.5 15 18.8 15 18C15 17.2 15.7 16.5 16.5 16.5H20.5C21.3 16.5 22 17.2 22 18C22 18.8 21.3 19.5 20.5 19.5H16.5Z"
            fill="#ECB22E"
          />
        </svg>
      );

    case 'google_chat':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#00AC47" />
          <path
            d="M9 10C9 8.9 9.9 8 11 8H19C20.1 8 21 8.9 21 10V16C21 17.1 20.1 18 19 18H12L9 21V10Z"
            fill="white"
          />
          <path
            d="M23 13H21V18H14V20C14 21.1 14.9 22 16 22H21L24 25V14C24 13.4 23.6 13 23 13Z"
            fill="#C7F3D6"
          />
        </svg>
      );

    case 'signal':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#3A76F0" />
          <path
            d="M16 8C11.6 8 8 11.4 8 15.6C8 17.6 8.8 19.4 10.1 20.8L9.5 23.8C9.4 24.3 9.9 24.7 10.3 24.5L13.7 23.3C14.4 23.6 15.2 23.7 16 23.7C20.4 23.7 24 20.3 24 16C24 11.6 20.4 8 16 8Z"
            fill="white"
          />
        </svg>
      );

    case 'discord':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#5865F2" />
          <path
            d="M22.5 10.3C21.1 9.6 19.6 9.1 18 9C18 9 17.7 9.5 17.5 10C15.8 9.8 14.2 9.8 12.5 10C12.3 9.5 12 9 12 9C10.4 9.1 8.9 9.6 7.5 10.3C4.8 14.3 4 18.2 4.4 22C6.2 23.4 8 24.2 9.7 24.8C10.2 24.2 10.6 23.5 11 22.8C10.3 22.5 9.7 22.2 9.1 21.8C9.2 21.7 9.4 21.6 9.6 21.4C13.2 23 17 23 20.5 21.4C20.7 21.6 20.8 21.7 21 21.8C20.4 22.2 19.7 22.5 19.1 22.8C19.5 23.5 19.9 24.2 20.4 24.8C22.1 24.2 23.9 23.4 25.7 22C26.1 17.6 25 13.8 22.5 10.3ZM11.5 19.2C10.5 19.2 9.7 18.2 9.7 17.1C9.7 16 10.5 15.1 11.5 15.1C12.5 15.1 13.3 16 13.3 17.1C13.3 18.2 12.5 19.2 11.5 19.2ZM18.5 19.2C17.5 19.2 16.7 18.2 16.7 17.1C16.7 16 17.5 15.1 18.5 15.1C19.5 15.1 20.3 16 20.3 17.1C20.3 18.2 19.5 19.2 18.5 19.2Z"
            fill="white"
          />
        </svg>
      );

    case 'messenger':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#0084FF" />
          <path
            d="M16 6C10.5 6 6 10.2 6 15.3C6 18.2 7.4 20.8 9.6 22.5V26L13 24.1C14 24.4 15 24.6 16 24.6C21.5 24.6 26 20.4 26 15.3C26 10.2 21.5 6 16 6ZM17.2 18.5L14.7 15.8L9.8 18.5L15.2 12.8L17.7 15.5L22.6 12.8L17.2 18.5Z"
            fill="white"
          />
        </svg>
      );

    case 'chatgpt':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#10A37F" />
          <path
            d="M23.3 14.1C23 12.2 21.7 10.8 20 10.3C19.7 9.1 18.8 8.1 17.6 7.6C15.8 6.9 13.8 7.4 12.6 8.8C11.4 8.7 10.1 9.4 9.5 10.5C8.5 12.1 8.8 14.2 10.1 15.5C9.8 16.7 10.1 18 10.9 18.9C11.9 20.2 13.6 20.8 15.2 20.5C15.7 21.5 16.7 22.2 17.8 22.4C19.6 22.8 21.4 21.8 22.2 20.2C23.1 19.7 23.7 18.7 23.8 17.6C23.9 16.4 23.7 15.1 23.3 14.1Z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'claude':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="16" r="16" fill="#D97706" />
          <path
            d="M16 7L18.2 13.8L25 16L18.2 18.2L16 25L13.8 18.2L7 16L13.8 13.8L16 7Z"
            fill="white"
          />
        </svg>
      );

    default:
      return (
        <div
          className={`flex items-center justify-center rounded-full bg-slate-200 text-slate-700 ${className}`}
          style={{ width: size, height: size }}
        >
          <Globe className="w-4 h-4" />
        </div>
      );
  }
};
