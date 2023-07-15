import { FC } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import Image, { StaticImageData } from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"

interface IconCardProps {
  image: StaticImageData | string
  title: string
  subTitle?: string
  buttons?: {
    text: string
    href?: string
    hide?: boolean
    onClick?: () => void
  }[]
  trucateWords?: number
}

function truncate(str: string, n: number) {
  return str.length > n ? str.substr(0, n - 1) + "..." : str
}

const IconCard: FC<IconCardProps> = (props: IconCardProps) => {
  return (
    <Card
      style={{
        overflow: "hidden",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardHeader
        style={{
          padding: 0,
          width: "100%",
          height: "280px",
        }}
      >
        <Image
          src={props.image}
          fill
          alt={props.title}
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
        <div className="flex flex-col gap-2">
          <HoverCard>
            <HoverCardTrigger>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {truncate(props.title, props.trucateWords || 70)}
              </h2>
            </HoverCardTrigger>
            <HoverCardContent>{props.title}</HoverCardContent>
          </HoverCard>
          <span className="text-xs">{props.subTitle}</span>
        </div>

        <div className="mt-5 flex h-fit content-end items-end justify-start gap-1 align-bottom">
          {props.buttons?.map((button, index) => {
            return (
              !button.hide && (
                <Button
                  key={index}
                  onClick={
                    button.href
                      ? () => {
                          null
                        }
                      : button.onClick
                  }
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                >
                  {button.href ? (
                    <Link href={button.href}>{button.text}</Link>
                  ) : (
                    button.text
                  )}
                </Button>
              )
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default IconCard
