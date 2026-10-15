import { Link } from "react-router";

import { paths } from "#web/domain/paths.ts";

import type { RecentItem } from "./recent-lectures.tsx";

import { HeroSheet } from "./hero-sheet.tsx";

type Props = {
  readonly courses: number;
  readonly newest: RecentItem | undefined;
  readonly ready: number;
  readonly statements: number;
};

const BUTTON =
  "inline-flex min-h-5 items-center gap-2.5 rounded-lg border border-ink px-5 py-3 text-[15px] font-semibold no-underline";

export const HomeHero = ({ courses, newest, ready, statements }: Props) => (
  <section className="grid items-center gap-6 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16 lg:py-19">
    <div>
      <div className="font-sans text-[13px] font-semibold tracking-[0.16em] text-def uppercase">
        ПИ ФКН ВШЭ · первый курс · 2026/27
      </div>
      <h1 className="mt-4 mb-5.5 font-sans text-[40px] leading-[1.02] font-bold tracking-tight sm:text-6xl">
        Конспекты лекций, <em className="text-thm not-italic">которые удобнее PDF</em>
      </h1>
      <p className="mb-7.5 max-w-140 font-serif text-xl/relaxed text-ink/85">
        Алгебра, матанализ и дискретная математика: определения и теоремы с номерами,
        доказательства, разобранные примеры и задачи с решениями. Каждая ссылка «по теореме 2.7»
        кликается — даже если теорема в другой лекции.
      </p>
      <div className="flex flex-wrap gap-3 font-sans">
        <a className={`${BUTTON} bg-ink text-paper`} href="#courses">
          Выбрать курс ↓
        </a>
        {newest !== undefined && (
          <Link
            className={`${BUTTON} text-ink`}
            to={paths.lecture(newest.course.id, newest.lecture.weekId)}
          >
            Последняя лекция: {newest.course.short.toLowerCase()}, {newest.lecture.lecture}
          </Link>
        )}
      </div>
      <dl className="mt-10 flex flex-wrap gap-x-8.5 gap-y-5 border-t border-rule pt-6 font-sans">
        {(
          [
            [ready, "конспектов готово"],
            [statements, "определения и теоремы"],
            [courses, "курса, четвёртый скоро"],
          ] as const
        ).map(([value, caption]) => (
          <div key={caption}>
            <dd className="order-first text-3xl font-bold tracking-tight">{value}</dd>
            <dt className="text-[13px] text-muted">{caption}</dt>
          </div>
        ))}
      </dl>
    </div>
    <HeroSheet />
  </section>
);
