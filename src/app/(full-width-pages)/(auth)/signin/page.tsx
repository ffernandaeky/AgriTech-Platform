import { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Agri-Tech",
  description: "Masuk ke dashboard Agri-Tech",
};

export default function SignIn() {
  return <SignInForm />;
}
