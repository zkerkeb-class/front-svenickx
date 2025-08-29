import { Linkedin } from "lucide-react";
import { useState } from "react";
import Loader from "../components/loader";
import { fetchApi } from "../services/fetch.service";

const AuthButton = ({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: any;
  label: string;
  color?: string;
}) => (
  <a
    href={href}
    className={`flex items-center gap-3 px-4 py-2 rounded-xl shadow-md border border-gray-100 transition w-full font-medium text-sm
      ${color ? color : "bg-white hover:bg-gray-50 text-gray-700"}
      hover:scale-[1.03] active:scale-100 duration-150
    `}
    style={{ boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)" }}
  >
    <div className="w-5 h-5">{icon}</div>
    <span>{label}</span>
  </a>
);

export default function Login() {
  const isAuthorized = document.cookie.includes("access-token");
  if (isAuthorized) {
    window.location.href = "/";
    return null;
  }

  const [state, setState] = useState<"login" | "register" | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) return;

    setIsLoading(true);
    const res = await fetchApi(
      `${import.meta.env.VITE_AUTH_SERVICE_URL}login`,
      "post",
      {
        email,
        password,
      }
    );
    setIsLoading(false);
    if (res.success) window.location.href = "/";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const firstname = form.get("firstname") as string;
    const lastname = form.get("lastname") as string;

    if (!email || !password || !firstname || !lastname) return;

    setIsLoading(true);
    const res = await fetchApi(
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
    if (res.success) window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 px-4">
      {/* Right: Auth Card */}
      <div className="flex-1 flex flex-col justify-center items-center py-12">
        <div className="w-full max-w-sm bg-white/95 p-10 rounded-3xl shadow-2xl border border-blue-100 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="inline-block md:hidden text-3xl mb-1">💬</span>
            <h1 className="text-2xl font-bold text-blue-700 text-center">
              Bienvenue sur Chatty
            </h1>
            <p className="text-gray-500 text-center text-sm">
              Connectez-vous pour retrouver vos conversations et échanger
              instantanément.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <AuthButton
              href="http://localhost:2001/google"
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <title>Google</title>
                  <g>
                    <circle cx="12" cy="12" r="12" fill="#fff" />
                    <path
                      d="M21.805 12.227c0-.638-.057-1.252-.163-1.84H12v3.481h5.548a4.74 4.74 0 0 1-2.057 3.112v2.584h3.323c1.947-1.794 3.07-4.44 3.07-7.337z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 22c2.7 0 4.963-.89 6.617-2.418l-3.323-2.584c-.92.617-2.09.983-3.294.983-2.53 0-4.677-1.708-5.44-4.004H3.13v2.522A9.997 9.997 0 0 0 12 22z"
                      fill="#34A853"
                    />
                    <path
                      d="M6.56 13.977A5.996 5.996 0 0 1 6.1 12c0-.687.118-1.353.326-1.977V7.501H3.13A9.997 9.997 0 0 0 2 12c0 1.647.396 3.205 1.13 4.499l3.43-2.522z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 6.875c1.47 0 2.782.506 3.818 1.5l2.863-2.863C16.963 3.89 14.7 3 12 3A9.997 9.997 0 0 0 3.13 7.501l3.43 2.522C7.323 8.583 9.47 6.875 12 6.875z"
                      fill="#EA4335"
                    />
                  </g>
                </svg>
              }
              label="Se connecter avec Google"
              color="bg-white hover:bg-blue-50 text-gray-700 border border-gray-200"
            />
            <AuthButton
              href="http://localhost:2001/facebook"
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#fff">
                  <title>Facebook</title>
                  <circle cx="12" cy="12" r="12" fill="#1877F3" />
                  <path
                    d="M15.117 8.667h-1.35c-.168 0-.317.149-.317.317v1.066h1.667l-.217 1.667h-1.45v4.333h-1.75v-4.333h-1.083v-1.667h1.083v-.883c0-1.05.633-1.617 1.567-1.617h1.283v1.417z"
                    fill="#fff"
                  />
                </svg>
              }
              label="Se connecter avec Facebook"
              color="bg-[#1877F3] hover:bg-[#166fe0] text-white"
            />
            <AuthButton
              href="http://localhost:2001/linkedin"
              icon={<Linkedin size={18} />}
              label="Se connecter avec LinkedIn"
              color="bg-[#0A66C2] hover:bg-[#004182] text-white"
            />
          </div>
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          {state === "login" || state === "register" ? (
            <form
              onSubmit={state === "login" ? handleLogin : handleRegister}
              className="flex flex-col gap-3"
            >
              {state === "register" && (
                <>
                  <input
                    name="firstname"
                    placeholder="Prénom"
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition bg-gray-50"
                    autoComplete="given-name"
                  />
                  <input
                    name="lastname"
                    placeholder="Nom"
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition bg-gray-50"
                    autoComplete="family-name"
                  />
                </>
              )}
              <input
                name="email"
                placeholder="Email"
                type="email"
                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition bg-gray-50"
                autoComplete="email"
              />
              <input
                name="password"
                placeholder="Mot de passe"
                type="password"
                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition bg-gray-50"
                autoComplete={
                  state === "register" ? "new-password" : "current-password"
                }
              />
              <button
                type="submit"
                className="flex justify-center bg-gradient-to-r from-blue-500 to-green-400 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition"
                disabled={isLoading}
              >
                {isLoading ? <Loader /> : "Confirmer"}
              </button>
              <p className="text-sm text-center">
                {state === "login" ? (
                  <>
                    Pas encore de compte ?{" "}
                    <button
                      type="button"
                      onClick={() => setState("register")}
                      className="flex justify-center text-blue-600 hover:underline"
                    >
                      S'inscrire
                    </button>
                  </>
                ) : (
                  <>
                    Déjà inscrit ?{" "}
                    <button
                      type="button"
                      onClick={() => setState("login")}
                      className="text-blue-600 hover:underline"
                    >
                      Se connecter
                    </button>
                  </>
                )}
              </p>
            </form>
          ) : (
            <button
              onClick={() => setState("login")}
              className="text-sm text-center text-blue-600 hover:underline w-full"
            >
              Se connecter par email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
