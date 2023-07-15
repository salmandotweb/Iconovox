import { type NextPage } from "next"
import Image from "next/image"
import Head from "next/head"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useRef, useState } from "react"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { api } from "~/utils/api"
import { LoadingSpinner } from "~/components/loading"
import { toast } from "react-hot-toast"
import Navbar from "~/components/navbar"
import type { Image as PrismaImage } from "@prisma/client"
import coin from "../../public/coin.png"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card"

dayjs.extend(relativeTime)

const CreateImageWizard = () => {
  const [input, setInput] = useState<string>("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [createdImage, setCreatedImage] = useState<
    PrismaImage | null | undefined
  >(undefined)
  const cancelButtonRef = useRef(null)

  const { user } = useUser()
  if (!user) {
    return null
  }
  const ctx = api.useContext()
  const { mutate: createMutate, isLoading: isGenerating } =
    api.images.create.useMutation({
      onSuccess: (createdData) => {
        if (createdData === undefined) {
          toast.error("Something went wrong. Adjust your prompt and try again.")
        } else {
          toast.success("Image successfully generated!")
          decrementCredits()
        }
        setInput("")
        setCreatedImage(createdData)
        void ctx.images.invalidate()
      },
      onError: (e) => {
        // TRPC Error
        console.log(e)
        if (e.message) {
          toast.error(e.message)
        } else {
          // Zod Error
          console.log(e.data?.zodError)
          const errorMessage = e.data?.zodError?.fieldErrors.prompt
          if (errorMessage && errorMessage[0]) {
            toast.error(errorMessage[0])
          } else {
            toast.error(e.message)
          }
        }
      },
    })
  const { mutate: deleteMutate } = api.images.delete.useMutation({
    onSuccess: () => {
      void ctx.images.invalidate()
      toast.success("Image successfully deleted!")
    },
    onError: (e) => {
      // TRPC Error
      console.log(e)
      if (e.message) {
        toast.error(e.message)
      } else {
        // Zod Error
        console.log(e.data?.zodError)
        const errorMessage = e.data?.zodError?.fieldErrors.prompt
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0])
        } else {
          toast.error(e.message)
        }
      }
    },
  })
  const { mutate: decrementCredits } =
    api.stripeUser.decrementCredits.useMutation({
      onSuccess: () => {
        void ctx.stripeUser.invalidate()
      },
      onError: (e) => {
        // TRPC Error
        console.log(e)
        if (e.message) {
          toast.error(e.message)
        } else {
          // Zod Error
          console.log(e.data?.zodError)
          const errorMessage = e.data?.zodError?.fieldErrors.prompt
          if (errorMessage && errorMessage[0]) {
            toast.error(errorMessage[0])
          } else {
            toast.error(e.message)
          }
        }
      },
    })

  const {
    data: suggestedPrompt,
    isLoading,
    refetch,
  } = api.suggestedPrompts.getRandom.useQuery()
  const { mutate: mutateHide } = api.images.hide.useMutation({
    onSuccess: (mutatedData) => {
      setCreatedImage(mutatedData)
      void ctx.images.invalidate()
      toast.success("Image successfully hidden from the front page.")
    },
    onError: (e) => {
      // TRPC Error
      console.log(e)
      if (e.message) {
        toast.error(e.message)
      } else {
        // Zod Error
        console.log(e.data?.zodError)
        const errorMessage = e.data?.zodError?.fieldErrors.prompt
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0])
        } else {
          toast.error(e.message)
        }
      }
    },
  })
  const { mutate: mutateShow } = api.images.show.useMutation({
    onSuccess: (mutatedData) => {
      setCreatedImage(mutatedData)
      void ctx.images.invalidate()
      toast.success("Image successfully shown on the front page.")
    },
    onError: (e) => {
      // TRPC Error
      console.log(e)
      if (e.message) {
        toast.error(e.message)
      } else {
        // Zod Error
        console.log(e.data?.zodError)
        const errorMessage = e.data?.zodError?.fieldErrors.prompt
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0])
        } else {
          toast.error(e.message)
        }
      }
    },
  })

  return (
    <div className="mx-auto flex w-11/12 max-w-screen-xl flex-col content-center justify-center gap-2 md:w-5/6">
      <div className="mx-auto flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Software engineer in gamers room"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          type="submit"
          onClick={() => createMutate({ prompt: input })}
          disabled={isGenerating || !input}
        >
          Generate
        </Button>
      </div>

      <div className="h-full">
        {createdImage && (
          <>
            <Card
              style={{
                overflow: "hidden",
                maxWidth: "400px",
                margin: "10px auto 0 auto",
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
                  src={createdImage.url}
                  fill
                  alt={createdImage.prompt}
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
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{createdImage.prompt.toUpperCase()}</CardTitle>
                  <span className="text-xs">{`Generated ${dayjs(
                    createdImage.createdAt
                  ).fromNow()}`}</span>
                </div>

                <div className="mt-5 flex h-fit content-end items-end justify-start gap-1 align-bottom">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImageModalOpen(true)}
                  >
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Link href={createdImage.url}>Download</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </Button>
                  {createdImage.hidden && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => mutateShow({ id: createdImage.id })}
                    >
                      <span className="flex lg:hidden">Show</span>
                      <span className="hidden lg:flex">Show on front page</span>
                    </Button>
                  )}
                  {!createdImage.hidden && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => mutateHide({ id: createdImage.id })}
                    >
                      <span className="flex lg:hidden">Hide</span>
                      <span className="hidden lg:flex">Hide on front page</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <Transition appear show={deleteModalOpen} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-10"
                initialFocus={cancelButtonRef}
                onClose={() => setDeleteModalOpen(false)}
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                          <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                              <ExclamationTriangleIcon
                                className="h-6 w-6 text-red-600"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                              <Dialog.Title
                                as="h3"
                                className="text-base font-semibold leading-6 text-gray-900"
                              >
                                Delete image
                              </Dialog.Title>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  Are you sure you want to delete this image?
                                  Image data will be permanently removed. This
                                  action cannot be undone.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                            onClick={() => {
                              deleteMutate({ id: createdImage.id })
                              setCreatedImage(null)
                              setDeleteModalOpen(false)
                            }}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setDeleteModalOpen(false)}
                            ref={cancelButtonRef}
                          >
                            Cancel
                          </button>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
            <Transition appear show={imageModalOpen} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-10"
                onClose={() => setImageModalOpen(false)}
              >
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black bg-opacity-80" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 scale-95"
                      enterTo="opacity-100 scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 scale-100"
                      leaveTo="opacity-0 scale-95"
                    >
                      <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                        <div className="bg-slate-200 p-4">
                          <Image
                            width={1024}
                            height={1024}
                            className="h-full w-full"
                            src={createdImage.url}
                            alt="Generated image"
                            quality={100}
                          />
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </>
        )}
      </div>
    </div>
  )
}

const Generate: NextPage = () => {
  const { isLoaded: userLoaded } = useUser()
  api.suggestedPrompts.getRandom.useQuery() // Start fetching asap

  if (!userLoaded) return <div />

  return (
    <>
      <Head>
        <title>Imagen</title>
      </Head>
      <main className="justify-center">
        <Navbar />
        <div className="pt-20">
          <CreateImageWizard />
        </div>
      </main>
    </>
  )
}

export default Generate
