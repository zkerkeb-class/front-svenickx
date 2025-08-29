import { LogOut } from "lucide-react";

function LogOutButton() {
  return (
    <button
      onClick={() => {
        document.cookie =
          "access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
      }}
      className="bg-gray-300 p-2 rounded flex items-center gap-2 hover:bg-gray-400 transition-colors cursor-pointer"
    >
      <span>Déconnexion</span>
      <LogOut size={15} />
    </button>
  );
}

export default LogOutButton;
