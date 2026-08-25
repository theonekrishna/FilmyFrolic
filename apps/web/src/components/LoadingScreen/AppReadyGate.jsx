import { useAuth } from "../../context/AuthContext";
import { useModules } from "../../context/ModulesContext";
import LoadingScreen from "./LoadingScreen";

export default function AppReadyGate({ children }) {
  const { loading: authLoading } = useAuth();
  const { modules } = useModules();

  const authDone = !authLoading;
  const modulesDone = modules !== null;
  const isReady = authDone && modulesDone;

  return (
    <>
      <LoadingScreen visible={!isReady} authDone={authDone} modulesDone={modulesDone} />
      {children}
    </>
  );
}
