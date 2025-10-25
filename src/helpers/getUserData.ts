import { store } from "../../nexusConfig";

async function getUserData(id: string) {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/get-user-data`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }
  );

  if (!res.ok) {
    console.error("Error during purchase:", res.statusText);
    return;
  }

  const userData = await res.json();

  store.setNexus({ userData: userData });
}

export default getUserData;
