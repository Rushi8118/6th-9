import { Helmet } from "react-helmet-async"
import { AuthLayout } from "@/components/premium-earth/AuthLayout"
import { LoginForm } from "@/components/premium-earth/LoginForm"

const BENEFITS = [
  "Personalised pathway planning",
  "Secure client access",
  "Clear application updates",
]

/** Standalone preview route for the premium split-screen login design. */
export default function PremiumLoginPage() {
  return (
    <>
      <Helmet>
        <title>Login Preview | Siddhivinayak Overseas</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <AuthLayout
        title="Your global future awaits."
        description="Manage your overseas journey with clear guidance, meaningful progress and support at every important step."
        benefits={BENEFITS}
      >
        <LoginForm />
      </AuthLayout>
    </>
  )
}
