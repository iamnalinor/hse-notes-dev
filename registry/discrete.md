---
course: discrete
title: Реестр теории по дискретной математике
based_on: конспекты лекций 1–6
---

# Соглашения курса и ключевые корнер-кейсы

- $0 \in \N$: $\N = \{0, 1, 2, \dots\}$, положительные натуральные — $\N_+$ (замечание [-@rem:lec01:nat]); в матанализе соглашение обратное.
- Импликация $A \to B$ ложна только при $[A] = 1$, $[B] = 0$; при ложной посылке она истинна (замечание [-@rem:lec01:why-implication]).
- «$A$, только если $B$» и «$A$ достаточно для $B$» — это $A \to B$; «$A$ необходимо для $B$» и «$A$, если $B$» — это $B \to A$ (замечание [-@rem:lec01:only-if]).
- Скобки в $A \to B \to C$ и $A \wedge B \vee C$ не опускаются: правил приоритета для них нет (замечание [-@rem:lec01:no-priority]).
- Проверка тавтологии «от противного» требует разобрать все ветки развилки (замечание [-@rem:lec01:branches]).
- При $\forall$ условие ставят импликацией, при $\exists$ — конъюнкцией (замечание [-@rem:lec02:forall-imp]).
- Предметная область квантора всегда непуста (замечание [-@rem:lec02:nonempty]); $\forall x\, (A(x) \to B(x))$ при пустом $A$ — пустая истина (определение [-@def:lec02:vacuous]).
- Связанную переменную переименовывают только в новую букву, иначе свободная переменная окажется захвачена: $\exists x\, (x < y)$ и $\exists y\, (y < y)$ — разные формулы (замечание [-@rem:lec02:rename]).
- $\exists x\, A \wedge \exists x\, B \not\equiv \exists x\, (A \wedge B)$, $\forall x\, (A \vee B) \not\equiv \forall x\, A \vee \forall x\, B$ (замечание [-@rem:lec02:distribute]).
- Принцип индукции для строк — аксиома, не выводимая из (A1), (A2); индукцию ведут по аргументу рекурсии (замечание [-@rem:lec03:which-var]).
- $\in$ и $\subseteq$ различаются: $\varnothing \subseteq X$ всегда, $\varnothing \in X$ — не всегда; $a \ne \{a\}$; $\in$ не транзитивно (замечания [-@rem:lec04:empty-table], [-@rem:lec04:singleton]).
- $\forall x \in \varnothing\ \varphi$ истинно, $\exists x \in \varnothing\ \varphi$ ложно (замечание [-@rem:lec04:bounded-empty]).
- $(A \cup B) \setminus B = A \setminus B$, а не $A$; $(A \times B) \cup (C \times D) \ne (A \cup C) \times (B \cup D)$ (замечания [-@rem:lec04:minus], [-@rem:lec04:product-union]).
- Сокращать $A \times C \subseteq B \times C$ на $C$ можно только при $C \ne \varnothing$ (замечание [-@rem:lec04:cancel-empty]); $A^0 = \{\varnothing\}$.
- База ПМИ в курсе — $\varphi(0)$ (замечание [-@rem:lec05:nat]); переход проверять и при наименьшем допустимом $n$ («все лошади одной масти», замечание [-@rem:lec05:horses]); в сильной индукции малые $n$, где нет нужных предыдущих значений, разбираются отдельно (замечание [-@rem:lec05:small-cases]).
- ПНЧ верен для подмножеств $\N$ и неверен для $\Z$ и положительных рациональных (замечание [-@rem:lec05:lnp-why]).
- С лекции 6 «число» — целое (замечание [-@rem:lec06:integers]); $0 \mid 0$ верно, $0$ делит только $0$ (замечание [-@rem:lec06:zero]).
- Остаток всегда неотрицателен: $-17 = 5 \cdot (-4) + 3$, а не $5 \cdot (-3) - 2$ (замечание [-@rem:lec06:negative]); сравнения — только при $m > 1$ (замечание [-@rem:lec06:modulus]).
- Сравнения нельзя сокращать ($6 \equiv 16 \pmod{10}$, но $3 \not\equiv 8$) и нельзя приводить показатель степени по модулю $m$ ($2^{10} \not\equiv 2^3 \pmod 7$) (замечания [-@rem:lec06:no-cancel], [-@rem:lec06:exponent]).
- $1$ не простое (иначе нет единственности разложения); $\deg(p, 0)$ не определено (замечание [-@rem:lec06:one], определение [-@def:lec06:deg]).

# Лекция 1 — Истинность, ложность и высказывания

::: {.definition ref="def:lec01:statement"}
Высказывание — модель повествовательного предложения, которая либо истинна, либо ложна, но не то и другое одновременно.
:::

::: {.definition ref="def:lec01:truth-value"}
$[A] = 1$, если $A$ истинно, и $[A] = 0$, если ложно.
:::

::: {.definition ref="def:lec01:connective"}
Связка $F$: $[F(A_1, \dots, A_n)] = f([A_1], \dots, [A_n])$ для некоторой функции $f$ — значение целого зависит только от значений частей.
:::

::: {.definition ref="def:lec01:atom"}
Атом — высказывание, которое нельзя разумно разбить на более простые связками.
:::

::: {.definition ref="def:lec01:connectives"}
$\neg A$, $A \wedge B$, $A \vee B$, $A \to B$, $A \leftrightarrow B$ заданы таблицей истинности; $A \to B$ ложна только при $[A] = 1$, $[B] = 0$, $A \leftrightarrow B$ истинна при $[A] = [B]$.
:::

::: {.proposition ref="prop:lec01:arith" status="доказано в лекции 1"}
$[A \wedge B] = \min = [A][B]$, $[A \vee B] = \max$, $[\neg A] = 1 - [A]$, $[A \to B] = 1 \iff [A] \le [B]$, $[A \leftrightarrow B] = 1 \iff [A] = [B]$. *Идея:* проверка по четырём строкам таблицы.
:::

::: {.definition ref="def:lec01:formula"}
Формула $F(A_1, \dots, A_n)$ — одно из $A_i$ или составное высказывание, построенное из них связками; не каждый $A_i$ обязан входить. Приоритет: $\neg$, затем $\wedge, \vee$, затем $\to$; $X \wedge Y \wedge Z = (X \wedge Y) \wedge Z$.
:::

::: {.definition ref="def:lec01:equivalence"}
$F \equiv G$, если $[F] = [G]$ при всех значениях атомов.
:::

::: {.proposition ref="prop:lec01:laws" status="доказано в лекции 1"}
Коммутативность и ассоциативность $\wedge$, $\vee$; $\neg\neg A \equiv A$; $A \to B \equiv \neg A \vee B$; $\neg(A \to B) \equiv A \wedge \neg B$; контрапозиция $A \to B \equiv \neg B \to \neg A$; законы де Моргана; $A \leftrightarrow B \equiv (A \to B) \wedge (B \to A)$. *Идея:* сравнить случаи ложности (истинности) обеих частей.
:::

::: {.definition ref="def:lec01:tautology"}
Тавтология — формула, истинная при всех значениях атомов.
:::

::: {.definition ref="def:lec01:satisfiable"}
Выполнимая формула — истинная хотя бы при одном наборе значений атомов.
:::

::: {.proposition ref="prop:lec01:taut-sat" status="доказано в лекции 1"}
$F$ выполнима $\iff$ $\neg F$ не тавтология; $F$ — тавтология $\iff$ $\neg F$ невыполнима $\iff$ $F \equiv T$ для тавтологии $T$; $F \equiv G \iff F \leftrightarrow G$ — тавтология. *Идея:* отрицание меняет «при всех наборах» на «при некотором наборе».
:::

::: {.definition ref="def:lec01:valid"}
Рассуждение «$A_1, \dots, A_n$; следовательно, $C$» корректно, если не бывает истинных посылок при ложном выводе.
:::

::: {.proposition ref="prop:lec01:valid-taut" status="доказано в лекции 1"}
Если $(A_1 \wedge \ldots \wedge A_n) \to C$ — тавтология, рассуждение корректно; обратное неверно (опровергающий набор значений может не реализовываться ни в какой ситуации). *Идея:* при истинных посылках истинная импликация даёт истинный вывод.
:::

# Лекция 2 — Язык математики. Предикаты и кванторы

::: {.definition ref="def:lec02:predicate"}
$n$-местный предикат — выражение с переменными $x_1, \dots, x_n$, которое становится высказыванием после подстановки подходящих объектов вместо всех переменных; высказывание — нульместный предикат.
:::

::: {.definition ref="def:lec02:domain"}
Предметная область переменной — совокупность объектов, которые разрешено подставлять вместо неё.
:::

::: {.definition ref="def:lec02:quantifiers"}
$\exists x\, A(x)$ истинно, если $A(a)$ истинно хотя бы для одного объекта $a$ области; $\forall x\, A(x)$ — если для каждого.
:::

::: {.definition ref="def:lec02:bound"}
Область действия квантора — часть формулы, к которой он применён. Вхождение переменной связано, если оно в области действия квантора по ней, иначе свободно; формула без свободных переменных — высказывание. Квантор связывает сильнее бинарных связок.
:::

::: {.proposition ref="prop:lec02:quant-neg" status="доказано в лекции 2 (по смыслу кванторов)"}
$\exists x\, A \equiv \neg\forall x\, \neg A$, $\forall x\, A \equiv \neg\exists x\, \neg A$; $\neg\forall x\, A \equiv \exists x\, \neg A$, $\neg\exists x\, A \equiv \forall x\, \neg A$. *Идея:* на конечной области это законы де Моргана для «длинных» $\wedge$ и $\vee$.
:::

::: {.definition ref="def:lec02:unique"}
«Существует единственный»: $\exists x\, (A(x) \wedge \forall y\, (A(y) \to y = x))$, сокращение $\exists ! x\, A(x)$.
:::

::: {.proposition ref="prop:lec02:order" status="доказано в лекции 2"}
$\exists y\, \forall x\, A(x, y)$ влечёт $\forall x\, \exists y\, A(x, y)$; обратное неверно. *Идея:* один свидетель $y_0$ годится для всех $x$; контрпример к обратному — $\forall x\, \exists y\, (y > x)$ в $\N$.
:::

::: {.definition ref="def:lec02:vacuous"}
Пустая истина — $\forall x\, (A(x) \to B(x))$, истинное потому, что $A(x)$ ложно для всех $x$.
:::

# Лекция 3 — Строки: индуктивные определения, индукция и рекурсия

::: {.definition ref="def:lec03:string"}
$S(A)$: $[\,] \in S(A)$; если $s \in S(A)$, $x \in A$, то $x : s \in S(A)$ ($x$ — голова, $s$ — хвост); других строк нет. $[x_1, \dots, x_n] := x_1 : (x_2 : (\dots : (x_n : [\,]) \dots))$.
:::

::: {.axiom ref="ax:lec03:a1a2"}
(A1) $[\,] \ne x : s$; (A2) $x : s = y : t \iff x = y \wedge s = t$.
:::

::: {.axiom ref="ax:lec03:induction"}
(ПИ) $P([\,]) \wedge \forall s\, \forall x\, (P(s) \to P(x : s)) \to \forall s\, P(s)$; база, переход (шаг), предположение индукции. Из (A1), (A2) не выводится.
:::

::: {.proposition ref="prop:lec03:cons-neq" status="доказано в лекции 3"}
$y : s \ne s$ для всех $s$, $y$. *Идея:* индукция по $s$ с предикатом $\forall y\, (y : s \ne s)$; в переходе (A2) сводит к предположению индукции при $y := x$.
:::

::: {.definition ref="def:lec03:lh"}
$\mathrm{lh}([\,]) = 0$, $\mathrm{lh}(x : s) = 1 + \mathrm{lh}(s)$ (в листках $\mathrm{len}$).
:::

::: {.definition ref="def:lec03:app"}
$\mathrm{app}([\,], t) = t$, $\mathrm{app}(x : s, t) = x : \mathrm{app}(s, t)$ — рекурсия по первому аргументу.
:::

::: {.lemma ref="lem:lec03:app-nil" status="доказано в лекции 3"}
$\mathrm{app}(s, [\,]) = s$. *Идея:* индукция по $s$.
:::

::: {.lemma ref="lem:lec03:app-assoc" status="доказано в лекции 3"}
$\mathrm{app}(s, \mathrm{app}(t, r)) = \mathrm{app}(\mathrm{app}(s, t), r)$. *Идея:* индукция по $s$ — аргументу рекурсии; индукция по $t$ или $r$ застревает.
:::

::: {.proposition ref="prop:lec03:lh-app" status="доказано в лекции 3"}
$\mathrm{lh}(\mathrm{app}(s, t)) = \mathrm{lh}(s) + \mathrm{lh}(t)$. *Идея:* индукция по $s$.
:::

::: {.lemma ref="lem:lec03:cancel-left" status="доказано в лекции 3"}
$\mathrm{app}(s, t) = \mathrm{app}(s, r) \Rightarrow t = r$. *Идея:* индукция по $s$, в переходе (A2).
:::

::: {.lemma ref="lem:lec03:app-empty" status="доказано в лекции 3"}
$\mathrm{app}(s, t) = [\,] \Rightarrow s = t = [\,]$. *Идея:* разбор случаев $s = [\,]$ / $s = x : r$, второй противоречит (A1).
:::

::: {.definition ref="def:lec03:rev"}
$\mathrm{rev}([\,]) = [\,]$, $\mathrm{rev}(x : s) = \mathrm{app}(\mathrm{rev}(s), [x])$.
:::

::: {.proposition ref="prop:lec03:rev-app" status="доказано в лекции 3"}
$\mathrm{rev}(\mathrm{app}(s, t)) = \mathrm{app}(\mathrm{rev}(t), \mathrm{rev}(s))$. *Идея:* индукция по $s$; база — правая единица, переход — ассоциативность.
:::

::: {.corollary ref="cor:lec03:rev-rev" status="доказано в лекции 3"}
$\mathrm{rev}(\mathrm{rev}(s)) = s$. *Идея:* индукция по $s$ с переворотом конкатенации и $\mathrm{rev}([x]) = [x]$. Отсюда сокращение справа без индукции.
:::

# Лекция 4 — Множества

::: {.axiom ref="ax:lec04:foundation"}
Нет бесконечных цепочек $x_0 \ni x_1 \ni x_2 \ni \dots$
:::

::: {.proposition ref="prop:lec04:not-self" status="доказано в лекции 4"}
$a \notin a$ для любого $a$; отсюда $a \ne \{a\}$. *Идея:* иначе цепочка $a \ni a \ni \dots$
:::

::: {.definition ref="def:lec04:equal"}
$A = B \iff \forall x\, (x \in A \iff x \in B)$.
:::

::: {.axiom ref="ax:lec04:equality"}
$A = B \wedge B \in C \Rightarrow A \in C$; равные множества взаимозаменяемы.
:::

::: {.definition ref="def:lec04:subset"}
$A \subseteq B \iff \forall x\, (x \in A \Rightarrow x \in B)$; собственное подмножество — $A \subseteq B$, $A \ne B$.
:::

::: {.lemma ref="lem:lec04:subset" status="доказано в лекции 4"}
$A \subseteq A$; $A \subseteq B \subseteq C \Rightarrow A \subseteq C$; $A = B \iff A \subseteq B \wedge B \subseteq A$. *Идея:* произвольный элемент.
:::

::: {.axiom ref="ax:lec04:listing"}
Существует $\{a_1, \dots, a_n\}$: $x \in \{a_1, \dots, a_n\} \iff x = a_1 \vee \ldots \vee x = a_n$; синглетон $\{a\}$.
:::

::: {.axiom ref="ax:lec04:specification"}
Существует $\{x \in A \mid \varphi(x)\}$: $y \in \{x \in A \mid \varphi(x)\} \iff y \in A \wedge \varphi(y)$.
:::

::: {.definition ref="def:lec04:empty"}
$E$ пусто, если $\forall x\, (x \notin E)$; $\varnothing = \{x \in \N \mid x \ne x\}$.
:::

::: {.lemma ref="lem:lec04:empty" status="доказано в лекции 4"}
Пустое множество — подмножество любого; любые два пустых множества равны, так что $\varnothing$ единственно. *Идея:* пустая истина.
:::

::: {.definition ref="def:lec04:bounded"}
$\forall x \in A\ \varphi \equiv \forall x\, (x \in A \to \varphi)$, $\exists x \in A\ \varphi \equiv \exists x\, (x \in A \wedge \varphi)$.
:::

::: {.proposition ref="prop:lec04:bounded-neg" status="доказано в лекции 4"}
$\neg\forall x \in A\ \varphi \equiv \exists x \in A\ \neg\varphi$, $\neg\exists x \in A\ \varphi \equiv \forall x \in A\ \neg\varphi$. *Идея:* отрицание кванторов и $\neg(P \to Q) \equiv P \wedge \neg Q$.
:::

::: {.lemma ref="lem:lec04:russell" status="доказано в лекции 4"}
Нет $R$ с $\forall x\, (x \in R \iff x \notin x)$. *Идея:* подставить $x := R$.
:::

::: {.corollary ref="cor:lec04:no-universal" status="доказано в лекции 4"}
$\{x \in A \mid x \notin x\} \notin A$; множества всех множеств нет. *Идея:* рассуждение Рассела внутри $A$.
:::

::: {.axiom ref="ax:lec04:powerset"}
Существует $\mathcal{P}(A)$: $x \in \mathcal{P}(A) \iff x \subseteq A$.
:::

::: {.axiom ref="ax:lec04:union"}
Существует $\bigcup A$: $x \in \bigcup A \iff \exists \alpha\, (x \in \alpha \wedge \alpha \in A)$.
:::

::: {.definition ref="def:lec04:operations"}
$A \cup B = \bigcup\{A, B\}$, $A \cap B = \{x \in A \mid x \in B\}$, $A \setminus B = \{x \in A \mid x \notin B\}$; непересекающиеся — $A \cap B = \varnothing$.
:::

::: {.lemma ref="lem:lec04:subset-equiv" status="доказано в лекции 4"}
$A \subseteq B \iff A \cap B = A \iff A \cup B = B$. *Идея:* доказательство по кругу.
:::

::: {.definition ref="def:lec04:complement"}
$\bar A = U \setminus A$ для $A \subseteq U$; $A \setminus B = A \cap \bar B$.
:::

::: {.theorem ref="thm:lec04:identities" status="доказано в лекции 4"}
Коммутативность, ассоциативность, идемпотентность, поглощение, $\bar{\bar A} = A$, две дистрибутивности, законы де Моргана, свойства $\varnothing$ и $U$, $A \cap \bar A = \varnothing$, $A \cup \bar A = U$. *Идея:* поэлементный перевод в логические эквивалентности; на практике — таблица принадлежности из $2^k$ строк.
:::

::: {.definition ref="def:lec04:pair"}
$(a, b) = \{\{a\}, \{a, b\}\}$ (по Куратовскому); $(a, a) = \{\{a\}\}$.
:::

::: {.lemma ref="lem:lec04:pair" status="доказано в лекции 4"}
$(a, b) = (c, d) \iff a = c \wedge b = d$. *Идея:* из $\{a\} \in (c, d)$ получить $a = c$, затем разобрать $\{a, b\} = \{c\}$ и $\{a, b\} = \{c, d\}$.
:::

::: {.definition ref="def:lec04:product"}
$A \times B = \{z \in \mathcal{P}(\mathcal{P}(A \cup B)) \mid \exists a \in A\ \exists b \in B\ z = (a, b)\}$; $A_1 \times \ldots \times A_n$ — скобки слева.
:::

::: {.definition ref="def:lec04:power"}
$A^0 = \{\varnothing\}$, $A^1 = A$, $A^n = A \times \ldots \times A$ при $n \ge 2$; $A^{n+1} = A^n \times A$ только при $n \ge 1$.
:::

::: {.definition ref="def:lec04:tuple"}
$(a_1, \dots, a_n) = ((\dots(a_1, a_2), \dots), a_n)$ при $n \ge 2$.
:::

::: {.lemma ref="lem:lec04:tuple" status="доказано в лекции 4"}
$(a_1, \dots, a_n) = (b_1, \dots, b_n) \iff \forall i\ a_i = b_i$. *Идея:* критерий равенства пар $n - 1$ раз.
:::

# Лекция 5 — Индукция на натуральных числах

::: {.axiom ref="ax:lec05:induction"}
ПМИ: $\varphi(0) \wedge \forall n \in \N\, (\varphi(n) \to \varphi(n + 1)) \to \forall n \in \N\ \varphi(n)$; для множеств: если $X \subseteq \N$, $0 \in X$ и $n \in X \Rightarrow n + 1 \in X$ при всех $n$, то $X = \N$.
:::

::: {.proposition ref="prop:lec05:shifted" status="доказано в лекции 5"}
Если $\varphi(n_0)$ и $\varphi(n) \to \varphi(n + 1)$ при всех $n \ge n_0$, то $\varphi(n)$ при всех $n \ge n_0$. *Идея:* ПМИ для $\psi(n) := (n \ge n_0 \to \varphi(n))$; при $n < n_0$ — пустая истина.
:::

::: {.definition ref="def:lec05:progressive"}
$X \subseteq \N$ прогрессивно, $\mathrm{Prog}(X)$, если $\forall n\, \bigl(\forall m < n\ (m \in X) \to n \in X\bigr)$.
:::

::: {.proposition ref="prop:lec05:strong" status="доказано в лекции 5 (теорема о равносильности)"}
ПСИ: всякое прогрессивное $X \subseteq \N$ равно $\N$.
:::

::: {.lemma ref="lem:lec05:prog-zero" status="доказано в лекции 5"}
Если $\mathrm{Prog}(X)$, то $0 \in X$. *Идея:* при $n = 0$ посылка $\forall m < 0\ (m \in X)$ — пустая истина.
:::

::: {.proposition ref="prop:lec05:lnp" status="доказано в лекции 5 (теорема о равносильности)"}
ПНЧ: всякое непустое $X \subseteq \N$ имеет наименьший элемент $\min X$. Для $\Z$ и для $\{x \in \Q \mid x > 0\}$ неверно.
:::

::: {.theorem ref="thm:lec05:equiv" status="доказано в лекции 5"}
ПСИ, ПНЧ и ПМИ равносильны. *Идея:* ПСИ $\Rightarrow$ ПНЧ — если у $X$ нет минимума, то $\overline{X}$ прогрессивно; ПНЧ $\Rightarrow$ ПМИ — $n = \min \overline{X} = m + 1$ с $m \in X$; ПМИ $\Rightarrow$ ПСИ — индукция для $Y = \{n \mid \forall m < n\ (m \in X)\}$.
:::

# Лекция 6 — Делимость

::: {.definition ref="def:lec06:divides"}
$a \mid b \iff \exists k \in \Z\ b = ak$; делитель, кратное. $0 \mid 0$ верно.
:::

::: {.lemma ref="lem:lec06:basic" status="доказано в лекции 6"}
$a \mid 0$; $1 \mid a$; $0 \mid a \Rightarrow a = 0$; $a \mid 1 \Rightarrow a = \pm 1$. *Идея:* последнее — из $1 = |a| \cdot |k| \ge |a| \ge 1$.
:::

::: {.lemma ref="lem:lec06:order" status="доказано в лекции 6"}
$a \mid a$; $a \mid b \wedge b \mid c \Rightarrow a \mid c$; $a \mid b \wedge b \mid a \Rightarrow a = \pm b$. *Идея:* в третьем $a = a k_1 k_2$, случаи $a = 0$ и $k_1 k_2 = 1$.
:::

::: {.lemma ref="lem:lec06:sum" status="доказано в лекции 6"}
$a \mid b \wedge a \mid c \Rightarrow a \mid b \pm c$.
:::

::: {.corollary ref="cor:lec06:sum" status="доказано в лекции 6"}
Если $a \mid b$ и $a \mid b + c$ (или $a \mid b - c$), то $a \mid c$.
:::

::: {.theorem ref="thm:lec06:division-nat" status="доказано в лекции 6"}
Для $a, b \in \N$, $b \ne 0$, существует единственная пара $(q, r) \in \N^2$ с $a = bq + r$, $0 \le r < b$. *Идея:* $q + 1 = \min\{s \in \N \mid a < bs\}$ по ПНЧ; единственность — из $r - r' = b(q' - q) \ge b$.
:::

::: {.definition ref="def:lec06:quotient"}
$q$ — неполное частное, $r$ — остаток от деления $a$ на $b$.
:::

::: {.corollary ref="cor:lec06:division" status="доказано в лекции 6"}
Теорема о делении с остатком: для $a$ и $b \ne 0$ существует единственная пара $(q, r) \in \Z \times \N$ с $a = bq + r$, $0 \le r < |b|$. *Идея:* делим $|a|$ на $|b|$; при $a < 0$, $r' > 0$ берём $-q' - 1$ и $|b| - r'$.
:::

::: {.definition ref="def:lec06:congruence"}
При $m > 1$: $a \equiv b \pmod m \iff m \mid a - b$.
:::

::: {.lemma ref="lem:lec06:same-rem" status="доказано в лекции 6"}
$a \equiv b \pmod m$ тогда и только тогда, когда остатки от деления $a$ и $b$ на $m$ равны. *Идея:* $m \mid r - r'$ и $|r - r'| < m$.
:::

::: {.corollary ref="cor:lec06:distinct" status="доказано в лекции 6"}
Числа $0, 1, \dots, m - 1$ попарно несравнимы по модулю $m$.
:::

::: {.corollary ref="cor:lec06:to-rem" status="доказано в лекции 6"}
$a \equiv r \pmod m$, где $r$ — остаток от деления $a$ на $m$.
:::

::: {.corollary ref="cor:lec06:equivalence" status="доказано в лекции 6"}
Сравнимость по модулю $m$ рефлексивна, симметрична и транзитивна.
:::

::: {.lemma ref="lem:lec06:arith" status="доказано в лекции 6"}
Если $a \equiv b$ и $c \equiv d \pmod m$, то $a \pm c \equiv b \pm d$, $ac \equiv bd$, $a^n \equiv b^n \pmod m$ ($n \in \N$). *Идея:* $ac - bd = m(bk_2 + dk_1 + mk_1k_2)$; степень — индукцией.
:::

::: {.definition ref="def:lec06:prime"}
Простое: $p > 1$, делители только $\pm 1, \pm p$; составное: $n > 1$, не простое. Отрицательные числа, $0$ и $1$ — ни то ни другое.
:::

::: {.lemma ref="lem:lec06:composite" status="доказано в лекции 6"}
$n > 1$ составное тогда и только тогда, когда $n = km$ с $1 < k, m < n$.
:::

::: {.definition ref="def:lec06:factorization"}
Разложение $n \ge 1$: $n = p_1^{a_1} \cdots p_s^{a_s}$, $p_i$ — попарно различные простые, $a_i \in \N$; степень простого $p$ в разложении ($0$, если $p$ нет в списке); разложения существенно одинаковы, если степени всех простых совпадают.
:::

::: {.theorem ref="thm:lec06:fta" status="доказано в лекции 6"}
ОТА: каждое $n \ge 1$ имеет разложение на простые, и любые два его разложения существенно одинаковы. *Идея:* обе части — минимальным контрпримером. Единственность: у наименьшего «плохого» $n$ общих простых в двух разложениях нет; для $p > q$ из разных разложений число $m = (p - q) \cdot \frac{n}{p} < n$ имеет разложения с разной степенью $q$, если $q \nmid p - q$, а $q \mid p - q$ даёт $q \mid p$.
:::

::: {.definition ref="def:lec06:deg"}
$\deg(p, n)$ для $n \ne 0$ — степень простого $p$ в любом разложении $\pm p_1^{a_1} \cdots p_s^{a_s}$ числа $n$; $\deg(p, ab) = \deg(p, a) + \deg(p, b)$.
:::

::: {.theorem ref="thm:lec06:infinite" status="доказано в лекции 6"}
Простых чисел бесконечно много. *Идея:* простой делитель числа $p_1 \cdots p_n + 1$ не может быть ни одним из $p_i$.
:::

::: {.lemma ref="lem:lec06:criterion" status="доказано в лекции 6"}
Признак делимости: для $a, b \ne 0$ $a \mid b$ тогда и только тогда, когда $\deg(p, a) \le \deg(p, b)$ для всех простых $p$. *Идея:* $\deg(p, ak) = \deg(p, a) + \deg(p, k)$; обратно $b = a \cdot (\pm \prod p_i^{\beta_i - \alpha_i})$.
:::

# Глоссарий курса

::: course-glossary
:::
