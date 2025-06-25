import { CreditCard, MessageCircleMore } from "lucide-react";
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
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-3xl font-bold mb-10">Chatty</h1>
      {isLoadingPage ? (
        <Loader />
      ) : isAuthorized ? (
        <>
          <a href="/chat">
            <button className="flex items-center gap-2 text-2xl bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
              Chatter
              <MessageCircleMore size={25} />
            </button>
          </a>
          {billingPortalUrl && (
            <a
              href={billingPortalUrl}
              className="flex items-center gap-1 mt-5 text-sm underline hover:text-blue-800"
            >
              <CreditCard size={15} />
              Mon abonnement
            </a>
          )}
        </>
      ) : (
        <>
          {stripeUrl && (
            <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-md items-center">
              <p>
                Procéder au paiement de :{" "}
                <span>
                  <b>9,99€</b>
                </span>
              </p>
              <a href={stripeUrl}>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                  Payer
                </button>
              </a>
            </div>
          )}
        </>
      )}
      <div className="absolute right-4 top-4">
        <LogOutButton />
      </div>
    </div>
  );
}

export default Index;
