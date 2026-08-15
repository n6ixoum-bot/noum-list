import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

const generatedPlanSchema = z.object({
  title: z.string().min(1).max(120),
  overview: z.string().min(1).max(300),
  stages: z.array(z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(220),
    tasks: z.array(z.object({
      title: z.string().min(1).max(140),
      outcome: z.string().min(1).max(220),
      durationMinutes: z.number().int().min(10).max(120),
      arabicQuery: z.string().min(2).max(160),
      englishQuery: z.string().min(2).max(160),
    })).min(1).max(5),
  })).min(2).max(4),
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  learning: router({
    generate: publicProcedure
      .input(z.object({
        goal: z.string().trim().min(3).max(160),
        level: z.enum(["مبتدئ", "متوسط"]),
        durationWeeks: z.union([z.literal(2), z.literal(4)]),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          model: "gpt-5-mini",
          messages: [
            {
              role: "system",
              content: `أنت مخطط تعلم عربي دقيق. لا تستخدم البحث على الويب. أنشئ مسارًا واقعيًا ومتدرجًا من مهام عملية قصيرة اعتمادًا على المعرفة العامة فقط. اجعل الخطة مختصرة: بين مرحلتين وأربع مراحل، وبين مهمتين وثلاث مهام فقط في كل مرحلة. لا تدّعِ أن مصدرًا ما هو الأفضل ولا تخترع روابط أو أسماء فيديوهات. بدلاً من ذلك، أنشئ لكل مهمة عبارة بحث يوتيوب عربية وأخرى إنجليزية تساعد المستخدم على العثور على فيديو مناسب. اكتب كل الحقول العربية، مع إبقاء englishQuery بالإنجليزية. أعد JSON صحيحًا فقط من دون شرح أو Markdown أو علامات اقتباس خارج JSON، وفق هذا الشكل:
{
  "title": "string",
  "overview": "string",
  "stages": [{
    "title": "string",
    "description": "string",
    "tasks": [{
      "title": "string",
      "outcome": "string",
      "durationMinutes": 30,
      "arabicQuery": "string",
      "englishQuery": "string"
    }]
  }]
}`,
            },
            {
              role: "user",
              content: `الهدف: ${input.goal}\nالمستوى: ${input.level}\nالمدة المطلوبة: ${input.durationWeeks} أسبوع.\nأنشئ بين مرحلتين وأربع مراحل، وبحد أقصى ثلاث مهام لكل مرحلة.`,
            },
          ],
          toolChoice: "none",
        });

        const content = response.choices[0]?.message.content;
        if (typeof content !== "string") {
          throw new Error("لم يصل محتوى صالح من مولّد المسارات.");
        }
        const normalized = content
          .trim()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "");
        return generatedPlanSchema.parse(JSON.parse(normalized));
      }),
  }),

  books: router({
    generateQuestions: publicProcedure
      .input(z.object({ title: z.string().trim().min(1).max(160), summary: z.string().trim().min(20).max(2000) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          model: "gpt-5-mini",
          messages: [
            { role: "system", content: "أنت مساعد قراءة عربي. بناءً على عنوان الكتاب والملخص الذي يقدمه المستخدم فقط، أنشئ 3 إلى 6 أسئلة مراجعة عميقة وقصيرة مع تلميح صغير لكل سؤال. لا تخترع معلومات غير موجودة في الملخص. أعد JSON صحيحًا فقط من دون Markdown بالشكل: {\"summary\":\"string\",\"questions\":[{\"question\":\"string\",\"hint\":\"string\"}]}" },
            { role: "user", content: `عنوان الكتاب: ${input.title}\nملخص القارئ: ${input.summary}` },
          ],
          toolChoice: "none",
        });
        const content = response.choices[0]?.message.content;
        if (typeof content !== "string") throw new Error("لم يصل تحليل صالح للكتاب.");
        const normalized = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
        return z.object({ summary: z.string().min(1).max(2000), questions: z.array(z.object({ question: z.string().min(3).max(260), hint: z.string().min(3).max(260) })).min(3).max(6) }).parse(JSON.parse(normalized));
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
