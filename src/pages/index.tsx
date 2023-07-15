import { type NextPage } from "next"
import Head from "next/head"
import Navbar from "../components/navbar"
import { api } from "~/utils/api"
import Hero from "~/sections/home/Hero"

const Home: NextPage = () => {
  api.images.getAll.useQuery() // Start fetching asap

  return (
    <>
      <Head>
        <title>imagen</title>
      </Head>
      <main>
        <Navbar />
        <Hero />
      </main>
    </>
  )
}

export default Home
