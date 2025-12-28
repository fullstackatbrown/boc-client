import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import HoverButton from '@/components/HoverButton';
import { HoverButtonProps } from '@/components/HoverButton';

interface DropdownProps {
  header: string;
  content: ReactNode;
  sideActions?: HoverButtonProps[];
}

const Dropdown: React.FC<DropdownProps> = ({ header, content, sideActions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`w-full`}>
      <div className="w-full flex justify-start">
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
        { sideActions
          ? sideActions.map((sideAc) => {
            return <HoverButton key={sideAc.header} header={sideAc.header} icon={sideAc.icon} repIcon={sideAc.repIcon} onClick={sideAc.onClick}/>
            // (
            //   <button
            //     key={sideAc.header}
            //     className="flex justify-start items-center px-4 py-3 text-lef hover:bg-boc_lightbrown transition rounded-2xl"
            //     onClick={() => {
            //       if (sideAc.repIcon) { sideAc.repIcon.setCurrIcon(sideAc.repIcon.replacementIcon) }
            //       sideAc.onClick()
            //     }}
            //   >
            //     <span className="text-boc_darkgreen font-medium mr-2">{sideAc.header}</span>
            //     {sideAc.repIcon ? sideAc.repIcon.currIcon : sideAc.icon}
            //   </button>
            // )
          })
          : <></>}
      </div>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
          isOpen ? 'opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4">{content}</div>
      </div>
    </div>
  );
};

export default Dropdown;