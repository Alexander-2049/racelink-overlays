import type { GameId } from '../contracts/games.js';

/**
 * A tiny, dependency-free description language for the public overlay data
 * contract. One node tree is the single source of truth for:
 * - the TypeScript types (`Infer<typeof node>`),
 * - runtime validation (`validateValue`),
 * - the generated field reference and `fields.json`.
 */

export const units = [
  'kph',
  'rpm',
  'ratio',
  'percent',
  'liters',
  'kg',
  'celsius',
  'mps',
  'mps2',
  'g',
  'rad',
  'deg',
  'seconds',
  'meters',
  'mm',
  'newtons',
  'nm',
  'kpa',
  'kwh',
  'laps',
  'count',
  'color',
  'unix-ms',
] as const;
export type Unit = (typeof units)[number];

export type FieldMeta = Readonly<{
  description: string;
  unit?: Unit;
  /** Inclusive value range for numbers. Values outside it are contract violations. */
  range?: readonly [number, number];
  /** Games that populate the value. Omitted means inherited from the parent node. */
  games?: readonly GameId[];
  /** API version in which the field appeared, for example `2.0`. */
  since?: string;
  /** Migration hint. A deprecated field stays for one major version. */
  deprecated?: string;
}>;

export type NumberNode = Readonly<{ kind: 'number'; integer: boolean; meta: FieldMeta }>;
export type StringNode = Readonly<{ kind: 'string'; meta: FieldMeta }>;
export type BooleanNode = Readonly<{ kind: 'boolean'; meta: FieldMeta }>;
export type EnumNode<V extends string = string> = Readonly<{
  kind: 'enum';
  values: readonly V[];
  meta: FieldMeta;
}>;
export interface ObjectNode<F extends Fields = Fields> {
  readonly kind: 'object';
  readonly fields: F;
  readonly meta: FieldMeta;
}
export interface ArrayNode<I extends Node = Node> {
  readonly kind: 'array';
  readonly items: I;
  readonly meta: FieldMeta;
}
export interface NullableNode<I extends Node = Node> {
  readonly kind: 'nullable';
  readonly inner: I;
}
/** A value described elsewhere (for example track geometry) with its own guard. */
export type ExternalNode<T = unknown> = Readonly<{
  kind: 'external';
  name: string;
  guard: (value: unknown) => value is T;
  meta: FieldMeta;
}>;

export type Node =
  | NumberNode
  | StringNode
  | BooleanNode
  | EnumNode
  | ObjectNode
  | ArrayNode
  | NullableNode
  | ExternalNode;
export type Fields = Readonly<Record<string, Node>>;

export type Infer<N> =
  N extends NullableNode<infer I>
    ? Infer<I> | null
    : N extends NumberNode
      ? number
      : N extends StringNode
        ? string
        : N extends BooleanNode
          ? boolean
          : N extends EnumNode<infer V>
            ? V
            : N extends ArrayNode<infer I>
              ? readonly Infer<I>[]
              : N extends ObjectNode<infer F>
                ? { readonly [K in keyof F]: Infer<F[K]> }
                : N extends ExternalNode<infer T>
                  ? T
                  : never;

type MetaInput = string | FieldMeta;
const meta = (input: MetaInput): FieldMeta =>
  typeof input === 'string' ? { description: input } : input;

export const num = (input: MetaInput): NumberNode => ({
  kind: 'number',
  integer: false,
  meta: meta(input),
});
export const int = (input: MetaInput): NumberNode => ({
  kind: 'number',
  integer: true,
  meta: meta(input),
});
export const str = (input: MetaInput): StringNode => ({ kind: 'string', meta: meta(input) });
export const bool = (input: MetaInput): BooleanNode => ({ kind: 'boolean', meta: meta(input) });
export const oneOf = <const V extends string>(
  values: readonly V[],
  input: MetaInput,
): EnumNode<V> => ({ kind: 'enum', values, meta: meta(input) });
export const obj = <const F extends Fields>(fields: F, input: MetaInput = ''): ObjectNode<F> => ({
  kind: 'object',
  fields,
  meta: meta(input),
});
export const list = <I extends Node>(items: I, input: MetaInput): ArrayNode<I> => ({
  kind: 'array',
  items,
  meta: meta(input),
});
/** The value is `null` when the running game does not provide it. */
export const nullable = <I extends Node>(inner: I): NullableNode<I> => ({
  kind: 'nullable',
  inner,
});
export const external = <T>(
  name: string,
  guard: (value: unknown) => value is T,
  input: MetaInput,
): ExternalNode<T> => ({ kind: 'external', name, guard, meta: meta(input) });

export type ValueNode = Exclude<Node, NullableNode>;
/** Strips `nullable` wrappers. */
export const unwrap = (node: Node): ValueNode =>
  node.kind === 'nullable' ? unwrap(node.inner) : node;
export type ValidationIssue = Readonly<{ path: string; message: string }>;

const join = (path: string, key: string): string => (path ? `${path}.${key}` : key);

/**
 * Checks a value against a node. Reports at most `limit` issues so a broken
 * high-frequency payload never produces unbounded work.
 */
export const validateValue = (
  node: Node,
  value: unknown,
  path = '',
  limit = 20,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const leafProblem = (current: ValueNode, item: unknown): string | null => {
    switch (current.kind) {
      case 'number': {
        if (typeof item !== 'number' || !Number.isFinite(item)) return 'expected finite number';
        if (current.integer && !Number.isInteger(item)) return 'expected integer';
        const range = current.meta.range;
        return range && (item < range[0] || item > range[1])
          ? `expected ${String(range[0])}..${String(range[1])}, got ${String(item)}`
          : null;
      }
      case 'string':
        if (typeof item !== 'string') return 'expected string';
        return current.meta.unit === 'color' && !/^#[0-9a-f]{6}$/i.test(item)
          ? 'expected #rrggbb color'
          : null;
      case 'boolean':
        return typeof item === 'boolean' ? null : 'expected boolean';
      case 'enum':
        return typeof item === 'string' && current.values.includes(item)
          ? null
          : `expected one of ${current.values.join(', ')}`;
      case 'external':
        return current.guard(item) ? null : `expected ${current.name}`;
      case 'array':
        return Array.isArray(item) ? null : 'expected array';
      case 'object':
        return typeof item === 'object' && item !== null && !Array.isArray(item)
          ? null
          : 'expected object';
    }
  };
  const visit = (current: Node, item: unknown, at: string): void => {
    if (issues.length >= limit) return;
    if (current.kind === 'nullable') {
      if (item !== null) visit(current.inner, item, at);
      return;
    }
    const problem = leafProblem(current, item);
    if (problem !== null) {
      issues.push({ path: at || '(root)', message: problem });
      return;
    }
    if (current.kind === 'array' && Array.isArray(item))
      item.forEach((entry: unknown, index) => {
        visit(current.items, entry, `${at}[${String(index)}]`);
      });
    if (current.kind === 'object') {
      const record = item as Record<string, unknown>;
      for (const [key, child] of Object.entries(current.fields)) {
        if (key in record) visit(child, record[key], join(at, key));
        else issues.push({ path: join(at, key), message: 'missing field' });
      }
    }
  };
  visit(node, value, path);
  return issues;
};

/** Flattened description of every leaf, used for docs, `fields.json`, and Data Explorer. */
export type FieldDescriptor = Readonly<{
  path: string;
  type: string;
  nullable: boolean;
  description: string;
  unit: Unit | null;
  range: readonly [number, number] | null;
  values: readonly string[] | null;
  games: readonly GameId[];
  since: string;
  deprecated: string | null;
}>;

const typeName = (node: Node): string => {
  switch (node.kind) {
    case 'nullable':
      return typeName(node.inner);
    case 'number':
      return node.integer ? 'integer' : 'number';
    case 'enum':
      return 'enum';
    case 'array':
      return `${typeName(node.items)}[]`;
    case 'external':
      return node.name;
    case 'string':
    case 'boolean':
    case 'object':
      return node.kind;
  }
};

export const describeFields = (
  root: Node,
  rootPath: string,
  defaultGames: readonly GameId[],
  defaultSince: string,
): readonly FieldDescriptor[] => {
  const result: FieldDescriptor[] = [];
  const visit = (node: Node, path: string, games: readonly GameId[], since: string): void => {
    const isNullable = node.kind === 'nullable';
    const target = unwrap(node);
    const current = target.meta;
    const ownGames = current.games ?? games;
    const ownSince = current.since ?? since;
    result.push(descriptor(target, path, isNullable, ownGames, ownSince));
    if (target.kind === 'object')
      for (const [key, child] of Object.entries(target.fields))
        visit(child, `${path}.${key}`, ownGames, ownSince);
    const items = target.kind === 'array' ? unwrap(target.items) : null;
    if (items?.kind === 'object')
      for (const [key, child] of Object.entries(items.fields))
        visit(child, `${path}[].${key}`, ownGames, ownSince);
  };
  const descriptor = (
    node: ValueNode,
    path: string,
    isNullable: boolean,
    games: readonly GameId[],
    since: string,
  ): FieldDescriptor => ({
    path,
    type: node.kind === 'object' ? 'object' : node.kind === 'array' ? 'array' : typeName(node),
    nullable: isNullable,
    description: node.meta.description,
    unit: node.meta.unit ?? null,
    range: node.meta.range ?? null,
    values: node.kind === 'enum' ? node.values : null,
    games,
    since,
    deprecated: node.meta.deprecated ?? null,
  });
  visit(root, rootPath, defaultGames, defaultSince);
  return result;
};
