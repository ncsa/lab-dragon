"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Updated import for useRouter from next/navigation
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { navLinks, userNames } from '../constants';
import Image from 'next/image';

const Toolbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeUser, setActiveUser] = useState('');

    useEffect(() => {
        const user = searchParams.get('user');
        if (user) {
            setActiveUser(user);
        }
    }, [searchParams]);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleUserClick = (user) => {
        setActiveUser(user);
        router.push(`/library?user=${user}`);
        setShowDropdown(false);
    };

    return (
        <div className="fixed left-0 top-0 h-full w-16 flex flex-col justify-between bg-grey shadow-lg">
            {/* Logo */}
            <Link href="/" className={`w-full p-3 flex justify-center items-center ${pathname === '/' ? 'bg-green' : 'hover:bg-green'}`}>
                <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center ">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="object-cover"
                    />
                </div>
            </Link>

            {/* Navigation Links */}
      <div className="flex-grow flex flex-col">
        {navLinks.filter(link => ['library', 'comment', 'search'].includes(link.id)).map((link) => (
          <Link
            key={link.id}
            href={`/${link.id}${activeUser ? `?user=${activeUser}` : ''}`}
            className={`w-full p-3 flex justify-center items-center transition-colors ${
              pathname === `/${link.id}`
                ? 'bg-blue text-blue rounded-md'
                : 'hover:bg-blue-100 text-gray-600 rounded-md'
            }`}
          >
            <div className={`w-10 h-10 rounded-md ${pathname === `/${link.id}` ? 'bg-white' : 'bg-white'} shadow flex items-center justify-center`}>
              {link.id === 'library' && <i className={`bi bi-book ${pathname === `/${link.id}` ? 'text-blue' : 'text-dark'} text-xl`}></i>}
              {link.id === 'comment' && <i className={`bi bi-chat-dots ${pathname === `/${link.id}` ? 'text-blue' : 'text-dark'} text-xl`}></i>}
              {link.id === 'search' && <i className={`bi bi-search ${pathname === `/${link.id}` ? 'text-blue' : 'text-dark'} text-xl`}></i>}
            </div>
          </Link>
        ))}
      </div>

    {/* Profile with Dropdown */}
      <div className="w-full p-3 flex flex-col items-center relative">
        {activeUser && (
          <div className="text-xs font-semibold text-blue-600 mb-2 bg-blue-100 px-2 py-1 rounded-full">
            {activeUser}
          </div>
        )}
        <div
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center cursor-pointer hover:bg-blue-500"
          onClick={toggleDropdown}
        >
          <i className="bi bi-person-circle text-dark text-xl text-blue"></i>
        </div>
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute left-16 bottom-0 w-40 bg-white shadow-lg rounded-md z-10">
            <ul className="flex flex-col text-gray-700 text-sm">
              {userNames.map((user, index) => (
                <li
                  key={index}
                  className={`px-4 py-2 hover:bg-blue-100 cursor-pointer ${
                    activeUser === user ? 'bg-blue-500 text-blue font-semibold' : 'hover:text-blue-600'
                  }`}
                  onClick={() => handleUserClick(user)}
                >
                  {user}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
