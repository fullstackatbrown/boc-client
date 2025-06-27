function BOCButton(props: { text: string; onClick: () => void; negative?: boolean; grow?: boolean }) {
  const { text, onClick, negative, grow } = props;
  const [bgColor, hoverColor] = (negative ? ["bg-red-600", "hover:bg-red-700"] : ["bg-boc_darkgreen", "hover:bg-green-700"])
  return (
    <button
      onClick={onClick}
      className={`align-middle px-6 h-12 text-white font-bold 
      rounded-lg transition ease-in-out duration-300 ${grow ? 'flex-grow' : ''} ` + bgColor + ' ' + hoverColor}
    >
      {text}
    </button>
  );
}
export default BOCButton; // Make sure to export the component
