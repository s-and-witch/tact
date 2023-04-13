import { ASTConstant, ASTField, ASTFunction, ASTInitFunction, ASTNativeFunction, ASTNode, ASTTypeRef, throwError, traverse } from "../grammar/ast";
import { CompilerContext, createContextStore } from "../context";
import { ConstantDescription, FieldDescription, FunctionArgument, FunctionDescription, InitDescription, printTypeRef, ReceiverSelector, TypeDescription, TypeOrigin, TypeRef, typeRefEquals } from "./types";
import { getRawAST } from "../grammar/store";
import { cloneNode } from "../grammar/clone";
import { crc16 } from "../utils/crc16";
import { resolveConstantValue } from "./resolveConstantValue";
import { resolveABIType } from "./resolveABITypeRef";
import { Address, Cell } from "ton-core";
import { enabledExternals } from "../config/features";
import { Type } from "js-yaml";

let store = createContextStore<TypeDescription>();
let staticFunctionsStore = createContextStore<FunctionDescription>();
let staticConstantsStore = createContextStore<ConstantDescription>();

export const toBounced = (type: string) => `${type}%%BOUNCED%%`;

export function resolveTypeRef(ctx: CompilerContext, src: ASTTypeRef): TypeRef {
    if (src.kind === 'type_ref_simple') {
        let t = getType(ctx, src.name);
        return {
            kind: 'ref',
            name: t.name,
            optional: src.optional
        };
    }
    if (src.kind === 'type_ref_map') {
        let k = getType(ctx, src.key).name;
        let v = getType(ctx, src.value).name;
        return {
            kind: 'map',
            key: k,
            value: v
        };
    }
    if (src.kind === 'type_ref_bounced') {
        throw Error("Unimplemented");
    }
    throw Error('Invalid type ref');
}

export function resolveTypeRefUnsafe(src: ASTTypeRef): TypeRef {
    if (src.kind === 'type_ref_simple') {
        return {
            kind: 'ref',
            name: src.name,
            optional: src.optional
        };
    }
    if (src.kind === 'type_ref_map') {
        return {
            kind: 'map',
            key: src.key,
            value: src.value
        };
    }
    if (src.kind === 'type_ref_bounced') {
        throw Error("Unimplemented");
    }
    throw Error('Invalid type ref');
}

function buildTypeRef(src: ASTTypeRef, types: { [key: string]: TypeDescription }): TypeRef {
    if (src.kind === 'type_ref_simple') {
        if (!types[src.name]) {
            throwError('Type ' + src.name + ' not found', src.ref);
        }
        return {
            kind: 'ref',
            name: src.name,
            optional: src.optional
        };
    }
    if (src.kind === 'type_ref_map') {
        if (!types[src.key]) {
            throwError('Type ' + src.key + ' not found', src.ref);
        }
        if (!types[src.value]) {
            throwError('Type ' + src.value + ' not found', src.ref);
        }
        return {
            kind: 'map',
            key: src.key,
            value: src.value
        };
    }
    if (src.kind === 'type_ref_bounced') {
        throw Error("Unimplemented");
    }

    throw Error('Unknown type ref');
}

function uidForName(name: string, types: { [key: string]: TypeDescription }) {
    // Resolve unique typeid from crc16
    let uid = crc16(name);
    while (Object.values(types).find((v) => v.uid === uid)) {
        uid = (uid + 1) % 65536;
    }
    return uid;
}

export function resolveDescriptors(ctx: CompilerContext) {
    let types: { [key: string]: TypeDescription } = {};
    let staticFunctions: { [key: string]: FunctionDescription } = {};
    let staticConstants: { [key: string]: ConstantDescription } = {};
    let ast = getRawAST(ctx);

    //
    // Register types
    //

    for (let a of ast.types) {
        if (types[a.name]) {
            throwError(`Type ${a.name} already exists`, a.ref);
        }

        let uid = uidForName(a.name, types);

        if (a.kind === 'primitive') {
            types[a.name] = {
                kind: 'primitive',
                origin: a.origin,
                name: a.name,
                uid,
                fields: [],
                traits: [],
                header: null,
                tlb: null,
                signature: null,
                functions: new Map(),
                receivers: [],
                dependsOn: [],
                init: null,
                ast: a,
                interfaces: [],
                constants: [],
                partialFields: []
            };
        } else if (a.kind === 'def_contract') {
            types[a.name] = {
                kind: 'contract',
                origin: a.origin,
                name: a.name,
                uid,
                header: null,
                tlb: null,
                fields: [],
                traits: [],
                signature: null,
                functions: new Map(),
                receivers: [],
                dependsOn: [],
                init: null,
                ast: a,
                interfaces: a.attributes.filter((v) => v.type === 'interface').map((v) => v.name.value),
                constants: [],
                partialFields: []
            };
        } else if (a.kind === 'def_struct') {
            types[a.name] = {
                kind: 'struct',
                origin: a.origin,
                name: a.name,
                uid,
                header: null,
                tlb: null,
                signature: null,
                fields: [],
                traits: [],
                functions: new Map(),
                receivers: [],
                dependsOn: [],
                init: null,
                ast: a,
                interfaces: [],
                constants: [],
                partialFields: []
            };
        } else if (a.kind === 'def_trait') {
            types[a.name] = {
                kind: 'trait',
                origin: a.origin,
                name: a.name,
                uid,
                header: null,
                tlb: null,
                signature: null,
                fields: [],
                traits: [],
                functions: new Map(),
                receivers: [],
                dependsOn: [],
                init: null,
                ast: a,
                interfaces: a.attributes.filter((v) => v.type === 'interface').map((v) => v.name.value),
                constants: [],
                partialFields: []
            };
        }
    }

    //
    // Resolve fields
    //

    function buildFieldDescription(src: ASTField, index: number): FieldDescription {
        let tr = buildTypeRef(src.type, types);

        // Resolve default value
        let d: bigint | boolean | string | null | Address | Cell | undefined = undefined;
        if (src.init) {
            d = resolveConstantValue(tr, src.init, ctx);
        }

        // Resolve abi type
        let type = resolveABIType(src);

        return { name: src.name, type: tr, index, as: src.as, default: d, ref: src.ref, ast: src, abi: { name: src.name, type } };
    }

    function buildConstantDescription(src: ASTConstant): ConstantDescription {
        let tr = buildTypeRef(src.type, types);
        let d = resolveConstantValue(tr, src.value, ctx);
        return { name: src.name, type: tr, value: d, ref: src.ref, ast: src };
    }

    for (let a of ast.types) {

        // Contract
        if (a.kind === 'def_contract') {
            for (const f of a.declarations) {
                if (f.kind === 'def_field') {
                    if (types[a.name].fields.find((v) => v.name === f.name)) {
                        throwError(`Field ${f.name} already exists`, f.ref);
                    }
                    if (types[a.name].constants.find((v) => v.name === f.name)) {
                        throwError(`Constant ${f.name} already exists`, f.ref);
                    }
                    types[a.name].fields.push(buildFieldDescription(f, types[a.name].fields.length));
                } else if (f.kind === 'def_constant') {
                    if (types[a.name].fields.find((v) => v.name === f.name)) {
                        throwError(`Field ${f.name} already exists`, f.ref);
                    }
                    if (types[a.name].constants.find((v) => v.name === f.name)) {
                        throwError(`Constant ${f.name} already exists`, f.ref);
                    }
                    types[a.name].constants.push(buildConstantDescription(f));
                }
            }
        }

        // Struct
        if (a.kind === 'def_struct') {
            for (const f of a.fields) {
                
                if (types[a.name].fields.find((v) => v.name === f.name)) {
                    throwError(`Field ${f.name} already exists`, f.ref);
                }
                types[a.name].fields.push(buildFieldDescription(f, types[a.name].fields.length));
            }
        }

        // Trait
        if (a.kind === 'def_trait') {
            for (const f of a.declarations) {
                if (f.kind !== 'def_field') {
                    continue;
                }
                if (types[a.name].fields.find((v) => v.name === f.name)) {
                    throwError(`Field ${f.name} already exists`, f.ref);
                }
                if (f.as) {
                    throwError(`Trait field cannot have serialization specifier`, f.ref);
                }
                types[a.name].fields.push(buildFieldDescription(f, types[a.name].fields.length));
            }
        }
    }

    //
    // Resolve contract functions
    //

    function resolveFunctionDescriptor(sself: string | null, a: ASTFunction | ASTNativeFunction, origin: TypeOrigin): FunctionDescription {

        let self = sself;

        // Resolve return
        let returns: TypeRef = { kind: 'void' };
        if (a.return) {
            returns = buildTypeRef(a.return, types);
        }

        // Resolve args
        let args: FunctionArgument[] = [];
        for (let r of a.args) {
            args.push({
                name: r.name,
                type: buildTypeRef(r.type, types),
                as: null,
                ref: r.ref
            });
        }

        // Resolve flags
        let isPublic = a.attributes.find(a => a.type === 'public');
        let isGetter = a.attributes.find(a => a.type === 'get');
        let isMutating = a.attributes.find(a => a.type === 'mutates');
        let isExtends = a.attributes.find(a => a.type === 'extends');
        let isVirtual = a.attributes.find(a => a.type === 'virtual');
        let isOverrides = a.attributes.find(a => a.type === 'overrides');
        let isInline = a.attributes.find(a => a.type === 'inline');

        // Check for native
        if (a.kind === 'def_native_function') {
            if (isPublic) {
                throwError('Native functions cannot be public', isPublic.ref);
            }
            if (isGetter) {
                throwError('Native functions cannot be getters', isGetter.ref);
            }
            if (self) {
                throwError('Native functions cannot be delated within a contract', a.ref);
            }
            if (isVirtual) {
                throwError('Native functions cannot be virtual', isVirtual.ref);
            }
            if (isOverrides) {
                throwError('Native functions cannot be overrides', isOverrides.ref);
            }
        }

        // Check virtual and overrides
        if (isVirtual && isExtends) {
            throwError('Extend functions cannot be virtual', isVirtual.ref);
        }
        if (isOverrides && isExtends) {
            throwError('Extend functions cannot be overrides', isOverrides.ref);
        }
        if (!self && isVirtual) {
            throwError('Virtual functions must be defined within a contract or a trait', isVirtual.ref);
        }
        if (!self && isOverrides) {
            throwError('Overrides functions must be defined within a contract or a trait', isOverrides.ref);
        }

        // Check virtual
        if (isVirtual) {
            let t = types[self!]!;
            if (t.kind !== 'trait') {
                throwError('Virtual functions must be defined within a trait', isVirtual.ref);
            }
        }

        // Check overrides
        if (isOverrides) {
            let t = types[self!]!;
            if (t.kind !== 'contract') {
                throwError('Overrides functions must be defined within a contract', isOverrides.ref);
            }
        }

        // Check for common
        if (a.kind === 'def_function') {
            if (isPublic && !self) {
                throwError('Public functions must be defined within a contract', isPublic.ref);
            }
            if (isGetter && !self) {
                throwError('Getters must be defined within a contract', isGetter.ref);
            }
        }

        // Common checks
        if (isPublic && isGetter) {
            throwError('Functions cannot be both public and getters', isPublic.ref);
        }

        // Check for getter
        if (isInline && isGetter) {
            throwError('Getters cannot be inline', isInline.ref);
        }

        // Validate mutating
        if (isExtends) {

            // Validate arguments
            if (self) {
                throwError('Extend functions cannot be defined within a contract', isExtends.ref);
            }
            if (args.length === 0) {
                throwError('Extend functions must have at least one argument', isExtends.ref);
            }
            if (args[0].name !== 'self') {
                throwError('Extend function must have first argument named "self"', args[0].ref);
            }
            if (args[0].type.kind !== 'ref') {
                throwError('Extend functions must have a reference type as the first argument', args[0].ref);
            }
            if (args[0].type.optional) {
                throwError('Extend functions must have a non-optional type as the first argument', args[0].ref);
            }
            if (!types[args[0].type.name]) {
                throwError('Type ' + args[0].type.name + ' not found', args[0].ref);
            }

            // Update self and remove first argument
            self = args[0].type.name;
            args = args.slice(1);
        }

        // Check for mutating and extends
        if (isMutating && !isExtends) {
            throwError('Mutating functions must be extend functions', isMutating.ref);
        }

        // Check argumen names
        let exNames = new Set<string>();
        for (let arg of args) {
            if (arg.name === 'self') {
                throwError('Argument name "self" is reserved', arg.ref);
            }
            if (exNames.has(arg.name)) {
                throwError('Argument name "' + arg.name + '" is already used', arg.ref);
            }
            exNames.add(arg.name);
        }

        // Register function
        return {
            name: a.name,
            self: self,
            origin,
            args,
            returns,
            ast: a,
            isMutating: !!isMutating || (!!sself /* && !isGetter */), // Mark all contract functions as mutating
            isPublic: !!isPublic,
            isGetter: !!isGetter,
            isVirtual: !!isVirtual,
            isOverrides: !!isOverrides,
            isInline: !!isInline,
        };
    }

    function resolveInitFunction(ast: ASTInitFunction): InitDescription {
        let args: FunctionArgument[] = [];
        for (let r of ast.args) {
            args.push({
                name: r.name,
                type: buildTypeRef(r.type, types),
                as: null,
                ref: r.ref
            });
        }
        return {
            args,
            ast
        };
    }

    for (const a of ast.types) {
        if (a.kind === 'def_contract' || a.kind === 'def_trait') {
            const s = types[a.name];
            for (const d of a.declarations) {
                if (d.kind === 'def_function') {
                    let f = resolveFunctionDescriptor(s.name, d, s.origin);
                    if (f.self !== s.name) {
                        throw Error('Function self must be ' + s.name); // Impossible
                    }
                    if (s.functions.has(f.name)) {
                        throwError(`Function ${f.name} already exists in type ${s.name}`, s.ast.ref);
                    }
                    s.functions.set(f.name, f);
                }
                if (d.kind === 'def_init_function') {
                    if (s.init) {
                        throwError('Init function already exists', d.ref);
                    }
                    s.init = resolveInitFunction(d);
                }
                if (d.kind === 'def_receive') {

                    // Check if externals are enabled
                    if (d.selector.kind.startsWith('external-') && !enabledExternals(ctx)) {
                        throwError('External functions are not enabled', d.ref);
                    }

                    if (d.selector.kind === 'internal-simple' || d.selector.kind === 'external-simple') {
                        const arg = d.selector.arg;
                        const internal = d.selector.kind === 'internal-simple';

                        // Check argument type
                        if (arg.type.kind !== 'type_ref_simple') {
                            throwError('Receive function can only accept message', d.ref);
                        }
                        if (arg.type.optional) {
                            throwError('Receive function cannot have optional argument', d.ref);
                        }

                        // Check resolved argument type
                        let t = types[arg.type.name];
                        if (!t) {
                            throwError('Type ' + arg.type.name + ' not found', d.ref);
                        }

                        // Raw receiver
                        if (t.kind === 'primitive') {

                            if (t.name === 'Slice') {

                                // Check for existing receiver
                                if (s.receivers.find((v) => v.selector.kind === (internal ? 'internal-fallback' : 'external-fallback'))) {
                                    throwError(`Fallback receive function already exists`, d.ref);
                                }

                                // Persist receiver
                                s.receivers.push({
                                    selector: {
                                        kind: internal ? 'internal-fallback' : 'external-fallback',
                                        name: arg.name
                                    },
                                    ast: d
                                });

                            } else if (t.name === 'String') {

                                // Check for existing receiver
                                if (s.receivers.find((v) => v.selector.kind === (internal ? 'internal-comment-fallback' : 'external-comment-fallback'))) {
                                    throwError('Comment fallback receive function already exists', d.ref);
                                }

                                // Persist receiver
                                s.receivers.push({
                                    selector: {
                                        kind: (internal ? 'internal-comment-fallback' : 'external-comment-fallback'),
                                        name: arg.name
                                    },
                                    ast: d
                                });
                            } else {
                                throwError('Receive function can only accept message, Slice or String', d.ref);
                            }
                        } else {

                            // Check type
                            if (t.kind !== 'struct') {
                                throwError('Receive function can only accept message', d.ref);
                            }
                            if (t.ast.kind !== 'def_struct') {
                                throwError('Receive function can only accept message', d.ref);
                            }
                            if (!t.ast.message) {
                                throwError('Receive function can only accept message', d.ref);
                            }

                            // Check for duplicate
                            const n = arg.type.name;
                            if (s.receivers.find((v) => v.selector.kind === (internal ? 'internal-binary' : 'external-binary') && v.selector.name === n)) {
                                throwError(`Receive function for ${arg.type.name} already exists`, d.ref);
                            }

                            // Persist receiver
                            s.receivers.push({
                                selector: {
                                    kind: (internal ? 'internal-binary' : 'external-binary'),
                                    name: arg.name,
                                    type: arg.type.name,
                                },
                                ast: d
                            });
                        }
                    } else if (d.selector.kind === 'internal-comment' || d.selector.kind === 'external-comment') {
                        const internal = d.selector.kind === 'internal-comment';
                        if (d.selector.comment.value === '') {
                            throwError('To use empty comment receiver, just remove argument instead of passing empty string', d.ref);
                        }
                        let c = d.selector.comment.value;
                        if (s.receivers.find((v) => v.selector.kind === (internal ? 'internal-comment' : 'external-comment') && v.selector.comment === c)) {
                            throwError(`Receive function for "${c}" already exists`, d.ref);
                        }
                        s.receivers.push({
                            selector: {
                                kind: (internal ? 'internal-comment' : 'external-comment'),
                                comment: c
                            },
                            ast: d
                        });
                    } else if (d.selector.kind === 'internal-fallback') {
                        const internal = d.selector.kind === 'internal-fallback';
                        // Handle empty
                        if (s.receivers.find((v) => v.selector.kind === (internal ? 'internal-empty' : 'external-empty'))) {
                            throwError('Empty receive function already exists', d.ref);
                        }
                        s.receivers.push({
                            selector: {
                                kind: (internal ? 'internal-empty' : 'external-empty')
                            },
                            ast: d
                        });
                    } else if (d.selector.kind === 'bounce') {
                        const arg = d.selector.arg;

                        // TODO improve error checking
                        if (!(arg.type.kind === 'type_ref_simple' || arg.type.kind === "type_ref_bounced")) {
                            throwError('Bounce receive function can only accept either Slice or bounced<T> types', d.ref);
                        }

                        let t = types[arg.type.name];
                        const isGeneric = arg.type.kind === "type_ref_simple" && t.kind === 'primitive' && t.name === 'Slice';

                        if (arg.type.kind === 'type_ref_simple' && arg.type.optional) {
                            throwError('Bounce receive function cannot have optional argument', d.ref);
                        }

                        // Check type
                        if (!isGeneric) {
                            if (t.kind !== 'struct') {
                                throwError('Bounce receive function can only accept struct args or Slice', d.ref);
                            }
                            if (t.ast.kind !== 'def_struct') {
                                throwError('Bounce receive function can only accept struct args or Slice', d.ref);
                            }
                            if (!t.ast.message) {
                                throwError('Bounce receive function can only accept struct message args', d.ref);
                            }
                        }

                        // Check for duplicate

                        const typeRef: TypeRef = {
                            kind: isGeneric ? 'ref' : 'bounced', 
                            name: arg.type.name,
                            optional: arg.type.kind === 'type_ref_simple' ? arg.type.optional : false,
                        };

                        if (s.receivers.find((v) => v.selector.kind === 'internal-bounce' && typeRefEquals(typeRef, v.selector.type))) {
                            throwError(`Bounce receive function for ${arg.type.name} already exists`, d.ref);
                        }
                        
                        // TODO not happy about this b/c ideally we'd use resolveTypeRef, but it's not available yet at this point
                        s.receivers.push({
                            selector: { kind: 'internal-bounce', name: arg.name, type: typeRef },
                            ast: d
                        });
                    } else {
                        throwError('Invalid receive function selector', d.ref);
                    }
                }
            }
        }
    }

    //
    // Check for missing init methods
    //

    for (let k in types) {
        let t = types[k];
        if (t.kind === 'contract') {
            if (!t.init) {
                throwError('Contract ' + t.name + ' does not have init method', t.ast.ref);
            }
        }
    }

    //
    // Check for structs to have at least one field
    //

    for (let k in types) {
        let t = types[k];
        if (t.kind === 'struct') {
            if (t.fields.length === 0) {
                throwError('Struct' + ' ' + t.name + ' does not have any fields', t.ast.ref);
            }
        }
    }

    //
    // Flatten and resolve traits
    //

    for (let k in types) {
        let t = types[k];
        if (t.ast.kind === 'def_trait' || t.ast.kind === 'def_contract') {

            // Flatten traits
            let traits: TypeDescription[] = [];
            let visited = new Set<string>();
            visited.add(t.name);
            function visit(name: string) {
                if (visited.has(name)) {
                    return;
                }
                let tt = types[name];
                if (!tt) {
                    throwError('Trait ' + name + ' not found', t.ast.ref)
                }
                visited.add(name);
                traits.push(tt);
                if (tt.ast.kind === 'def_trait') {
                    for (let s of tt.ast.traits) {
                        visit(s.value);
                    }
                    for (let f of tt.traits) {
                        visit(f.name);
                    }
                } else {
                    throwError('Type ' + name + ' is not a trait', t.ast.ref);
                }
            }
            for (let s of t.ast.traits) {
                visit(s.value);
            }

            // Assign traits
            t.traits = traits;
        }
    }

    //
    // Verify trait fields
    //

    for (let k in types) {
        let t = types[k];

        for (let tr of t.traits) {

            // Check that trait is valid
            if (!types[tr.name]) {
                throwError('Trait ' + tr.name + ' not found', t.ast.ref);
            }
            if (types[tr.name].kind !== 'trait') {
                throwError('Type ' + tr.name + ' is not a trait', t.ast.ref);
            }

            // Check that trait has all required fields
            let ttr = types[tr.name];
            for (let f of ttr.fields) {

                // Check if field exists
                let ex = t.fields.find((v) => v.name === f.name);
                if (!ex) {
                    throwError(`Trait ${tr.name} requires field ${f.name}`, t.ast.ref);
                }

                // Check type
                if (!typeRefEquals(f.type, ex.type)) {
                    throwError(`Trait ${tr.name} requires field ${f.name} of type ${printTypeRef(f.type)}`, t.ast.ref);
                }
            }
        }
    }

    //
    // Copy Trait functions
    //

    function copyTraits(t: TypeDescription) {
        for (let tr of t.traits) {

            // Copy functions
            for (let f of tr.functions.values()) {
                let ex = t.functions.get(f.name);

                // Check overrides
                if (ex && ex.isOverrides) {
                    if (f.isGetter) {
                        throwError(`Overridden function ${f.name} can not be a getter`, ex.ast.ref);
                    }
                    if (f.isMutating !== ex.isMutating) {
                        throwError(`Overridden function ${f.name} should have same mutability`, ex.ast.ref);
                    }
                    if (!typeRefEquals(f.returns, ex.returns)) {
                        throwError(`Overridden function ${f.name} should have same return type`, ex.ast.ref);
                    }
                    if (f.args.length !== ex.args.length) {
                        throwError(`Overridden function ${f.name} should have same number of arguments`, ex.ast.ref);
                    }
                    for (let i = 0; i < f.args.length; i++) {
                        let a = ex.args[i];
                        let b = f.args[i];
                        if (!typeRefEquals(a.type, b.type)) {
                            throwError(`Overridden function ${f.name} should have same argument types`, ex.ast.ref);
                        }
                    }
                    continue; // Ignore overridden functions
                }

                // Check duplicates
                if (ex) {
                    throwError(`Function ${f.name} already exist in ${t.name}`, t.ast.ref);
                }

                // Register function
                t.functions.set(f.name, {
                    ...f,
                    self: t.name,
                    ast: cloneNode(f.ast)
                });
            }

            // Copy receivers
            for (let f of tr.receivers) {
                function sameReceiver(a: ReceiverSelector, b: ReceiverSelector) {
                    if (a.kind === 'internal-comment' && b.kind === 'internal-comment') {
                        return a.comment === b.comment;
                    }
                    if (a.kind === 'internal-binary' && b.kind === 'internal-binary') {
                        return a.type === b.type;
                    }
                    if (a.kind === 'internal-bounce' && b.kind === 'internal-bounce') {
                        return a.type === b.type;
                    }
                    if (a.kind === 'internal-empty' && b.kind === 'internal-empty') {
                        return true;
                    }
                    if (a.kind === 'internal-fallback' && b.kind === 'internal-fallback') {
                        return true;
                    }
                    if (a.kind === 'internal-comment-fallback' && b.kind === 'internal-comment-fallback') {
                        return true;
                    }
                    return false;
                }
                if (t.receivers.find((v) => sameReceiver(v.selector, f.selector))) {
                    throwError(`Receive function for "${f.selector}" already exists`, t.ast.ref);
                }
                t.receivers.push({
                    selector: f.selector,
                    ast: cloneNode(f.ast)
                });
            }

            // Copy intefaces
            for (let i of tr.interfaces) {
                if (!t.interfaces.find((v) => v === i)) {
                    t.interfaces.push(i);
                }
            }
        }
    }

    // Copy to non-traits to avoid duplicates

    let processed = new Set<string>();
    let processing = new Set<string>();

    function processType(name: string) {

        // Check if processed
        if (processed.has(name)) {
            return;
        }
        if (processing.has(name)) {
            throwError(`Circular dependency detected for type ${name}`, types[name].ast.ref);
        }
        processing.has(name);

        // Process dependencies first
        let dependencies = Object.values(types).filter((v) => v.traits.find((v2) => v2.name === name));
        for (let d of dependencies) {
            processType(d.name);
        }

        // Copy traits
        copyTraits(types[name]);

        // Mark as processed
        processed.add(name);
        processing.delete(name);
    }
    for (let k in types) {
        processType(k);
    }

    //
    // Register dependencies
    //

    for (let k in types) {
        let t = types[k];
        let dependsOn = new Set<string>();
        let handler = (src: ASTNode) => {
            if (src.kind === 'init_of') {
                if (!types[src.name]) {
                    throwError(`Type ${src.name} not found`, src.ref);
                }
                dependsOn.add(src.name);
            }
        }

        // Traverse functions
        for (let f of t.functions.values()) {
            traverse(f.ast, handler);
        }
        for (let f of t.receivers) {
            traverse(f.ast, handler);
        }

        // Add dependencies
        for (let s of dependsOn) {
            if (s !== k) {
                t.dependsOn.push(types[s]!);
            }
        }
    }

    //
    // Register transient dependencies
    //

    function collectTransient(name: string, to: Set<string>) {
        let t = types[name];
        for (let d of t.dependsOn) {
            if (to.has(d.name)) {
                continue;
            }
            to.add(d.name);
            collectTransient(d.name, to);
        }
    }
    for (let k in types) {
        let dependsOn = new Set<string>();
        dependsOn.add(k);
        collectTransient(k, dependsOn);
        for (let s of dependsOn) {
            if (s !== k && !types[k].dependsOn.find((v) => v.name === s)) {
                types[k].dependsOn.push(types[s]!);
            }
        }
    }

    //
    // Resolve static functions
    //

    for (let a of ast.functions) {
        let r = resolveFunctionDescriptor(null, a, a.origin);
        if (r.self) {
            if (types[r.self].functions.has(r.name)) {
                throwError(`Function ${r.name} already exists in type ${r.self}`, r.ast.ref);
            }
            types[r.self].functions.set(r.name, r);
        } else {
            if (staticFunctions[r.name]) {
                throwError(`Static function ${r.name} already exists`, r.ast.ref);
            }
            if (staticConstants[r.name]) {
                throwError(`Static constant ${r.name} already exists`, a.ref);
            }
            staticFunctions[r.name] = r;
        }
    }

    //
    // Resolve static constants
    //

    for (let a of ast.constants) {
        if (staticConstants[a.name]) {
            throwError(`Static constant ${a.name} already exists`, a.ref);
        }
        if (staticFunctions[a.name]) {
            throwError(`Static function ${a.name} already exists`, a.ref);
        }
        staticConstants[a.name] = buildConstantDescription(a);
    }

    //
    // Populate partial serialization info
    //
    for (let t in types) {
        types[t].partialFields = resolvePartialFields(ctx, types[t])
    }

    //
    // Register types and functions in context
    //

    for (let t in types) {
        ctx = store.set(ctx, t, types[t]);
    }
    for (let t in staticFunctions) {
        ctx = staticFunctionsStore.set(ctx, t, staticFunctions[t]);
    }
    for (let t in staticConstants) {
        ctx = staticConstantsStore.set(ctx, t, staticConstants[t]);
    }

    return ctx;
}

export function getType(ctx: CompilerContext, name: string): TypeDescription {
    let r = store.get(ctx, name);
    if (!r) {
        throw Error('Type ' + name + ' not found');
    }
    return r;
}

export function getAllTypes(ctx: CompilerContext) {
    return store.all(ctx);
}

export function getContracts(ctx: CompilerContext) {
    return Object.values(getAllTypes(ctx)).filter((v) => v.kind === 'contract').map((v) => v.name);
}

export function getStaticFunction(ctx: CompilerContext, name: string): FunctionDescription {
    let r = staticFunctionsStore.get(ctx, name);
    if (!r) {
        throw Error('Static function ' + name + ' not found');
    }
    return r;
}

export function hasStaticFunction(ctx: CompilerContext, name: string) {
    return !!staticFunctionsStore.get(ctx, name);
}

export function getStaticConstant(ctx: CompilerContext, name: string): ConstantDescription {
    let r = staticConstantsStore.get(ctx, name);
    if (!r) {
        throw Error('Static constant ' + name + ' not found');
    }
    return r;
}

export function hasStaticConstant(ctx: CompilerContext, name: string) {
    return !!staticConstantsStore.get(ctx, name);
}

export function getAllStaticFunctions(ctx: CompilerContext) {
    return staticFunctionsStore.all(ctx);
}

export function getAllStaticConstants(ctx: CompilerContext) {
    return staticConstantsStore.all(ctx);
}

export function resolvePartialFields(ctx: CompilerContext, type: TypeDescription) {
    if (type.kind !== 'struct') return [];

    const partialFields = [];

    let remainingBits = 224;

    for (const f of type.fields) {
        // dicts are unsupported
        if (f.abi.type.kind !== "simple") break;

        let fieldBits = f.abi.type.optional ? 1 : 0;
        if (Number.isInteger(f.abi.type.format)) {
            fieldBits += f.abi.type.format as number;
        } else if (f.abi.type.format === "coins") {
            fieldBits += 124;
        } else if (f.abi.type.type === "address") {
            fieldBits += 267;
        } else if (f.abi.type.type === "bool") {
            fieldBits += 1;
        } else {
            // Unsupported - all others (slice, builder, nested structs, maps)
            break;
        }

        if (remainingBits - fieldBits >= 0) {
            remainingBits -= fieldBits;
            partialFields.push(f);
        } else {
            break;
        }
    }

    return partialFields;
}