'use client'

import { useEffect, useState, RefObject } from 'react';

export default function CreationButton({ footerRef }:{ footerRef: RefObject<HTMLDivElement> }) {
  const [isAboveFooter, setIsAboveFooter] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setIsAboveFooter(entry.isIntersecting); },
      { root: null, threshold: 0 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => { //Clean up function - only runs once user changes pages, refreshes, etc.
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <div className={`transition-all duration-200 ${
        isAboveFooter
          ? 'absolute bottom-4 right-4' // Adjust based on footer height
          : 'fixed bottom-4 right-4'
      }`}
    >
      <button
        className="group flex items-center gap-2 bg-boc_darkbrown text-background text-lg font-semibold px-4 h-12 rounded-full transition-all duration-1000 overflow-hidden w-12 hover:w-36"
        onClick={() => {
          window.location.href = "/trips/creation-form";
        }}
      >
        <span className="text-2xl">+</span>
        <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-none">
          Create Trip
        </span>
      </button>
    </div>
  );
}