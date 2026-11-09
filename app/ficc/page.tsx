import { redirect } from "next/navigation";

// FICC records now live at the bottom of the Incidents page.
export default function FiccPage() {
  redirect("/incidents#ficc");
}
