import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex w-full justify-end space-x-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 p-4 shadow-lg">
      <Link href="/">
        <Button
          variant="outline"
          className="bg-yellow-500 bg-opacity-20 text-yellow-900 hover:bg-yellow-400 hover:bg-opacity-30"
        >
          Tokens List
        </Button>
      </Link>
      <Link href="/deploy">
        <Button
          variant="outline"
          className="bg-yellow-500 bg-opacity-20 text-yellow-900 hover:bg-yellow-400 hover:bg-opacity-30"
        >
          Deploy new token
        </Button>
      </Link>
      {/* @ts-ignore */}
      <radix-connect-button />
    </header>
  );
}
