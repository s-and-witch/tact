import { 
    Cell,
    Slice, 
    Address, 
    Builder, 
    beginCell, 
    ComputeError, 
    TupleItem, 
    TupleReader, 
    Dictionary, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    Contract, 
    ContractABI, 
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    let sc_0 = slice;
    let _code = sc_0.loadRef();
    let _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function storeTupleStateInit(source: StateInit) {
    let builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: bigint;
    raw: Cell;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw);
    };
}

export function loadContext(slice: Slice) {
    let sc_0 = slice;
    let _bounced = sc_0.loadBit();
    let _sender = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _raw = sc_0.loadRef();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function loadTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function storeTupleContext(source: Context) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw);
    return builder.build();
}

function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: bigint;
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
    };
}

export function loadSendParameters(slice: Slice) {
    let sc_0 = slice;
    let _bounce = sc_0.loadBit();
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _mode = sc_0.loadIntBig(257);
    let _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function loadTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function storeTupleSendParameters(source: SendParameters) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type Struct2 = {
    $$type: 'Struct2';
    v: bigint;
}

export function storeStruct2(src: Struct2) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2971230874, 32);
        b_0.storeInt(src.v, 257);
    };
}

export function loadStruct2(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2971230874) { throw Error('Invalid prefix'); }
    let _v = sc_0.loadIntBig(257);
    return { $$type: 'Struct2' as const, v: _v };
}

function loadTupleStruct2(source: TupleReader) {
    let _v = source.readBigNumber();
    return { $$type: 'Struct2' as const, v: _v };
}

function storeTupleStruct2(source: Struct2) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.v);
    return builder.build();
}

function dictValueParserStruct2(): DictionaryValue<Struct2> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeStruct2(src)).endCell());
        },
        parse: (src) => {
            return loadStruct2(src.loadRef().beginParse());
        }
    }
}

export type OptStruct = {
    $$type: 'OptStruct';
    s: Struct2 | null;
}

export function storeOptStruct(src: OptStruct) {
    return (builder: Builder) => {
        let b_0 = builder;
        if (src.s !== null && src.s !== undefined) { b_0.storeBit(true); b_0.store(storeStruct2(src.s)); } else { b_0.storeBit(false); }
    };
}

export function loadOptStruct(slice: Slice) {
    let sc_0 = slice;
    let _s = sc_0.loadBit() ? loadStruct2(sc_0) : null;
    return { $$type: 'OptStruct' as const, s: _s };
}

function loadTupleOptStruct(source: TupleReader) {
    const _s_p = source.readTupleOpt();
    const _s = _s_p ? loadTupleStruct2(_s_p) : null;
    return { $$type: 'OptStruct' as const, s: _s };
}

function storeTupleOptStruct(source: OptStruct) {
    let builder = new TupleBuilder();
    if (source.s !== null && source.s !== undefined) {
        builder.writeTuple(storeTupleStruct2(source.s));
    } else {
        builder.writeTuple(null);
    }
    return builder.build();
}

function dictValueParserOptStruct(): DictionaryValue<OptStruct> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeOptStruct(src)).endCell());
        },
        parse: (src) => {
            return loadOptStruct(src.loadRef().beginParse());
        }
    }
}

export type SomeGenericStruct = {
    $$type: 'SomeGenericStruct';
    value1: bigint;
    value2: bigint;
    value3: bigint;
    value4: bigint;
    value5: bigint;
}

export function storeSomeGenericStruct(src: SomeGenericStruct) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.value1, 257);
        b_0.storeInt(src.value2, 257);
        b_0.storeInt(src.value3, 257);
        let b_1 = new Builder();
        b_1.storeInt(src.value4, 257);
        b_1.storeInt(src.value5, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadSomeGenericStruct(slice: Slice) {
    let sc_0 = slice;
    let _value1 = sc_0.loadIntBig(257);
    let _value2 = sc_0.loadIntBig(257);
    let _value3 = sc_0.loadIntBig(257);
    let sc_1 = sc_0.loadRef().beginParse();
    let _value4 = sc_1.loadIntBig(257);
    let _value5 = sc_1.loadIntBig(257);
    return { $$type: 'SomeGenericStruct' as const, value1: _value1, value2: _value2, value3: _value3, value4: _value4, value5: _value5 };
}

function loadTupleSomeGenericStruct(source: TupleReader) {
    let _value1 = source.readBigNumber();
    let _value2 = source.readBigNumber();
    let _value3 = source.readBigNumber();
    let _value4 = source.readBigNumber();
    let _value5 = source.readBigNumber();
    return { $$type: 'SomeGenericStruct' as const, value1: _value1, value2: _value2, value3: _value3, value4: _value4, value5: _value5 };
}

function storeTupleSomeGenericStruct(source: SomeGenericStruct) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.value1);
    builder.writeNumber(source.value2);
    builder.writeNumber(source.value3);
    builder.writeNumber(source.value4);
    builder.writeNumber(source.value5);
    return builder.build();
}

function dictValueParserSomeGenericStruct(): DictionaryValue<SomeGenericStruct> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSomeGenericStruct(src)).endCell());
        },
        parse: (src) => {
            return loadSomeGenericStruct(src.loadRef().beginParse());
        }
    }
}

export type StructWithOptionals = {
    $$type: 'StructWithOptionals';
    a: bigint | null;
    b: boolean | null;
    c: Cell | null;
    d: Address | null;
    e: SomeGenericStruct | null;
}

export function storeStructWithOptionals(src: StructWithOptionals) {
    return (builder: Builder) => {
        let b_0 = builder;
        if (src.a !== null && src.a !== undefined) { b_0.storeBit(true).storeInt(src.a, 257); } else { b_0.storeBit(false); }
        if (src.b !== null && src.b !== undefined) { b_0.storeBit(true).storeBit(src.b); } else { b_0.storeBit(false); }
        if (src.c !== null && src.c !== undefined) { b_0.storeBit(true).storeRef(src.c); } else { b_0.storeBit(false); }
        b_0.storeAddress(src.d);
        let b_1 = new Builder();
        if (src.e !== null && src.e !== undefined) { b_1.storeBit(true); b_1.store(storeSomeGenericStruct(src.e)); } else { b_1.storeBit(false); }
        b_0.storeRef(b_1.endCell());
    };
}

export function loadStructWithOptionals(slice: Slice) {
    let sc_0 = slice;
    let _a = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    let _b = sc_0.loadBit() ? sc_0.loadBit() : null;
    let _c = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _d = sc_0.loadMaybeAddress();
    let sc_1 = sc_0.loadRef().beginParse();
    let _e = sc_1.loadBit() ? loadSomeGenericStruct(sc_1) : null;
    return { $$type: 'StructWithOptionals' as const, a: _a, b: _b, c: _c, d: _d, e: _e };
}

function loadTupleStructWithOptionals(source: TupleReader) {
    let _a = source.readBigNumberOpt();
    let _b = source.readBooleanOpt();
    let _c = source.readCellOpt();
    let _d = source.readAddressOpt();
    const _e_p = source.readTupleOpt();
    const _e = _e_p ? loadTupleSomeGenericStruct(_e_p) : null;
    return { $$type: 'StructWithOptionals' as const, a: _a, b: _b, c: _c, d: _d, e: _e };
}

function storeTupleStructWithOptionals(source: StructWithOptionals) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.a);
    builder.writeBoolean(source.b);
    builder.writeCell(source.c);
    builder.writeAddress(source.d);
    if (source.e !== null && source.e !== undefined) {
        builder.writeTuple(storeTupleSomeGenericStruct(source.e));
    } else {
        builder.writeTuple(null);
    }
    return builder.build();
}

function dictValueParserStructWithOptionals(): DictionaryValue<StructWithOptionals> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeStructWithOptionals(src)).endCell());
        },
        parse: (src) => {
            return loadStructWithOptionals(src.loadRef().beginParse());
        }
    }
}

export type Update = {
    $$type: 'Update';
    a: bigint | null;
    b: boolean | null;
    c: Cell | null;
    d: Address | null;
    e: SomeGenericStruct | null;
    f: StructWithOptionals | null;
}

export function storeUpdate(src: Update) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(357891325, 32);
        if (src.a !== null && src.a !== undefined) { b_0.storeBit(true).storeInt(src.a, 257); } else { b_0.storeBit(false); }
        if (src.b !== null && src.b !== undefined) { b_0.storeBit(true).storeBit(src.b); } else { b_0.storeBit(false); }
        if (src.c !== null && src.c !== undefined) { b_0.storeBit(true).storeRef(src.c); } else { b_0.storeBit(false); }
        b_0.storeAddress(src.d);
        let b_1 = new Builder();
        if (src.e !== null && src.e !== undefined) { b_1.storeBit(true); b_1.store(storeSomeGenericStruct(src.e)); } else { b_1.storeBit(false); }
        let b_2 = new Builder();
        if (src.f !== null && src.f !== undefined) { b_2.storeBit(true); b_2.store(storeStructWithOptionals(src.f)); } else { b_2.storeBit(false); }
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadUpdate(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 357891325) { throw Error('Invalid prefix'); }
    let _a = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    let _b = sc_0.loadBit() ? sc_0.loadBit() : null;
    let _c = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _d = sc_0.loadMaybeAddress();
    let sc_1 = sc_0.loadRef().beginParse();
    let _e = sc_1.loadBit() ? loadSomeGenericStruct(sc_1) : null;
    let sc_2 = sc_1.loadRef().beginParse();
    let _f = sc_2.loadBit() ? loadStructWithOptionals(sc_2) : null;
    return { $$type: 'Update' as const, a: _a, b: _b, c: _c, d: _d, e: _e, f: _f };
}

function loadTupleUpdate(source: TupleReader) {
    let _a = source.readBigNumberOpt();
    let _b = source.readBooleanOpt();
    let _c = source.readCellOpt();
    let _d = source.readAddressOpt();
    const _e_p = source.readTupleOpt();
    const _e = _e_p ? loadTupleSomeGenericStruct(_e_p) : null;
    const _f_p = source.readTupleOpt();
    const _f = _f_p ? loadTupleStructWithOptionals(_f_p) : null;
    return { $$type: 'Update' as const, a: _a, b: _b, c: _c, d: _d, e: _e, f: _f };
}

function storeTupleUpdate(source: Update) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.a);
    builder.writeBoolean(source.b);
    builder.writeCell(source.c);
    builder.writeAddress(source.d);
    if (source.e !== null && source.e !== undefined) {
        builder.writeTuple(storeTupleSomeGenericStruct(source.e));
    } else {
        builder.writeTuple(null);
    }
    if (source.f !== null && source.f !== undefined) {
        builder.writeTuple(storeTupleStructWithOptionals(source.f));
    } else {
        builder.writeTuple(null);
    }
    return builder.build();
}

function dictValueParserUpdate(): DictionaryValue<Update> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeUpdate(src)).endCell());
        },
        parse: (src) => {
            return loadUpdate(src.loadRef().beginParse());
        }
    }
}

 type Opt2_init_args = {
    $$type: 'Opt2_init_args';
}

function initOpt2_init_args(src: Opt2_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
    };
}

async function Opt2_init() {
    const __code = Cell.fromBase64('te6ccgECEAEAAfwAART/APSkE/S88sgLAQIBYgIDApbQAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggwm6AYEE/7qx8uCIVFBTA28E+GEC+GLbPFrbPPLggsj4QwHMfwHKAFkCzMzJ7VQEBQIBWAwNASjtRNDUAfhj0gABldTUWWwS4DDbPAYBlu2i7fsBkjB/4HAh10nCH5UwINcLH97AAI6t+QGC8LHKRhLgUa+E5D7eE6QE1S2I4dpYUjCRQ8T5mUFmPzb1uo6F2zx/2zHgkTDicAgBDvhDcW8B2zwHAKgB0PQEMG0BggCg1wGAEPQPb6Hy4IcBggCg1yICgBD0F8gByPQAyQHMcAHKAFggbrOOGn9YygABIG7y0IBvIYIQsRlimljLH4EBAc8AlTBwAcoA4skEJHFvAds8bds8cds8cW8BMG0wcQkJCQoAAjABBts8MAsABG8BALm7vRgnBc7D1dLK57HoTsOdZKhRtmgnCd1jUtK2R8syLTry398WI5gnAgVcAbgGdjlM5YOq5HJbLDgnAb1J3vlUWW8cdT094FWcMmgnDZecZujDm8J6y2oTE1uN3lgCAUgODwARsK+7UTQ0gABgAHWybuNDVpcGZzOi8vUW1ZVldiOXBQWmhXcnR0ZWJXM3ZvMkJjUWFlUmsxVDY0REtvbVJLalRYamlKRoIA==');
    const __system = Cell.fromBase64('te6cckECEgEAAgYAAQHAAQEFoWHtAgEU/wD0pBP0vPLICwMCAWIJBAIBWAgFAgFIBwYAdbJu40NWlwZnM6Ly9RbVlWV2I5cFBaaFdydHRlYlczdm8yQmNRYWVSazFUNjRES29tUktqVFhqaUpGggABGwr7tRNDSAAGAAubu9GCcFzsPV0srnsehOw51kqFG2aCcJ3WNS0rZHyzItOvLf3xYjmCcCBVwBuAZ2OUzlg6rkclssOCcBvUne+VRZbxx1PT3gVZwyaCcNl5xm6MObwnrLahMTW43eWAKW0AHQ0wMBcbCjAfpAASDXSYEBC7ry4Igg1wsKIIMJugGBBP+6sfLgiFRQUwNvBPhhAvhi2zxa2zzy4ILI+EMBzH8BygBZAszMye1UDwoBlu2i7fsBkjB/4HAh10nCH5UwINcLH97AAI6t+QGC8LHKRhLgUa+E5D7eE6QE1S2I4dpYUjCRQ8T5mUFmPzb1uo6F2zx/2zHgkTDicAsEJHFvAds8bds8cds8cW8BMG0wcQ4ODgwBBts8MA0ABG8BAAIwASjtRNDUAfhj0gABldTUWWwS4DDbPBABDvhDcW8B2zwRAKgB0PQEMG0BggCg1wGAEPQPb6Hy4IcBggCg1yICgBD0F8gByPQAyQHMcAHKAFggbrOOGn9YygABIG7y0IBvIYIQsRlimljLH4EBAc8AlTBwAcoA4snx6x4N');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initOpt2_init_args({ $$type: 'Opt2_init_args' })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const Opt2_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack undeflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    13: { message: `Out of gas error` },
    32: { message: `Method ID not found` },
    34: { message: `Action is invalid or not supported` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
    137: { message: `Masterchain support is not enabled for this contract` },
}

const Opt2_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Struct2","header":2971230874,"fields":[{"name":"v","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"OptStruct","header":null,"fields":[{"name":"s","type":{"kind":"simple","type":"Struct2","optional":true}}]},
    {"name":"SomeGenericStruct","header":null,"fields":[{"name":"value1","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"value2","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"value3","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"value4","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"value5","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"StructWithOptionals","header":null,"fields":[{"name":"a","type":{"kind":"simple","type":"int","optional":true,"format":257}},{"name":"b","type":{"kind":"simple","type":"bool","optional":true}},{"name":"c","type":{"kind":"simple","type":"cell","optional":true}},{"name":"d","type":{"kind":"simple","type":"address","optional":true}},{"name":"e","type":{"kind":"simple","type":"SomeGenericStruct","optional":true}}]},
    {"name":"Update","header":357891325,"fields":[{"name":"a","type":{"kind":"simple","type":"int","optional":true,"format":257}},{"name":"b","type":{"kind":"simple","type":"bool","optional":true}},{"name":"c","type":{"kind":"simple","type":"cell","optional":true}},{"name":"d","type":{"kind":"simple","type":"address","optional":true}},{"name":"e","type":{"kind":"simple","type":"SomeGenericStruct","optional":true}},{"name":"f","type":{"kind":"simple","type":"StructWithOptionals","optional":true}}]},
]

const Opt2_getters: ABIGetter[] = [
]

const Opt2_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"text","text":"Test"}},
]

export class Opt2 implements Contract {
    
    static async init() {
        return await Opt2_init();
    }
    
    static async fromInit() {
        const init = await Opt2_init();
        const address = contractAddress(0, init);
        return new Opt2(address, init);
    }
    
    static fromAddress(address: Address) {
        return new Opt2(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  Opt2_types,
        getters: Opt2_getters,
        receivers: Opt2_receivers,
        errors: Opt2_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: 'Test') {
        
        let body: Cell | null = null;
        if (message === 'Test') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
}