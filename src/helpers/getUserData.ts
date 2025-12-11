import nexus from "../../nexusConfig";
import api from "../helpers/api";

async function getUserData(id: string) {
  const res = await api.getUserData<{
    userData: Record<string, string>;
    status: string;
  }>(id);

  if (!res.resData) return;
  else if (res.resData.status === "notFound") return;
  else if (res.resData.status === "success")
    nexus.set({ userData: res.resData.userData });
}

export default getUserData;
