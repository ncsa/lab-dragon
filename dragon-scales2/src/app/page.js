import React from 'react';
import Image from 'next/image';
import { CiSquarePlus } from "react-icons/ci";
import Link from 'next/link'

const Home = () => {
  return (
    <div className="bg-green min-h-screen flex">
      {/* Main content area */}
      <div className="flex-grow flex flex-col items-start pl-32 pt-16">
        {/* Logo and Lab Dragon */}
        <div className="w-full flex flex-col items-center text-center mb-16">
          <Image
            src="/logo.png"
            alt="Lab Dragon Logo"
            width={80}
            height={80}
          />
          <div className="text-white text-[54.13px] font-bold font-['Helvetica Neue'] mt-4">
            Lab Dragon
          </div>
        </div>

        {/* Create new Library Section */}
        <Link href="/library">
          <div className="flex flex-col items-start">
            <div className="text-white text-[34.58px] font-bold font-['Helvetica Neue'] mb-4">
              Get started
            </div>
            <div className="relative bg-white rounded-[22px] shadow-lg p-4 w-[191px] h-[191px] flex flex-col cursor-pointer hover:shadow-xl transition-shadow overflow-hidden">
              {/* Bottom half background */}
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-[#CFF1E6]"></div>
              {/* Content */}
              <div className="relative z-10 text-grey text-4xl"><CiSquarePlus /></div>
              <div className="relative z-10 w-[142px] text-[#a1a1a1] text-xl font-medium font-['Helvetica Neue'] mt-2">Create new <br />Library</div>
              <div className="relative z-10 text-[#a1a1a1] text-base font-medium font-['Helvetica Neue'] py-6">
                12/12/2025
              </div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default Home;

