import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Loader from "../components/loader";
import { fetchApi } from "../services/fetch.service";

function Activate() {
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActivated, setIsActivated] = useState<boolean>(false);

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    setIsLoading(true);
    const response = await fetchApi(
      `${import.meta.env.VITE_DB_SERVICE_URL}auth/activate`,
      "put",
      {
        token,
      }
    );
    setIsLoading(false);
    if (response.success) {
      setIsActivated(true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {isLoading ? <Loader /> : isActivated ? "Activé" : "Erreur"}
    </div>
  );
}

export default Activate;
