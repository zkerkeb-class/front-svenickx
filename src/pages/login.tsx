import { Linkedin } from "lucide-react";
import { useState } from "react";
import Loader from "../components/loader";
import { fetchApi } from "../services/fetch.service";

function Login() {
  const isAuthorized = document.cookie.includes("access-token");
  if (isAuthorized) {
    window.location.href = "/";
    return null;
  }

  const [state, setState] = useState<"login" | "register" | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return;
    }

    setIsLoading(true);
    const response = await fetchApi(
      `${import.meta.env.VITE_AUTH_SERVICE_URL}register`,
      "post",
      {
        email,
        password,
      }
    );
    setIsLoading(false);
    if (response.success) {
      window.location.href = "/";
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    // Handle form submission logic here
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstname = formData.get("firstname") as string;
    const lastname = formData.get("lastname") as string;

    if (!email || !password || !firstname || !lastname) {
      return;
    }

    setIsLoading(true);

    const response = await fetchApi(
      `${import.meta.env.VITE_AUTH_SERVICE_URL}register`,
      "post",
      {
        email,
        password,
        firstname,
        lastname,
      }
    );
    setIsLoading(false);
    if (response.success) {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-3xl font-bold mb-10">Chatty</h1>
      <div className="flex flex-col gap-4 *:flex *:items-center *:gap-2">
        <a
          href="http://localhost:2001/google"
          className="shadow-md rounded-xl p-4 bg-white hover:bg-gray-50"
        >
          <div className="w-5">
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Google</title>
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
          </div>
          <span>Se connecter avec Google</span>
        </a>
        <a
          href="http://localhost:2001/facebook"
          className="flex items-center gap-2 shadow-md rounded-xl p-4 bg-white hover:bg-gray-50"
        >
          <div className="w-5">
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Facebook</title>
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            </svg>
          </div>
          <span>Se connecter avec Facebook</span>
        </a>
        <a
          href="http://localhost:2001/linkedin"
          className="flex items-center gap-2 shadow-md rounded-xl p-4 bg-white hover:bg-gray-50"
        >
          <div className="w-5">
            <Linkedin />
          </div>
          Se connecter avec LinkedIn
        </a>
        {state === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-2 mt-5">
            <p>Connexion par email</p>
            <input
              placeholder="email"
              name="email"
              className="shadow-md px-3 py-2 rounded border w-50"
            />
            <input
              placeholder="password"
              name="password"
              type="password"
              className="shadow-md px-3 py-2 rounded border w-50"
            />
            <button
              type="submit"
              className="flex justify-center bg-green-300 rounded w-50 px-3 py-2 cursor-pointer hover:opacity-80"
              disabled={isLoading}
            >
              {isLoading ? <Loader /> : "Confirmer"}
            </button>
            <p>
              Pas de compte ?{" "}
              <button
                type="button"
                className="cursor-pointer hover:underline"
                onClick={() => setState("register")}
              >
                S'inscrire
              </button>
            </p>
          </form>
        ) : state === "register" ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-2 mt-5">
            <p>S'incrire</p>
            <input
              placeholder="email"
              name="email"
              className="shadow-md px-3 py-2 rounded border w-50"
            />
            <input
              placeholder="password"
              name="password"
              type="password"
              className="shadow-md px-3 py-2 rounded border w-50"
            />
            <input
              placeholder="firstname"
              name="firstname"
              className="shadow-md px-3 py-2 rounded border w-50"
            />
            <input
              placeholder="lastname"
              name="lastname"
              className="shadow-md px-3 py-2 rounded border w-50"
            />
            <button
              type="submit"
              className="flex justify-center bg-green-300 rounded w-50 px-3 py-2 cursor-pointer hover:opacity-80"
              disabled={isLoading}
            >
              {isLoading ? <Loader /> : "Confirmer"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setState("login")}
            className="justify-center cursor-pointer hover:underline"
          >
            Se connecter par email
          </button>
        )}
      </div>
    </div>
  );
}

export default Login;
