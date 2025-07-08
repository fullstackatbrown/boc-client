import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

interface DropdownProps {
  header: string;
  content: React.ReactNode;
}

const BigDropdown: React.FC<DropdownProps> = ({ header, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        className="flex justify-start items-center px-1 py-3 text-lef hover:bg-boc_lightbrown transition rounded-lg w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-funky text-3xl text-boc_medbrown mr-2">{header}</span>
        <ChevronDownIcon
          className={`w-8 h-8 text-boc_medbrown transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-1 pb-4">{content}</div>
      </div>
    </div>
  );
};

export default BigDropdown;