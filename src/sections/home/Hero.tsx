import Link from "next/link"
import { BsMagic } from "react-icons/bs"
import LatestImages from "~/components/LatestImages"
import { Button } from "~/components/ui/button"

const Hero = () => {
  return (
    <section>
      <div className="mx-auto max-w-screen-xl gap-12 px-4 py-12 text-gray-600 md:px-8">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <h1 className="text-sm font-medium text-indigo-600">
            Empower Your Imagination with AI-Generated Images
          </h1>
          <h2 className="mx-auto text-4xl font-extrabold text-gray-800 md:text-5xl">
            Unleash the Power of AI:{" "}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#E114E5] bg-clip-text text-transparent">
              Generate Unique Images in Seconds
            </span>
          </h2>
          <div className="flex flex-col items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
            <Button
              size="lg"
              variant="outline"
              style={{
                gap: "0.5rem",
              }}
            >
              <BsMagic />
              <Link href="/generate">Generate Icons Now</Link>
            </Button>
          </div>
        </div>
        <div className="mt-14">
          <LatestImages />
        </div>
      </div>
    </section>
  )
}

export default Hero
