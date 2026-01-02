import {
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const DropdownHeader = () => {
  return (
    <DropdownMenuContent
      side='bottom'
      align='start'
      sideOffset={8}
      className='w-50'
    >
      <DropdownMenuItem>
        <Link
          className='font-medium text-gray-600 hover:text-indigo-600'
          href='/'
        >
          Home
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link
          className='font-medium text-gray-600 hover:text-indigo-600'
          href='/posts'
        >
          Posts
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Link
          className='font-medium text-gray-600 hover:text-indigo-600'
          href='/orders'
        >
          Orders
        </Link>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
};

export default DropdownHeader;
