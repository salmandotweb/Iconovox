import Image from "next/image"
import { FC } from "react"
import { LoadingSpinner } from "./loading"
import type { Image as PrismaImage } from "@prisma/client"
import { api } from "~/utils/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"

type ImageDisplayProps = {
  image: PrismaImage
}

function truncate(str: string, n: number) {
  return str.length > n ? str.substr(0, n - 1) + "..." : str
}

const ImageDisplay = ({ image }: ImageDisplayProps) => {
  return (
    <Card
      style={{
        overflow: "hidden",
      }}
    >
      <CardHeader
        style={{
          padding: 0,
          width: "100%",
          height: "250px",
        }}
      >
        <Image
          src={image.url}
          fill
          alt={image.prompt}
          style={{
            objectFit: "cover",
          }}
        />
      </CardHeader>
      <CardContent
        style={{
          margin: "1rem 0",
          padding: "0 1rem",
        }}
      >
        <HoverCard>
          <HoverCardTrigger>
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {truncate(image.prompt, 70)}
            </h2>
          </HoverCardTrigger>
          <HoverCardContent>{image.prompt}</HoverCardContent>
        </HoverCard>
      </CardContent>
    </Card>
  )
}

const LatestImages: FC = () => {
  const { data, isLoading: postsLoading } = api.images.getAll.useQuery()

  if (postsLoading)
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    )

  if (!data) return <div>Something went wrong</div>

  return (
    <div className="xs:w-11/12 ss:w-5/6 xs:grid-cols-2 s:gap-6 ss:gap-8 mx-auto grid w-5/6 max-w-screen-xl grid-cols-1 justify-center gap-5 md:grid-cols-3 xl:grid-cols-3">
      {data?.map((image) => (
        <ImageDisplay image={image} key={image.id} />
      ))}
    </div>
  )
}

export default LatestImages
