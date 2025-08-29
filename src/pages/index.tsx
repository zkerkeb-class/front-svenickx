import {
  CreditCard,
  MessageCircleMore,
  Send,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../components/loader";
import LogOutButton from "../components/logoutButton";
import { IUser } from "../models/user";
import { fetchApi } from "../services/fetch.service";

function Index() {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [billingPortalUrl, setBillingPortalUrl] = useState<string | null>(null);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);

  useEffect(() => {
    getMe();
  }, []);

  //#region GetMe
  const getMe = async () => {
    const response = await fetchApi<IUser>(
      `${import.meta.env.VITE_DB_SERVICE_URL}auth/me`,
      "get"
    );
    if (!response.success) {
      setIsAuthorized(false);
      document.cookie =
        "access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
      return;
    }
    if (response.data.redirectUrl) {
      setStripeUrl(response.data.redirectUrl);
      setIsLoadingPage(false);
      return;
    }

    setIsAuthorized(true);
    setBillingPortalUrl(response.data.data.billingPortalUrl);
    setIsLoadingPage(false);
  };
  //#endregion

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col">
      <header className="flex justify-between items-center px-8 py-6 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <MessageCircleMore size={36} className="text-blue-600" />
          <span className="text-2xl font-extrabold text-blue-700 tracking-tight">
            Chatty
          </span>
        </div>
        <div>
          <LogOutButton />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {isLoadingPage ? (
          <Loader />
        ) : (
          <>
            <section className="w-full max-w-3xl text-center mt-12 mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Bienvenue sur <span className="text-blue-600">Chatty</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-6">
                L'application de messagerie moderne pour discuter, partager et
                collaborer en toute simplicité.
                <br />
                Rejoignez une communauté dynamique et échangez en temps réel
                avec vos amis, collègues ou groupes !
              </p>
              {isAuthorized ? (
                <a href="/chat">
                  <button className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                    Accéder à la messagerie
                    <Send size={22} />
                  </button>
                </a>
              ) : (
                stripeUrl && (
                  <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-lg items-center mx-auto max-w-sm">
                    <p className="text-gray-800 text-base">
                      Pour profiter de toutes les fonctionnalités, activez votre
                      abonnement :
                      <br />
                      <span className="font-bold text-blue-700 text-lg">
                        9,99€ / mois
                      </span>
                    </p>
                    <a href={stripeUrl}>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors">
                        Procéder au paiement
                      </button>
                    </a>
                  </div>
                )
              )}
              {isAuthorized && billingPortalUrl && (
                <div className="mt-4">
                  <a
                    href={billingPortalUrl}
                    className="inline-flex items-center gap-2 text-blue-700 underline hover:text-blue-900 text-sm"
                  >
                    <CreditCard size={16} />
                    Gérer mon abonnement
                  </a>
                </div>
              )}
            </section>
            <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 mb-16">
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
                <Users2 size={36} className="text-blue-500 mb-3" />
                <h3 className="font-bold text-lg mb-2">
                  Discussions de groupe
                </h3>
                <p className="text-gray-600 text-center">
                  Echangez des messages avec vos amis ou collègues.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
                <ShieldCheck size={36} className="text-blue-500 mb-3" />
                <h3 className="font-bold text-lg mb-2">
                  Sécurité & Confidentialité
                </h3>
                <p className="text-gray-600 text-center">
                  Vos conversations ne sont pas protégées et complètement public
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
                <MessageCircleMore size={36} className="text-blue-500 mb-3" />
                <h3 className="font-bold text-lg mb-2">
                  Messagerie instantanée
                </h3>
                <p className="text-gray-600 text-center">
                  Envoyez et recevez des messages en temps réel, sans aucune
                  limite, où que vous soyez.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="w-full text-center py-4 text-gray-500 text-sm bg-white border-t">
        © {new Date().getFullYear()} Chatty — Application de messagerie moderne
        et sécurisée.
      </footer>
    </div>
  );
}

export default Index;
