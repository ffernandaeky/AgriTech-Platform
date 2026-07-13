import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Agri-Tech",
  description: "Registrasi belum diaktifkan. Login tersedia di landing page Agri-Tech",
};

export default function SignUp() {
  redirect("/");
}
