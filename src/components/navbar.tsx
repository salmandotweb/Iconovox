import React from "react"
import { UserButton, useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import Link from "next/link"
import { api } from "~/utils/api"
import { useRouter } from "next/router"
import { LoadingSpinner } from "./loading"

const navigation = [
  { title: "Generate", path: "/generate" },
  {
    title: "My Collection",
    path: "/history",
  },
]

const Navbar: React.FC = () => {
  const { isSignedIn } = useUser()

  const router = useRouter()

  const { mutateAsync: createCheckout } =
    api.checkout.createCheckout.useMutation()

  const { data: credits, isLoading: creditsLoading } =
    api.stripeUser.getCredits.useQuery()

  const buyCredits = async () => {
    await createCheckout()
      .then((res) => {
        window.location.href = res as string
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <>
      <nav
        className={`bg-white pb-5 md:text-sm ${
          isSignedIn
            ? "mx-2 mt-2 rounded-xl border shadow-lg md:mx-2 md:mt-0 md:border-none md:shadow-none"
            : ""
        }`}
      >
        <div className="mx-auto max-w-screen-xl items-center gap-x-14 px-4 md:flex md:px-8">
          <div className="flex items-center justify-between py-5 md:block">
            <Link href="/">
              <img
                src="https://www.floatui.com/logo.svg"
                width={120}
                height={50}
                alt="Float UI logo"
              />
            </Link>
            <div className="md:hidden">
              <button className="menu-btn text-gray-500 hover:text-gray-800">
                {isSignedIn ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div
            className={`mt-8 flex-1 items-center md:mt-0 md:flex ${
              isSignedIn ? "block" : "hidden"
            } `}
          >
            <ul className="items-center justify-center space-y-6 md:flex md:space-x-6 md:space-y-0">
              {navigation.map((item, idx) => {
                return (
                  <li key={idx} className="text-gray-700 hover:text-gray-900">
                    <a href={item.path} className="block">
                      {item.title}
                    </a>
                  </li>
                )
              })}
            </ul>
            <div className="mt-6 flex-1 items-center justify-end gap-x-6 space-y-6 md:mt-0 md:flex md:space-y-0">
              {isSignedIn && (
                <>
                  <div className="flex items-center gap-x-2">
                    <span className="text-gray-700">Credits:</span>
                    <span className="text-gray-900">
                      {creditsLoading ? <LoadingSpinner /> : credits}
                    </span>
                  </div>

                  <Button size="sm" variant="outline" onClick={buyCredits}>
                    Buy Credits
                  </Button>
                </>
              )}
              {isSignedIn ? (
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-12 w-12",
                    },
                  }}
                />
              ) : (
                <Link href="/sign-in">
                  <Button size="sm" variant="default">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
