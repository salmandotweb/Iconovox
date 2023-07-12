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
    <div className="mx-auto flex min-h-screen w-11/12 max-w-screen-xl flex-col content-center justify-center gap-2 md:w-5/6">
      <p className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">
        Generate an image
      </p>
      <div className="py-4 pb-4 font-medium text-black">
        <p className="pb-1 text-xl font-semibold">Instructions for best use:</p>
        <ul className="list-decimal pl-8">
          <li>Be as detailed as possible.</li>
          <li>
            Mention the style of image you want, such as cartoon, painting,
            photo, 3d render, Unreal Engine, 8k, etc.
          </li>
          <li>
            Be specific about the individual elements, background, and colors
            you want in your image.
          </li>
          <li>
            Try to avoid overly complicated/specific prompts and images with
            multiple human subjects, as they may lead to distortions.
          </li>
          <li>
            Note: Some long/complex prompts cause an error by taking over 10
            seconds to generate, leading to an API timeout. If this happens,
            please try again with a different prompt while we work on a fix.
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 text-sm">
          <p className="flex items-center justify-center font-medium">
            Want a sample prompt?
          </p>
          <button
            onClick={() => {
              // Set the input to the suggested prompt and refetch for the next button press
              if (suggestedPrompt && !isLoading) {
                setInput(suggestedPrompt.text)
                void refetch()
              }
            }}
            className="border-b-3 flex items-center justify-center rounded-lg border-violet-900
            bg-violet-600 px-2 py-1 font-semibold text-white duration-300 ease-in hover:scale-105 hover:border-violet-800 hover:bg-violet-600"
          >
            Surprise me
          </button>
        </div>
        <div className="flex w-full flex-col rounded-lg border-2 border-slate-300 bg-slate-50 font-semibold text-black shadow-lg shadow-slate-400 sm:flex-row">
          <textarea
            rows={5}
            placeholder="Enter a prompt!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
            className="flex w-full rounded-lg bg-slate-50 pl-2 pt-2 sm:hidden"
          ></textarea>
          <textarea
            rows={3}
            placeholder="Enter a prompt!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
            className="hidden w-full rounded-lg bg-slate-50 pl-2 pt-2 sm:flex"
          ></textarea>
          {!isGenerating ? (
            <div className="border-t-1 sm:border-l-1 flex flex-row items-center justify-center gap-1.5 border-slate-300 p-2 sm:w-32 sm:border-t-0">
              <button
                className="rounded-lg duration-300 ease-in hover:text-violet-600 disabled:bg-slate-50 disabled:text-slate-300"
                onClick={() => createMutate({ prompt: input })}
                disabled={isGenerating || input === ""}
              >
                Generate
              </button>
              <Image
                className=""
                src={coin}
                alt="credits"
                width={22}
                height={22}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center border-l-2 sm:w-32">
              <LoadingSpinner />
            </div>
          )}
        </div>
      </div>
      <div className="h-full">
        {createdImage && (
          <>
            <div className="mt-4 flex h-auto flex-col items-center justify-center gap-4 rounded-lg border-2 border-slate-300 bg-slate-50 p-4 shadow-xl shadow-slate-400 sm:flex-row">
              <Image
                width={1024}
                height={1024}
                className="xs:h-64 xs:w-64 s:h-72 s:w-72 ss:h-80 ss:w-80 h-52 w-52 shadow-lg shadow-slate-500 duration-200 ease-in hover:cursor-pointer hover:shadow-violet-700"
                src={createdImage.url}
                alt="Generated image"
                quality={100}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCA"
                onClick={() => setImageModalOpen(true)}
              />
              <div className="ml:px-8 flex w-full flex-col items-start md:px-2">
                <div className="flex gap-1 font-bold text-slate-300">
                  <span className="font-thin text-black">{`Generated ${dayjs(
                    createdImage.createdAt
                  ).fromNow()}`}</span>
                </div>
                <span className="flex max-h-64 flex-wrap overflow-auto pb-4 pr-2 font-serif text-xl">
                  {createdImage.prompt}
                </span>
                <div className="ml:gap-3 flex h-fit content-end items-end justify-start gap-1 align-bottom">
                  <Link
                    href={createdImage.url}
                    className="text-md flex h-9 items-center justify-center rounded-xl border-b-4 border-violet-900
                      bg-violet-600 px-4 font-medium text-white duration-300 ease-in hover:scale-105 hover:border-violet-800 hover:bg-violet-600"
                  >
                    Download
                  </Link>
                  <button
                    className="text-md flex h-9 items-center justify-center rounded-xl border-b-4 border-violet-900
                      bg-violet-600 px-4 font-medium text-white duration-300 ease-in hover:scale-105 hover:border-violet-800 hover:bg-violet-600"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    Delete
                  </button>
                  {createdImage.hidden && (
                    <button
                      className="text-md flex h-9 items-center justify-center rounded-xl border-b-4 border-violet-900
                  bg-violet-600 px-4 font-medium text-white duration-300 ease-in hover:scale-105 hover:border-violet-800 hover:bg-violet-600"
                      onClick={() => mutateShow({ id: createdImage.id })}
                    >
                      <span className="flex lg:hidden">Show</span>
                      <span className="hidden lg:flex">Show on front page</span>
                    </button>
                  )}
                  {!createdImage.hidden && (
                    <button
                      className="text-md flex h-9 items-center justify-center rounded-xl border-b-4 border-violet-900
                  bg-violet-600 px-4 font-medium text-white duration-300 ease-in hover:scale-105 hover:border-violet-800 hover:bg-violet-600"
                      onClick={() => mutateHide({ id: createdImage.id })}
                    >
                      <span className="flex lg:hidden">Hide</span>
                      <span className="hidden lg:flex">Hide on front page</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
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
        <div className="flex justify-center pt-8">
          <Link
            href="/history"
            className="flex items-center justify-center rounded-xl border-b-4 border-violet-900 bg-violet-600
            px-2 py-1 text-lg font-semibold text-white duration-300 ease-in hover:scale-105 hover:border-violet-800 hover:bg-violet-600"
          >
            Image History
          </Link>
        </div>
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
        <title>Imager</title>
      </Head>
      <main className="justify-center">
        <Navbar />
        <div className="flex border-x border-slate-400 p-4 pt-40 text-black sm:pt-28">
          <CreateImageWizard />
        </div>
      </main>
    </>
  )
}

export default Generate
