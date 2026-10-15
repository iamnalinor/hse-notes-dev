import type { LectureEntry } from "#web/domain/schemas.ts";

import { COURSES } from "#web/domain/courses.ts";

import { CourseCard } from "./course-card.tsx";
import { SectionTitle } from "./section-title.tsx";

type Props = {
  readonly lectures: Readonly<Record<string, readonly LectureEntry[]>>;
  readonly today: string;
};

export const CoursesSection = ({ lectures, today }: Props) => (
  <section className="border-t border-rule py-16" id="courses">
    <div className="mb-7 flex flex-col items-start justify-between gap-4 font-sans md:flex-row md:items-end">
      <SectionTitle eyebrow="Курсы">Первый модуль</SectionTitle>
      <p className="max-w-110 text-[15px] text-muted">
        Конспект появляется после каждой лекции. Если лекции ещё не было, в нём черновик по
        программе курса.
      </p>
    </div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,0.7fr)]">
      {COURSES.map((course) => (
        <CourseCard
          course={course}
          key={course.id}
          lectures={lectures[course.id] ?? []}
          today={today}
        />
      ))}
      <article className="flex flex-col rounded-xl border border-dashed border-rule px-5.5 pt-5.5">
        <span className="text-[12.5px] tracking-wider text-muted uppercase">Позже</span>
        <h3 className="mt-2.5 mb-1.5 text-[25px] leading-tight font-bold wrap-break-word text-muted">
          Введение в программирование
        </h3>
        <span className="text-[13.5px] text-muted">Конспекты появятся позже</span>
      </article>
    </div>
  </section>
);
