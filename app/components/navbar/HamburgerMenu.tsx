import { RxHamburgerMenu } from "react-icons/rx";
const HamburgerMenu = ({ className, onClick }: { className: string; onClick: () => void }) => {
  return (
    <button className={className} onClick={onClick}>
      <RxHamburgerMenu className="primary-text-color" size={25}/>
    </button>
  );
};

export default HamburgerMenu;
