import { z } from "zod"
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc"
import { TRPCError } from "@trpc/server"
import axios, { type AxiosError } from "axios"
import { s3 } from "../../../aws-config.mjs"

type DalleResponse = {
  data: {
    data: [
      {
        url: string
      }
    ]
  }
}

type imagenesponse = {
  data: Buffer
}

export const imagesRouter = createTRPCRouter({
  // Get user's most recently generated image
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId
    const image = await ctx.prisma.image.findFirst({
      where: {
        authorId: {
          equals: userId,
        },
      },
      orderBy: [{ createdAt: "desc" }],
    })
    return image
  }),
  // Get 100 most recently generated images in reverse chronological order
  getAll: publicProcedure.query(async ({ ctx }) => {
    const images = await ctx.prisma.image.findMany({
      where: {
        hidden: {
          equals: false,
        },
      },
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    })
    return images
  }),

  // Get all of a user's images in reverse chronological order
  getAllUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId
    const images = await ctx.prisma.image.findMany({
      where: {
        authorId: {
          equals: userId,
        },
      },
      orderBy: [{ createdAt: "desc" }],
    })
    return images
  }),

  // Generate a new image for a user
  create: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1, { message: "Prompt cannot be empty" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId
      // remove icon word from the prompt both lowercase and uppercase
      const prompt = input.prompt

      // For testing purposes (return latest generated image)
      // const image = await ctx.prisma.image.findFirst({
      //   take: 1,
      //   orderBy: [{ createdAt: "desc" }],
      // })
      // return image
      // }),

      // Check if user has a positive token balance
      const stripeUser = await ctx.prisma.stripeUser.findFirst({
        where: {
          clerkID: ctx.userId,
        },
      })
      if (!stripeUser || !stripeUser?.credits || stripeUser?.credits <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You don't have enough credits to generate an image. Please buy more credits.",
        })
      }

      if (!process.env.OPENAI_API_KEY) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "OpenAI API key not found",
        })
      }

      // Define async func to upload to S3 bucket
      type uploadParams = {
        Bucket: string
        Key: string
        Body: Buffer
      }
      const uploadImage = (params: uploadParams) => {
        return new Promise((resolve, reject) => {
          s3.putObject(params, (err, data) => {
            if (err) {
              reject(err)
            } else {
              resolve(data)
            }
          })
        })
      }

      try {
        // Make call to DALL-E
        const dalleResponse: DalleResponse = await axios.post(
          "https://api.openai.com/v1/images/generations",
          {
            prompt: prompt,
            n: 1,
            size: "1024x1024",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
          }
        )
        const imageUrl = dalleResponse["data"]["data"][0]["url"]
        const imagenesponse: imagenesponse = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        })

        if (!imagenesponse) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error downloading image from DALL-E",
          })
        }

        // Create a unique key for image
        const timeStamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const s3Key = `${timeStamp}-${randomString}.jpg`

        // Await S3 upload
        await uploadImage({
          Bucket: "salmandotweb-icony",
          Key: s3Key,
          Body: imagenesponse.data,
        })
        const s3Url = `https://salmandotweb-icony.s3.amazonaws.com/${s3Key}`

        // Create db record and return
        const image = await ctx.prisma.image.create({
          data: {
            authorId: authorId,
            prompt: prompt,
            url: s3Url,
          },
        })
        return image
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error generating image",
        })
      }
    }),

  // Delete an image given its id
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "id cannot be empty" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.image.delete({
        where: {
          id: input.id,
        },
      })
    }),

  // Show an image given its id
  show: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "id cannot be empty" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const image = await ctx.prisma.image.update({
        where: {
          id: input.id,
        },
        data: {
          hidden: false,
        },
      })
      return image
    }),

  // Hide an image given its id
  hide: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "id cannot be empty" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const image = await ctx.prisma.image.update({
        where: {
          id: input.id,
        },
        data: {
          hidden: true,
        },
      })
      return image
    }),
})
