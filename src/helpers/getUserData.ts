import nexus from "../../nexusConfig";
import api from "../helpers/api";

async function getUserData(id: string) {
  const res = await api.getUserData(id);

  if (!res.data.ok) {
    console.error("Error during purchase:", res.data.statusText);
    return;
  }

  nexus.set({ userData: res.data });
}

export default getUserData;
