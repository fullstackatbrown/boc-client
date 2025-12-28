import { Dispatch, ReactNode, SetStateAction } from "react";

interface ReplaceableIcon {
    replacementIcon: ReactNode;
    currIcon: ReactNode;
    setCurrIcon: Dispatch<SetStateAction<ReactNode>>;
  }

export interface HoverButtonProps {
    header: string;
    icon: ReactNode;
    repIcon?: ReplaceableIcon;
    negative?: boolean;
    onClick: () => void;
  }

export default function HoverButton(props: HoverButtonProps) {
    return (
        <button
          className="flex justify-start items-center px-4 py-3 text-lef hover:bg-boc_lightbrown transition rounded-2xl"
          onClick={() => {
            if (props.repIcon) { props.repIcon.setCurrIcon(props.repIcon.replacementIcon) }
            props.onClick()
          }}
        >
          <span className={`${props.negative ? "text-red-500" : "text-boc_darkgreen"} font-medium mr-2`}>{props.header}</span>
          {props.repIcon ? props.repIcon.currIcon : props.icon}
        </button>
      )
}