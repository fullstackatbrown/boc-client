"use client";
function Title(props: { text: string }) {
  const { text } = props;

  return (
    <div className="pb-0">
      <h1 className="text-5xl text-boc_green font-funky">{text}</h1>
      <hr className="bg-boc_medbrown border-0 h-[2px] my-5" />
    </div>
  );
}
export default Title; // Make sure to export the component
