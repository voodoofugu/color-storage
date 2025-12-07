import nexus from "../../nexusConfig";
import api from "../helpers/api";

async function getUserData(id: string) {
  const res = await api.getUserData(id);

  if (!res.ok) {
    console.error("Error during purchase:", res.statusText);
    return;
  }

  const userData = await res.json();

  nexus.set({ userData: userData });
}

export default getUserData;
