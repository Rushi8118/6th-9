import { Helmet } from "react-helmet-async"
import { AuthLayout } from "@/components/premium-earth/AuthLayout"
import { RegisterForm } from "@/components/premium-earth/RegisterForm"

const BENEFITS = [
  "Personalised pathway planning",
  "Secure client access",
  "Clear application updates",
]

/** Standalone preview route for the premium split-screen register design. */
export default function PremiumRegisterPage() {
  return (
    <>
      <Helmet>
        <title>Register Preview | Siddhivinayak Overseas</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <AuthLayout
        title="Your global future awaits."
        description="Create your account and take the first step toward your global future."
        benefits={BENEFITS}
      >
        <RegisterForm />
      </AuthLayout>
    </>
  )
}
