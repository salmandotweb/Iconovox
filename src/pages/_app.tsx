import { type AppType } from "next/app"
import { api } from "~/utils/api"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "react-hot-toast"
import Head from "next/head"
import "../styles/global.css"

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <Head>
        <title>Imager</title>
        <meta
          name="description"
          content="Bring your imagination to life with our AI-generated images"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster />
      <Component {...pageProps} />
    </ClerkProvider>
  )
}

export default api.withTRPC(MyApp)
