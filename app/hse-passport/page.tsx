import { redirect } from "next/navigation";

/** /hse-passport opens the first section (PPE). */
export default function HsePassportIndex() {
  redirect("/hse-passport/ppe");
}
