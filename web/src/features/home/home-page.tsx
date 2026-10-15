import { useCatalog, useLabelIndex } from "#web/api/queries.ts";
import { COURSES } from "#web/domain/courses.ts";
import { labelStats } from "#web/domain/stats.ts";
import { StatusBadge } from "#web/shared/ui/status-badge.tsx";
import { useToday } from "#web/shared/ui/today.ts";

import { CoursesSection } from "./courses-section.tsx";
import { HomeHero } from "./home-hero.tsx";
import { type RecentItem, recentItems, RecentLectures } from "./recent-lectures.tsx";
import { SectionTitle } from "./section-title.tsx";

const LEGEND = [
  ["read", "Написано по записи лекции: порядок, номера и обозначения как у лектора."],
  [
    "draft",
    "Написано заранее по программе и материалам прошлых лет. После лекции сверяется и меняет статус.",
  ],
] as const;

export const Component = () => {
  const catalog = useCatalog();
  const labels = useLabelIndex();
  const today = useToday();

  const all: RecentItem[] = COURSES.flatMap((course) =>
    (catalog.lectures[course.id] ?? []).map((lecture) => ({ course, lecture })),
  );
  const recent = recentItems(all, today);
  const statements = COURSES.map((course) => {
    const stats = labelStats(Object.values(labels[course.id] ?? {}));
    return stats.definitions + stats.theorems;
  }).reduce((sum, count) => sum + count, 0);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
      <HomeHero
        courses={COURSES.length}
        newest={recent[0]}
        ready={all.filter((item) => item.lecture.basis === "lecture").length}
        statements={statements}
      />
      <CoursesSection lectures={catalog.lectures} today={today} />
      <section className="border-t border-rule py-16">
        <div className="mb-7 font-sans">
          <SectionTitle eyebrow="Обновления">Недавние лекции</SectionTitle>
        </div>
        <RecentLectures items={recent} today={today} />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {LEGEND.map(([status, text]) => (
            <div
              className="flex items-start gap-4 rounded-xl border border-rule bg-card px-5 py-4.5"
              key={status}
            >
              <StatusBadge status={status} />
              <p className="mt-1 font-serif text-[16.5px] leading-normal text-ink/85">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
