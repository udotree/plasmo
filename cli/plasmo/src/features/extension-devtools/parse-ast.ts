/**
 * Copyright (c) Plasmo Corp, foss@plasmo.com, MIT Licensed
 * ---
 * Adapted from https://github.com/dword-design/ts-ast-to-literal/blob/master/src/index.js
 * Copyright (c) Sebastian Landwehr info@sebastianlandwehr.com, MIT licensed
 */
import typescript, {
  type ArrayLiteralExpression,
  type Identifier,
  type LiteralExpression,
  type Node,
  type ObjectLiteralExpression,
  type PropertyAssignment
} from "typescript"

const { SyntaxKind } = typescript

export const parseAst = (node: Node) => {
  switch (node.kind) {
    case SyntaxKind.StringLiteral:
      return (node as LiteralExpression).text
    case SyntaxKind.TrueKeyword:
      return true
    case SyntaxKind.FalseKeyword:
      return false
    case SyntaxKind.NullKeyword:
      return null
    case SyntaxKind.NumericLiteral:
      return parseFloat((node as LiteralExpression).text)
    case SyntaxKind.ArrayLiteralExpression:
      return (node as ArrayLiteralExpression).elements
        .filter((node) => node.kind !== SyntaxKind.SpreadElement)
        .map(parseAst)
    case SyntaxKind.ObjectLiteralExpression:
      return (node as ObjectLiteralExpression).properties
        .filter(
          (property) =>
            property.kind === SyntaxKind.PropertyAssignment &&
            (property.name.kind === SyntaxKind.Identifier ||
              property.name.kind === SyntaxKind.StringLiteral)
        )
        .map((property: PropertyAssignment) => [
          (property.name as Identifier).escapedText ||
            (property.name as LiteralExpression).text,
          parseAst(property.initializer)
        ])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    default:
      return undefined
  }
}
