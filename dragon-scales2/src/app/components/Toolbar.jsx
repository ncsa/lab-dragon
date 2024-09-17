"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks } from '../constants';
import { FaBook, FaCommentDots, FaSearch, FaUserCircle } from 'react-icons/fa';
import Image from 'next/image';


const Toolbar = () => {
    const pathname = usePathname();

    return (
        <div className="fixed left-0 top-0 h-full w-16 flex flex-col justify-between bg-grey shadow-lg">
            {/* Logo */}
            
                <Link href="/" className="w-full p-3 flex justify-center items-center hover:bg-green">
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
            <div className="flex-grow flex flex-col mt-6">
                {navLinks.filter(link => ['library', 'comment', 'search'].includes(link.id)).map((link) => (
                    <Link
                        key={link.id}
                        href={`/${link.id}`}
                        className={`w-full p-3 flex justify-center items-center hover:bg-blue transition-colors ${pathname === `/${link.id}` 
                            ? 'bg-blue-500 rounded-r-lg' 
                            : 'hover:bg-blue-100 rounded-r-lg'
                        }`}
                    >
                        <div className="w-10 h-10 rounded-md bg-white shadow flex items-center justify-center">
                            {link.id === 'library' && <FaBook className="text-blue text-xl" />}
                            {link.id === 'comment' && <FaCommentDots className="text-blue text-xl" />}
                            {link.id === 'search' && <FaSearch className="text-blue text-xl" />}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Profile */}
            <div className="w-full p-3 flex justify-center items-center">
                <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                    <FaUserCircle className="text-blue text-xl" /> {/* Profile icon */}
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
