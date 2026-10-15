import { Link, useParams } from "react-router";

import { useLabelIndex } from "#web/api/queries.ts";
import { useCourse } from "#web/api/use-course.ts";
import { latestRead } from "#web/domain/lectures.ts";
import { paths } from "#web/domain/paths.ts";
import { labelStats } from "#web/domain/stats.ts";
import { useToday } from "#web/shared/ui/today.ts";

import { CourseHero } from "./course-hero.tsx";
import { LectureTable } from "./lecture-table.tsx";
import { RemarksPanel } from "./remarks-panel.tsx";

export const Component = () => {
  const { course: courseId } = useParams();
  const { info, lectures } = useCourse(courseId);
  const stats = labelStats(Object.values(useLabelIndex()[info.id] ?? {}));
  const today = useToday();
  const current = latestRead(lectures);

  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
      <CourseHero course={info} current={current} lectures={lectures} stats={stats} today={today} />
      <div className="grid gap-10 py-9 pb-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
        <section>
          <h2 className="mb-3.5 text-[13px] font-semibold tracking-[0.16em] text-muted uppercase">
            Лекции
          </h2>
          <LectureTable
            course={info.id}
            current={current?.weekId}
            lectures={lectures}
            today={today}
          />
        </section>
        <aside className="flex flex-col gap-4.5">
          <RemarksPanel course={info.id} />
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              className="block rounded-lg border border-rule bg-card p-3.5 text-ink no-underline"
              to={paths.registry(info.id)}
            >
              <b className="block text-[26px] font-bold text-def">{stats.definitions}</b>
              <span className="text-[13px] text-muted">определений в реестре</span>
            </Link>
            <Link
              className="block rounded-lg border border-rule bg-card p-3.5 text-ink no-underline"
              to={paths.registry(info.id)}
            >
              <b className="block text-[26px] font-bold text-thm">{stats.theorems}</b>
              <span className="text-[13px] text-muted">теорем и утверждений</span>
            </Link>
          </div>
          <div className="rounded-xl border border-dashed border-rule px-4 py-3.5 text-[12.5px] leading-normal text-faint">
            Здесь появятся: режим карточек для подготовки к коллоквиуму и пометки «спрашивают на
            коллоквиуме».
          </div>
        </aside>
      </div>
    </div>
  );
};
