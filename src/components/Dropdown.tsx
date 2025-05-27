import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

interface DropdownProps {
  header: string;
  content: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ header, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`w-full`}>
      <button
        className="flex justify-start items-center px-4 py-3 text-lef hover:bg-boc_lightbrown transition rounded-2xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-boc_darkgreen font-medium mr-2">{header}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-boc_darkgreen transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4">{content}</div>
      </div>
    </div>
  );
};

export default Dropdown;