---
course: calculus
title: Реестр теории по математическому анализу
based_on: конспекты лекций 1–2
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

# Глоссарий курса

::: course-glossary
:::
