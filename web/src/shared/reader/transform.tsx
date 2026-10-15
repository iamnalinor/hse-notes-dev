import type { ReactElement, ReactNode } from "react";

import {
  attributesToProps,
  type DOMNode,
  domToReact,
  Element,
  type HTMLReactParserOptions,
} from "html-react-parser";

import { blockStyle } from "#web/domain/blocks.ts";
import { isRemarkTag, REMARK_TAGS, type RemarkTag } from "#web/domain/remarks.ts";

import { splitBlockName } from "./block-name.ts";
import { Block } from "./block.tsx";
import { adjacentElement, childWithClass, hasClass, textOf } from "./dom-utils.ts";
import { ProblemFooter } from "./problem-footer.tsx";
import { Proof } from "./proof.tsx";
import { RefLink } from "./ref-link.tsx";
import { TexMath } from "./tex-math.tsx";

export type TransformOptions = {
  /** Where `fig/<hash>.svg` of this document lives. */
  readonly assetBase: string;
  readonly sectionNumbers: ReadonlyMap<string, string>;
  /** The registry is a flat list of headings, notes have parts and numbered sections. */
  readonly variant: "notes" | "registry";
};

type Replace = NonNullable<HTMLReactParserOptions["replace"]>;
type Handler = (
  node: Element,
  options: TransformOptions,
  replace: Replace,
) => ReactElement | undefined;

const LONG_PROOF_CHARS = 700;
const PART_HEADING =
  "mt-13 mb-1.5 flex items-center gap-3.5 font-sans text-[13px] font-semibold tracking-[0.16em] text-muted uppercase after:h-px after:flex-1 after:bg-rule after:content-['']";
const TITLE_HEADING = "mt-11 mb-3 font-sans text-[25px] leading-tight font-bold";

const children = (node: Element, replace: Replace): ReactNode =>
  domToReact(node.children as DOMNode[], { replace });

const math: Handler = (node) => <TexMath display={hasClass(node, "display")} tex={textOf(node)} />;

const reference: Handler = (node, _options, replace) => (
  <RefLink refId={node.attribs["data-ref"] ?? ""}>{children(node, replace)}</RefLink>
);

const answerParts = (node: Element, replace: Replace): Record<string, ReactNode> => {
  const next = adjacentElement(node, "next");
  const siblings = [next, next === undefined ? undefined : adjacentElement(next, "next")].filter(
    (sibling): sibling is Element => sibling !== undefined,
  );
  const part = (name: string): ReactNode => {
    const found = siblings.find((sibling) => hasClass(sibling, name));
    return found === undefined ? undefined : children(found, replace);
  };
  return { answer: part("nb-answer"), solution: part("nb-solution") };
};

const blockHeading = (nameNode: Element, tag: RemarkTag | undefined, replace: Replace) => {
  const parsed = splitBlockName(nameNode.children as DOMNode[]);
  const isTagOnly = tag !== undefined && parsed.titleText === REMARK_TAGS[tag].label;
  return {
    label: parsed.label,
    title:
      isTagOnly || parsed.title.length === 0 ? null : domToReact([...parsed.title], { replace }),
  };
};

const block: Handler = (node, _options, replace) => {
  const kind = blockStyle(node.attribs["data-type"]);
  const nameNode = childWithClass(childWithClass(node, "nb-head") ?? node, "nb-name");
  const body = childWithClass(node, "nb-body");
  if (kind === undefined || nameNode === undefined || body === undefined) {
    return;
  }

  const rawTag = node.attribs["data-tag"];
  const tag = isRemarkTag(rawTag) ? rawTag : undefined;
  const name = blockHeading(nameNode, tag, replace);
  const { answer, solution } = kind === "problem" ? answerParts(node, replace) : {};

  return (
    <Block
      footer={
        kind === "problem" ? <ProblemFooter answer={answer} solution={solution} /> : undefined
      }
      id={node.attribs["id"]}
      kind={kind}
      name={name}
      number={node.attribs["data-number"]}
      tag={tag}
    >
      {children(body, replace)}
    </Block>
  );
};

/** Answers and solutions are drawn inside the problem card, not after it. */
const absorbedAnswer: Handler = (node) => {
  const previous = adjacentElement(node, "prev");
  const isAbsorbed =
    previous !== undefined &&
    (hasClass(previous, "nb-problem") ||
      hasClass(previous, "nb-answer") ||
      hasClass(previous, "nb-solution"));
  return isAbsorbed ? <span hidden /> : undefined;
};

const proof: Handler = (node, _options, replace) => (
  <Proof collapsed={textOf(node).length > LONG_PROOF_CHARS}>{children(node, replace)}</Proof>
);

const proofLabel: Handler = (node) => {
  const isLead = node.parent instanceof Element && node.parent.name === "p";
  const isInProof =
    isLead && node.parent?.parent instanceof Element && hasClass(node.parent.parent, "nb-proof");
  return isInProof && textOf(node).trim() === "Доказательство." ? <span hidden /> : undefined;
};

const image: Handler = (node, options) => {
  const { src, ...rest } = attributesToProps(node.attribs);
  return typeof src === "string" ? (
    <img
      {...rest}
      alt={node.attribs["alt"] ?? ""}
      loading="lazy"
      src={`${options.assetBase}${src}`}
    />
  ) : undefined;
};

const table: Handler = (node, _options, replace) => (
  <div className="my-5 overflow-x-auto">
    <table>{children(node, replace)}</table>
  </div>
);

const section: Handler = (node, options, replace) => {
  const number = options.sectionNumbers.get(node.attribs["id"] ?? "");
  return (
    <section className="scroll-mt-6" data-section-number={number} id={node.attribs["id"]}>
      {children(node, replace)}
    </section>
  );
};

const heading: Handler = (node, options, replace) => {
  const parentId = node.parent instanceof Element ? node.parent.attribs["id"] : undefined;
  const number = parentId === undefined ? undefined : options.sectionNumbers.get(parentId);
  if (node.name === "h1") {
    return (
      <h2 className={options.variant === "notes" ? PART_HEADING : `mt-12 ${TITLE_HEADING}`}>
        {children(node, replace)}
      </h2>
    );
  }
  if (node.name === "h2") {
    return (
      <h3 className={TITLE_HEADING}>
        {number !== undefined && <span className="mr-2.5 font-normal text-muted">{number}</span>}
        {children(node, replace)}
      </h3>
    );
  }
  return <h4 className="mt-8 mb-2 font-sans text-xl font-bold">{children(node, replace)}</h4>;
};

const byTag: Readonly<Record<string, Handler>> = {
  h1: heading,
  h2: heading,
  h3: heading,
  img: image,
  section,
  table,
};

const byClass: readonly (readonly [string, Handler])[] = [
  ["math", math],
  ["nb", block],
  ["nb-proof", proof],
  ["nb-answer", absorbedAnswer],
  ["nb-solution", absorbedAnswer],
];

const handlerFor = (node: Element): Handler | undefined => {
  if (node.name === "a" && node.attribs["data-ref"] !== undefined) {
    return reference;
  }
  return node.name === "em"
    ? proofLabel
    : (byTag[node.name] ?? byClass.find(([name]) => hasClass(node, name))?.[1]);
};

export const createReplacer = (options: TransformOptions): Replace => {
  const replace: Replace = (node) => {
    return node instanceof Element ? handlerFor(node)?.(node, options, replace) : undefined;
  };
  return replace;
};
