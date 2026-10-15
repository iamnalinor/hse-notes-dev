---
course: calculus
title: Реестр теории по математическому анализу
based_on: конспекты лекций 1–4
---

# Соглашения курса и ключевые корнер-кейсы

- $\N = \{1, 2, 3, \dots\}$, $0 \notin \N$: последовательности начинаются с $a_1$, индукция — с $P(1)$ [-@rem:lec01:naturals].
- Порядок разноимённых кванторов существен: $\exists y\, \forall x$ сильнее $\forall x\, \exists y$, во втором $y = y(x)$ [-@prop:lec01:order]; поэтому «$\forall n\ \exists C\ a_n < C$» верно для любой последовательности [-@rem:lec02:quantifier-swap].
- При отрицании ограничения под кванторами сохраняются: отрицание «$\forall \varepsilon > 0\ \exists N\ \forall n > N$ …» — «$\exists \varepsilon > 0\ \forall N\ \exists n > N$ …» [-@rem:lec01:negation-domain].
- Импликация с ложной посылкой истинна [-@ex:lec01:implication]; «или» неисключающее [-@rem:lec01:or-inclusive].
- В индукции нужны и база, и переход при каждом $k$ [-@rem:lec01:no-base], [-@rem:lec01:all-k]; базовых значений столько, сколько предыдущих членов использует переход [-@rem:lec01:two-bases].
- В неравенстве Бернулли условие $x \ge -1$ существенно: $n = 3$, $x = -4$; оно достаточное, неравенство верно и при $x \ge -2$ [-@rem:lec01:bernoulli-condition].
- Сочетания с повторениями в конспекте — $\overline{C}_n^k = C_{n+k-1}^k$ ($n$ видов снизу); в задачах встречается запись $\overline{C_k^n}$ с $n$ сверху [-@rem:lec02:repetitions-notation].
- Число сочетаний $C_n^k$: $n$ снизу, $k$ сверху (в англоязычной литературе $\binom{n}{k}$, $n$ сверху) [-@rem:lec02:notation].
- «Возрастающая» в курсе — строго ($a_n < a_{n+1}$), нестрогая — «неубывающая» [-@rem:lec02:increasing-convention].
- Ограниченность сверху — со строгим неравенством $a_n < C$; для ограниченности строгость неважна [-@rem:lec02:strict].
- Последовательность — не множество значений [-@rem:lec02:not-a-set]; неограниченная не обязана «расти» ($n^{(-1)^n}$) [-@rem:lec02:unbounded-grows].
- В определении предела порядок «$\forall \varepsilon\ \exists N\ \forall n$» существен: при «$\exists N\ \forall \varepsilon$» сходятся только финально постоянные, при «$\exists n$» вместо «$\forall n$» $(-1)^n$ «стремилась» бы к $\pm 1$ [-@rem:lec03:quantifiers].
- Ограниченная последовательность не обязана сходиться: $(-1)^n$ [-@rem:lec03:bounded-not-convergent]; неограниченная не обязана быть б.б.: $n^{(-1)^n}$ [-@rem:lec04:unbounded-not-large].
- Б.б. в курсе — стремление к $\infty$ без знака; $(-1)^n n \to \infty$, но не к $\pm\infty$ [-@rem:lec04:infinity-symbol].
- Отделимость от нуля требует $|d_n| > \delta$ для *всех* $n$: $0, 1, 1, \dots$ сходится к $1$, но не отделима [-@rem:lec04:separated-quantifiers].
- Предельный переход превращает строгое неравенство в нестрогое: $\frac1n > 0$, но $\lim \frac1n = 0$ [-@rem:lec04:strict].

# Лекция 1 — Высказывания, предикаты, кванторы. Метод математической индукции. Неравенство Бернулли

::: {.definition ref="def:lec01:statement"}
Высказывание — утверждение, про которое можно сказать, истинно оно или ложно.
:::

::: {.definition ref="def:lec01:predicate"}
Предикат — утверждение, зависящее от переменных, которое становится высказыванием при любых значениях переменных.
:::

::: {.definition ref="def:lec01:quantifiers"}
$\forall x \in X\ P(x)$ истинно, если $P(x)$ истинно при каждом $x \in X$; $\exists x \in X\ P(x)$ истинно, если $P(x)$ истинно хотя бы при одном $x \in X$.
:::

::: {.proposition ref="prop:lec01:order" status="доказано в лекции 1"}
Одноимённые кванторы перестановочны; $\exists y\, \forall x\ P \Rightarrow \forall x\, \exists y\ P$; обратное неверно. *Идея:* одно $y_0$ из левой части годится для всех $x$; контрпример к обратному — предикат $y \ge x^2$: $\forall x\, \exists y$ истинно, $\exists y\, \forall x$ ложно.
:::

::: {.definition ref="def:lec01:operations"}
$A \wedge B$ истинна, когда истинны обе; $A \vee B$ — когда истинна хотя бы одна; $\lnot A$ — когда $A$ ложно; $A \Rightarrow B$ ложна только при истинной $A$ и ложной $B$; $A \Leftrightarrow B$ — это $(A \Rightarrow B) \wedge (B \Rightarrow A)$.
:::

::: {.definition ref="def:lec01:tautology"}
Тавтология — формула, истинная при всех наборах значений входящих в неё высказываний; формулы равносильны, если их значения совпадают при каждом наборе.
:::

::: {.proposition ref="prop:lec01:laws" status="доказано в лекции 1"}
Равносильны: $\lnot\lnot A$ и $A$; $\lnot(A \wedge B)$ и $\lnot A \vee \lnot B$; $\lnot(A \vee B)$ и $\lnot A \wedge \lnot B$; $A \Rightarrow B$ и $\lnot A \vee B$; $\lnot(A \Rightarrow B)$ и $A \wedge \lnot B$; $A \Rightarrow B$ и $\lnot B \Rightarrow \lnot A$. *Идея:* таблицы истинности.
:::

::: {.theorem ref="thm:lec01:negation" status="доказано в лекции 1"}
$\lnot \forall x \in X\ P(x) \Leftrightarrow \exists x \in X\ \lnot P(x)$, $\lnot \exists x \in X\ P(x) \Leftrightarrow \forall x \in X\ \lnot P(x)$; для цепочки кванторов $\lnot$ проносится слева направо, ограничения $x \in X$ сохраняются. *Идея:* $\forall$-высказывание ложно ровно тогда, когда есть контрпример.
:::

::: {.axiom ref="ax:lec01:induction"}
Если $P(1)$ и $\forall k \in \N\ (P(k) \Rightarrow P(k+1))$, то $\forall n \in \N\ P(n)$.
:::

::: {.proposition ref="prop:lec01:sum" status="доказано в лекции 1"}
$1 + 2 + \dots + n = \frac{n(n+1)}{2}$. *Идея:* индукция, $\frac{k(k+1)}{2} + (k + 1) = \frac{(k+1)(k+2)}{2}$.
:::

::: {.proposition ref="prop:lec01:induction-n0" status="доказано в лекции 1"}
Если $P(n_0)$ и $\forall k \ge n_0\ (P(k) \Rightarrow P(k+1))$, то $P(n)$ при всех $n \ge n_0$. *Идея:* обычная индукция для $Q(m) = P(m + n_0 - 1)$.
:::

::: {.proposition ref="prop:lec01:induction-two" status="доказано в лекции 1"}
Если $P(1)$, $P(2)$ и $\forall k\ (P(k) \wedge P(k+1) \Rightarrow P(k+2))$, то $\forall n\ P(n)$. *Идея:* обычная индукция для $Q(n) = P(n) \wedge P(n+1)$.
:::

::: {.theorem ref="thm:lec01:bernoulli" status="доказано в лекции 1"}
$\forall n \in \N\ \forall x \ge -1\colon (1 + x)^n \ge 1 + nx$. *Идея:* индукция по $n$; в переходе домножаем на $1 + x \ge 0$ и отбрасываем $kx^2 \ge 0$.
:::

# Лекция 2 — Комбинаторика и бином Ньютона. Последовательности, монотонность, ограниченность

::: {.definition ref="def:lec02:permutation"}
Перестановка $n$-элементного множества — упорядоченный набор всех его элементов; их число $P_n$.
:::

::: {.proposition ref="prop:lec02:permutations" status="доказано в лекции 2"}
$P_n = n!$. *Идея:* правило произведения: $n$ вариантов на первое место, $n - 1$ на второе, …
:::

::: {.definition ref="def:lec02:arrangement"}
Размещение из $n$ по $k$ ($0 \le k \le n$) — упорядоченный набор $k$ различных элементов $n$-элементного множества; их число $A_n^k$.
:::

::: {.proposition ref="prop:lec02:arrangements" status="доказано в лекции 2"}
$A_n^k = n(n-1)\cdots(n-k+1) = \frac{n!}{(n-k)!}$; $0! = 1$. *Идея:* правило произведения для $k$ мест.
:::

::: {.definition ref="def:lec02:combination"}
Сочетание из $n$ по $k$ ($0 \le k \le n$) — $k$-элементное подмножество $n$-элементного множества; их число $C_n^k$.
:::

::: {.proposition ref="prop:lec02:combinations" status="доказано в лекции 2"}
$C_n^k = \frac{A_n^k}{k!} = \frac{n!}{k!(n-k)!}$. *Идея:* каждое сочетание соответствует ровно $k!$ размещениям.
:::

::: {.proposition ref="prop:lec02:pascal" status="доказано в лекции 2"}
$C_n^k = C_n^{n-k}$; $C_n^k = C_{n-1}^k + C_{n-1}^{k-1}$ при $1 \le k \le n - 1$. *Идея:* подмножество ↔ дополнение; разбиение подмножеств по тому, содержат ли они фиксированный элемент.
:::

::: {.proposition ref="prop:lec02:repetitions" status="доказано в лекции 2"}
$\overline{A}_n^k = n^k$; $P(n; m_1, \dots, m_s) = \frac{n!}{m_1! \cdots m_s!}$; $\overline{C}_n^k = C_{n+k-1}^k$. *Идея:* правило произведения; деление на перестановки одинаковых букв; кодирование звёздочками и перегородками.
:::

::: {.theorem ref="thm:lec02:binomial" status="доказано в лекции 2"}
$(a + b)^n = \sum_{k=0}^{n} C_n^k a^k b^{n-k}$ (здесь $0^0 = 1$). *Идея:* при раскрытии $n$ скобок одночлен $a^k b^{n-k}$ получается столько раз, сколькими способами можно выбрать $k$ скобок, из которых берётся $a$.
:::

::: {.corollary ref="cor:lec02:sum" status="доказано в лекции 2"}
$\sum_{k=0}^{n} C_n^k = 2^n$, $\sum_{k=0}^{n} (-1)^k C_n^k = 0$. *Идея:* $a = b = 1$ и $a = -1$, $b = 1$ в формуле бинома.
:::

::: {.theorem ref="thm:lec02:multinomial" status="доказано в лекции 2"}
$(x_1 + \dots + x_s)^n = \sum_{m_1 + \dots + m_s = n} P(n; m_1, \dots, m_s) x_1^{m_1} \cdots x_s^{m_s}$. *Идея:* как у бинома — число слов из $m_1$ букв $x_1$, …, $m_s$ букв $x_s$.
:::

::: {.definition ref="def:lec02:sequence"}
Последовательность $(a_n)_{n \in \N}$ — набор вещественных чисел, пронумерованных натуральными индексами (функция $\N \to \R$).
:::

::: {.definition ref="def:lec02:monotone"}
Возрастающая: $a_n < a_{n+1}$; убывающая: $a_n > a_{n+1}$; неубывающая: $a_n \le a_{n+1}$; невозрастающая: $a_n \ge a_{n+1}$ (при всех $n \in \N$); монотонная — любого из этих типов.
:::

::: {.definition ref="def:lec02:bounded-above"}
Ограниченная сверху: $\exists C \in \R\ \forall n \in \N\colon a_n < C$; снизу: $\exists C \in \R\ \forall n\colon a_n > C$; ограниченная — и сверху, и снизу.
:::

::: {.proposition ref="prop:lec02:bounded-abs" status="доказано в лекции 2"}
$(a_n)$ ограничена $\Leftrightarrow \exists C > 0\ \forall n\colon |a_n| < C$. *Идея:* «$\Leftarrow$»: $-C < a_n < C$; «$\Rightarrow$»: $C = |C_1| + |C_2|$.
:::

# Лекция 3 — Предел последовательности. Единственность предела, ограниченность сходящейся последовательности, предел суммы

::: {.definition ref="def:lec03:neighborhood"}
$\varepsilon$-окрестность точки $a$: $U_\varepsilon(a) = (a - \varepsilon, a + \varepsilon)$, $\varepsilon > 0$.
:::

::: {.definition ref="def:lec03:limit"}
$\lim\limits_{n \to \infty} a_n = a \in \R$, если $\forall \varepsilon > 0\ \exists N = N(\varepsilon) \in \N\ \forall n > N\colon |a_n - a| < \varepsilon$. Сходящаяся — имеет предел-число; расходящаяся — не имеет: $\forall a\ \exists \varepsilon > 0\ \forall N\ \exists n > N\colon |a_n - a| \ge \varepsilon$.
:::

::: {.proposition ref="prop:lec03:finitely-many" status="доказано в лекции 3"}
$a_n \to a \Leftrightarrow$ для любого $\varepsilon > 0$ вне $U_\varepsilon(a)$ лишь конечное число членов (номеров). *Идея:* номера вне окрестности не больше $N(\varepsilon)$; обратно, $N$ — наибольший из них.
:::

::: {.proposition ref="prop:lec03:finite-change" status="доказано в лекции 3"}
Изменение конечного числа членов и сдвиг номера $b_n = a_{n \pm p}$ не меняют сходимости и предела. *Идея:* $N_b = \max(N_a, n_0)$ или $\max(N_a + p, n_0)$.
:::

::: {.theorem ref="thm:lec03:uniqueness" status="доказано в лекции 3"}
Если $a_n \to a$ и $a_n \to b$, то $a = b$. *Идея:* от противного; окрестности радиуса $\frac{|b - a|}{3}$ не пересекаются, а член с номером $\max(N_1, N_2) + 1$ лежит в обеих.
:::

::: {.theorem ref="thm:lec03:bounded" status="доказано в лекции 3"}
Сходящаяся последовательность ограничена. *Идея:* $\varepsilon = 1$; $C = \max(|a_1|, \dots, |a_N|, |a|) + 1$.
:::

::: {.corollary ref="cor:lec03:unbounded" status="доказано в лекции 3"}
Неограниченная последовательность расходится. Обратное неверно: $(-1)^n$ ограничена и расходится.
:::

::: {.theorem ref="thm:lec03:sum" status="доказано в лекции 3"}
Если $a_n \to a$, $b_n \to b$, $c \in \R$, то $a_n \pm b_n \to a \pm b$, $c\,a_n \to c\,a$. *Идея:* для суммы берём номера для $\frac\varepsilon2$ и неравенство треугольника; для $c\,a_n$ — номер для $\frac{\varepsilon}{|c|}$.
:::

# Лекция 4 — Бесконечно малые и бесконечно большие последовательности. Арифметика предела. Предельный переход в неравенствах. Теорема о двух милиционерах

::: {.definition ref="def:lec04:infinite-limit"}
$\lim a_n = \infty$: $\forall M > 0\ \exists N = N(M)\ \forall n > N\colon |a_n| > M$; $\lim a_n = +\infty$: то же с $a_n > M$; $\lim a_n = -\infty$: с $a_n < -M$.
:::

::: {.definition ref="def:lec04:small-large"}
Бесконечно малая (б.м.): $a_n \to 0$; бесконечно большая (б.б.): $a_n \to \infty$ (без знака).
:::

::: {.proposition ref="prop:lec04:reciprocal" status="доказано в лекции 4"}
$\frac{1}{\text{б.б.}}$ — б.м.; $\frac{1}{\text{б.м.}}$ — б.б. (при $a_n \ne 0$). *Идея:* $\left|\frac{1}{a_n}\right| < \varepsilon \Leftrightarrow |a_n| > \frac1\varepsilon$; номер $N\left(\frac1\varepsilon\right)$.
:::

::: {.proposition ref="prop:lec04:bounded-small" status="доказано в лекции 4"}
Ограниченная, умноженная на б.м., — б.м. *Идея:* $|a_n b_n| \le C|b_n|$, номер $N\left(\frac\varepsilon C\right)$.
:::

::: {.corollary ref="cor:lec04:small-algebra" status="доказано в лекции 4"}
Сумма, разность, произведение б.м. и произведение б.м. на число — б.м.; б.м. ограничена.
:::

::: {.lemma ref="lem:lec04:decomposition" status="доказано в лекции 4"}
$a_n \to a \Leftrightarrow a_n = a + \alpha_n$, где $\alpha_n$ — б.м.
:::

::: {.theorem ref="thm:lec04:product" status="доказано в лекции 4"}
Если $a_n \to a$, $b_n \to b$, то $a_n b_n \to ab$. *Идея:* $a_n b_n - ab = a\beta_n + b\alpha_n + \alpha_n\beta_n$ — сумма б.м.
:::

::: {.definition ref="def:lec04:separated"}
$(d_n)$ отделима от нуля: $\exists \delta > 0\ \forall n \in \N\colon |d_n| > \delta$.
:::

::: {.proposition ref="prop:lec04:separated" status="доказано в лекции 4"}
Если $a_n \to a \ne 0$ и $a_n \ne 0$ при всех $n$, то $(a_n)$ отделима от нуля. *Идея:* $\varepsilon_0 = \frac{|a|}{2}$, $\delta = \frac12\min\left(|a_1|, \dots, |a_N|, \frac{|a|}{2}\right)$.
:::

::: {.proposition ref="prop:lec04:reciprocal-bounded" status="доказано в лекции 4"}
$\frac{1}{\text{отделимая}}$ — ограниченная ($C = \frac1\delta$); $\frac{1}{\text{ограниченная}}$ — отделимая (при $c_n \ne 0$, $\delta = \frac1C$).
:::

::: {.theorem ref="thm:lec04:quotient" status="доказано в лекции 4"}
Если $a_n \to a$, $b_n \to b \ne 0$, $b_n \ne 0$, то $\frac{a_n}{b_n} \to \frac ab$. *Идея:* $\frac{a_n}{b_n} - \frac ab = \frac1b \cdot \frac{1}{b_n} \cdot (b\alpha_n - a\beta_n)$ — ограниченная · б.м.; $\frac{1}{b_n}$ ограничена, так как $b_n$ отделима от нуля.
:::

::: {.theorem ref="thm:lec04:inequality" status="доказано в лекции 4"}
Если $a_n \to a$, $b_n \to b$ и $a_n \ge b_n$ при $n > N$, то $a \ge b$. Из строгого неравенства следует только нестрогое ($\frac1n > 0$). *Идея:* от противного, $\varepsilon_0 = \frac{b - a}{3}$, непересекающиеся окрестности дают $a_n < b_n$.
:::

::: {.corollary ref="cor:lec04:bound-limit" status="доказано в лекции 4"}
Если $a_n \to a$ и $a_n \le C$ (соответственно $\ge C$) с некоторого номера, то $a \le C$ (соответственно $a \ge C$).
:::

::: {.theorem ref="thm:lec04:squeeze" status="доказано в лекции 4"}
Теорема о двух милиционерах: если $a_n \le b_n \le c_n$ при $n > N$ и $a_n \to a$, $c_n \to a$, то $b_n \to a$. *Идея:* $a - \varepsilon < a_n \le b_n \le c_n < a + \varepsilon$ при $n > \max(N, N_1, N_2)$.
:::

::: {.definition ref="def:lec04:indeterminate"}
Неопределённость — частное, произведение, сумма или разность б.м. и/или б.б., предел которых не определён типами частей: $\frac00$, $\frac\infty\infty$, $\infty - \infty$, $0 \cdot \infty$.
:::

::: {.proposition ref="prop:lec04:standard" status="доказано в лекции 4"}
$q^n \to 0$ ($|q| < 1$), $\to +\infty$ ($q > 1$), $\to \infty$ ($q < -1$), $= 1$ ($q = 1$); $\sqrt[n]{a} \to 1$ ($a > 0$); $\sqrt[n]{n} \to 1$; $\frac{n^k}{a^n} \to 0$ ($a > 1$); $\frac{a^n}{n!} \to 0$; $\frac{n!}{n^n} \to 0$. *Идея:* Бернулли или один член бинома + теорема о двух милиционерах; для $\frac{a^n}{n!}$ — множители $\frac{|a|}{j} \le \frac12$ при $j > 2|a|$.
:::

# Глоссарий курса

::: course-glossary
:::
