// AUTOGENERATED FILE
// This file was generated from grammar.ohm by `ohm generateBundles`.

import {
  ActionDict,
  Grammar,
  IterationNode,
  Node,
  NonterminalNode,
  Semantics,
  TerminalNode
} from 'ohm-js';

export interface TactActionDict<T> extends ActionDict<T> {
  Program?: (this: NonterminalNode, arg0: IterationNode) => T;
  ProgramItem?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Type?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Field?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: TerminalNode) => T;
  Struct?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: IterationNode, arg4: TerminalNode) => T;
  StructBody?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Contract?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: IterationNode, arg4: TerminalNode) => T;
  ContractBody?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Function?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: TerminalNode, arg5: TerminalNode, arg6: NonterminalNode, arg7: TerminalNode, arg8: IterationNode, arg9: TerminalNode) => T;
  FunctionArg?: (this: NonterminalNode, arg0: NonterminalNode, arg1: TerminalNode, arg2: NonterminalNode) => T;
  Statement?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  StatementBlock?: (this: NonterminalNode, arg0: TerminalNode, arg1: IterationNode, arg2: TerminalNode) => T;
  StatementLet?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode, arg3: NonterminalNode, arg4: TerminalNode) => T;
  StatementReturn?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: TerminalNode) => T;
  Expression?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  ExpressionMul_mul?: (this: NonterminalNode, arg0: NonterminalNode, arg1: TerminalNode, arg2: NonterminalNode) => T;
  ExpressionMul_div?: (this: NonterminalNode, arg0: NonterminalNode, arg1: TerminalNode, arg2: NonterminalNode) => T;
  ExpressionMul?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  ExpressionAdd_add?: (this: NonterminalNode, arg0: NonterminalNode, arg1: TerminalNode, arg2: NonterminalNode) => T;
  ExpressionAdd_sub?: (this: NonterminalNode, arg0: NonterminalNode, arg1: TerminalNode, arg2: NonterminalNode) => T;
  ExpressionAdd?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  ExpressionUnary_neg?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode) => T;
  ExpressionUnary_add?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode) => T;
  ExpressionUnary_log_not?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode) => T;
  ExpressionUnary_bit_not?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode) => T;
  ExpressionUnary?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  ExpressionValue?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  typeLiteral?: (this: NonterminalNode, arg0: NonterminalNode, arg1: IterationNode) => T;
  typeLiteralPart?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
  integerLiteral?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  integerLiteralDec?: (this: NonterminalNode, arg0: IterationNode) => T;
  integerLiteralHex?: (this: NonterminalNode, arg0: TerminalNode, arg1: IterationNode) => T;
  letterAsciiLC?: (this: NonterminalNode, arg0: TerminalNode) => T;
  letterAsciiUC?: (this: NonterminalNode, arg0: TerminalNode) => T;
  letterAscii?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  idStart?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  idPart?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
  id?: (this: NonterminalNode, arg0: NonterminalNode, arg1: IterationNode) => T;
  nullLiteral?: (this: NonterminalNode, arg0: TerminalNode) => T;
  boolLiteral?: (this: NonterminalNode, arg0: TerminalNode) => T;
  keyword?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  struct?: (this: NonterminalNode, arg0: TerminalNode) => T;
  contract?: (this: NonterminalNode, arg0: TerminalNode) => T;
  var?: (this: NonterminalNode, arg0: TerminalNode) => T;
  let?: (this: NonterminalNode, arg0: TerminalNode) => T;
  fun?: (this: NonterminalNode, arg0: TerminalNode) => T;
  return?: (this: NonterminalNode, arg0: TerminalNode) => T;
  reservedWord?: (this: NonterminalNode, arg0: NonterminalNode) => T;
}

export interface TactSemantics extends Semantics {
  addOperation<T>(name: string, actionDict: TactActionDict<T>): this;
  extendOperation<T>(name: string, actionDict: TactActionDict<T>): this;
  addAttribute<T>(name: string, actionDict: TactActionDict<T>): this;
  extendAttribute<T>(name: string, actionDict: TactActionDict<T>): this;
}

export interface TactGrammar extends Grammar {
  createSemantics(): TactSemantics;
  extendSemantics(superSemantics: TactSemantics): TactSemantics;
}

declare const grammar: TactGrammar;
export default grammar;

