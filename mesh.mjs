#!/usr/bin/env node
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// ../../node_modules/canonicalize/lib/canonicalize.js
var require_canonicalize = __commonJS((exports, module) => {
  module.exports = function serialize(object) {
    if (typeof object === "number" && isNaN(object)) {
      throw new Error("NaN is not allowed");
    }
    if (typeof object === "number" && !isFinite(object)) {
      throw new Error("Infinity is not allowed");
    }
    if (object === null || typeof object !== "object") {
      return JSON.stringify(object);
    }
    if (object.toJSON instanceof Function) {
      return serialize(object.toJSON());
    }
    if (Array.isArray(object)) {
      const values2 = object.reduce((t, cv, ci) => {
        const comma = ci === 0 ? "" : ",";
        const value = cv === undefined || typeof cv === "symbol" ? null : cv;
        return `${t}${comma}${serialize(value)}`;
      }, "");
      return `[${values2}]`;
    }
    const values = Object.keys(object).sort().reduce((t, cv) => {
      if (object[cv] === undefined || typeof object[cv] === "symbol") {
        return t;
      }
      const comma = t.length === 0 ? "" : ",";
      return `${t}${comma}${serialize(cv)}:${serialize(object[cv])}`;
    }, "");
    return `{${values}}`;
  };
});

// src/suppress-warnings.ts
var passthrough = process.emitWarning.bind(process);
function isWebStorageNoise(warning, type) {
  const message = typeof warning === "string" ? warning : warning?.message ?? "";
  return /localstorage-file|localStorage is not available|web ?storage/i.test(message) || type === "ExperimentalWarning" && /localstorage/i.test(message);
}
process.emitWarning = (warning, ...rest) => {
  const opt = rest[0];
  const type = typeof opt === "string" ? opt : opt?.type;
  if (isWebStorageNoise(warning, type))
    return;
  return passthrough(warning, ...rest);
};

// src/config.ts
import * as fs6 from "node:fs";
import * as path6 from "node:path";
import * as os3 from "node:os";

// ../../node_modules/@noble/ed25519/index.js
/*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
var ed25519_CURVE = {
  p: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,
  n: 0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,
  h: 8n,
  a: 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,
  d: 0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,
  Gx: 0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,
  Gy: 0x6666666666666666666666666666666666666666666666666666666666666658n
};
var { p: P, n: N, Gx, Gy, a: _a, d: _d } = ed25519_CURVE;
var h = 8n;
var L = 32;
var L2 = 64;
var err = (m = "") => {
  throw new Error(m);
};
var isBig = (n) => typeof n === "bigint";
var isStr = (s) => typeof s === "string";
var isBytes = (a) => a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
var abytes = (a, l) => !isBytes(a) || typeof l === "number" && l > 0 && a.length !== l ? err("Uint8Array expected") : a;
var u8n = (len) => new Uint8Array(len);
var u8fr = (buf) => Uint8Array.from(buf);
var padh = (n, pad) => n.toString(16).padStart(pad, "0");
var bytesToHex = (b) => Array.from(abytes(b)).map((e) => padh(e, 2)).join("");
var C = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
var _ch = (ch) => {
  if (ch >= C._0 && ch <= C._9)
    return ch - C._0;
  if (ch >= C.A && ch <= C.F)
    return ch - (C.A - 10);
  if (ch >= C.a && ch <= C.f)
    return ch - (C.a - 10);
  return;
};
var hexToBytes = (hex) => {
  const e = "hex invalid";
  if (!isStr(hex))
    return err(e);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    return err(e);
  const array = u8n(al);
  for (let ai = 0, hi = 0;ai < al; ai++, hi += 2) {
    const n1 = _ch(hex.charCodeAt(hi));
    const n2 = _ch(hex.charCodeAt(hi + 1));
    if (n1 === undefined || n2 === undefined)
      return err(e);
    array[ai] = n1 * 16 + n2;
  }
  return array;
};
var toU8 = (a, len) => abytes(isStr(a) ? hexToBytes(a) : u8fr(abytes(a)), len);
var cr = () => globalThis?.crypto;
var subtle = () => cr()?.subtle ?? err("crypto.subtle must be defined");
var concatBytes = (...arrs) => {
  const r = u8n(arrs.reduce((sum, a) => sum + abytes(a).length, 0));
  let pad = 0;
  arrs.forEach((a) => {
    r.set(a, pad);
    pad += a.length;
  });
  return r;
};
var randomBytes = (len = L) => {
  const c = cr();
  return c.getRandomValues(u8n(len));
};
var big = BigInt;
var arange = (n, min, max, msg = "bad number: out of range") => isBig(n) && min <= n && n < max ? n : err(msg);
var M = (a, b = P) => {
  const r = a % b;
  return r >= 0n ? r : b + r;
};
var modN = (a) => M(a, N);
var invert = (num, md) => {
  if (num === 0n || md <= 0n)
    err("no inverse n=" + num + " mod=" + md);
  let a = M(num, md), b = md, x = 0n, y = 1n, u = 1n, v = 0n;
  while (a !== 0n) {
    const q = b / a, r = b % a;
    const m = x - u * q, n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  return b === 1n ? M(x, md) : err("no inverse");
};
var callHash = (name) => {
  const fn = etc[name];
  if (typeof fn !== "function")
    err("hashes." + name + " not set");
  return fn;
};
var apoint = (p) => p instanceof Point ? p : err("Point expected");
var B256 = 2n ** 256n;

class Point {
  static BASE;
  static ZERO;
  ex;
  ey;
  ez;
  et;
  constructor(ex, ey, ez, et) {
    const max = B256;
    this.ex = arange(ex, 0n, max);
    this.ey = arange(ey, 0n, max);
    this.ez = arange(ez, 1n, max);
    this.et = arange(et, 0n, max);
    Object.freeze(this);
  }
  static fromAffine(p) {
    return new Point(p.x, p.y, 1n, M(p.x * p.y));
  }
  static fromBytes(hex, zip215 = false) {
    const d = _d;
    const normed = u8fr(abytes(hex, L));
    const lastByte = hex[31];
    normed[31] = lastByte & ~128;
    const y = bytesToNumLE(normed);
    const max = zip215 ? B256 : P;
    arange(y, 0n, max);
    const y2 = M(y * y);
    const u = M(y2 - 1n);
    const v = M(d * y2 + 1n);
    let { isValid, value: x } = uvRatio(u, v);
    if (!isValid)
      err("bad point: y not sqrt");
    const isXOdd = (x & 1n) === 1n;
    const isLastByteOdd = (lastByte & 128) !== 0;
    if (!zip215 && x === 0n && isLastByteOdd)
      err("bad point: x==0, isLastByteOdd");
    if (isLastByteOdd !== isXOdd)
      x = M(-x);
    return new Point(x, y, 1n, M(x * y));
  }
  assertValidity() {
    const a = _a;
    const d = _d;
    const p = this;
    if (p.is0())
      throw new Error("bad point: ZERO");
    const { ex: X, ey: Y, ez: Z, et: T } = p;
    const X2 = M(X * X);
    const Y2 = M(Y * Y);
    const Z2 = M(Z * Z);
    const Z4 = M(Z2 * Z2);
    const aX2 = M(X2 * a);
    const left = M(Z2 * M(aX2 + Y2));
    const right = M(Z4 + M(d * M(X2 * Y2)));
    if (left !== right)
      throw new Error("bad point: equation left != right (1)");
    const XY = M(X * Y);
    const ZT = M(Z * T);
    if (XY !== ZT)
      throw new Error("bad point: equation left != right (2)");
    return this;
  }
  equals(other) {
    const { ex: X1, ey: Y1, ez: Z1 } = this;
    const { ex: X2, ey: Y2, ez: Z2 } = apoint(other);
    const X1Z2 = M(X1 * Z2);
    const X2Z1 = M(X2 * Z1);
    const Y1Z2 = M(Y1 * Z2);
    const Y2Z1 = M(Y2 * Z1);
    return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
  }
  is0() {
    return this.equals(I);
  }
  negate() {
    return new Point(M(-this.ex), this.ey, this.ez, M(-this.et));
  }
  double() {
    const { ex: X1, ey: Y1, ez: Z1 } = this;
    const a = _a;
    const A = M(X1 * X1);
    const B = M(Y1 * Y1);
    const C2 = M(2n * M(Z1 * Z1));
    const D = M(a * A);
    const x1y1 = X1 + Y1;
    const E = M(M(x1y1 * x1y1) - A - B);
    const G = D + B;
    const F = G - C2;
    const H = D - B;
    const X3 = M(E * F);
    const Y3 = M(G * H);
    const T3 = M(E * H);
    const Z3 = M(F * G);
    return new Point(X3, Y3, Z3, T3);
  }
  add(other) {
    const { ex: X1, ey: Y1, ez: Z1, et: T1 } = this;
    const { ex: X2, ey: Y2, ez: Z2, et: T2 } = apoint(other);
    const a = _a;
    const d = _d;
    const A = M(X1 * X2);
    const B = M(Y1 * Y2);
    const C2 = M(T1 * d * T2);
    const D = M(Z1 * Z2);
    const E = M((X1 + Y1) * (X2 + Y2) - A - B);
    const F = M(D - C2);
    const G = M(D + C2);
    const H = M(B - a * A);
    const X3 = M(E * F);
    const Y3 = M(G * H);
    const T3 = M(E * H);
    const Z3 = M(F * G);
    return new Point(X3, Y3, Z3, T3);
  }
  multiply(n, safe = true) {
    if (!safe && (n === 0n || this.is0()))
      return I;
    arange(n, 1n, N);
    if (n === 1n)
      return this;
    if (this.equals(G))
      return wNAF(n).p;
    let p = I;
    let f = G;
    for (let d = this;n > 0n; d = d.double(), n >>= 1n) {
      if (n & 1n)
        p = p.add(d);
      else if (safe)
        f = f.add(d);
    }
    return p;
  }
  toAffine() {
    const { ex: x, ey: y, ez: z } = this;
    if (this.equals(I))
      return { x: 0n, y: 1n };
    const iz = invert(z, P);
    if (M(z * iz) !== 1n)
      err("invalid inverse");
    return { x: M(x * iz), y: M(y * iz) };
  }
  toBytes() {
    const { x, y } = this.assertValidity().toAffine();
    const b = numTo32bLE(y);
    b[31] |= x & 1n ? 128 : 0;
    return b;
  }
  toHex() {
    return bytesToHex(this.toBytes());
  }
  clearCofactor() {
    return this.multiply(big(h), false);
  }
  isSmallOrder() {
    return this.clearCofactor().is0();
  }
  isTorsionFree() {
    let p = this.multiply(N / 2n, false).double();
    if (N % 2n)
      p = p.add(this);
    return p.is0();
  }
  static fromHex(hex, zip215) {
    return Point.fromBytes(toU8(hex), zip215);
  }
  get x() {
    return this.toAffine().x;
  }
  get y() {
    return this.toAffine().y;
  }
  toRawBytes() {
    return this.toBytes();
  }
}
var G = new Point(Gx, Gy, 1n, M(Gx * Gy));
var I = new Point(0n, 1n, 1n, 0n);
Point.BASE = G;
Point.ZERO = I;
var numTo32bLE = (num) => hexToBytes(padh(arange(num, 0n, B256), L2)).reverse();
var bytesToNumLE = (b) => big("0x" + bytesToHex(u8fr(abytes(b)).reverse()));
var pow2 = (x, power) => {
  let r = x;
  while (power-- > 0n) {
    r *= r;
    r %= P;
  }
  return r;
};
var pow_2_252_3 = (x) => {
  const x2 = x * x % P;
  const b2 = x2 * x % P;
  const b4 = pow2(b2, 2n) * b2 % P;
  const b5 = pow2(b4, 1n) * x % P;
  const b10 = pow2(b5, 5n) * b5 % P;
  const b20 = pow2(b10, 10n) * b10 % P;
  const b40 = pow2(b20, 20n) * b20 % P;
  const b80 = pow2(b40, 40n) * b40 % P;
  const b160 = pow2(b80, 80n) * b80 % P;
  const b240 = pow2(b160, 80n) * b80 % P;
  const b250 = pow2(b240, 10n) * b10 % P;
  const pow_p_5_8 = pow2(b250, 2n) * x % P;
  return { pow_p_5_8, b2 };
};
var RM1 = 0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n;
var uvRatio = (u, v) => {
  const v3 = M(v * v * v);
  const v7 = M(v3 * v3 * v);
  const pow = pow_2_252_3(u * v7).pow_p_5_8;
  let x = M(u * v3 * pow);
  const vx2 = M(v * x * x);
  const root1 = x;
  const root2 = M(x * RM1);
  const useRoot1 = vx2 === u;
  const useRoot2 = vx2 === M(-u);
  const noRoot = vx2 === M(-u * RM1);
  if (useRoot1)
    x = root1;
  if (useRoot2 || noRoot)
    x = root2;
  if ((M(x) & 1n) === 1n)
    x = M(-x);
  return { isValid: useRoot1 || useRoot2, value: x };
};
var modL_LE = (hash) => modN(bytesToNumLE(hash));
var sha512a = (...m) => etc.sha512Async(...m);
var sha512s = (...m) => callHash("sha512Sync")(...m);
var hash2extK = (hashed) => {
  const head = hashed.slice(0, L);
  head[0] &= 248;
  head[31] &= 127;
  head[31] |= 64;
  const prefix = hashed.slice(L, L2);
  const scalar = modL_LE(head);
  const point = G.multiply(scalar);
  const pointBytes = point.toBytes();
  return { head, prefix, scalar, point, pointBytes };
};
var getExtendedPublicKeyAsync = (priv) => sha512a(toU8(priv, L)).then(hash2extK);
var getExtendedPublicKey = (priv) => hash2extK(sha512s(toU8(priv, L)));
var getPublicKey = (priv) => getExtendedPublicKey(priv).pointBytes;
var hashFinishS = (res) => res.finish(sha512s(res.hashable));
var _sign = (e, rBytes, msg) => {
  const { pointBytes: P2, scalar: s } = e;
  const r = modL_LE(rBytes);
  const R = G.multiply(r).toBytes();
  const hashable = concatBytes(R, P2, msg);
  const finish = (hashed) => {
    const S = modN(r + modL_LE(hashed) * s);
    return abytes(concatBytes(R, numTo32bLE(S)), L2);
  };
  return { hashable, finish };
};
var sign = (msg, privKey) => {
  const m = toU8(msg);
  const e = getExtendedPublicKey(privKey);
  const rBytes = sha512s(e.prefix, m);
  return hashFinishS(_sign(e, rBytes, m));
};
var etc = {
  sha512Async: async (...messages) => {
    const s = subtle();
    const m = concatBytes(...messages);
    return u8n(await s.digest("SHA-512", m.buffer));
  },
  sha512Sync: undefined,
  bytesToHex,
  hexToBytes,
  concatBytes,
  mod: M,
  invert,
  randomBytes
};
var utils = {
  getExtendedPublicKeyAsync,
  getExtendedPublicKey,
  randomPrivateKey: () => randomBytes(L),
  precompute: (w = 8, p = G) => {
    p.multiply(3n);
    return p;
  }
};
var W = 8;
var scalarBits = 256;
var pwindows = Math.ceil(scalarBits / W) + 1;
var pwindowSize = 2 ** (W - 1);
var precompute = () => {
  const points = [];
  let p = G;
  let b = p;
  for (let w = 0;w < pwindows; w++) {
    b = p;
    points.push(b);
    for (let i = 1;i < pwindowSize; i++) {
      b = b.add(p);
      points.push(b);
    }
    p = b.double();
  }
  return points;
};
var Gpows = undefined;
var ctneg = (cnd, p) => {
  const n = p.negate();
  return cnd ? n : p;
};
var wNAF = (n) => {
  const comp = Gpows || (Gpows = precompute());
  let p = I;
  let f = G;
  const pow_2_w = 2 ** W;
  const maxNum = pow_2_w;
  const mask = big(pow_2_w - 1);
  const shiftBy = big(W);
  for (let w = 0;w < pwindows; w++) {
    let wbits = Number(n & mask);
    n >>= shiftBy;
    if (wbits > pwindowSize) {
      wbits -= maxNum;
      n += 1n;
    }
    const off = w * pwindowSize;
    const offF = off;
    const offP = off + Math.abs(wbits) - 1;
    const isEven = w % 2 !== 0;
    const isNeg = wbits < 0;
    if (wbits === 0) {
      f = f.add(ctneg(isEven, comp[offF]));
    } else {
      p = p.add(ctneg(isNeg, comp[offP]));
    }
  }
  return { p, f };
};

// ../../node_modules/@noble/hashes/esm/utils.js
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(b, ...lengths) {
  if (!isBytes2(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes2(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function clean(...arrays) {
  for (let i = 0;i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function")();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex2(bytes) {
  abytes2(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0;i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes2(data);
  return data;
}
class Hash {
}
function createHasher(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}

// ../../node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE);
  const _32n = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n & _u32_max);
  const wl = Number(value & _u32_max);
  const h2 = isLE ? 4 : 0;
  const l = isLE ? 0 : 4;
  view.setUint32(byteOffset + h2, wh, isLE);
  view.setUint32(byteOffset + l, wl, isLE);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}

class HashMD extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    data = toBytes(data);
    abytes2(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0;pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (;blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos;i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0;i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor);
    to.set(...this.get());
    const { blockLen, buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (length % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
}
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA512_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);

// ../../node_modules/@noble/hashes/esm/_u64.js
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0;i < len; i++) {
    const { h: h2, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h2, l];
  }
  return [Ah, Al];
}
var shrSH = (h2, _l, s) => h2 >>> s;
var shrSL = (h2, l, s) => h2 << 32 - s | l >>> s;
var rotrSH = (h2, l, s) => h2 >>> s | l << 32 - s;
var rotrSL = (h2, l, s) => h2 << 32 - s | l >>> s;
var rotrBH = (h2, l, s) => h2 << 64 - s | l >>> s - 32;
var rotrBL = (h2, l, s) => h2 >>> s - 32 | l << 64 - s;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

// ../../node_modules/@noble/hashes/esm/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);

class SHA256 extends HashMD {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV[0] | 0;
    this.B = SHA256_IV[1] | 0;
    this.C = SHA256_IV[2] | 0;
    this.D = SHA256_IV[3] | 0;
    this.E = SHA256_IV[4] | 0;
    this.F = SHA256_IV[5] | 0;
    this.G = SHA256_IV[6] | 0;
    this.H = SHA256_IV[7] | 0;
  }
  get() {
    const { A, B, C: C2, D, E, F, G: G2, H } = this;
    return [A, B, C2, D, E, F, G2, H];
  }
  set(A, B, C2, D, E, F, G2, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C2 | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G2 | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0;i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16;i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C: C2, D, E, F, G: G2, H } = this;
    for (let i = 0;i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G2) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C2) | 0;
      H = G2;
      G2 = F;
      F = E;
      E = D + T1 | 0;
      D = C2;
      C2 = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C2 = C2 + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G2 = G2 + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C2, D, E, F, G2, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
}
var K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);

class SHA512 extends HashMD {
  constructor(outputLen = 64) {
    super(128, outputLen, 16, false);
    this.Ah = SHA512_IV[0] | 0;
    this.Al = SHA512_IV[1] | 0;
    this.Bh = SHA512_IV[2] | 0;
    this.Bl = SHA512_IV[3] | 0;
    this.Ch = SHA512_IV[4] | 0;
    this.Cl = SHA512_IV[5] | 0;
    this.Dh = SHA512_IV[6] | 0;
    this.Dl = SHA512_IV[7] | 0;
    this.Eh = SHA512_IV[8] | 0;
    this.El = SHA512_IV[9] | 0;
    this.Fh = SHA512_IV[10] | 0;
    this.Fl = SHA512_IV[11] | 0;
    this.Gh = SHA512_IV[12] | 0;
    this.Gl = SHA512_IV[13] | 0;
    this.Hh = SHA512_IV[14] | 0;
    this.Hl = SHA512_IV[15] | 0;
  }
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i = 0;i < 16; i++, offset += 4) {
      SHA512_W_H[i] = view.getUint32(offset);
      SHA512_W_L[i] = view.getUint32(offset += 4);
    }
    for (let i = 16;i < 80; i++) {
      const W15h = SHA512_W_H[i - 15] | 0;
      const W15l = SHA512_W_L[i - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i - 2] | 0;
      const W2l = SHA512_W_L[i - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
      SHA512_W_H[i] = SUMh | 0;
      SHA512_W_L[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0;i < 80; i++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    clean(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
}
var sha256 = /* @__PURE__ */ createHasher(() => new SHA256);
var sha512 = /* @__PURE__ */ createHasher(() => new SHA512);

// ../../node_modules/@noble/hashes/esm/sha256.js
var sha2562 = sha256;

// ../../node_modules/@noble/hashes/esm/sha512.js
var sha5122 = sha512;

// ../proto/src/envelope.ts
var import_canonicalize = __toESM(require_canonicalize(), 1);
etc.sha512Sync = (...m) => sha5122(etc.concatBytes(...m));
function bytesToBase64url(bytes) {
  let binary = "";
  for (const b of bytes)
    binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function encodePubkey(bytes) {
  return "ed25519-pk:" + bytesToBase64url(bytes);
}
function encodeSig(bytes) {
  return "ed25519:" + bytesToBase64url(bytes);
}
var _encoder = new TextEncoder;
function jcs(v) {
  const result = import_canonicalize.default(v);
  if (result === undefined)
    throw new Error("jcs: canonicalization returned undefined");
  return result;
}
function sha256Hex(s) {
  return bytesToHex2(sha2562(_encoder.encode(s)));
}
function keyCommitment(pubkey) {
  return "sha256:" + sha256Hex(pubkey);
}
function signableBytes(sub) {
  const { sig: _sig, ...rest } = sub;
  return _encoder.encode(jcs(rest));
}
function signSubmission(sub, secretKeyBytes) {
  const bytes = signableBytes(sub);
  const sigBytes = sign(bytes, secretKeyBytes);
  return encodeSig(sigBytes);
}
function signBytes(bytes, secret) {
  return encodeSig(sign(bytes, secret));
}
function keygen() {
  const secret = utils.randomPrivateKey();
  const pubkeyBytes = getPublicKey(secret);
  return { pubkey: encodePubkey(pubkeyBytes), secret };
}
// ../proto/src/path.ts
var WINDOWS_RESERVED = {
  con: true,
  prn: true,
  aux: true,
  nul: true,
  com1: true,
  com2: true,
  com3: true,
  com4: true,
  com5: true,
  com6: true,
  com7: true,
  com8: true,
  com9: true,
  lpt1: true,
  lpt2: true,
  lpt3: true,
  lpt4: true,
  lpt5: true,
  lpt6: true,
  lpt7: true,
  lpt8: true,
  lpt9: true
};
function normalizeId(path) {
  return path.normalize("NFC").replace(/\\/g, "/").split("/").filter((s) => s.length > 0).map((s) => s.toLowerCase()).join("/");
}
function isLegalPath(path) {
  if (/[\x00-\x1f\x7f]/.test(path))
    return { ok: false, reason: "control-char" };
  const segments = path.replace(/\\/g, "/").split("/").filter((s) => s.length > 0);
  if (segments.length === 0)
    return { ok: false, reason: "empty path" };
  let hasReservedLocalState = false;
  for (const seg of segments) {
    const normalizedSeg = seg.normalize("NFC").toLowerCase();
    if (normalizedSeg === ".mesh" || normalizedSeg === ".meshignore") {
      hasReservedLocalState = true;
    }
    if (seg === "." || seg === "..")
      return { ok: false, reason: `path-traversal: ${seg}` };
    const stem = normalizedSeg.includes(".") ? normalizedSeg.slice(0, normalizedSeg.indexOf(".")) : normalizedSeg;
    if (WINDOWS_RESERVED[stem])
      return { ok: false, reason: `windows-reserved: ${seg}` };
    if (/[<>:"|?*]/.test(seg))
      return { ok: false, reason: `windows-illegal-char: ${seg}` };
  }
  if (hasReservedLocalState)
    return { ok: false, reason: "reserved local mesh state" };
  return { ok: true };
}

// ../proto/src/access.ts
var GRADE_ORDER = { discover: 1, read: 2, write: 3, exclusive: 4 };
function gte(a, b) {
  return GRADE_ORDER[a] >= GRADE_ORDER[b];
}
function isAccessGrade(s) {
  return s in GRADE_ORDER;
}
function prefixBase(prefix) {
  return prefix.replace(/\/\*\*$/, "").replace(/\/\*$/, "");
}
function prefixCovers(prefix, path) {
  const base = prefixBase(prefix);
  return path === base || path.startsWith(base + "/");
}
function isOpenClosed(v) {
  return v === "open" || v === "closed";
}
function normalizeDefaultAccess(v) {
  if (isOpenClosed(v))
    return { discover: v, write: v };
  if (v !== null && typeof v === "object") {
    const o = v;
    return {
      discover: isOpenClosed(o.discover) ? o.discover : "open",
      write: isOpenClosed(o.write) ? o.write : "open"
    };
  }
  return { discover: "open", write: "open" };
}

// ../proto/src/limits.ts
var MAX_FTS_MAX_FILE_BYTES = 5 * 1024 * 1024;
var MIN_ARTIFACT_MAX_BYTES = 1024 * 1024;
var MAX_ARTIFACT_MAX_BYTES = 500 * 1024 * 1024;
var DEFAULT_ARTIFACT_MAX_BYTES = 25 * 1024 * 1024;

// ../proto/src/performatives.ts
var PERFORMATIVE_SET = {
  request: true,
  inform: true,
  deliver: true,
  announce: true,
  claim: true,
  release: true,
  accept: true,
  reject: true,
  escalate: true,
  signal: true,
  "key.rotate": true,
  "file.write": true,
  "file.delete": true,
  "file.lock": true,
  "file.unlock": true,
  "file.request": true,
  "system.genesis": true,
  "system.join": true,
  "system.leave": true,
  "system.roles": true,
  "system.grant": true,
  "system.role": true,
  "system.config": true,
  "system.lease_clear": true,
  "system.revoke": true,
  "decide.request": true,
  "decide.resolve": true,
  "system.decision_lapse": true,
  "system.role_lapse": true,
  "escalate.ack": true,
  "system.checkpoint": true
};
var CONDITIONS = ["working", "stuck", "gone"];
var ROOM_ONLY = {
  escalate: true,
  "system.genesis": true,
  "system.join": true,
  "system.leave": true,
  "system.roles": true,
  "system.grant": true,
  "system.role": true,
  "system.config": true,
  "system.lease_clear": true,
  "system.revoke": true,
  "system.decision_lapse": true,
  "system.role_lapse": true,
  "system.checkpoint": true
};
var PARTICIPANT_PERFORMATIVES = Object.keys(PERFORMATIVE_SET).filter((p) => !(p in ROOM_ONLY));
var COLLAB_LANE_EXCLUDE = ["file.*", "system.*"];
// ../proto/src/composer.ts
var GRADES = Object.keys(GRADE_ORDER);
var COMPOSER_SPEC = [
  {
    performative: "request",
    label: "Request",
    hint: "Ask the room for something (free-text chat).",
    fields: [
      { target: "body", label: "Message", type: "text", required: true, sample: "Can someone look at the flaky CI?" },
      { target: "thread", label: "Thread", type: "text", required: false, sample: "ci-flake" }
    ]
  },
  {
    performative: "inform",
    label: "Inform",
    hint: "Share information — no reply expected.",
    fields: [
      { target: "body", label: "Message", type: "text", required: true, sample: "Deploy finished, all green." },
      { target: "task_ref", label: "Task", type: "text", required: false, sample: "t-123" },
      { target: "thread", label: "Thread", type: "text", required: false, sample: "deploys" }
    ]
  },
  {
    performative: "announce",
    label: "Announce task",
    hint: "Post a task others can claim (volunteer mode).",
    fixedData: { mode: "volunteer" },
    fields: [
      { target: "task_ref", label: "Task id", type: "text", required: true, sample: "t-123" },
      { target: "body", label: "Description", type: "text", required: true, sample: "Fix the login redirect loop" },
      { target: "data.verdict_by", label: "Verdict by", type: "csv", required: false, sample: "alice@team" },
      { target: "data.claim_window_s", label: "Claim window (s)", type: "number", required: false, sample: "300" },
      { target: "data.lease_ttl_s", label: "Lease TTL (s)", type: "number", required: false, sample: "900" },
      { target: "data.max_claim_s", label: "Max claim (s)", type: "number", required: false, sample: "3600" },
      { target: "data.depends_on", label: "Depends on", type: "csv", required: false, sample: "t-100,t-101" }
    ]
  },
  {
    performative: "claim",
    label: "Claim",
    hint: "Take an announced task.",
    fields: [
      { target: "task_ref", label: "Task id", type: "text", required: true, sample: "t-123" },
      { target: "body", label: "Note", type: "text", required: false, sample: "Taking this one." }
    ]
  },
  {
    performative: "release",
    label: "Release",
    hint: "Give a claimed task back to the room.",
    fields: [
      { target: "task_ref", label: "Task id", type: "text", required: true, sample: "t-123" },
      { target: "body", label: "Note", type: "text", required: false, sample: "Out of my depth — releasing." }
    ]
  },
  {
    performative: "deliver",
    label: "Deliver",
    hint: "Hand in work for a task (needs at least one artifact ref).",
    fields: [
      { target: "task_ref", label: "Task id", type: "text", required: true, sample: "t-123" },
      { target: "artifacts", label: "Artifacts", type: "csv", required: true, sample: "pr://org/repo/42" },
      { target: "body", label: "Note", type: "text", required: false, sample: "PR up, tests green." }
    ]
  },
  {
    performative: "accept",
    label: "Accept",
    hint: "Accept a delivery (verdict).",
    fields: [
      { target: "task_ref", label: "Task id", type: "text", required: true, sample: "t-123" },
      { target: "body", label: "Note", type: "text", required: false, sample: "Looks good — merged." }
    ]
  },
  {
    performative: "reject",
    label: "Reject",
    hint: "Reject a delivery (verdict, with reason).",
    fields: [
      { target: "task_ref", label: "Task id", type: "text", required: true, sample: "t-123" },
      { target: "body", label: "Reason", type: "text", required: false, sample: "Breaks the mobile layout." }
    ]
  },
  {
    performative: "signal",
    label: "Signal",
    hint: "Broadcast your liveness condition.",
    fields: [
      { target: "data.condition", label: "Condition", type: "enum", options: CONDITIONS, required: true, sample: "working" },
      { target: "body", label: "Note", type: "text", required: false, sample: "Deep in the merge conflict." }
    ]
  },
  {
    performative: "decide.request",
    label: "Ask for decision",
    hint: "Open a decision with a named authority.",
    fields: [
      { target: "thread", label: "Decision id", type: "text", required: true, sample: "d-1" },
      { target: "data.question", label: "Question", type: "text", required: true, sample: "Ship option A or B?" },
      { target: "data.authority", label: "Authority", type: "csv", required: true, sample: "id:alice@team,role:architect" },
      { target: "data.deadline", label: "Deadline (ISO)", type: "text", required: false, sample: "2026-08-01T12:00:00Z" }
    ]
  },
  {
    performative: "decide.resolve",
    label: "Resolve decision",
    hint: "Answer an open decision you hold authority over.",
    fields: [
      { target: "thread", label: "Decision id", type: "text", required: true, sample: "d-1" },
      { target: "data.resolution", label: "Resolution", type: "text", required: true, sample: "Option A" }
    ]
  },
  {
    performative: "escalate.ack",
    label: "Ack escalation",
    hint: "Mark a room escalation as handled.",
    fields: [
      { target: "data.escalate_seq", label: "Escalation seq", type: "number", required: true, sample: "42" }
    ]
  },
  {
    performative: "file.request",
    label: "Request file access",
    hint: "Post an advisory access request for a path.",
    fields: [
      { target: "data.path", label: "Path", type: "text", required: true, sample: "src/app.ts" },
      { target: "data.grade", label: "Grade", type: "enum", options: GRADES, required: true, sample: "read" }
    ]
  }
];
// ../proto/src/machine.ts
var MAX_DURATION_S = 30 * 24 * 60 * 60;
// ../proto/src/decisions.ts
function decisionsAwaitingAuthority(decisions, selfId, roles) {
  return decisions.filter((d) => d.status === "open" && (d.authority.includes(`id:${selfId}`) || roles.some((r) => d.authority.includes(`role:${r}`))));
}
// ../proto/src/ws.ts
var WS_PING = '{"type":"ping"}';
// ../proto/src/policy.ts
var CODE_EXTS = {
  ts: true,
  tsx: true,
  js: true,
  jsx: true,
  mjs: true,
  cjs: true,
  go: true,
  rs: true,
  py: true,
  rb: true,
  java: true,
  cs: true,
  c: true,
  cc: true,
  cpp: true,
  cxx: true,
  h: true,
  hpp: true,
  swift: true,
  kt: true,
  kts: true,
  scala: true,
  hs: true,
  ex: true,
  exs: true,
  clj: true,
  cljs: true,
  php: true,
  sh: true,
  bash: true,
  lua: true,
  r: true,
  jl: true,
  sql: true
};
function globToRegex(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const pattern = escaped.replace(/\*\*/g, "\x00").replace(/\*/g, "[^/]*").replace(/\x00/g, ".*");
  return new RegExp("^" + pattern + "$");
}
function policyFor(path, overrides = []) {
  for (const o of overrides) {
    if (globToRegex(o.glob).test(path))
      return o.policy;
  }
  const dot = path.lastIndexOf(".");
  const ext = dot !== -1 ? path.slice(dot + 1).toLowerCase() : "";
  return CODE_EXTS[ext] === true ? "merge" : "shared";
}
// ../proto/src/charter.ts
var CHARTER_ROOM_PATH = "charter/room.md";
var CHARTER_ROLES_PREFIX = "charter/roles/";
function sanitizeRoleSegment(role) {
  const percentEncode = (ch) => "%" + ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
  let encoded = role.replace(/%/g, percentEncode).replace(/[<>:"|?*]/g, percentEncode).replace(/[\/\\]/g, percentEncode).replace(/[\x00-\x1f\x7f]/g, percentEncode);
  const stem = encoded.includes(".") ? encoded.slice(0, encoded.indexOf(".")) : encoded;
  if (WINDOWS_RESERVED[stem.toLowerCase()] === true) {
    encoded = percentEncode(encoded[0]) + encoded.slice(1);
  }
  return encoded;
}
function charterRolePath(role) {
  return `${CHARTER_ROLES_PREFIX}${sanitizeRoleSegment(role)}.md`;
}
// ../proto/src/roles.ts
function myRoles(bindings, selfId) {
  const seen = new Set;
  const roles = [];
  for (const b of bindings) {
    if (b.participant === selfId && b.in_window && !seen.has(b.role)) {
      seen.add(b.role);
      roles.push(b.role);
    }
  }
  return roles;
}
// ../proto/src/duties.ts
function isClaimStalled(c, selfId, nowMs) {
  if (c.state !== "CLAIMED")
    return false;
  if (selfId !== null && c.holder !== selfId)
    return false;
  return c.max_claim_until != null && c.max_claim_until <= nowMs;
}
var DEP_SATISFIED = new Set(["DELIVERED", "DONE"]);
function computeDuties(claims, selfId, roles, nowMs) {
  const stateByRef = new Map(claims.map((c) => [c.task_ref, c.state]));
  const depsSatisfied = (deps) => deps.every((d) => {
    const st = stateByRef.get(d);
    return st !== undefined && DEP_SATISFIED.has(st);
  });
  const isVerdictMine = (verdictBy) => verdictBy.some((v) => v === selfId || roles.includes(v));
  const claimable = [];
  const verdict = [];
  const ready = [];
  const stalled = [];
  for (const c of claims) {
    if (c.state === "ANNOUNCED" && !c.holder && depsSatisfied(c.depends_on)) {
      claimable.push(c.task_ref);
    } else if (c.state === "DELIVERED" && isVerdictMine(c.verdict_by)) {
      verdict.push(c.task_ref);
    } else if (c.state === "CLAIMED" && c.holder === selfId && c.depends_on.length > 0 && depsSatisfied(c.depends_on)) {
      ready.push(c.task_ref);
    }
    if (isClaimStalled(c, selfId, nowMs)) {
      stalled.push(c.task_ref);
    }
  }
  return { claimable, verdict, ready, stalled };
}
function dutyParts(d) {
  const parts = [];
  if (d.stalled.length)
    parts.push(`stalled (needs release or a push): ${d.stalled.join(", ")}`);
  if (d.verdict.length)
    parts.push(`awaiting your verdict (accept/reject): ${d.verdict.join(", ")}`);
  if (d.ready.length)
    parts.push(`dependencies delivered — proceed/deliver: ${d.ready.join(", ")}`);
  if (d.claimable.length)
    parts.push(`open to claim: ${d.claimable.join(", ")}`);
  return parts;
}
// ../engine/src/identity.ts
import * as path from "node:path";
import * as os from "node:os";
function meshHome() {
  return process.env["MESH_HOME"] ?? path.join(os.homedir(), ".mesh");
}
function buildCard(id, pubkey, secretBytes, opts = {}) {
  const owner_team = opts.owner_team ?? id.split("@")[1] ?? "default";
  const roles = opts.specialties ?? opts.roles ?? [];
  const partial = {
    id,
    owner_team,
    skills: opts.skills ?? [],
    roles,
    ...opts.specialties !== undefined && { specialties: opts.specialties },
    pubkey,
    ...opts.host !== undefined && { host: opts.host }
  };
  const msg = new TextEncoder().encode(jcs(partial));
  return { ...partial, card_sig: signBytes(msg, secretBytes) };
}

// ../engine/src/client.ts
var HTTP_STATUS_ERROR = {
  400: "bad_request",
  401: "unauthorized",
  403: "forbidden",
  404: "not_found",
  408: "timeout",
  409: "conflict",
  413: "artifact_too_large",
  422: "unprocessable",
  429: "rate_limited",
  500: "server_error",
  502: "bad_gateway",
  503: "unavailable",
  504: "gateway_timeout"
};
var HTTP_STATUS_HINT = {
  403: "rejected before reaching the room — check the room URL and token, or an edge proxy/WAF blocking the request (large binary uploads are a common trigger)",
  413: "file may exceed the room's artifact size limit (25 MB) or the platform request-body limit",
  429: "rate limited — retry after the indicated delay",
  502: "upstream/gateway error — the room may be redeploying; retry",
  503: "service unavailable — the room may be redeploying; retry",
  504: "gateway timeout — retry"
};

class MeshClient {
  opts;
  constructor(opts) {
    this.opts = opts;
  }
  get roomId() {
    return this.opts.roomId;
  }
  buildSubmission(input) {
    const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("hex");
    const client_ts = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const sub = {
      v: 1,
      room: this.opts.roomId,
      sender: this.opts.senderId,
      performative: input.performative,
      client_ts,
      nonce
    };
    if (input.task_ref !== undefined)
      sub.task_ref = input.task_ref;
    if (input.thread !== undefined)
      sub.thread = input.thread;
    if (input.contingent_on !== undefined)
      sub.contingent_on = input.contingent_on;
    if (input.reply_to !== undefined)
      sub.reply_to = input.reply_to;
    if (input.mentions !== undefined)
      sub.mentions = input.mentions;
    if (input.artifacts !== undefined)
      sub.artifacts = input.artifacts;
    if (input.data !== undefined)
      sub.data = input.data;
    if (input.body !== undefined)
      sub.body = input.body;
    sub.sig = signSubmission(sub, this.opts.secretBytes);
    return sub;
  }
  async _get(path2) {
    return fetch(`${this.opts.roomUrl}${path2}`, {
      headers: { Authorization: `Bearer ${this.opts.token}` }
    });
  }
  async _post(path2, body) {
    return fetch(`${this.opts.roomUrl}${path2}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.opts.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  }
  async _delete(path2) {
    return fetch(`${this.opts.roomUrl}${path2}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.opts.token}` }
    });
  }
  async _head(path2) {
    return fetch(`${this.opts.roomUrl}${path2}`, {
      method: "HEAD",
      headers: { Authorization: `Bearer ${this.opts.token}` }
    });
  }
  async _put(path2, body, headers) {
    return fetch(`${this.opts.roomUrl}${path2}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${this.opts.token}`, ...headers },
      body
    });
  }
  async _err(res) {
    const raw = await res.text().catch(() => "");
    let body = {};
    let parsed = false;
    try {
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p === "object") {
          body = p;
          parsed = true;
        }
      }
    } catch {}
    const structuredError = body["error"];
    const error = structuredError ?? HTTP_STATUS_ERROR[res.status] ?? "unknown_error";
    const statusText = `HTTP ${res.status}${res.statusText ? " " + res.statusText : ""}`;
    const looksMarkup = !parsed && /^\s*<(?:!|\?|[a-zA-Z])/.test(raw);
    const snippet = looksMarkup ? "non-JSON body (edge/proxy)" : raw.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    const detail = body["detail"] ?? (structuredError ? res.statusText : `${statusText}${snippet ? " — " + snippet : ""}`);
    const structuredHint = body["hint"] ?? body["tip"];
    const hint = structuredHint ?? HTTP_STATUS_HINT[res.status];
    return {
      ok: false,
      error,
      detail,
      hint,
      retry_after_s: body["retry_after_s"],
      status: res.status
    };
  }
  async _getList(path2, field) {
    const res = await this._get(path2);
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return data[field];
  }
  async _postSeq(path2, body) {
    const res = await this._post(path2, body);
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, seq: data.seq };
  }
  async postEntry(input) {
    const sub = this.buildSubmission(input);
    const res = await this._post("/entries", sub);
    if (res.status === 202) {
      const data = await res.json();
      return { ok: true, seq: data.seq, entry_hash: data.entry_hash };
    }
    return this._err(res);
  }
  async getEntries(opts = {}) {
    const params = new URLSearchParams;
    if (opts.since !== undefined)
      params.set("since", String(opts.since));
    if (opts.limit !== undefined)
      params.set("limit", String(opts.limit));
    if (opts.wait_s !== undefined)
      params.set("wait_s", String(opts.wait_s));
    if (opts.mark)
      params.set("mark", "1");
    if (opts.performative && opts.performative.length > 0)
      params.set("performative", opts.performative.join(","));
    if (opts.exclude && opts.exclude.length > 0)
      params.set("exclude", opts.exclude.join(","));
    const qs = params.toString();
    const res = await this._get(`/entries${qs ? "?" + qs : ""}`);
    if (!res.ok)
      throw Object.assign(new Error(`GET /entries failed: ${res.status}`), { status: res.status });
    return res.json();
  }
  async getEntriesComplete(opts = {}) {
    const allEntries = [];
    const allNotifies = [];
    let since = opts.since;
    let last;
    for (;; ) {
      const page = await this.getEntries({ ...opts, since });
      last = page;
      allEntries.push(...page.entries);
      allNotifies.push(...page.notifies);
      if (!page.notifies_truncated || page.entries.length === 0)
        break;
      if (opts.signal?.aborted)
        break;
      since = page.entries[page.entries.length - 1].seq;
    }
    return { entries: allEntries, notifies: allNotifies, head: last.head, read_cursor: last.read_cursor };
  }
  async getState() {
    const res = await this._get("/state");
    if (!res.ok)
      throw Object.assign(new Error(`GET /state failed: ${res.status}`), { status: res.status });
    return res.json();
  }
  async getSnapshot() {
    const res = await this._get("/snapshot");
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, ...data };
  }
  async verify(from, to) {
    const res = await this._get(`/verify?from=${from}&to=${to}`);
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, chain_ok: data.ok, head: data.head };
  }
  async heartbeat(task_ref) {
    const res = await this._post(`/claims/${encodeURIComponent(task_ref)}/heartbeat`, {});
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, lease_expires: data.lease_expires };
  }
  async fileHeartbeat(path2) {
    const res = await this._post("/leases/heartbeat", { path: path2 });
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, lease_expires: data.lease_expires };
  }
  async postWatch(predicate) {
    const res = await this._post("/watches", { predicate });
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, watch_id: data.watch_id };
  }
  async getWatches() {
    const res = await this._get("/watches");
    if (!res.ok)
      throw Object.assign(new Error(`GET /watches failed: ${res.status}`), { status: res.status });
    return res.json();
  }
  async deleteWatch(id) {
    await this._delete(`/watches/${encodeURIComponent(id)}`);
  }
  async deleteRoom() {
    const res = await this._delete("");
    if (res.ok)
      return { ok: true };
    const body = await res.json().catch(() => ({}));
    return { ok: false, error: body["error"] ?? res.statusText, status: res.status };
  }
  async rotateInvite() {
    const res = await this._post("/invite", {});
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, invite: data.invite };
  }
  async createPassphraseInvite(participantId, passphrase, ttlS) {
    const res = await this._post("/invites", {
      participant_id: participantId,
      passphrase,
      ...ttlS !== undefined && { ttl_s: ttlS }
    });
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, ...data };
  }
  async listPassphraseInvites() {
    const res = await this._get("/invites");
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, invites: data.invites };
  }
  async revokePassphraseInvite(participantId) {
    const res = await this._delete(`/invites/${encodeURIComponent(participantId)}`);
    if (!res.ok)
      return this._err(res);
    return { ok: true };
  }
  async headArtifact(hash) {
    const res = await this._head(`/artifacts/${hash}`);
    return res.ok;
  }
  async putArtifact(hash, bytes) {
    if (await this.headArtifact(hash))
      return { ok: true, size: bytes.length, deduped: true };
    const res = await this._put(`/artifacts/${hash}`, bytes, {
      "Content-Type": "application/gzip",
      "Content-Length": String(bytes.length)
    });
    if (!res.ok)
      return this._err(res);
    const data = await res.json();
    return { ok: true, size: data.size, deduped: data.deduped ?? false };
  }
  async getArtifact(hash) {
    const res = await this._get(`/artifacts/${hash}`);
    if (!res.ok)
      return this._err(res);
    return new Uint8Array(await res.arrayBuffer());
  }
  async getTree(prefix) {
    const q = prefix ? `?prefix=${encodeURIComponent(prefix)}` : "";
    const res = await this._get(`/tree${q}`);
    if (!res.ok)
      return this._err(res);
    return res.json();
  }
  async listGrants() {
    return this._getList("/grants", "grants");
  }
  async listRoles() {
    return this._getList("/roles", "roles");
  }
  async listLeases(opts) {
    const q = opts?.mine ? "?holder=me" : "";
    return this._getList(`/leases${q}`, "leases");
  }
  async grant(subject, path2, grade) {
    return this._postSeq("/grants", { path_prefix: path2, subject, access: grade });
  }
  async assignRole(participant, role, opts) {
    return this._postSeq("/roles", { participant, role, ...opts });
  }
  async setDefaultAccess(access) {
    return this._postSeq("/config", { default_access: access });
  }
  async setDefaultAccessSplit(posture) {
    return this._postSeq("/config", { default_access: posture });
  }
  async setRateLimit(rateLimit) {
    return this._postSeq("/config", { rate_limit: rateLimit });
  }
  async setAuthoritySource(source) {
    return this._postSeq("/config", { authority_source: source });
  }
  async setArchiveThreshold(thresholdEntries) {
    return this._postSeq("/config", { archive: { threshold_entries: thresholdEntries } });
  }
  async setFtsMaxFileBytes(bytes) {
    return this._postSeq("/config", { fts_max_file_bytes: bytes });
  }
  async setArtifactMaxBytes(bytes) {
    return this._postSeq("/config", { artifact_max_bytes: bytes });
  }
  async setPublicShare(enabled) {
    return this._postSeq("/config", { public_share: enabled });
  }
  async revokeGrant(subject, path2) {
    return this._postSeq("/grants/revoke", { path_prefix: path2, subject });
  }
  async removeRole(participant, role) {
    return this._postSeq("/roles/revoke", { participant, role });
  }
  async search(query, opts) {
    const params = new URLSearchParams({ q: query });
    if (opts?.prefix !== undefined)
      params.set("prefix", opts.prefix);
    if (opts?.limit !== undefined)
      params.set("limit", String(opts.limit));
    let res;
    try {
      res = await this._get(`/search?${params.toString()}`);
    } catch {
      return { ok: false, error: "search_unavailable", detail: "search host unreachable", status: 503 };
    }
    if (!res.ok)
      return this._err(res);
    return res.json();
  }
  async relay(path2, update) {
    await this._post("/relay", { path: path2, update });
  }
  static KEEPALIVE_MS = 25000;
  static RECONNECT_BASE_MS = 500;
  static RECONNECT_MAX_MS = 8000;
  static MAX_HANDSHAKE_FAILURES = 5;
  async* follow(since, signal, opts = {}) {
    const cursor = { seq: since ?? -1 };
    let handshakeFailures = 0;
    while (!signal?.aborted) {
      const opened = yield* this.streamOnce(cursor, signal, opts);
      if (signal?.aborted)
        break;
      if (opened) {
        handshakeFailures = 0;
      } else if (++handshakeFailures >= MeshClient.MAX_HANDSHAKE_FAILURES) {
        throw new Error(`WS stream: gave up after ${handshakeFailures} failed connection attempts`);
      }
      const delay = Math.min(MeshClient.RECONNECT_MAX_MS, MeshClient.RECONNECT_BASE_MS * 2 ** Math.min(handshakeFailures, 6));
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  async* streamOnce(cursor, signal, opts = {}) {
    const wsBase = this.opts.roomUrl.replace(/^http/, "ws");
    const params = new URLSearchParams({ token: this.opts.token });
    if (cursor.seq >= 0)
      params.set("since", String(cursor.seq));
    if (opts.performative && opts.performative.length > 0)
      params.set("performative", opts.performative.join(","));
    if (opts.exclude && opts.exclude.length > 0)
      params.set("exclude", opts.exclude.join(","));
    const url = `${wsBase}/stream?${params}`;
    const queue = [];
    let resolve = null;
    const enqueue = (item) => {
      queue.push(item);
      resolve?.();
      resolve = null;
    };
    let opened = false;
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => {
      opened = true;
    });
    ws.addEventListener("message", (ev) => {
      try {
        const frame = JSON.parse(ev.data);
        if (frame.type === "ping" || frame.type === "pong")
          return;
        enqueue({ value: frame });
      } catch {}
    });
    ws.addEventListener("close", () => enqueue({ done: true }));
    ws.addEventListener("error", () => enqueue({ done: true }));
    const onAbort = () => enqueue({ done: true });
    signal?.addEventListener("abort", onAbort);
    const keepalive = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(WS_PING);
        } catch {}
      }
    }, MeshClient.KEEPALIVE_MS);
    try {
      while (true) {
        while (queue.length > 0) {
          const item = queue.shift();
          if ("done" in item)
            return opened;
          if (item.value.type === "entry") {
            if (item.value.entry.seq <= cursor.seq)
              continue;
            cursor.seq = item.value.entry.seq;
            yield item.value;
            continue;
          }
          if (item.value.type === "backfill_truncated") {
            let pageSince = item.value.resume_since;
            try {
              for (;; ) {
                if (signal?.aborted)
                  return opened;
                const page = await this.getEntries({ since: pageSince, limit: 100, performative: opts.performative, exclude: opts.exclude });
                if (page.entries.length === 0)
                  break;
                for (const e of page.entries) {
                  if (e.seq <= cursor.seq)
                    continue;
                  cursor.seq = e.seq;
                  yield { type: "entry", entry: e };
                }
                pageSince = page.entries[page.entries.length - 1].seq;
                if (page.entries.length < 100)
                  break;
              }
            } catch {
              return opened;
            }
            continue;
          }
          yield item.value;
        }
        const { promise, resolve: r } = Promise.withResolvers();
        resolve = r;
        await promise;
      }
    } finally {
      clearInterval(keepalive);
      signal?.removeEventListener("abort", onAbort);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
  }
}
async function createRoom(workerBaseUrl, roomId, ownerCard, joinSecret, defaults, nextCommitment) {
  const url = `${workerBaseUrl}/v1/rooms/${encodeURIComponent(roomId)}/create`;
  const body = {
    owner_id: ownerCard.id,
    owner_card: ownerCard,
    join_secret: joinSecret,
    owner_next_commitment: nextCommitment ?? keyCommitment(keygen().pubkey)
  };
  if (defaults)
    body["defaults"] = defaults;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let errBody = {};
    try {
      errBody = await res.json();
    } catch {}
    return {
      ok: false,
      error: errBody["error"] ?? "create_failed",
      detail: errBody["detail"] ?? res.statusText,
      hint: errBody["hint"],
      status: res.status
    };
  }
  const data = await res.json();
  return { ok: true, ...data };
}
async function joinRoom(roomUrl, roomId, joinSecret, card, secretBytes, nextCommitment) {
  return joinRoomWith(roomUrl, roomId, { join_secret: joinSecret }, card, secretBytes, nextCommitment);
}
async function joinRoomWithPassphrase(roomUrl, roomId, passphrase, card, secretBytes, nextCommitment) {
  return joinRoomWith(roomUrl, roomId, { passphrase }, card, secretBytes, nextCommitment);
}
async function joinRoomWith(roomUrl, roomId, credential, card, secretBytes, nextCommitment) {
  const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const challengeBytes = new TextEncoder().encode(jcs({ room: roomId, id: card.id, ts }));
  const challenge_sig = signBytes(challengeBytes, secretBytes);
  const commitment = nextCommitment ?? keyCommitment(keygen().pubkey);
  const res = await fetch(`${roomUrl}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...credential, card, ts, challenge_sig, next_commitment: commitment })
  });
  if (!res.ok) {
    let errBody = {};
    try {
      errBody = await res.json();
    } catch {}
    return {
      ok: false,
      error: errBody["error"] ?? "join_failed",
      detail: errBody["detail"] ?? res.statusText,
      hint: errBody["hint"],
      status: res.status
    };
  }
  const data = await res.json();
  return { ok: true, ...data };
}
// ../engine/src/artifact.ts
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
function sha256hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
var DEFAULT_EXCLUDES = [".git"];
async function packDir(dir, opts = {}) {
  const excludes = (opts.exclude ?? DEFAULT_EXCLUDES).flatMap((e) => ["--exclude", e]);
  const args = ["-czf", "-", ...excludes, "-C", dir, "."];
  const { promise, resolve, reject } = Promise.withResolvers();
  const child = spawn("tar", args, { stdio: ["ignore", "pipe", "pipe"] });
  const chunks = [];
  const errChunks = [];
  child.stdout.on("data", (chunk) => chunks.push(chunk));
  child.stderr.on("data", (chunk) => errChunks.push(chunk));
  child.on("error", reject);
  child.on("close", (code) => {
    if (code !== 0) {
      reject(new Error(`tar pack failed (exit ${code}): ${Buffer.concat(errChunks).toString()}`));
      return;
    }
    const buf = Buffer.concat(chunks);
    const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    resolve({ bytes, hash: sha256hex(bytes), size: bytes.length });
  });
  return promise;
}
async function unpackInto(bytes, dir) {
  mkdirSync(dir, { recursive: true });
  const { promise, resolve, reject } = Promise.withResolvers();
  const child = spawn("tar", ["-xzf", "-", "-C", dir], { stdio: ["pipe", "ignore", "pipe"] });
  const errChunks = [];
  child.stderr.on("data", (chunk) => errChunks.push(chunk));
  child.on("error", reject);
  child.on("close", (code) => {
    if (code !== 0) {
      reject(new Error(`tar unpack failed (exit ${code}): ${Buffer.concat(errChunks).toString()}`));
    } else {
      resolve();
    }
  });
  child.stdin.on("error", reject);
  child.stdin.write(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  child.stdin.end();
  return promise;
}
function parseArtifactRef(ref) {
  const m = /^r2:([0-9a-f]{64})$/.exec(ref);
  return m ? { kind: "r2", hash: m[1] } : { kind: "other", raw: ref };
}

// ../../node_modules/node-diff3/dist/diff3.mjs
function LCS(buffer1, buffer2) {
  let equivalenceClasses = Object.create(null);
  for (let j = 0;j < buffer2.length; j++) {
    const item = buffer2[j];
    if (equivalenceClasses[item]) {
      equivalenceClasses[item].push(j);
    } else {
      equivalenceClasses[item] = [j];
    }
  }
  const NULLRESULT = { buffer1index: -1, buffer2index: -1, chain: null };
  let candidates = [NULLRESULT];
  for (let i = 0;i < buffer1.length; i++) {
    const item = buffer1[i];
    const buffer2indices = equivalenceClasses[item] || [];
    let r = 0;
    let c = candidates[0];
    for (const j of buffer2indices) {
      let s;
      for (s = r;s < candidates.length; s++) {
        if (candidates[s].buffer2index < j && (s === candidates.length - 1 || candidates[s + 1].buffer2index > j)) {
          break;
        }
      }
      if (s < candidates.length) {
        const newCandidate = { buffer1index: i, buffer2index: j, chain: candidates[s] };
        if (r === candidates.length) {
          candidates.push(c);
        } else {
          candidates[r] = c;
        }
        r = s + 1;
        c = newCandidate;
        if (r === candidates.length) {
          break;
        }
      }
    }
    candidates[r] = c;
  }
  return candidates[candidates.length - 1];
}
function diffIndices(buffer1, buffer2) {
  const lcs = LCS(buffer1, buffer2);
  let result = [];
  let tail1 = buffer1.length;
  let tail2 = buffer2.length;
  for (let candidate = lcs;candidate !== null; candidate = candidate.chain) {
    const mismatchLength1 = tail1 - candidate.buffer1index - 1;
    const mismatchLength2 = tail2 - candidate.buffer2index - 1;
    tail1 = candidate.buffer1index;
    tail2 = candidate.buffer2index;
    if (mismatchLength1 || mismatchLength2) {
      result.push({
        buffer1: [tail1 + 1, mismatchLength1],
        buffer1Content: buffer1.slice(tail1 + 1, tail1 + 1 + mismatchLength1),
        buffer2: [tail2 + 1, mismatchLength2],
        buffer2Content: buffer2.slice(tail2 + 1, tail2 + 1 + mismatchLength2)
      });
    }
  }
  result.reverse();
  return result;
}
function diff3MergeRegions(a, o, b) {
  let hunks = [];
  function addHunk(h2, ab) {
    hunks.push({
      ab,
      oStart: h2.buffer1[0],
      oLength: h2.buffer1[1],
      abStart: h2.buffer2[0],
      abLength: h2.buffer2[1]
    });
  }
  diffIndices(o, a).forEach((item) => addHunk(item, "a"));
  diffIndices(o, b).forEach((item) => addHunk(item, "b"));
  hunks.sort((x, y) => x.oStart - y.oStart);
  let results = [];
  let currOffset = 0;
  function advanceTo(endOffset) {
    if (endOffset > currOffset) {
      results.push({
        stable: true,
        buffer: "o",
        bufferStart: currOffset,
        bufferLength: endOffset - currOffset,
        bufferContent: o.slice(currOffset, endOffset)
      });
      currOffset = endOffset;
    }
  }
  while (hunks.length) {
    let hunk = hunks.shift();
    let regionStart = hunk.oStart;
    let regionEnd = hunk.oStart + hunk.oLength;
    let regionHunks = [hunk];
    advanceTo(regionStart);
    while (hunks.length) {
      const nextHunk = hunks[0];
      const nextHunkStart = nextHunk.oStart;
      if (nextHunkStart > regionEnd)
        break;
      regionEnd = Math.max(regionEnd, nextHunkStart + nextHunk.oLength);
      regionHunks.push(hunks.shift());
    }
    if (regionHunks.length === 1) {
      if (hunk.abLength > 0) {
        const buffer = hunk.ab === "a" ? a : b;
        results.push({
          stable: true,
          buffer: hunk.ab,
          bufferStart: hunk.abStart,
          bufferLength: hunk.abLength,
          bufferContent: buffer.slice(hunk.abStart, hunk.abStart + hunk.abLength)
        });
      }
    } else {
      let bounds = {
        a: [a.length, -1, o.length, -1],
        b: [b.length, -1, o.length, -1]
      };
      while (regionHunks.length) {
        hunk = regionHunks.shift();
        const oStart = hunk.oStart;
        const oEnd = oStart + hunk.oLength;
        const abStart = hunk.abStart;
        const abEnd = abStart + hunk.abLength;
        let b2 = bounds[hunk.ab];
        b2[0] = Math.min(abStart, b2[0]);
        b2[1] = Math.max(abEnd, b2[1]);
        b2[2] = Math.min(oStart, b2[2]);
        b2[3] = Math.max(oEnd, b2[3]);
      }
      const aStart = bounds.a[0] + (regionStart - bounds.a[2]);
      const aEnd = bounds.a[1] + (regionEnd - bounds.a[3]);
      const bStart = bounds.b[0] + (regionStart - bounds.b[2]);
      const bEnd = bounds.b[1] + (regionEnd - bounds.b[3]);
      let result = {
        stable: false,
        aStart,
        aLength: aEnd - aStart,
        aContent: a.slice(aStart, aEnd),
        oStart: regionStart,
        oLength: regionEnd - regionStart,
        oContent: o.slice(regionStart, regionEnd),
        bStart,
        bLength: bEnd - bStart,
        bContent: b.slice(bStart, bEnd)
      };
      results.push(result);
    }
    currOffset = regionEnd;
  }
  advanceTo(o.length);
  return results;
}
function diff3Merge(a, o, b, options) {
  let defaults = {
    excludeFalseConflicts: true,
    stringSeparator: /\s+/
  };
  options = Object.assign(defaults, options);
  if (typeof a === "string")
    a = a.split(options.stringSeparator);
  if (typeof o === "string")
    o = o.split(options.stringSeparator);
  if (typeof b === "string")
    b = b.split(options.stringSeparator);
  let results = [];
  const regions = diff3MergeRegions(a, o, b);
  let okBuffer = [];
  function flushOk() {
    if (okBuffer.length) {
      results.push({ ok: okBuffer });
    }
    okBuffer = [];
  }
  function isFalseConflict(a2, b2) {
    if (a2.length !== b2.length)
      return false;
    for (let i = 0;i < a2.length; i++) {
      if (a2[i] !== b2[i])
        return false;
    }
    return true;
  }
  regions.forEach((region) => {
    if (region.stable) {
      okBuffer.push(...region.bufferContent);
    } else {
      if (options.excludeFalseConflicts && isFalseConflict(region.aContent, region.bContent)) {
        okBuffer.push(...region.aContent);
      } else {
        flushOk();
        results.push({
          conflict: {
            a: region.aContent,
            aIndex: region.aStart,
            o: region.oContent,
            oIndex: region.oStart,
            b: region.bContent,
            bIndex: region.bStart
          }
        });
      }
    }
  });
  flushOk();
  return results;
}

// ../engine/src/merge.ts
function threeWayMerge(base, tip, mine) {
  const baseLines = base.split(`
`);
  const tipLines = tip.split(`
`);
  const mineLines = mine.split(`
`);
  const regions = diff3Merge(mineLines, baseLines, tipLines);
  const out = [];
  let hasConflict = false;
  for (const region of regions) {
    if (region.ok !== undefined) {
      out.push(...region.ok);
    } else if (region.conflict !== undefined) {
      hasConflict = true;
      out.push("<<<<<<< mine", ...region.conflict.a, "=======", ...region.conflict.b, ">>>>>>> tip");
    }
  }
  const text = out.join(`
`);
  return hasConflict ? { ok: false, conflicted: text } : { ok: true, merged: text };
}

// ../engine/src/fs.ts
function resolveNode(tree, repopath) {
  const id = normalizeId(repopath);
  return tree.find((n) => n.path === id);
}
function hashFromRef(content_hash) {
  if (content_hash === undefined)
    throw new Error("no content ref (row is gated or absent)");
  const m = /^r2:([0-9a-f]{64})$/.exec(content_hash);
  if (!m)
    throw new Error(`not an r2 content ref: ${content_hash}`);
  return m[1];
}
function resolveWorkspaceRoot(into, root) {
  return into ?? root ?? ".";
}
async function fsPutOcc(client, repopath, bytes, baseOverrideRef) {
  const hash = sha256hex(bytes);
  let baseHashRef = baseOverrideRef === null ? undefined : baseOverrideRef;
  if (baseOverrideRef === undefined) {
    const treeResult = await client.getTree(repopath);
    if ("tree" in treeResult) {
      const node = resolveNode(treeResult.tree, repopath);
      baseHashRef = node?.content_hash;
    }
  }
  const up = await client.putArtifact(hash, bytes);
  if (!up.ok)
    return { ok: false, kind: "error", error: up.error, detail: up.detail, hint: up.hint, retry_after_s: up.retry_after_s };
  const postData = {
    path: repopath,
    content_hash: "r2:" + hash,
    size: bytes.length
  };
  if (baseHashRef !== undefined)
    postData["base_hash"] = baseHashRef;
  const r = await client.postEntry({ performative: "file.write", data: postData });
  if (r.ok)
    return { ok: true, seq: r.seq, deduped: up.deduped, hash, pushedBytes: bytes, merged: false };
  if (r.error === "stale_base" && r.hint && baseHashRef) {
    const tipRef = r.hint;
    if (!tipRef.startsWith("r2:") || !baseHashRef.startsWith("r2:")) {
      return { ok: false, kind: "error", error: r.error, detail: r.detail, hint: r.hint };
    }
    const tipHex = tipRef.slice(3);
    const baseHex = baseHashRef.slice(3);
    const [tipBlob, baseBlob] = await Promise.all([
      client.getArtifact(tipHex),
      client.getArtifact(baseHex)
    ]);
    if (!(tipBlob instanceof Uint8Array)) {
      return { ok: false, kind: "error", error: "fetch_tip_failed", detail: tipBlob.detail };
    }
    if (!(baseBlob instanceof Uint8Array)) {
      return { ok: false, kind: "error", error: "fetch_base_failed", detail: baseBlob.detail };
    }
    const tipText = Buffer.from(tipBlob).toString("utf8");
    const baseText = Buffer.from(baseBlob).toString("utf8");
    const mineText = Buffer.from(bytes).toString("utf8");
    const merged = threeWayMerge(baseText, tipText, mineText);
    if (!merged.ok) {
      return { ok: false, kind: "conflict", conflictedText: merged.conflicted };
    }
    const mergedBytes = new Uint8Array(Buffer.from(merged.merged, "utf8"));
    const mergedHash = sha256hex(mergedBytes);
    const up2 = await client.putArtifact(mergedHash, mergedBytes);
    if (!up2.ok)
      return { ok: false, kind: "error", error: up2.error, detail: up2.detail, hint: up2.hint, retry_after_s: up2.retry_after_s };
    const r2 = await client.postEntry({
      performative: "file.write",
      data: { path: repopath, content_hash: "r2:" + mergedHash, size: mergedBytes.length, base_hash: tipRef }
    });
    if (!r2.ok)
      return { ok: false, kind: "error", error: r2.error, detail: r2.detail, hint: r2.hint, retry_after_s: r2.retry_after_s };
    return { ok: true, seq: r2.seq, deduped: up2.deduped, hash: mergedHash, pushedBytes: mergedBytes, merged: true };
  }
  return { ok: false, kind: "error", error: r.error, detail: r.detail, hint: r.hint, retry_after_s: r.retry_after_s };
}
// ../engine/src/edit-base.ts
import * as fs2 from "node:fs";
import * as path3 from "node:path";

// ../engine/src/private-file.ts
import * as fs from "node:fs";
import * as path2 from "node:path";
import { randomBytes as randomBytes2 } from "node:crypto";
function writePrivateFileAtomic(finalPath, content) {
  const dir = path2.dirname(finalPath);
  fs.mkdirSync(dir, { recursive: true, mode: 448 });
  const tmpPath = path2.join(dir, `.${path2.basename(finalPath)}.tmp-${process.pid}-${randomBytes2(6).toString("hex")}`);
  try {
    fs.writeFileSync(tmpPath, content, { encoding: "utf8", mode: 384 });
    fs.renameSync(tmpPath, finalPath);
  } catch (error) {
    try {
      fs.rmSync(tmpPath, { force: true });
    } catch {}
    throw error;
  }
  if (process.platform !== "win32") {
    try {
      fs.chmodSync(finalPath, 384);
    } catch {}
    try {
      fs.chmodSync(dir, 448);
    } catch {}
  }
}

// ../engine/src/edit-base.ts
var SIDECAR_CONTENT_CAP_BYTES = 1e6;
function sidecarPath(roomId, repopath, home) {
  for (const [label, raw] of [["roomId", roomId], ["repopath", repopath]]) {
    let decoded;
    try {
      decoded = decodeURIComponent(raw);
    } catch {
      decoded = raw;
    }
    if (decoded === "." || decoded === ".." || decoded.split(/[/\\]/).some((seg) => seg === "..")) {
      throw new Error(`sidecarPath: illegal ${label} "${raw}"`);
    }
  }
  return path3.join(home ?? meshHome(), "edit-base", roomId, encodeURIComponent(repopath));
}
function readSidecar(roomId, repopath, home) {
  const p = sidecarPath(roomId, repopath, home);
  if (!fs2.existsSync(p))
    return;
  try {
    fs2.chmodSync(p, 384);
  } catch {}
  try {
    return JSON.parse(fs2.readFileSync(p, "utf8"));
  } catch {
    return;
  }
}
function writeSidecar(roomId, repopath, sidecar, home) {
  const p = sidecarPath(roomId, repopath, home);
  writePrivateFileAtomic(p, JSON.stringify(sidecar));
}
function dropSidecar(roomId, repopath, home) {
  const p = sidecarPath(roomId, repopath, home);
  try {
    fs2.rmSync(p);
  } catch {}
}
function buildSidecar(bytes, tipHash) {
  if (isValidUtf8Bytes(bytes) && bytes.length <= SIDECAR_CONTENT_CAP_BYTES) {
    return { content: Buffer.from(bytes).toString("utf8"), tip_hash: tipHash };
  }
  return { tip_hash: tipHash };
}
function listSidecarPaths(roomId, home) {
  const dir = path3.join(home ?? meshHome(), "edit-base", roomId);
  let entries;
  try {
    entries = fs2.readdirSync(dir);
  } catch {
    return [];
  }
  const out = [];
  for (const name of entries) {
    try {
      out.push(decodeURIComponent(name));
    } catch {}
  }
  return out;
}
function isValidUtf8Bytes(bytes) {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}
function isValidUtf8Text(s) {
  if (s.includes("�"))
    return false;
  for (let i = 0;i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 55296 && c <= 56319) {
      const next = s.charCodeAt(i + 1);
      if (Number.isNaN(next) || next < 56320 || next > 57343)
        return false;
      i++;
    } else if (c >= 56320 && c <= 57343) {
      return false;
    }
  }
  return true;
}
var CONFLICT_MARKER_RE = /^(<{7}( |$)|={7}$|>{7}( |$))/m;
function hasConflictMarkers(text) {
  return CONFLICT_MARKER_RE.test(text);
}
function hasPreExistingConflictMarkers(localBytes) {
  if (localBytes === undefined)
    return false;
  if (!isValidUtf8Bytes(localBytes))
    return false;
  return hasConflictMarkers(localBytes.toString("utf8"));
}
function decideEditWrite(input) {
  const { sidecar, tipText, tipHash, localBytes } = input;
  const sidecarContent = sidecar?.content;
  if (localBytes === undefined) {
    return { kind: "clean", text: tipText, sidecar: { content: tipText, tip_hash: tipHash } };
  }
  if (sidecarContent !== undefined && localBytes.equals(Buffer.from(sidecarContent, "utf8"))) {
    return { kind: "clean", text: tipText, sidecar: { content: tipText, tip_hash: tipHash } };
  }
  const base = sidecarContent ?? tipText;
  if (!isValidUtf8Bytes(localBytes) || !isValidUtf8Text(base) || !isValidUtf8Text(tipText)) {
    return {
      kind: "binary",
      warning: `fs edit: local file has diverged and looks like binary content — resolve manually (not merged, local file left untouched)`
    };
  }
  const localText = localBytes.toString("utf8");
  const merge = threeWayMerge(base, tipText, localText);
  if (merge.ok) {
    const result = {
      kind: "merged",
      text: merge.merged,
      sidecar: { content: merge.merged, tip_hash: tipHash }
    };
    if (sidecarContent === undefined) {
      result.warning = "fs edit: no prior sidecar found — kept local edits, merged against the room tip";
    }
    return result;
  }
  return {
    kind: "conflict",
    text: merge.conflicted,
    warning: "fs edit: local edits conflict with the room tip — conflict markers written, resolve manually"
  };
}
function decideFoldBack(conflictBaseText, currentDocText, localText) {
  if (currentDocText === conflictBaseText) {
    return { kind: "clean", text: localText };
  }
  const merge = threeWayMerge(conflictBaseText, currentDocText, localText);
  if (merge.ok) {
    return {
      kind: "merged",
      text: merge.merged,
      warning: "fs edit: room tip advanced while conflict markers were being resolved — remote edits auto-merged"
    };
  }
  return {
    kind: "conflict",
    text: merge.conflicted,
    warning: "fs edit: room tip advanced and overlaps your resolution — new conflict markers written, resolve again before publishing"
  };
}

// ../engine/src/folder-lineage.ts
import * as fs3 from "node:fs";
import * as path4 from "node:path";
var FOLDER_STATE_DIR = ".mesh";
function assertNoTraversal(label, raw) {
  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  if (decoded === "." || decoded === ".." || decoded.split(/[/\\]/).some((seg) => seg === "..")) {
    throw new Error(`folder-lineage: illegal ${label} "${raw}"`);
  }
}
function atomicWriteJson(finalPath, value) {
  writePrivateFileAtomic(finalPath, JSON.stringify(value));
}
function attachmentsPath(root) {
  return path4.join(root, FOLDER_STATE_DIR, "attachments.json");
}
function readAttachments(root) {
  const p = attachmentsPath(root);
  if (!fs3.existsSync(p))
    return { v: 1, attachments: [] };
  try {
    const raw = JSON.parse(fs3.readFileSync(p, "utf8"));
    if (typeof raw !== "object" || raw === null || !("attachments" in raw) || !Array.isArray(raw.attachments)) {
      return { v: 1, attachments: [] };
    }
    const attachments = raw.attachments.filter((a) => typeof a === "object" && a !== null && typeof a.origin === "string" && typeof a.roomId === "string");
    return { v: 1, attachments };
  } catch {
    return { v: 1, attachments: [] };
  }
}
function upsertAttachment(root, a) {
  const current = readAttachments(root);
  const idx = current.attachments.findIndex((x) => x.origin === a.origin && x.roomId === a.roomId);
  const attachments = idx >= 0 ? current.attachments.map((x, i) => i === idx ? a : x) : [...current.attachments, a];
  atomicWriteJson(attachmentsPath(root), { v: 1, attachments });
}
function findEnclosingAttachment(cwd, origin, roomId) {
  let dir = path4.resolve(cwd);
  for (;; ) {
    const { attachments } = readAttachments(dir);
    if (attachments.some((a) => a.origin === origin && a.roomId === roomId))
      return dir;
    const up = path4.dirname(dir);
    if (up === dir)
      return null;
    dir = up;
  }
}
function folderSidecarPath(root, roomKey, repopath) {
  assertNoTraversal("roomKey", roomKey);
  assertNoTraversal("repopath", repopath);
  return path4.join(root, FOLDER_STATE_DIR, "lineage", roomKey, encodeURIComponent(repopath));
}
function readFolderSidecar(root, roomKey, repopath) {
  const p = folderSidecarPath(root, roomKey, repopath);
  if (!fs3.existsSync(p))
    return;
  try {
    return JSON.parse(fs3.readFileSync(p, "utf8"));
  } catch {
    return;
  }
}
function writeFolderSidecar(root, roomKey, repopath, s) {
  atomicWriteJson(folderSidecarPath(root, roomKey, repopath), s);
}
function dropFolderSidecar(root, roomKey, repopath) {
  try {
    fs3.rmSync(folderSidecarPath(root, roomKey, repopath));
  } catch {}
}
function listFolderSidecarPaths(root, roomKey) {
  assertNoTraversal("roomKey", roomKey);
  const dir = path4.join(root, FOLDER_STATE_DIR, "lineage", roomKey);
  let entries;
  try {
    entries = fs3.readdirSync(dir);
  } catch {
    return [];
  }
  const out = [];
  for (const name of entries) {
    if (name.startsWith("."))
      continue;
    try {
      out.push(decodeURIComponent(name));
    } catch {}
  }
  return out;
}
function readSidecarResolved(root, roomKey, roomId, repopath, home, legacyAmbiguous) {
  const folder = readFolderSidecar(root, roomKey, repopath);
  if (folder !== undefined)
    return folder;
  if (legacyAmbiguous)
    return;
  return readSidecar(roomId, repopath, home);
}

// ../engine/src/sync.ts
import { writeFileSync as writeFileSync2, existsSync as existsSync3, mkdirSync as mkdirSync3, readFileSync as readFileSync3, unlinkSync, lstatSync } from "node:fs";
import { resolve as resolve2, dirname as dirname3, sep, basename as basename2 } from "node:path";
function classifySync(input) {
  if (input.tipGated)
    return "gated";
  if (input.ignoredLocally)
    return "ignored";
  const { localHash, baseTipHash, tipHash } = input;
  const L3 = localHash !== undefined;
  const B = baseTipHash !== undefined;
  const T = tipHash !== undefined;
  if (!L3 && !B && !T)
    return "vacuous";
  if (L3 && !B && !T)
    return "untracked";
  if (!L3 && !B && T)
    return "room-only";
  if (!L3 && B && !T)
    return "orphan-base";
  if (!L3 && B && T)
    return "local-deleted";
  if (L3 && B && !T)
    return localHash === baseTipHash ? "room-deleted-clean" : "room-deleted-dirty";
  if (L3 && !B && T)
    return localHash === tipHash ? "adopt" : "never-synced";
  const lb = localHash === baseTipHash;
  const bt = baseTipHash === tipHash;
  const lt = localHash === tipHash;
  if (lb && bt)
    return "in-sync";
  if (!lb && bt)
    return "ahead";
  if (lb && !bt)
    return "behind";
  if (lt)
    return "converged";
  return "diverged";
}
var STATE_GLYPH = {
  vacuous: " ",
  untracked: "?",
  "room-only": "↓",
  "orphan-base": ".",
  "local-deleted": "↓",
  "room-deleted-clean": "✝",
  "room-deleted-dirty": "✝",
  adopt: "=",
  "never-synced": "⇅",
  "in-sync": "=",
  ahead: "↑",
  behind: "↓",
  converged: "=",
  diverged: "⇅",
  gated: "⊘",
  ignored: "i"
};
var OVERLAY_GLYPH = {
  locked: "\uD83D\uDD12",
  "conflict-markers": "C"
};
function buildStatusRow(input, now) {
  const state = classifySync({
    localHash: input.localHash,
    baseTipHash: input.baseTipHash,
    tipHash: input.tipHash,
    tipGated: input.gated,
    ignoredLocally: input.ignoredLocally
  });
  const details = [];
  let overlay;
  if (input.lease && input.lease.expiresAtMs > now) {
    overlay = "locked";
    const ttlS = Math.max(0, Math.round((input.lease.expiresAtMs - now) / 1000));
    details.push(`held by ${input.lease.holder}, ${ttlS}s left`);
  } else if (input.hasConflictMarkers) {
    overlay = "conflict-markers";
  }
  if (input.gated)
    details.push("content-gated");
  if (state === "ignored")
    details.push(`room still has it — mesh fs rm ${input.path} to evict, or remove from .meshignore`);
  return {
    path: input.path,
    state,
    glyph: overlay ? OVERLAY_GLYPH[overlay] : STATE_GLYPH[state],
    overlay,
    detail: details.length > 0 ? details.join("; ") : undefined
  };
}
function composeStatusRows(input, now) {
  const allPaths = new Set([...input.local.keys(), ...input.tip.keys(), ...input.sidecarOnlyPaths]);
  const rows = [];
  for (const path5 of [...allPaths].sort()) {
    const local = input.local.get(path5);
    const node = input.tip.get(path5);
    const localText = local?.text;
    rows.push(buildStatusRow({
      path: path5,
      localHash: local?.hash,
      baseTipHash: input.baseTipHash.get(path5),
      tipHash: node?.content_hash,
      gated: node !== undefined && !node.content_hash,
      lease: input.lease.get(path5),
      hasConflictMarkers: localText !== undefined && hasConflictMarkers(localText),
      ignoredLocally: input.ignoredLocally?.has(path5) ?? false
    }, now));
  }
  return rows;
}
function formatStatusLine(row, opts) {
  const label = row.overlay ?? row.state;
  if (opts.porcelain)
    return `${label}	${row.path}`;
  return row.detail ? `${row.glyph} ${label}  ${row.path}  (${row.detail})` : `${row.glyph} ${label}  ${row.path}`;
}
function dryRunMergeVerdict(result) {
  return result.ok ? "auto-mergeable" : "WILL conflict";
}
var MAX_DIFF_CELLS = 4000000;
var MAX_DIFF_DIM = 20000;
function lcsDiff(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i2 = n - 1;i2 >= 0; i2--) {
    for (let j2 = m - 1;j2 >= 0; j2--) {
      dp[i2][j2] = a[i2] === b[j2] ? dp[i2 + 1][j2 + 1] + 1 : Math.max(dp[i2 + 1][j2], dp[i2][j2 + 1]);
    }
  }
  const ops = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ kind: "eq", line: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ kind: "del", line: a[i] });
      i++;
    } else {
      ops.push({ kind: "add", line: b[j] });
      j++;
    }
  }
  while (i < n) {
    ops.push({ kind: "del", line: a[i] });
    i++;
  }
  while (j < m) {
    ops.push({ kind: "add", line: b[j] });
    j++;
  }
  return ops;
}
function hunkRanges(ops, context) {
  const changeIdxs = [];
  ops.forEach((op, idx) => {
    if (op.kind !== "eq")
      changeIdxs.push(idx);
  });
  if (changeIdxs.length === 0)
    return [];
  const ranges = [];
  let start = Math.max(0, changeIdxs[0] - context);
  let end = Math.min(ops.length, changeIdxs[0] + 1 + context);
  for (let k = 1;k < changeIdxs.length; k++) {
    const idx = changeIdxs[k];
    const s = Math.max(0, idx - context);
    const e = Math.min(ops.length, idx + 1 + context);
    if (s <= end) {
      end = Math.max(end, e);
    } else {
      ranges.push([start, end]);
      start = s;
      end = e;
    }
  }
  ranges.push([start, end]);
  return ranges;
}
function unifiedDiff(aText, bText, aLabel, bLabel) {
  if (aText === bText)
    return "(no differences)";
  const aLines = aText.split(`
`);
  const bLines = bText.split(`
`);
  if (aLines.length * bLines.length > MAX_DIFF_CELLS || aLines.length > MAX_DIFF_DIM || bLines.length > MAX_DIFF_DIM) {
    return [
      `--- ${aLabel}`,
      `+++ ${bLabel}`,
      `@@ whole file differs (too large to line-diff: ${aLines.length} vs ${bLines.length} lines) @@`
    ].join(`
`);
  }
  const ops = lcsDiff(aLines, bLines);
  const aPos = [];
  const bPos = [];
  let ai = 1, bi = 1;
  for (const op of ops) {
    aPos.push(ai);
    bPos.push(bi);
    if (op.kind !== "add")
      ai++;
    if (op.kind !== "del")
      bi++;
  }
  const context = 3;
  const out = [`--- ${aLabel}`, `+++ ${bLabel}`];
  for (const [start, end] of hunkRanges(ops, context)) {
    let aCount = 0, bCount = 0;
    for (let k = start;k < end; k++) {
      if (ops[k].kind !== "add")
        aCount++;
      if (ops[k].kind !== "del")
        bCount++;
    }
    const aStart = aCount > 0 ? aPos[start] : Math.max(0, aPos[start] - 1);
    const bStart = bCount > 0 ? bPos[start] : Math.max(0, bPos[start] - 1);
    out.push(`@@ -${aStart},${aCount} +${bStart},${bCount} @@`);
    for (let k = start;k < end; k++) {
      const op = ops[k];
      const prefix = op.kind === "eq" ? " " : op.kind === "del" ? "-" : "+";
      out.push(prefix + op.line);
    }
  }
  return out.join(`
`);
}
function contentLane(policy, isBinary) {
  if (isBinary)
    return "binary";
  return policy === "shared" ? "prose" : "code";
}
function planPutRow(input) {
  const state = classifySync(input);
  switch (state) {
    case "untracked":
      return { kind: "add" };
    case "adopt":
    case "in-sync":
    case "converged":
      return { kind: "noop-refresh" };
    case "never-synced":
      return { kind: "refuse" };
    case "room-deleted-clean":
      return { kind: "skip-deleted" };
    case "room-deleted-dirty":
      return { kind: "resurrect" };
    case "ahead":
      return { kind: "fast-forward" };
    case "behind":
      return { kind: "skip-behind" };
    case "diverged":
      return { kind: "merge-attempt", lane: contentLane(input.policy, input.isBinary) };
    case "ignored":
      return { kind: "skip-ignored" };
    case "vacuous":
    case "room-only":
    case "orphan-base":
    case "local-deleted":
      throw new Error(`planPutRow: unreachable state "${state}" — put targets always have local bytes`);
    case "gated":
      throw new Error(`planPutRow: unreachable state "gated" — put targets never set tipGated`);
  }
}
function planPutTarget(input) {
  if (input.hasMarkers)
    return { kind: "refuse-markers" };
  if (input.lockedByOther)
    return { kind: "locked", holder: input.lockedByOther.holder, expiresAtMs: input.lockedByOther.expiresAtMs };
  return planPutRow(input);
}
function nextForkPath(repoPath, taken) {
  const slash = repoPath.lastIndexOf("/");
  const dir = slash === -1 ? "" : repoPath.slice(0, slash + 1);
  const base = slash === -1 ? repoPath : repoPath.slice(slash + 1);
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot) : "";
  for (let n = 1;; n++) {
    const candidate = `${dir}${stem} (${n})${ext}`;
    if (!taken.has(normalizeId(candidate)))
      return candidate;
  }
}
async function forkWrite(client, origRepoPath, bytes, taken, maxAttempts = 3) {
  const hash = sha256hex(bytes);
  const seen = new Set(taken);
  for (let attempt = 0;attempt < maxAttempts; attempt++) {
    const candidate = nextForkPath(origRepoPath, seen);
    const legal = isLegalPath(candidate);
    if (!legal.ok)
      return { ok: false, error: "illegal_fork_path", detail: legal.reason };
    const up = await client.putArtifact(hash, bytes);
    if (!up.ok)
      return { ok: false, error: up.error, detail: up.detail, hint: up.hint, retry_after_s: up.retry_after_s };
    const r = await client.postEntry({ performative: "file.write", data: { path: candidate, content_hash: "r2:" + hash, size: bytes.length } });
    if (!r.ok)
      return { ok: false, error: r.error, detail: r.detail, hint: r.hint, retry_after_s: r.retry_after_s };
    const t = await client.getTree(candidate);
    if (!("error" in t)) {
      const node = resolveNode(t.tree, candidate);
      if (node?.content_hash === "r2:" + hash)
        return { ok: true, forkPath: candidate, hash };
    }
    seen.add(normalizeId(candidate));
  }
  return { ok: false, error: "fork_race_exhausted", detail: `could not land a fork of ${origRepoPath} after ${maxAttempts} attempts (verify-and-bump)` };
}
function finishCodeConflict(ctx, conflictedText) {
  writeFileSync2(ctx.localAbs, conflictedText, "utf8");
  return { kind: "conflict-markers-local", stashHash: sha256hex(ctx.localBytes) };
}
async function proseMerge(ctx) {
  const sidecar = ctx.sidecar;
  const tipRef = ctx.tipHash;
  let baseText;
  if (sidecar.content !== undefined) {
    baseText = sidecar.content;
  } else {
    const baseBlob = await ctx.client.getArtifact(hashFromRef(sidecar.tip_hash));
    if (!(baseBlob instanceof Uint8Array))
      return { kind: "error", error: "fetch_base_failed", detail: baseBlob.detail };
    baseText = Buffer.from(baseBlob).toString("utf8");
  }
  const tipBlob = await ctx.client.getArtifact(hashFromRef(tipRef));
  if (!(tipBlob instanceof Uint8Array))
    return { kind: "error", error: "fetch_tip_failed", detail: tipBlob.detail };
  const tipText = Buffer.from(tipBlob).toString("utf8");
  const mineText = Buffer.from(ctx.localBytes).toString("utf8");
  const merge = threeWayMerge(baseText, tipText, mineText);
  if (!merge.ok)
    return { kind: "overlap" };
  const mergedBytes = new Uint8Array(Buffer.from(merge.merged, "utf8"));
  const push = await fsPutOcc(ctx.client, ctx.repoPath, mergedBytes, tipRef);
  if (!push.ok) {
    if (push.kind === "conflict")
      return { kind: "overlap" };
    return { kind: "error", error: push.error, detail: push.detail };
  }
  return { kind: "merged", hash: push.hash, pushedBytes: mergedBytes };
}
async function applyMergeAttempt(ctx, lane) {
  switch (lane) {
    case "binary": {
      const fork = await forkWrite(ctx.client, ctx.repoPath, ctx.localBytes, ctx.knownTaken);
      return fork.ok ? { kind: "forked", forkPath: fork.forkPath, hash: fork.hash, reason: "binary" } : { kind: "error", error: fork.error, detail: fork.detail, hint: fork.hint, retry_after_s: fork.retry_after_s };
    }
    case "prose": {
      const merge = await proseMerge(ctx);
      if (merge.kind === "error")
        return merge;
      if (merge.kind === "merged")
        return { kind: "merged", hash: merge.hash, pushedBytes: merge.pushedBytes };
      const fork = await forkWrite(ctx.client, ctx.repoPath, ctx.localBytes, ctx.knownTaken);
      return fork.ok ? { kind: "forked", forkPath: fork.forkPath, hash: fork.hash, reason: "prose" } : { kind: "error", error: fork.error, detail: fork.detail, hint: fork.hint, retry_after_s: fork.retry_after_s };
    }
    case "code": {
      const r = await fsPutOcc(ctx.client, ctx.repoPath, ctx.localBytes, ctx.sidecar.tip_hash);
      if (r.ok)
        return { kind: "merged", hash: r.hash, pushedBytes: r.pushedBytes };
      if (r.kind === "conflict")
        return finishCodeConflict(ctx, r.conflictedText);
      return { kind: "error", error: r.error, detail: r.detail, hint: r.hint, retry_after_s: r.retry_after_s };
    }
  }
}
async function applyPutTarget(ctx, action, tipSeq, now) {
  switch (action.kind) {
    case "refuse-markers":
      return { kind: "refused-markers" };
    case "locked": {
      const watch = await ctx.client.postWatch({ kind: "entry", path: ctx.repoPath });
      const ttlS = Math.max(0, Math.round((action.expiresAtMs - now) / 1000));
      return { kind: "locked", holder: action.holder, ttlS, watchRegistered: watch.ok };
    }
    case "refuse":
      return { kind: "refused-never-synced" };
    case "skip-deleted":
      return { kind: "skipped-deleted" };
    case "skip-behind":
      return { kind: "skipped-behind", tipSeq: tipSeq ?? -1 };
    case "skip-ignored":
      return { kind: "skipped-ignored" };
    case "noop-refresh":
      return { kind: "unchanged" };
    case "add":
    case "resurrect": {
      const r = await fsPutOcc(ctx.client, ctx.repoPath, ctx.localBytes, null);
      if (!r.ok) {
        return r.kind === "conflict" ? { kind: "error", error: "unexpected_conflict", detail: "add/resurrect returned a merge conflict — there was no prior base to conflict against" } : { kind: "error", error: r.error, detail: r.detail, hint: r.hint, retry_after_s: r.retry_after_s };
      }
      return action.kind === "add" ? { kind: "added", hash: r.hash, deduped: r.deduped } : { kind: "resurrected", hash: r.hash, deduped: r.deduped };
    }
    case "fast-forward": {
      const r = await fsPutOcc(ctx.client, ctx.repoPath, ctx.localBytes, ctx.sidecar.tip_hash);
      if (!r.ok) {
        return r.kind === "conflict" ? finishCodeConflict(ctx, r.conflictedText) : { kind: "error", error: r.error, detail: r.detail, hint: r.hint, retry_after_s: r.retry_after_s };
      }
      return r.merged ? { kind: "merged", hash: r.hash, pushedBytes: r.pushedBytes } : { kind: "fast-forwarded", hash: r.hash, deduped: r.deduped };
    }
    case "merge-attempt":
      return applyMergeAttempt(ctx, action.lane);
  }
}
var passthroughRetry = (attempt) => attempt();
var INFORM_WORTHY = { resurrected: true, "conflict-markers-local": true, forked: true };
function applyWithRetry(ctx, action, tipSeq, now, retry) {
  const mutating = action.kind === "add" || action.kind === "resurrect" || action.kind === "fast-forward" || action.kind === "merge-attempt";
  return mutating ? retry(() => applyPutTarget(ctx, action, tipSeq, now), (o) => o.kind === "error" && o.error === "rate_limited", (o) => o.kind === "error" ? o.retry_after_s : undefined) : applyPutTarget(ctx, action, tipSeq, now);
}
async function healStaleRace(client, target, planInput, ctx, now, retry, maxAttempts = 3) {
  let outcome = { kind: "error", error: "stale_base", detail: "race unresolved after reclassify-retry" };
  let tipSeq;
  for (let attempt = 0;attempt < maxAttempts; attempt++) {
    const fresh = await client.getTree(target.repoPath);
    if (!("tree" in fresh))
      return { outcome: { kind: "error", error: fresh.error, detail: fresh.detail }, tipSeq: undefined };
    const node = resolveNode(fresh.tree, target.repoPath);
    const action = planPutTarget({ ...planInput, tipHash: node?.content_hash });
    const freshCtx = { ...ctx, tipHash: node?.content_hash };
    outcome = await applyWithRetry(freshCtx, action, node?.tip_seq, now, retry);
    tipSeq = node?.tip_seq;
    if (!(outcome.kind === "error" && outcome.error === "stale_base"))
      break;
  }
  return { outcome, tipSeq };
}
async function resolveTipAuthors(client, seqs) {
  const authors = new Map;
  if (seqs.size === 0)
    return authors;
  const all = [...seqs];
  const minSeq = Math.min(...all);
  const maxSeq = Math.max(...all);
  try {
    const { entries } = await client.getEntries({ since: minSeq - 1, limit: maxSeq - minSeq + 1 });
    for (const seq of all)
      authors.set(seq, entries.find((e) => e.seq === seq)?.submission.sender ?? null);
  } catch {
    for (const seq of all)
      authors.set(seq, null);
  }
  return authors;
}
function categorizePutActions(actions) {
  const c = { total: actions.length, upload: 0, newCount: 0, changed: 0, unchanged: 0, locked: 0, skipped: 0 };
  for (const a of actions) {
    switch (a.kind) {
      case "add":
        c.upload++;
        c.newCount++;
        break;
      case "resurrect":
        c.upload++;
        c.newCount++;
        break;
      case "fast-forward":
        c.upload++;
        c.changed++;
        break;
      case "merge-attempt":
        c.upload++;
        c.changed++;
        break;
      case "noop-refresh":
        c.unchanged++;
        break;
      case "locked":
        c.locked++;
        break;
      case "skip-behind":
      case "skip-ignored":
      case "skip-deleted":
      case "refuse":
      case "refuse-markers":
        c.skipped++;
        break;
      default: {
        const _exhaustive = a;
        break;
      }
    }
  }
  return c;
}
async function runPutBatch(client, targets, opts) {
  const now = opts.now ?? Date.now();
  const retry = opts.retry ?? passthroughRetry;
  const [treeResult, leasesResult] = await Promise.all([client.getTree(opts.treePrefix), client.listLeases()]);
  if ("error" in treeResult) {
    opts.onProgress?.({ kind: "finish", op: "put", total: 0, act: 0, exitCode: 2, stopped: true, error: treeResult.error, detail: treeResult.detail });
    return { rows: [], hardError: { error: treeResult.error, detail: treeResult.detail }, informed: false, stopped: true, exitCode: 2 };
  }
  if (!Array.isArray(leasesResult)) {
    opts.onProgress?.({ kind: "finish", op: "put", total: 0, act: 0, exitCode: 2, stopped: true, error: leasesResult.error, detail: leasesResult.detail });
    return { rows: [], hardError: { error: leasesResult.error, detail: leasesResult.detail }, informed: false, stopped: true, exitCode: 2 };
  }
  const tipByPath = new Map;
  const knownTaken = new Set;
  for (const n2 of treeResult.tree) {
    knownTaken.add(n2.path);
    if (n2.content_hash)
      tipByPath.set(n2.path, { contentHash: n2.content_hash, tipSeq: n2.tip_seq });
  }
  const leaseByPath = new Map;
  for (const l of leasesResult)
    leaseByPath.set(l.path, { holder: l.holder, expiresAtMs: l.lease_expires });
  const planned = targets.map((target) => {
    const key = normalizeId(target.repoPath);
    const sidecar = opts.root !== undefined && opts.roomKey !== undefined ? readSidecarResolved(opts.root, opts.roomKey, opts.roomId, key, opts.home) : readSidecar(opts.roomId, key, opts.home);
    const tip = tipByPath.get(key);
    const lease = leaseByPath.get(key);
    const lockedByOther = lease && lease.expiresAtMs > now && lease.holder !== opts.selfId ? lease : undefined;
    const localHash = "r2:" + sha256hex(target.localBytes);
    const isBinary = !isValidUtf8Bytes(target.localBytes);
    const planInput = {
      localHash,
      baseTipHash: sidecar?.tip_hash,
      tipHash: tip?.contentHash,
      policy: policyFor(target.repoPath),
      isBinary,
      lockedByOther,
      hasMarkers: hasPreExistingConflictMarkers(Buffer.from(target.localBytes))
    };
    const action = planPutTarget(planInput);
    const ctx = {
      client,
      repoPath: target.repoPath,
      localAbs: target.localAbs,
      localBytes: target.localBytes,
      sidecar,
      tipHash: tip?.contentHash,
      knownTaken
    };
    return { target, key, localHash, ctx, planInput, action, tip };
  });
  opts.onProgress?.({ kind: "plan", op: "put", label: opts.treePrefix || "(room root)", ...categorizePutActions(planned.map((p) => p.action)) });
  const rows = [];
  let hardError;
  let stopped = false;
  let n = 0;
  for (const { target, key, localHash, ctx, planInput, action, tip } of planned) {
    n++;
    opts.onProgress?.({ kind: "start", n, total: planned.length, path: target.repoPath });
    let tipSeq = tip?.tipSeq;
    let outcome;
    try {
      outcome = await applyWithRetry(ctx, action, tip?.tipSeq, now, retry);
      if (outcome.kind === "error" && outcome.error === "stale_base") {
        const healed = await healStaleRace(client, target, planInput, ctx, now, retry);
        outcome = healed.outcome;
        tipSeq = healed.tipSeq;
      }
      if (outcome.kind === "merged")
        writeFileSync2(target.localAbs, outcome.pushedBytes);
      const putSidecar = (s) => {
        if (opts.root !== undefined && opts.roomKey !== undefined)
          writeFolderSidecar(opts.root, opts.roomKey, key, s);
        else
          writeSidecar(opts.roomId, key, s, opts.home);
      };
      if (outcome.kind === "added" || outcome.kind === "resurrected" || outcome.kind === "fast-forwarded") {
        putSidecar(buildSidecar(target.localBytes, "r2:" + outcome.hash));
      } else if (outcome.kind === "unchanged") {
        putSidecar(buildSidecar(target.localBytes, localHash));
      } else if (outcome.kind === "merged") {
        putSidecar(buildSidecar(outcome.pushedBytes, "r2:" + outcome.hash));
      }
    } catch (e) {
      outcome = { kind: "error", error: "exception", detail: e instanceof Error ? e.message : String(e) };
    }
    rows.push({ repoPath: target.repoPath, outcome, tipSeq });
    opts.onProgress?.({ kind: "put-file", n, total: planned.length, path: target.repoPath, outcome });
    if (outcome.kind === "error") {
      if (opts.stopOnError) {
        hardError = { error: outcome.error, detail: outcome.detail, hint: outcome.hint };
        stopped = true;
        break;
      }
      continue;
    }
    if (opts.strict && outcome.kind === "conflict-markers-local") {
      stopped = true;
      break;
    }
  }
  const notable = rows.filter((r) => INFORM_WORTHY[r.outcome.kind] === true);
  const attributable = notable.filter((r) => (r.outcome.kind === "conflict-markers-local" || r.outcome.kind === "forked") && r.tipSeq !== undefined);
  if (attributable.length > 0) {
    const authors = await resolveTipAuthors(client, new Set(attributable.map((r) => r.tipSeq)));
    for (const row of attributable)
      row.tipAuthor = authors.get(row.tipSeq) ?? null;
  }
  let informed = false;
  if (notable.length > 0) {
    const r = await retry(() => client.postEntry({ performative: "inform", body: formatPutSignalBody(notable) }), (res) => !res.ok && res.error === "rate_limited", (res) => res.ok ? undefined : res.retry_after_s);
    informed = r.ok;
  }
  const anyError = rows.some((r) => r.outcome.kind === "error");
  const exitCode = hardError || anyError ? 2 : notable.length > 0 ? 1 : 0;
  opts.onProgress?.({ kind: "finish", op: "put", total: planned.length, act: categorizePutActions(planned.map((p) => p.action)).upload, exitCode, stopped });
  if (hardError)
    return { rows, hardError, informed, stopped, exitCode: 2 };
  return { rows, informed, stopped, exitCode };
}
function formatPutRowMessage(repoPath, outcome) {
  switch (outcome.kind) {
    case "added":
    case "fast-forwarded":
      return `  ${repoPath} (uploaded${outcome.deduped ? ", deduped" : ""})`;
    case "unchanged":
      return `  ${repoPath} (unchanged)`;
    case "refused-never-synced":
      return `  ${repoPath} — two independent copies (never synced) — run 'mesh fs get ${repoPath}' first, then re-put`;
    case "refused-markers":
      return `  ${repoPath} — local file still has unresolved conflict markers — resolve them, then re-put (put never uploads marker-bearing content)`;
    case "skipped-deleted":
      return `  ${repoPath} (skipped — room deleted this; local copy left untouched)`;
    case "resurrected":
      return `  ${repoPath} (resurrected — room had deleted this; your local edits pushed back)`;
    case "skipped-behind":
      return `  ${repoPath} — ↓ behind (seq ${outcome.tipSeq}) — run 'mesh fs get ${repoPath}'`;
    case "skipped-ignored":
      return `  ${repoPath} (skipped — .meshignore-excluded; 'mesh fs rm ${repoPath}' to evict, or remove it from .meshignore)`;
    case "merged":
      return `  ${repoPath} (merged with room)`;
    case "conflict-markers-local":
      return `  ${repoPath} — CONFLICT: markers written locally; room untouched — resolve, then re-put (mine stashed: r2:${outcome.stashHash})`;
    case "forked":
      return `  ${repoPath} — CONFLICT: room forked as '${outcome.forkPath}' (${outcome.reason}); your local copy is unchanged`;
    case "locked":
      return `  ${repoPath} — locked, held by ${outcome.holder} (${outcome.ttlS}s left) — skipped${outcome.watchRegistered ? ", watch registered" : " (watch registration failed — you will not be notified)"}`;
    case "error":
      return `  ${repoPath} — [${outcome.error}]${outcome.detail ? " " + outcome.detail : ""}${outcome.hint ? " — " + outcome.hint : ""}`;
  }
}
function summarizePutRows(rows) {
  const s = { total: rows.length, uploaded: 0, unchanged: 0, merged: 0, resurrected: 0, conflicts: 0, locked: 0, skipped: 0, errors: 0 };
  for (const { outcome } of rows) {
    switch (outcome.kind) {
      case "added":
      case "fast-forwarded":
        s.uploaded++;
        break;
      case "unchanged":
        s.unchanged++;
        break;
      case "merged":
        s.merged++;
        break;
      case "resurrected":
        s.resurrected++;
        break;
      case "conflict-markers-local":
      case "forked":
        s.conflicts++;
        break;
      case "locked":
        s.locked++;
        break;
      case "skipped-deleted":
      case "skipped-behind":
      case "skipped-ignored":
      case "refused-never-synced":
      case "refused-markers":
        s.skipped++;
        break;
      case "error":
        s.errors++;
        break;
      default: {
        const _exhaustive = outcome;
        break;
      }
    }
  }
  return s;
}
function formatPutSummary(label, s) {
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const parts = [`${s.uploaded} uploaded`, `${s.unchanged} unchanged`];
  if (s.merged)
    parts.push(`${s.merged} merged`);
  if (s.resurrected)
    parts.push(`${s.resurrected} resurrected`);
  if (s.conflicts)
    parts.push(plural(s.conflicts, "conflict"));
  if (s.locked)
    parts.push(`${s.locked} locked`);
  if (s.skipped)
    parts.push(`${s.skipped} skipped`);
  if (s.errors)
    parts.push(plural(s.errors, "error"));
  return `${label} — ${plural(s.total, "file")}: ${parts.join(", ")}`;
}
var PUT_ROW_NEEDS_ATTENTION = {
  "conflict-markers-local": true,
  forked: true,
  error: true,
  locked: true,
  "refused-markers": true,
  "refused-never-synced": true,
  "skipped-behind": true,
  resurrected: true,
  added: false,
  "fast-forwarded": false,
  unchanged: false,
  merged: false,
  "skipped-deleted": false,
  "skipped-ignored": false
};
function putRowNeedsAttention(outcome) {
  return PUT_ROW_NEEDS_ATTENTION[outcome.kind];
}
function formatPutSignalBody(rows) {
  const lines = rows.map(({ repoPath, outcome, tipSeq, tipAuthor }) => {
    const attribution = tipSeq === undefined ? "" : tipAuthor ? ` (tip: seq ${tipSeq} by ${tipAuthor})` : ` (tip: seq ${tipSeq})`;
    switch (outcome.kind) {
      case "resurrected":
        return `${repoPath}: resurrected (room had deleted it; local edits pushed back)`;
      case "conflict-markers-local":
        return `${repoPath}: markers-local (mine stashed as r2:${outcome.stashHash})${attribution}`;
      case "forked":
        return `${repoPath}: forked as '${outcome.forkPath}' (${outcome.reason})${attribution}`;
      default:
        return `${repoPath}: ${outcome.kind}`;
    }
  });
  return `fs put: ${rows.length} path(s) need attention
${lines.join(`
`)}`;
}
function planGetRow(input) {
  const state = classifySync(input);
  switch (state) {
    case "vacuous":
    case "untracked":
      return { kind: "noop" };
    case "room-only":
      return { kind: "download" };
    case "orphan-base":
      return { kind: "drop-sidecar" };
    case "local-deleted":
      return { kind: "rehydrate" };
    case "room-deleted-clean":
      return { kind: "report-deleted", clean: true };
    case "room-deleted-dirty":
      return { kind: "report-deleted", clean: false };
    case "adopt":
      return { kind: "adopt" };
    case "never-synced":
      return { kind: "fork-theirs" };
    case "in-sync":
      return { kind: "noop-insync" };
    case "ahead":
      return { kind: "report-ahead" };
    case "behind":
      return { kind: "update" };
    case "converged":
      return { kind: "sidecar-refresh" };
    case "diverged":
      return { kind: "merge-attempt", lane: contentLane(input.policy, input.isBinary) };
    case "ignored":
      return { kind: "refuse-ignored" };
    case "gated":
      throw new Error(`planGetRow: unreachable state "gated" — planGetTarget guards this before delegating here`);
  }
}
function planGetTarget(input) {
  if (input.hasMarkers)
    return { kind: "refused-markers" };
  if (input.gated)
    return { kind: "gated" };
  return planGetRow(input);
}
function nextLocalForkPath(repoPath, isTaken) {
  const slash = repoPath.lastIndexOf("/");
  const dir = slash === -1 ? "" : repoPath.slice(0, slash + 1);
  const base = slash === -1 ? repoPath : repoPath.slice(slash + 1);
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot) : "";
  for (let n = 1;; n++) {
    const candidate = `${dir}${stem} (${n})${ext}`;
    if (!isTaken(candidate))
      return candidate;
  }
}
function requireTipHash(ctx) {
  const hash = ctx.tip?.contentHash;
  if (hash !== undefined)
    return hash;
  return { error: "gated_tip", detail: `${ctx.repoPath}: content hash unexpectedly missing for a non-gated get action` };
}
async function fetchAndWriteTip(ctx, kind) {
  const tipRef = requireTipHash(ctx);
  if (typeof tipRef !== "string")
    return { kind: "error", ...tipRef };
  let hash;
  try {
    hash = hashFromRef(tipRef);
  } catch (e) {
    return { kind: "error", error: "bad_content_ref", detail: e instanceof Error ? e.message : String(e) };
  }
  const blob = await ctx.client.getArtifact(hash);
  if (!(blob instanceof Uint8Array))
    return { kind: "error", error: blob.error, detail: blob.detail, hint: blob.hint };
  mkdirSync3(dirname3(ctx.localAbs), { recursive: true });
  writeFileSync2(ctx.localAbs, blob);
  return { kind, bytes: blob, tipHash: tipRef };
}
async function forkTheirsLocally(ctx, reason) {
  const tipRef = requireTipHash(ctx);
  if (typeof tipRef !== "string")
    return { kind: "error", ...tipRef };
  let hash;
  try {
    hash = hashFromRef(tipRef);
  } catch (e) {
    return { kind: "error", error: "bad_content_ref", detail: e instanceof Error ? e.message : String(e) };
  }
  const blob = await ctx.client.getArtifact(hash);
  if (!(blob instanceof Uint8Array))
    return { kind: "error", error: blob.error, detail: blob.detail, hint: blob.hint };
  const forkPath = nextLocalForkPath(ctx.repoPath, (candidate) => existsSync3(resolve2(ctx.into, candidate)));
  const forkAbs = resolve2(ctx.into, forkPath);
  mkdirSync3(dirname3(forkAbs), { recursive: true });
  writeFileSync2(forkAbs, blob);
  return reason === "never-synced" ? { kind: "forked-theirs", forkPath, hash: sha256hex(blob) } : { kind: "forked-conflict", forkPath, hash: sha256hex(blob) };
}
async function fetchMergeTexts(ctx) {
  const sidecar = ctx.sidecar;
  const tipRef = requireTipHash(ctx);
  if (typeof tipRef !== "string")
    return { ok: false, ...tipRef };
  let baseText;
  if (sidecar.content !== undefined) {
    baseText = sidecar.content;
  } else {
    const baseBlob = await ctx.client.getArtifact(hashFromRef(sidecar.tip_hash));
    if (!(baseBlob instanceof Uint8Array))
      return { ok: false, error: "fetch_base_failed", detail: baseBlob.detail };
    baseText = Buffer.from(baseBlob).toString("utf8");
  }
  const tipBlob = await ctx.client.getArtifact(hashFromRef(tipRef));
  if (!(tipBlob instanceof Uint8Array))
    return { ok: false, error: "fetch_tip_failed", detail: tipBlob.detail };
  return { ok: true, baseText, tipText: Buffer.from(tipBlob).toString("utf8"), mineText: Buffer.from(ctx.localBytes).toString("utf8") };
}
async function applyGetMergeAttempt(ctx, lane) {
  switch (lane) {
    case "binary":
      return forkTheirsLocally(ctx, "conflict");
    case "code":
    case "prose": {
      const texts = await fetchMergeTexts(ctx);
      if (!texts.ok)
        return { kind: "error", error: texts.error, detail: texts.detail };
      const merge = threeWayMerge(texts.baseText, texts.tipText, texts.mineText);
      if (merge.ok) {
        const tipRef = requireTipHash(ctx);
        if (typeof tipRef !== "string")
          return { kind: "error", ...tipRef };
        const mergedBytes = new Uint8Array(Buffer.from(merge.merged, "utf8"));
        writeFileSync2(ctx.localAbs, mergedBytes);
        return { kind: "merged-local", bytes: mergedBytes, tipHash: tipRef };
      }
      if (lane === "code") {
        writeFileSync2(ctx.localAbs, merge.conflicted, "utf8");
        return { kind: "conflict-markers-local" };
      }
      return forkTheirsLocally(ctx, "conflict");
    }
  }
}
async function applyGetTarget(ctx, action) {
  switch (action.kind) {
    case "refused-markers":
      return { kind: "refused-markers" };
    case "gated":
      return { kind: "gated" };
    case "refuse-ignored":
      return { kind: "refused-ignored" };
    case "noop":
      return { kind: "noop" };
    case "drop-sidecar":
      return { kind: "dropped-sidecar" };
    case "download":
      return fetchAndWriteTip(ctx, "downloaded");
    case "rehydrate":
      return fetchAndWriteTip(ctx, "rehydrated");
    case "report-deleted": {
      if (!action.clean)
        return { kind: "deleted-dirty" };
      if (ctx.prune) {
        try {
          unlinkSync(ctx.localAbs);
        } catch {}
        return { kind: "deleted-clean", pruned: true };
      }
      return { kind: "deleted-clean", pruned: false };
    }
    case "adopt": {
      const tipRef = requireTipHash(ctx);
      if (typeof tipRef !== "string")
        return { kind: "error", ...tipRef };
      return { kind: "adopted", bytes: ctx.localBytes, tipHash: tipRef };
    }
    case "fork-theirs":
      return forkTheirsLocally(ctx, "never-synced");
    case "noop-insync":
      return { kind: "unchanged" };
    case "report-ahead":
      return { kind: "ahead" };
    case "update":
      return fetchAndWriteTip(ctx, "updated");
    case "sidecar-refresh": {
      const tipRef = requireTipHash(ctx);
      if (typeof tipRef !== "string")
        return { kind: "error", ...tipRef };
      return { kind: "converged", bytes: ctx.localBytes, tipHash: tipRef };
    }
    case "merge-attempt":
      return applyGetMergeAttempt(ctx, action.lane);
  }
}
var GET_EXIT1 = {
  "forked-theirs": true,
  "conflict-markers-local": true,
  "forked-conflict": true,
  "refused-markers": true,
  "path-escape": true,
  gated: true,
  "refused-ignored": true,
  "refused-reserved": true
};
function getRowNeedsVerify(outcome) {
  switch (outcome.kind) {
    case "ahead":
    case "deleted-dirty":
    case "forked-theirs":
    case "conflict-markers-local":
    case "forked-conflict":
    case "refused-markers":
    case "gated":
    case "path-escape":
    case "refused-ignored":
    case "refused-reserved":
      return true;
    case "deleted-clean":
      return !outcome.pruned;
    default:
      return false;
  }
}
function categorizeGetActions(actions) {
  const c = { total: actions.length, upload: 0, newCount: 0, changed: 0, unchanged: 0, locked: 0, skipped: 0 };
  for (const a of actions) {
    switch (a.kind) {
      case "download":
      case "rehydrate":
        c.upload++;
        c.newCount++;
        break;
      case "update":
      case "merge-attempt":
      case "fork-theirs":
        c.upload++;
        c.changed++;
        break;
      case "noop-insync":
      case "adopt":
      case "sidecar-refresh":
      case "noop":
        c.unchanged++;
        break;
      case "report-deleted":
      case "drop-sidecar":
      case "report-ahead":
      case "refused-markers":
      case "gated":
      case "refuse-ignored":
        c.skipped++;
        break;
      default: {
        const _exhaustive = a;
        break;
      }
    }
  }
  return c;
}
function hasLocalSymlinkComponent(base, repoPath) {
  let cursor = base;
  for (const segment of repoPath.replace(/\\/g, "/").split("/").filter(Boolean)) {
    cursor = resolve2(cursor, segment);
    try {
      if (lstatSync(cursor).isSymbolicLink())
        return true;
    } catch {
      return false;
    }
  }
  return false;
}
async function runGetBatch(client, opts) {
  const base = resolve2(opts.into);
  const baseName = basename2(base).normalize("NFC").toLowerCase();
  if (baseName === ".mesh" || baseName === ".meshignore") {
    const hardError2 = {
      error: "reserved_workspace_root",
      detail: `refusing to hydrate into Mesh's reserved local-state path: ${base}`
    };
    opts.onProgress?.({ kind: "finish", op: "get", total: 0, act: 0, exitCode: 2, ...hardError2 });
    return { rows: [], hardError: hardError2, exitCode: 2 };
  }
  const treeResult = await client.getTree(opts.treePrefix);
  if ("error" in treeResult) {
    opts.onProgress?.({ kind: "finish", op: "get", total: 0, act: 0, exitCode: 2, error: treeResult.error, detail: treeResult.detail });
    return { rows: [], hardError: { error: treeResult.error, detail: treeResult.detail }, exitCode: 2 };
  }
  const tipByPath = new Map;
  for (const n2 of treeResult.tree)
    tipByPath.set(n2.path, { contentHash: n2.content_hash, tipSeq: n2.tip_seq });
  const allPaths = new Set((opts.targets ?? []).map(normalizeId));
  if (!opts.explicitOnly)
    for (const p of tipByPath.keys())
      allPaths.add(p);
  const sortedPaths = [...allPaths].sort();
  const planned = [];
  const preflightRefusals = [];
  for (const repoPath of sortedPaths) {
    const abs = resolve2(opts.into, repoPath);
    if (abs !== base && !abs.startsWith(base + sep)) {
      preflightRefusals.push({ repoPath, state: "vacuous", localAbs: abs, outcome: { kind: "path-escape" } });
      continue;
    }
    const legal = isLegalPath(repoPath);
    if (!legal.ok) {
      const outcome = legal.reason === "reserved local mesh state" ? { kind: "refused-reserved" } : { kind: "path-escape" };
      preflightRefusals.push({ repoPath, state: "vacuous", localAbs: abs, outcome });
      continue;
    }
    if (hasLocalSymlinkComponent(base, repoPath)) {
      preflightRefusals.push({ repoPath, state: "vacuous", localAbs: abs, outcome: { kind: "path-escape" } });
      continue;
    }
    let localBytes;
    try {
      localBytes = new Uint8Array(readFileSync3(abs));
    } catch {
      localBytes = undefined;
    }
    const key = normalizeId(repoPath);
    const sidecar = opts.roomKey !== undefined ? readSidecarResolved(opts.into, opts.roomKey, opts.roomId, key, opts.home) : readSidecar(opts.roomId, key, opts.home);
    const tip = tipByPath.get(repoPath);
    const gated = tip !== undefined && !tip.contentHash;
    const planInput = {
      localHash: localBytes !== undefined ? "r2:" + sha256hex(localBytes) : undefined,
      baseTipHash: sidecar?.tip_hash,
      tipHash: tip?.contentHash,
      policy: policyFor(repoPath),
      isBinary: localBytes !== undefined && !isValidUtf8Bytes(localBytes),
      hasMarkers: hasPreExistingConflictMarkers(localBytes ? Buffer.from(localBytes) : undefined),
      gated
    };
    const state = classifySync({ ...planInput, tipGated: planInput.gated });
    const action = planGetTarget(planInput);
    if (state === "vacuous")
      continue;
    const ctx = { client, repoPath, into: opts.into, localAbs: abs, localBytes, sidecar, tip, prune: opts.prune };
    planned.push({ repoPath, abs, ctx, state, action });
  }
  opts.onProgress?.({ kind: "plan", op: "get", label: opts.treePrefix || "(room root)", ...categorizeGetActions(planned.map((p) => p.action)) });
  const rows = [...preflightRefusals];
  let hardError;
  let n = 0;
  const total = planned.length + preflightRefusals.length;
  for (const { repoPath, abs, ctx, state, action } of planned) {
    n++;
    opts.onProgress?.({ kind: "start", n, total, path: repoPath });
    const key = normalizeId(repoPath);
    const outcome = await applyGetTarget(ctx, action);
    const putSidecar = (s) => {
      if (opts.roomKey !== undefined)
        writeFolderSidecar(opts.into, opts.roomKey, key, s);
      else
        writeSidecar(opts.roomId, key, s, opts.home);
    };
    const drop = () => {
      if (opts.roomKey !== undefined)
        dropFolderSidecar(opts.into, opts.roomKey, key);
      dropSidecar(opts.roomId, key, opts.home);
    };
    if (outcome.kind === "downloaded" || outcome.kind === "rehydrated" || outcome.kind === "updated" || outcome.kind === "adopted" || outcome.kind === "converged" || outcome.kind === "merged-local") {
      putSidecar(buildSidecar(outcome.bytes, outcome.tipHash));
    } else if (outcome.kind === "dropped-sidecar") {
      drop();
    } else if (outcome.kind === "deleted-clean" && outcome.pruned) {
      drop();
    }
    rows.push({ repoPath, state, outcome, localAbs: abs });
    opts.onProgress?.({ kind: "get-file", n, total, path: repoPath, outcome });
    if (outcome.kind === "error") {
      hardError = { error: outcome.error, detail: outcome.detail, hint: outcome.hint };
      break;
    }
  }
  const exitCode = hardError ? 2 : rows.some((r) => GET_EXIT1[r.outcome.kind]) ? 1 : 0;
  opts.onProgress?.({ kind: "finish", op: "get", total, act: categorizeGetActions(planned.map((p) => p.action)).upload, exitCode });
  return { rows, hardError, exitCode };
}
function formatGetRowMessage(repoPath, outcome) {
  switch (outcome.kind) {
    case "noop":
    case "unchanged":
      return;
    case "dropped-sidecar":
      return `  ${repoPath} (stale sync record dropped — room no longer has this)`;
    case "downloaded":
      return `  ${repoPath} (downloaded)`;
    case "rehydrated":
      return `  ${repoPath} (re-hydrated)`;
    case "deleted-clean":
      return outcome.pruned ? `  ${repoPath} (room deleted this; local copy pruned)` : `  ${repoPath} — room deleted this; local copy untouched — 'fs get --prune' to remove it`;
    case "deleted-dirty":
      return `  ${repoPath} — room deleted this but you have unsynced local edits; local copy kept — 'fs put ${repoPath}' to resurrect it in the room, or delete it yourself`;
    case "adopted":
      return `  ${repoPath} (adopted — sync base recorded)`;
    case "forked-theirs":
      return `  ${repoPath} — two independent copies (never synced): kept yours, room's copy landed as '${outcome.forkPath}'`;
    case "ahead":
      return `  ${repoPath} — ↑ ahead (unsynced local edits) — run 'mesh fs put ${repoPath}'`;
    case "updated":
      return `  ${repoPath} (updated ← room)`;
    case "converged":
      return `  ${repoPath} (converged — sync base refreshed)`;
    case "merged-local":
      return `  ${repoPath} (merged locally — run 'mesh fs put ${repoPath}' to push)`;
    case "conflict-markers-local":
      return `  ${repoPath} — CONFLICT: markers written locally; resolve, then 'mesh fs put ${repoPath}' to push`;
    case "forked-conflict":
      return `  ${repoPath} — CONFLICT: room's version landed as '${outcome.forkPath}'; your local copy is unchanged`;
    case "refused-markers":
      return `  ${repoPath} — local file still has unresolved conflict markers — resolve them first (get never overwrites marker-bearing content)`;
    case "gated":
      return `  ${repoPath} — discoverable but content is gated — you lack a read grant on this path`;
    case "refused-ignored":
      return `  ${repoPath} — .meshignore-excluded locally; refusing to overwrite — remove it from .meshignore first, or 'mesh fs rm ${repoPath}' if you meant to drop it`;
    case "refused-reserved":
      return `  ${repoPath} — legacy reserved room path; skipped — remove it with 'mesh fs rm ${repoPath}'`;
    case "path-escape":
      return `  ${repoPath} — path escapes target directory — skipped`;
    case "error":
      return `  ${repoPath} — [${outcome.error}]${outcome.detail ? " " + outcome.detail : ""}${outcome.hint ? " — " + outcome.hint : ""}`;
  }
}
// ../engine/src/ignore.ts
import { readFileSync as readFileSync4, readdirSync as readdirSync3 } from "node:fs";
import { join as join5 } from "node:path";
function loadMeshignore(root) {
  try {
    return readFileSync4(join5(root, ".meshignore"), "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith("#"));
  } catch {
    return [];
  }
}
function globToRegexBody(glob) {
  let out = "";
  for (let i = 0;i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        out += ".*";
        i++;
      } else
        out += "[^/]*";
    } else if (c === "?") {
      out += "[^/]";
    } else if (".+^${}()|[]\\".includes(c)) {
      out += "\\" + c;
    } else {
      out += c;
    }
  }
  return out;
}
function patternToRegex(pattern) {
  let p = pattern.endsWith("/") ? pattern.slice(0, -1) : pattern;
  const anchored = p.startsWith("/");
  if (anchored)
    p = p.replace(/^\/+/, "");
  const head = anchored ? "^" : "(?:^|/)";
  return new RegExp(`${head}${globToRegexBody(p)}(?:/|$)`);
}
function makeIgnore(patterns, opts = {}) {
  const res = patterns.map(patternToRegex);
  return (rel) => {
    const segs = rel.split("/");
    const normalizedSegs = segs.map((segment) => segment.normalize("NFC").toLowerCase());
    if (normalizedSegs.includes(".meshignore") || normalizedSegs.includes(".mesh"))
      return true;
    if (!opts.includeHidden && segs.some((s) => s.startsWith(".")))
      return true;
    return res.some((re) => re.test(rel));
  };
}
function meshignoreToTarExcludes(patterns) {
  return patterns.map((p) => {
    if (p.startsWith("/"))
      return "./" + p.replace(/^\/+/, "");
    if (p.endsWith("/"))
      return p.slice(0, -1);
    return p;
  });
}
function walkDirFiles(root, isIgnored) {
  const out = [];
  const rec = (dir, rel) => {
    for (const ent of readdirSync3(dir, { withFileTypes: true })) {
      const childRel = rel ? `${rel}/${ent.name}` : ent.name;
      if (isIgnored(childRel))
        continue;
      if (ent.isDirectory())
        rec(join5(dir, ent.name), childRel);
      else if (ent.isFile())
        out.push(childRel);
    }
  };
  rec(root, "");
  return out.sort();
}
// ../engine/src/workspace-cache.ts
function isCacheFresh(cachedHash, treeHash) {
  return cachedHash !== undefined && cachedHash === treeHash;
}
var DEFAULT_MAX_BYTES = 512 * 1024 * 1024;
var DEFAULT_IDLE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

class WorkspaceCache {
  _client;
  _maxBytes;
  _idleTtlMs;
  _mirror;
  _entries = new Map;
  _totalBytes = 0;
  constructor(_rootDir, client, opts) {
    this._client = client;
    this._maxBytes = opts?.maxBytes ?? DEFAULT_MAX_BYTES;
    this._idleTtlMs = opts?.idleTtlMs ?? DEFAULT_IDLE_TTL_MS;
    this._mirror = opts?.mirror;
  }
  async read(path5) {
    let treeHash;
    if (this._mirror !== undefined) {
      const node = this._mirror.get(path5);
      if (node === undefined) {
        throw new Error(`WorkspaceCache.read: path "${path5}" not found in room tree`);
      }
      treeHash = node.content_hash;
    } else {
      const treeResult = await this._client.getTree(path5);
      if (!("tree" in treeResult)) {
        throw new Error(`WorkspaceCache.read: getTree failed for path "${path5}": ${treeResult.error}`);
      }
      const node = resolveNode(treeResult.tree, path5);
      if (node === undefined) {
        throw new Error(`WorkspaceCache.read: path "${path5}" not found in room tree`);
      }
      treeHash = node.content_hash;
    }
    if (treeHash === undefined) {
      throw new Error(`WorkspaceCache.read: path "${path5}" is content-gated (no read grant) — cannot hydrate`);
    }
    const existing = this._entries.get(path5);
    if (isCacheFresh(existing?.hash, treeHash)) {
      existing.atime = Date.now();
      return existing.bytes;
    }
    const rawHash = hashFromRef(treeHash);
    const blobResult = await this._client.getArtifact(rawHash);
    if (!(blobResult instanceof Uint8Array)) {
      throw new Error(`WorkspaceCache.read: getArtifact failed for "${path5}" (hash ${rawHash}): ${blobResult.error}`);
    }
    if (existing !== undefined) {
      this._totalBytes -= existing.bytes.byteLength;
      this._entries.delete(path5);
    }
    const entry = { hash: treeHash, bytes: blobResult, atime: Date.now() };
    this._entries.set(path5, entry);
    this._totalBytes += blobResult.byteLength;
    this._evict();
    return blobResult;
  }
  isWarm(path5, hash) {
    return this._entries.get(path5)?.hash === hash;
  }
  async warm(path5, hash) {
    if (this.isWarm(path5, hash))
      return;
    const rawHash = hashFromRef(hash);
    const blobResult = await this._client.getArtifact(rawHash);
    if (!(blobResult instanceof Uint8Array)) {
      throw new Error(`WorkspaceCache.warm: getArtifact failed for "${path5}" (hash ${rawHash}): ${blobResult.error}`);
    }
    const existing = this._entries.get(path5);
    if (existing !== undefined) {
      this._totalBytes -= existing.bytes.byteLength;
      this._entries.delete(path5);
    }
    const entry = { hash, bytes: blobResult, atime: Date.now() };
    this._entries.set(path5, entry);
    this._totalBytes += blobResult.byteLength;
    this._evict();
  }
  async ls(prefix) {
    const result = await this._client.getTree(prefix);
    if (!("tree" in result)) {
      throw new Error(`WorkspaceCache.ls: getTree failed: ${result.error}`);
    }
    return result.tree;
  }
  async hydrate(prefix) {
    const result = await this._client.getTree(prefix);
    if (!("tree" in result)) {
      throw new Error(`WorkspaceCache.hydrate: getTree failed: ${result.error}`);
    }
    const paths = [];
    for (const node of result.tree) {
      await this.read(node.path);
      paths.push(node.path);
    }
    return paths;
  }
  _evict() {
    const now = Date.now();
    for (const [path5, entry] of this._entries) {
      if (now - entry.atime > this._idleTtlMs) {
        this._totalBytes -= entry.bytes.byteLength;
        this._entries.delete(path5);
      }
    }
    while (this._totalBytes > this._maxBytes && this._entries.size > 0) {
      let oldestPath;
      let oldestAtime = Infinity;
      for (const [p, e] of this._entries) {
        if (e.atime < oldestAtime) {
          oldestAtime = e.atime;
          oldestPath = p;
        }
      }
      if (oldestPath === undefined)
        break;
      const evicted = this._entries.get(oldestPath);
      this._totalBytes -= evicted.bytes.byteLength;
      this._entries.delete(oldestPath);
    }
  }
}
// ../engine/src/tree-mirror.ts
var TREE_INERT_FILE_PERFORMATIVES = { "file.lock": true, "file.unlock": true, "file.request": true };

class TreeMirror {
  _nodes = new Map;
  _headSeq = 0;
  get headSeq() {
    return this._headSeq;
  }
  seed(rows) {
    this._nodes.clear();
    let maxSeq = 0;
    for (const r of rows) {
      this._nodes.set(normalizeId(r.path), {
        size: r.size,
        content_hash: r.content_hash,
        tip_seq: r.tip_seq,
        tip_ts: r.tip_ts
      });
      if (r.tip_seq > maxSeq)
        maxSeq = r.tip_seq;
    }
    this._headSeq = maxSeq;
  }
  fold(entry) {
    if (entry.seq !== this._headSeq + 1)
      return false;
    const performative = entry.submission.performative;
    if (performative === "file.write") {
      const d = entry.submission.data;
      if (!d || typeof d.path !== "string" || typeof d.content_hash !== "string" || typeof d.size !== "number") {
        return false;
      }
      this._nodes.set(normalizeId(d.path), {
        size: d.size,
        content_hash: d.content_hash,
        tip_seq: entry.seq,
        tip_ts: entry.room_ts
      });
    } else if (performative === "file.delete") {
      const d = entry.submission.data;
      if (!d || typeof d.path !== "string")
        return false;
      this._nodes.delete(normalizeId(d.path));
    } else if (performative.startsWith("file.") && TREE_INERT_FILE_PERFORMATIVES[performative] !== true) {
      return false;
    }
    this._headSeq = entry.seq;
    return true;
  }
  get(path5) {
    return this._nodes.get(normalizeId(path5));
  }
  getAllPaths() {
    return [...this._nodes.keys()];
  }
}
// ../engine/src/machine-registry.ts
import * as fs4 from "node:fs";
import * as path5 from "node:path";
import * as os2 from "node:os";
import { createHash as createHash2 } from "node:crypto";
function machineDir() {
  return process.env["MESH_MACHINE_DIR"] ?? path5.join(os2.homedir(), ".mesh", "machine");
}
function roomKeyFor(origin, roomId) {
  return encodeURIComponent(origin) + "#" + encodeURIComponent(roomId);
}
function parseRoomKey(roomKey) {
  const sep2 = roomKey.indexOf("#");
  if (sep2 < 0)
    return null;
  try {
    return { origin: decodeURIComponent(roomKey.slice(0, sep2)), roomId: decodeURIComponent(roomKey.slice(sep2 + 1)) };
  } catch {
    return null;
  }
}
function roomIdFromRoomKey(roomKey) {
  return parseRoomKey(roomKey)?.roomId ?? roomKey;
}
function normalizeOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}
function membershipId(home, origin, roomId) {
  return createHash2("sha256").update(`${home}|${origin}|${roomId}`).digest("hex").slice(0, 16);
}
function registryPath(dir) {
  return path5.join(dir ?? machineDir(), "registry.json");
}
function loadMachineRegistry(dir) {
  const p = registryPath(dir);
  if (!fs4.existsSync(p))
    return { v: 1, homes: [], daemons: {} };
  try {
    const raw = JSON.parse(fs4.readFileSync(p, "utf8"));
    return {
      v: 1,
      homes: Array.isArray(raw.homes) ? raw.homes : [],
      daemons: raw.daemons && typeof raw.daemons === "object" ? raw.daemons : {}
    };
  } catch {
    return { v: 1, homes: [], daemons: {} };
  }
}
function writeRegistry(dir, registry) {
  writePrivateFileAtomic(registryPath(dir), JSON.stringify(registry, null, 2) + `
`);
}
function registerHome(home, dir) {
  const resolved = path5.resolve(home);
  const registry = loadMachineRegistry(dir);
  if (registry.homes.includes(resolved))
    return;
  writeRegistry(dir, { ...registry, homes: [...registry.homes, resolved].sort() });
}
function daemonKey(home, roomKey) {
  return `${home}#${roomKey}`;
}
function readIdentityLabel(home) {
  try {
    const raw = JSON.parse(fs4.readFileSync(path5.join(home, "identity.json"), "utf8"));
    if (typeof raw.id !== "string" || typeof raw.pubkey !== "string")
      return;
    return { identityId: raw.id, pubkey: raw.pubkey };
  } catch {
    return;
  }
}
function parseRoomsFile(raw) {
  if (typeof raw === "object" && raw !== null && raw.v === 2) {
    const rawMemberships = raw.memberships;
    const memberships2 = {};
    if (typeof rawMemberships === "object" && rawMemberships !== null) {
      for (const [roomKey, entry] of Object.entries(rawMemberships)) {
        if (parseRoomKey(roomKey) === null)
          continue;
        memberships2[roomKey] = entry;
      }
    }
    return { file: { v: 2, memberships: memberships2 }, wasV1: false };
  }
  const memberships = {};
  if (typeof raw === "object" && raw !== null) {
    for (const [roomId, entry] of Object.entries(raw)) {
      if (typeof entry !== "object" || entry === null || typeof entry.url !== "string")
        continue;
      const e = entry;
      memberships[roomKeyFor(normalizeOrigin(e.url), roomId)] = e;
    }
  }
  return { file: { v: 2, memberships }, wasV1: true };
}
function readRoomsAnyVersion(home) {
  let raw;
  try {
    raw = JSON.parse(fs4.readFileSync(path5.join(home, "rooms.json"), "utf8"));
  } catch {
    return [];
  }
  const { file } = parseRoomsFile(raw);
  const out = [];
  for (const [roomKey, entry] of Object.entries(file.memberships)) {
    const parsed = parseRoomKey(roomKey);
    if (parsed === null)
      continue;
    out.push({ ...entry, roomKey, origin: parsed.origin, roomId: parsed.roomId });
  }
  return out;
}
function isActiveRoom(home, m) {
  try {
    const raw = fs4.readFileSync(path5.join(home, "active_room"), "utf8").trim();
    return raw === m.roomKey || raw === m.roomId;
  } catch {
    return false;
  }
}
function scanMachineInventory(dir) {
  const registry = loadMachineRegistry(dir);
  const defaultHome = process.env["MESH_HOME_ROOT"] ?? path5.join(os2.homedir(), ".mesh");
  const homes = new Set(registry.homes);
  homes.add(defaultHome);
  if (process.env["MESH_HOME_ROOT"] === undefined) {
    const siblingRoot = path5.dirname(defaultHome);
    let siblings;
    try {
      siblings = fs4.readdirSync(siblingRoot);
    } catch {
      siblings = [];
    }
    for (const name of siblings) {
      if (name === ".mesh" || name.startsWith(".mesh-"))
        homes.add(path5.join(siblingRoot, name));
    }
  }
  let profileNames;
  try {
    profileNames = fs4.readdirSync(path5.join(defaultHome, "profiles"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    profileNames = [];
  }
  for (const name of profileNames)
    homes.add(path5.join(defaultHome, "profiles", name));
  const out = [];
  for (const home of [...homes].sort()) {
    const identity = readIdentityLabel(home);
    if (!identity)
      continue;
    const label = home === defaultHome ? "default" : path5.basename(home);
    const memberships = readRoomsAnyVersion(home).map((m) => ({ ...m, active: isActiveRoom(home, m) }));
    out.push({ home, label, identityId: identity.identityId, pubkey: identity.pubkey, memberships });
  }
  return out;
}
// ../engine/src/status-root.ts
import { resolve as resolve4 } from "node:path";
function resolveStatusRoot(rootFlag, cwd, membership) {
  if (rootFlag !== undefined)
    return { root: resolve4(rootFlag), source: "flag" };
  const enclosing = findEnclosingAttachment(cwd, membership.origin, membership.roomId);
  if (enclosing !== null)
    return { root: enclosing, source: "enclosing-attachment" };
  return null;
}
// ../engine/src/promise-with-resolvers.ts
function withResolversPolyfill() {
  let resolvePromise;
  let rejectPromise;
  const promise = new Promise((resolve5, reject) => {
    resolvePromise = resolve5;
    rejectPromise = reject;
  });
  if (resolvePromise === undefined || rejectPromise === undefined) {
    throw new Error("Promise executor did not initialize synchronously");
  }
  return { promise, resolve: resolvePromise, reject: rejectPromise };
}
function installPromiseWithResolvers() {
  if (typeof Promise.withResolvers === "function")
    return;
  Object.defineProperty(Promise, "withResolvers", {
    configurable: true,
    writable: true,
    value: withResolversPolyfill
  });
}
// src/config.ts
var PROFILES_ROOT = () => process.env["MESH_HOME_ROOT"] ?? path6.join(os3.homedir(), ".mesh");
function readCwdProfile(cwd) {
  let dir = cwd;
  for (;; ) {
    const f = path6.join(dir, ".mesh-profile");
    if (fs6.existsSync(f))
      return fs6.readFileSync(f, "utf8").trim() || null;
    const up = path6.dirname(dir);
    if (up === dir)
      return null;
    dir = up;
  }
}
function resolveProfileHome(profileFlag, cwd = process.cwd()) {
  if (process.env["MESH_HOME"])
    return process.env["MESH_HOME"];
  const name = profileFlag ?? readCwdProfile(cwd) ?? getActiveProfile();
  return name ? path6.join(PROFILES_ROOT(), "profiles", name) : path6.join(os3.homedir(), ".mesh");
}
function loadConfig(home) {
  const f = path6.join(home ?? meshHome(), "config.json");
  if (!fs6.existsSync(f))
    return {};
  const raw = JSON.parse(fs6.readFileSync(f, "utf8"));
  if (typeof raw !== "object" || raw === null)
    return {};
  return raw;
}
function saveConfig(cfg, home) {
  const dir = home ?? meshHome();
  fs6.mkdirSync(dir, { recursive: true });
  fs6.writeFileSync(path6.join(dir, "config.json"), JSON.stringify(cfg, null, 2));
}
var DEFAULT_ROOM_URL = "https://usemesh.dev";
function resolveRoomUrl(explicit, home) {
  return explicit ?? process.env["ROOM_URL"] ?? loadConfig(home).defaultRoomUrl ?? DEFAULT_ROOM_URL;
}
function setActiveProfile(name) {
  const root = PROFILES_ROOT();
  fs6.mkdirSync(root, { recursive: true });
  fs6.writeFileSync(path6.join(root, "active_profile"), name + `
`);
}
function getActiveProfile() {
  const p = path6.join(PROFILES_ROOT(), "active_profile");
  if (!fs6.existsSync(p))
    return null;
  try {
    return fs6.readFileSync(p, "utf8").trim() || null;
  } catch {
    return null;
  }
}
function listProfiles() {
  const dir = path6.join(PROFILES_ROOT(), "profiles");
  if (!fs6.existsSync(dir))
    return [];
  return fs6.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}
function loadIdentity(home) {
  const p = path6.join(home ?? meshHome(), "identity.json");
  if (!fs6.existsSync(p))
    return null;
  try {
    fs6.chmodSync(p, 384);
  } catch {}
  return JSON.parse(fs6.readFileSync(p, "utf8"));
}
function saveIdentity(identity, home) {
  const finalPath = path6.join(home ?? meshHome(), "identity.json");
  writePrivateFileAtomic(finalPath, JSON.stringify(identity, null, 2) + `
`);
}
function persistOrExplain(identity, home, persist = saveIdentity) {
  try {
    persist(identity, home);
  } catch (err2) {
    const identityPath = path6.join(home ?? meshHome(), "identity.json");
    process.stderr.write(`
mesh: FAILED to save the new identity after the room already accepted the rotation.
` + `The old key is now dead in this room — write the JSON below to ${identityPath} manually to recover:

` + JSON.stringify(identity, null, 2) + `

`);
    throw new Error(`could not persist rotated identity to ${identityPath} (see the JSON dump above for manual recovery)`, { cause: err2 });
  }
}
function createIdentity(id, home, roles) {
  const { pubkey, secret } = keygen();
  const next = keygen();
  const identity = {
    id,
    pubkey,
    secret: Buffer.from(secret).toString("base64"),
    next_pubkey: next.pubkey,
    next_secret: Buffer.from(next.secret).toString("base64")
  };
  if (roles && roles.length > 0)
    identity.roles = roles;
  saveIdentity(identity, home);
  return identity;
}
function loadIdentityWithSecret(home) {
  const identity = loadIdentity(home);
  if (!identity)
    return null;
  return {
    id: identity.id,
    pubkey: identity.pubkey,
    secretBytes: new Uint8Array(Buffer.from(identity.secret, "base64")),
    roles: identity.roles ?? [],
    next_pubkey: identity.next_pubkey
  };
}
function rotateIdentityFile(identity) {
  if (identity.next_pubkey === undefined || identity.next_secret === undefined) {
    const next = keygen();
    return {
      identity: {
        ...identity,
        next_pubkey: next.pubkey,
        next_secret: Buffer.from(next.secret).toString("base64")
      },
      data: { next_commitment: keyCommitment(next.pubkey) }
    };
  }
  const revealPubkey = identity.next_pubkey;
  const newNext = keygen();
  return {
    identity: {
      ...identity,
      pubkey: identity.next_pubkey,
      secret: identity.next_secret,
      next_pubkey: newNext.pubkey,
      next_secret: Buffer.from(newNext.secret).toString("base64")
    },
    data: { reveal_pubkey: revealPubkey, next_commitment: keyCommitment(newNext.pubkey) }
  };
}
function ensureNextKey(identity, home) {
  if (identity.next_pubkey !== undefined && identity.next_secret !== undefined) {
    return identity;
  }
  const next = keygen();
  const upgraded = {
    ...identity,
    next_pubkey: next.pubkey,
    next_secret: Buffer.from(next.secret).toString("base64")
  };
  saveIdentity(upgraded, home);
  return upgraded;
}
function listIdentityHomes(root = os3.homedir()) {
  let names;
  try {
    names = fs6.readdirSync(root);
  } catch {
    return [];
  }
  const out = [];
  for (const name of names) {
    if (name !== ".mesh" && !name.startsWith(".mesh-"))
      continue;
    const home = path6.join(root, name);
    const identity = loadIdentity(home);
    if (identity)
      out.push({ home, identity });
  }
  return out.sort((a, b) => a.home.localeCompare(b.home));
}
function roomsPath(home) {
  return path6.join(home ?? meshHome(), "rooms.json");
}
function loadRooms(home) {
  const p = roomsPath(home);
  if (!fs6.existsSync(p))
    return { v: 2, memberships: {} };
  try {
    fs6.chmodSync(p, 384);
  } catch {}
  const raw = JSON.parse(fs6.readFileSync(p, "utf8"));
  const { file, wasV1 } = parseRoomsFile(raw);
  if (!wasV1)
    return file;
  saveRooms(file, home);
  const activeRaw = readActiveRoomRaw(home);
  if (activeRaw !== null) {
    const migratedKey = Object.keys(file.memberships).find((roomKey) => parseRoomKey(roomKey)?.roomId === activeRaw);
    if (migratedKey !== undefined)
      setActiveRoom(migratedKey, home);
  }
  return file;
}
function saveRooms(rooms, home) {
  const finalPath = roomsPath(home);
  writePrivateFileAtomic(finalPath, JSON.stringify(rooms, null, 2) + `
`);
}
function upsertRoom(roomId, entry, home) {
  const rooms = loadRooms(home);
  const roomKey = roomKeyFor(normalizeOrigin(entry.url), roomId);
  saveRooms({ v: 2, memberships: { ...rooms.memberships, [roomKey]: entry } }, home);
}
function findRoomKeysById(rooms, roomId) {
  const out = [];
  for (const roomKey of Object.keys(rooms.memberships)) {
    const parsed = parseRoomKey(roomKey);
    if (parsed !== null && parsed.roomId === roomId)
      out.push({ roomKey, origin: parsed.origin });
  }
  return out;
}
function ambiguousRoomIdError(roomId, matches, home) {
  const origins = matches.map((m) => m.origin).join(", ");
  return new Error(`Room "${roomId}" is joined on more than one origin (${origins}) in ${roomsPath(home)}. ` + `Disambiguate with --url <origin>, e.g. --room ${roomId} --url ${matches[0].origin}.`);
}
function resolveRoomKeyById(rooms, roomId, urlFlag, home) {
  let matches = findRoomKeysById(rooms, roomId);
  if (urlFlag !== undefined) {
    const originFlag = normalizeOrigin(urlFlag);
    matches = matches.filter((m) => m.origin === originFlag);
  }
  if (matches.length === 0)
    throw new Error(`Room "${roomId}" not in ${roomsPath(home)}. Run "mesh room join" first.`);
  if (matches.length > 1)
    throw ambiguousRoomIdError(roomId, matches, home);
  return matches[0].roomKey;
}
function removeRoom(roomId, home, urlFlag) {
  const rooms = loadRooms(home);
  if (findRoomKeysById(rooms, roomId).length === 0)
    return false;
  const roomKey = resolveRoomKeyById(rooms, roomId, urlFlag, home);
  const memberships = { ...rooms.memberships };
  delete memberships[roomKey];
  saveRooms({ v: 2, memberships }, home);
  if (readActiveRoomRaw(home) === roomKey)
    setActiveRoom(null, home);
  return true;
}
function isRoomIdAmbiguous(roomId, home) {
  return findRoomKeysById(loadRooms(home), roomId).length > 1;
}
function activeRoomPath(home) {
  return path6.join(home ?? meshHome(), "active_room");
}
function readActiveRoomRaw(home) {
  const p = activeRoomPath(home);
  if (!fs6.existsSync(p))
    return null;
  try {
    return fs6.readFileSync(p, "utf8").trim() || null;
  } catch {
    return null;
  }
}
function getActiveRoom(home) {
  const raw = readActiveRoomRaw(home);
  return raw === null ? null : roomIdFromRoomKey(raw);
}
function setActiveRoom(roomKey, home) {
  const p = activeRoomPath(home);
  if (roomKey === null) {
    try {
      fs6.rmSync(p, { force: true });
    } catch {}
    return;
  }
  const dir = home ?? meshHome();
  fs6.mkdirSync(dir, { recursive: true, mode: 448 });
  fs6.writeFileSync(p, roomKey + `
`, { encoding: "utf8", mode: 384 });
}
function resolveRoom(roomIdOpt, home, urlFlag) {
  const rooms = loadRooms(home);
  if (roomIdOpt) {
    const roomKey = resolveRoomKeyById(rooms, roomIdOpt, urlFlag, home);
    setActiveRoom(roomKey, home);
    return { roomId: roomIdOpt, roomKey, entry: rooms.memberships[roomKey] };
  }
  const roomKeys = Object.keys(rooms.memberships);
  if (roomKeys.length === 0)
    throw new Error('No rooms joined. Run "mesh room join" first.');
  if (roomKeys.length === 1) {
    const roomKey = roomKeys[0];
    return { roomId: roomIdFromRoomKey(roomKey), roomKey, entry: rooms.memberships[roomKey] };
  }
  const activeKey = readActiveRoomRaw(home);
  if (activeKey !== null && rooms.memberships[activeKey]) {
    return { roomId: roomIdFromRoomKey(activeKey), roomKey: activeKey, entry: rooms.memberships[activeKey] };
  }
  throw new Error(`Multiple rooms: ${roomKeys.map(roomIdFromRoomKey).join(", ")}. Use --room <room_id> (it'll be remembered next time).`);
}
function setDefaultWorkspaceRoot(roomKey, root, home) {
  const rooms = loadRooms(home);
  const entry = rooms.memberships[roomKey];
  if (!entry || entry.workspace_root !== undefined)
    return;
  saveRooms({ v: 2, memberships: { ...rooms.memberships, [roomKey]: { ...entry, workspace_root: root } } }, home);
}

// src/prompt.ts
import * as readline from "node:readline/promises";
function applyDefault(input, def) {
  const t = input.trim();
  return t === "" ? def : t;
}
async function promptLine(question, def) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const ans = await rl.question(def !== undefined ? `${question} [${def}]: ` : `${question}: `);
    return def !== undefined ? applyDefault(ans, def) : ans.trim();
  } finally {
    rl.close();
  }
}
async function promptChoice(question, choices) {
  const first = choices[0];
  if (first === undefined)
    throw new Error("promptChoice: choices must be non-empty");
  const ans = await promptLine(`${question} (${choices.join("/")})`, first);
  return choices.includes(ans) ? ans : first;
}

// src/render.ts
var RESET = "\x1B[0m";
var BOLD = "\x1B[1m";
var DIM = "\x1B[2m";
var C2 = {
  cyan: "\x1B[36m",
  white: "\x1B[37m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  green: "\x1B[32m",
  red: "\x1B[31m",
  magenta: "\x1B[35m",
  brightGreen: "\x1B[92m",
  brightRed: "\x1B[91m",
  brightBlue: "\x1B[94m",
  grey: "\x1B[90m"
};
function isTTY() {
  return Boolean(process.stdout.isTTY);
}
function ansi(code, text) {
  if (!isTTY())
    return text;
  return `${code}${text}${RESET}`;
}
var PERF_STYLE = {
  request: { label: "request", color: C2.cyan },
  inform: { label: "inform", color: C2.white },
  deliver: { label: "deliver", color: C2.green, bold: true },
  announce: { label: "announce", color: C2.yellow, bold: true },
  claim: { label: "claim", color: C2.brightBlue, bold: true },
  release: { label: "release", color: C2.magenta, bold: true },
  accept: { label: "accept", color: C2.brightGreen, bold: true },
  reject: { label: "reject", color: C2.brightRed, bold: true },
  escalate: { label: "escalate", color: C2.red, bold: true },
  "system.genesis": { label: "genesis", color: C2.grey },
  "system.join": { label: "join", color: C2.grey },
  "system.leave": { label: "leave", color: C2.grey },
  "system.roles": { label: "roles", color: C2.grey },
  "system.grant": { label: "grant", color: C2.grey },
  "system.role": { label: "role", color: C2.grey },
  "system.config": { label: "config", color: C2.grey },
  "system.lease_clear": { label: "lapse", color: C2.yellow },
  "system.revoke": { label: "revoke", color: C2.red },
  "key.rotate": { label: "rotate", color: C2.blue },
  "decide.request": { label: "ask", color: C2.cyan, bold: true },
  "decide.resolve": { label: "answer", color: C2.brightGreen, bold: true },
  "system.decision_lapse": { label: "lapsed", color: C2.yellow },
  "escalate.ack": { label: "ack", color: C2.green },
  "system.role_lapse": { label: "lapse", color: C2.yellow }
};
function truncate(s, max) {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
}
function scrubControl(s) {
  return s.replace(/[\x00-\x1f\x7f]/g, "");
}
function scrubBody(s) {
  return s.split(`
`).map(scrubControl).join(`
`);
}
function fmtTime(isoTs) {
  const t = isoTs.slice(11, 19);
  return t.length === 8 ? t : isoTs;
}
var DEFAULT_SENDER_MIN = 12;
var DEFAULT_SENDER_MAX = 28;
var DEFAULT_BODY_WIDTH = 80;
function renderEntry(entry, opts) {
  const { seq, room_ts, submission } = entry;
  const { sender, performative, task_ref, body, artifacts, data } = submission;
  const seqStr = String(seq).padStart(4, "0");
  const timeStr = fmtTime(room_ts);
  const dateStr = opts.datePrefix ? `${opts.datePrefix} ` : "";
  const style = PERF_STYLE[performative] ?? { label: performative, color: C2.white };
  const labelRaw = style.label.padEnd(8);
  const label = style.bold ? ansi(BOLD + style.color, labelRaw.toUpperCase()) : ansi(style.color, labelRaw);
  const senderStr = ansi(DIM, scrubControl(sender).padEnd(opts.senderWidth));
  const seqLabel = ansi(DIM, `[${seqStr}]`);
  const timeLabel = ansi(DIM, timeStr);
  const taskStr = task_ref ? ansi(C2.yellow, scrubControl(task_ref)) + "  " : "";
  const bodyWidth = opts.bodyWidth ?? DEFAULT_BODY_WIDTH;
  const bodySnippet = body ? ansi(DIM, `"${truncate(scrubBody(body), bodyWidth)}"`) : "";
  let pathStr = "";
  if (performative.startsWith("file.") && data && typeof data === "object") {
    const d = data;
    if (d["redacted"] === true) {
      pathStr = `  ${ansi(DIM, "[redacted]")}`;
    } else if (typeof d["path"] === "string") {
      const p = scrubControl(d["path"]);
      const size = d["size"];
      const sizeStr = performative === "file.write" && typeof size === "number" ? ` (${humanSize(size)})` : "";
      pathStr = `  ${ansi(C2.cyan, p)}${sizeStr}`;
    }
  }
  const artStr = artifacts && artifacts.length > 0 ? `  ${ansi(C2.cyan, `→ ${artifacts.map(scrubControl).join(", ")}`)}` : "";
  const ackHint = performative === "escalate" ? `  ${ansi(DIM, `— run: mesh ack ${seq}`)}` : "";
  return `${seqLabel} ${dateStr}${timeLabel}  ${senderStr}  ${label}  ${taskStr}${bodySnippet}${pathStr}${artStr}${ackHint}`;
}
function renderEntries(entries, opts = {}) {
  if (entries.length === 0)
    return "";
  const minW = Math.max(1, opts.minSenderWidth ?? DEFAULT_SENDER_MIN);
  const maxW = Math.max(minW, opts.maxSenderWidth ?? DEFAULT_SENDER_MAX);
  let maxLen = 0;
  for (const e of entries) {
    const n = e.submission.sender.length;
    if (n > maxLen)
      maxLen = n;
  }
  const senderWidth = Math.min(maxW, Math.max(minW, maxLen));
  const trackDate = opts.trackDateChanges === true;
  const today = (opts.now ?? new Date).toISOString().slice(5, 10);
  let prevDate;
  return entries.map((e) => {
    let datePrefix;
    if (trackDate) {
      const d = e.room_ts.length >= 10 && e.room_ts[4] === "-" && e.room_ts[7] === "-" ? e.room_ts.slice(5, 10) : "";
      if (d && d !== prevDate) {
        if (prevDate === undefined ? d !== today : true) {
          datePrefix = d;
        }
        prevDate = d;
      }
    }
    return renderEntry(e, { senderWidth, datePrefix });
  }).join(`
`);
}
function commonPathPrefix(paths) {
  if (paths.length === 0)
    return "";
  const segLists = paths.map((p) => p.split("/").slice(0, -1));
  let common = segLists[0];
  for (const segs of segLists.slice(1)) {
    let k = 0;
    while (k < common.length && k < segs.length && segs[k] === common[k])
      k++;
    common = common.slice(0, k);
  }
  return common.join("/");
}
function renderInboxDigest(entries, opts = {}) {
  if (entries.length === 0)
    return "";
  const minW = Math.max(1, opts.minSenderWidth ?? DEFAULT_SENDER_MIN);
  const maxW = Math.max(minW, opts.maxSenderWidth ?? DEFAULT_SENDER_MAX);
  let maxLen = 0;
  for (const e of entries) {
    const n = e.submission.sender.length;
    if (n > maxLen)
      maxLen = n;
  }
  const senderWidth = Math.min(maxW, Math.max(minW, maxLen));
  const lines = [];
  let i = 0;
  while (i < entries.length) {
    const e = entries[i];
    if (!e.submission.performative.startsWith("file.")) {
      lines.push(renderEntry(e, { senderWidth }));
      i++;
      continue;
    }
    const sender = e.submission.sender;
    let j = i + 1;
    while (j < entries.length && entries[j].submission.performative.startsWith("file.") && entries[j].submission.sender === sender)
      j++;
    const runLen = j - i;
    if (runLen === 1) {
      lines.push(renderEntry(e, { senderWidth }));
    } else {
      const paths = [];
      for (let k = i;k < j; k++) {
        const d = entries[k].submission.data;
        if (d && typeof d === "object" && typeof d["path"] === "string") {
          paths.push(d["path"]);
        }
      }
      const prefix = paths.length > 0 ? commonPathPrefix(paths) : "";
      const underStr = paths.length > 0 ? ` under ${prefix}/` : "";
      lines.push(`${scrubControl(sender)} ${runLen} file changes${underStr} (seq ${e.seq}–${entries[j - 1].seq})`);
    }
    i = j;
  }
  return lines.join(`
`);
}
function renderStateHeader(head) {
  return ansi(DIM, `head: seq=${head.seq}  ${head.entry_hash}`);
}
function renderTable(headers, rows) {
  const widths = headers.map((h2, i) => Math.max(h2.length, ...rows.map((row) => row[i]?.length ?? 0)));
  const fmt = (cols) => cols.map((c, i) => c.padEnd(widths[i] ?? 0)).join("  ");
  return [fmt(headers), ...rows.map(fmt)].join(`
`);
}
var CONDITION_STALE_AFTER_MS = 300000 * 3;
function fmtAge(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1)
    return "<1m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0)
    return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h${minutes}m`;
}
function conditionWithStaleness(condition, conditionTs, opts = {}) {
  if (condition === null || condition === undefined || condition === "")
    return condition;
  if (conditionTs === null || conditionTs === undefined)
    return condition;
  const publishedMs = Date.parse(conditionTs);
  if (Number.isNaN(publishedMs))
    return condition;
  const nowMs = opts.nowMs ?? Date.now();
  const staleAfterMs = opts.staleAfterMs ?? CONDITION_STALE_AFTER_MS;
  const ageMs = nowMs - publishedMs;
  if (ageMs <= staleAfterMs)
    return condition;
  return `${condition}? stale ${fmtAge(ageMs)}`;
}
function renderRoster(rows) {
  const dash = (s) => s === undefined || s === "" ? "-" : String(s);
  const short = (pk) => pk.replace(/^ed25519-pk:/, "").slice(0, 8);
  return renderTable(["id", "team", "host", "specialties", "last", "cond", "cond@seq", "retired", "pubkey"], rows.map((r) => {
    const specialties = r.specialties ?? r.roles;
    const cond = conditionWithStaleness(r.condition, r.condition_ts);
    return [
      scrubControl(r.participant_id),
      scrubControl(dash(r.owner_team)),
      scrubControl(dash(r.host)),
      specialties.length ? specialties.map(scrubControl).join(",") : "-",
      dash(r.last_seen_seq),
      scrubControl(dash(cond ?? undefined)),
      dash(r.condition_seq ?? undefined),
      dash(r.retired_seq ?? undefined),
      short(r.pubkey)
    ];
  }));
}
function renderDecisions(rows) {
  const dash = (s) => s === undefined || s === null || s === "" ? "-" : s;
  return renderTable(["id", "question", "authority", "deadline", "status", "resolved_by"], rows.map((r) => [
    scrubControl(r.id),
    scrubControl(truncate(r.question, 40)),
    scrubControl(r.authority.join(",")),
    dash(r.deadline),
    r.status,
    scrubControl(dash(r.resolved_by))
  ]));
}
function renderGrants(rows) {
  return renderTable(["subject", "path", "grade"], rows.map((r) => [scrubControl(r.subject), scrubControl(r.path_prefix), r.access]));
}
function fmtWindow(active_from, active_until) {
  if (active_from === null && active_until === null)
    return "-";
  const from = active_from !== null ? new Date(active_from).toISOString() : "…";
  const until = active_until !== null ? new Date(active_until).toISOString() : "…";
  return `${from}→${until}`;
}
function renderRoleBindings(rows) {
  const dash = (s) => s === undefined || s === null || s === "" ? "-" : s;
  return renderTable(["participant", "role", "depth", "window", "override", "condition"], rows.map((r) => [
    scrubControl(r.participant),
    scrubControl(r.role),
    String(r.depth),
    fmtWindow(r.active_from, r.active_until),
    r.override ? "yes" : "-",
    dash(conditionWithStaleness(r.condition, r.condition_ts))
  ]));
}
function renderLeases(rows) {
  return renderTable(["path", "holder", "expires"], rows.map((r) => [r.path, r.holder, new Date(r.lease_expires).toISOString()]));
}
function humanSize(bytes) {
  if (bytes < 1024)
    return `${bytes}B`;
  const kb = bytes / 1024;
  if (kb < 1024)
    return `${kb.toFixed(1)}KB`;
  const mb = kb / 1024;
  if (mb < 1024)
    return `${mb.toFixed(1)}MB`;
  return `${(mb / 1024).toFixed(1)}GB`;
}
function fmtTTL(remainingMs) {
  const totalSec = Math.floor(remainingMs / 1000);
  if (totalSec < 60)
    return `${totalSec}s`;
  return `${Math.floor(totalSec / 60)}m`;
}
function fmtLeaseCell(lease, now) {
  if (!lease)
    return "-";
  const remainingMs = lease.lease_expires - now;
  if (remainingMs <= 0)
    return "-";
  return `${lease.holder} ${fmtTTL(remainingMs)}`;
}
function renderWorkspace(opts) {
  const { roomId, posture, into, rows, leases, localSizes, policyFor: policyFor2, now, recent = [] } = opts;
  const totalBytes = rows.reduce((sum, r) => sum + r.size, 0);
  const hydratedPaths = rows.filter((r) => localSizes[r.path] !== undefined);
  const hydratedBytes = hydratedPaths.reduce((sum, r) => sum + localSizes[r.path], 0);
  const leaseByPath = new Map(leases.map((l) => [l.path, l]));
  const lines = [
    `room ${roomId} · posture ${posture}`,
    `local dir ${into} — ${rows.length} files · ${humanSize(totalBytes)} in room · ${hydratedPaths.length} hydrated locally (${humanSize(hydratedBytes)})`,
    "",
    renderTable(["path", "size", "policy", "tip", "lease", "editing", "local"], rows.map((r) => {
      const localSize = localSizes[r.path];
      return [
        scrubControl(r.path),
        humanSize(r.size),
        policyFor2(r.path),
        String(r.tip_seq),
        scrubControl(fmtLeaseCell(leaseByPath.get(r.path), now)),
        scrubControl(r.lease_holder ?? "-"),
        localSize === undefined ? "-" : humanSize(localSize)
      ];
    }))
  ];
  if (recent.length > 0)
    lines.push("", "recent:", ...recent.map((l) => `  ${l}`));
  return lines.join(`
`);
}
function sectionHeader(path7, tip_seq, author) {
  const safePath = scrubControl(path7);
  const parts = [
    tip_seq !== null ? `seq ${tip_seq}` : null,
    author !== null ? `by ${scrubControl(author)}` : null
  ].filter((x) => x !== null);
  return parts.length > 0 ? `  # ${safePath} — ${parts.join(" ")}` : `  # ${safePath}`;
}
function workspaceGrantLines(section) {
  if (section.writeGrants === null)
    return ["  my write access: (unavailable — could not fetch grants)"];
  if (section.writeGrants.length === 0) {
    return [section.posture === "open" ? "  my write access: (no explicit grants — posture is open, all members may write)" : "  my write access: (none — posture is closed; ask the owner for a grant)"];
  }
  return [
    "  my write access:",
    ...section.writeGrants.map((g) => `    ${scrubControl(g.path_prefix)} (${g.access})`)
  ];
}
function workspaceLeaseLines(leases) {
  if (leases === null)
    return ["  active leases: (unavailable — could not fetch leases)"];
  if (leases.length === 0)
    return ["  active leases: (none)"];
  return [
    "  active leases:",
    ...leases.map((l) => `    ${scrubControl(l.path)} — held by ${scrubControl(l.holder)} (expires ${new Date(l.lease_expires).toISOString()})`)
  ];
}
function renderBriefTeam(rows) {
  const dash = (s) => s.length === 0 ? "-" : s;
  return renderTable(["participant", "roles", "condition", "claimed"], rows.map((r) => [
    scrubControl(r.participant_id),
    dash(r.boundRoles.map(scrubControl).join(",")),
    scrubControl(dash(conditionWithStaleness(r.condition, r.condition_ts) ?? "")),
    dash(r.claimedRefs.map(scrubControl).join(","))
  ]));
}
var FILE_PLANE_USAGE_NOTE = [
  "file plane — how to touch files:",
  '  put <path>    upload; code auto-merges, conflicts -> local markers (exit 1); prose forks "name (N)"',
  "  get <path>    download; safe — never clobbers local edits the room hasn't seen",
  "  status        per-file sync state vs the room (read-only; --porcelain for scripts)",
  "  diff <path>   unified diff of your local copy vs the room tip (no local writes)",
  "  edit <path>   live collaborative co-edit (CRDT prose) — no conflicts, no forks",
  "  lock/rm       lock <path> reserves exclusive write; rm deletes",
  `  conflict rule: code keeps the room's copy + writes local markers; prose/binary fork "name (N)"`,
  "  exit codes: 0 clean  1 conflicts/forks present  2 hard error",
  "  doctor        one-step room health check: open escalations, stalled holds, fs conflicts, chain verify (--porcelain for scripts)",
  "  ack <seq>     mark an open escalation handled (any member; attributed and visible in the record)"
];
function renderBrief(b) {
  const lines = [];
  if (b.badge != null) {
    lines.push(scrubControl(b.badge));
    lines.push("");
  }
  lines.push(`who i am: ${scrubControl(b.selfId)} in ${scrubControl(b.roomId)}` + (b.roles.length > 0 ? ` (roles: ${b.roles.map(scrubControl).join(", ")})` : " (no bound roles)"));
  lines.push("");
  lines.push("room charter:");
  if (b.room.content !== null) {
    lines.push(sectionHeader(b.room.path, b.room.tip_seq, b.room.author));
    lines.push(scrubBody(b.room.content));
  } else {
    lines.push(`  no charter yet — owner can \`mesh fs put ${scrubControl(b.room.path)}\``);
  }
  lines.push("");
  lines.push("my seats:");
  if (b.roleCharters.length === 0) {
    lines.push("  (no bound roles — no seat contracts apply)");
  } else {
    for (const seat of b.roleCharters) {
      if (seat.content !== null) {
        lines.push(sectionHeader(seat.path, seat.tip_seq, seat.author));
        lines.push(scrubBody(seat.content));
      } else {
        lines.push(`  # ${scrubControl(seat.path)}`);
        lines.push(`  no seat contract yet — owner can \`mesh fs put ${scrubControl(seat.path)}\``);
      }
    }
  }
  lines.push("");
  lines.push("situation:");
  const situationLines = dutyParts(b.duties).map((p) => `  ${scrubControl(p)}`);
  if (b.openDecisions.length) {
    situationLines.push(`  open decisions awaiting your input: ${b.openDecisions.map((d) => `${d.id} (${scrubControl(d.question)})`).join(", ")}`);
  }
  lines.push(...situationLines.length ? situationLines : ["  (nothing open for you right now)"]);
  lines.push("");
  lines.push("team:");
  lines.push(b.team && b.team.length > 0 ? renderBriefTeam(b.team) : "  (no other participants)");
  lines.push("");
  lines.push("workspace:");
  lines.push(`  posture: ${b.workspace.posture}`);
  lines.push(...workspaceGrantLines(b.workspace));
  lines.push(...workspaceLeaseLines(b.workspace.leases));
  lines.push("");
  lines.push(...FILE_PLANE_USAGE_NOTE);
  return lines.join(`
`);
}

// src/chat.ts
import { createInterface as createInterface2 } from "node:readline";
var PROMPT_DEFAULT = "> ";
var CSI = "\x1B[";
var CLEAR_LINE = "\x1B[2K\r";
var CLEAR_TO_END = "\x1B[0J";
function printAboveFooter(line, footer) {
  process.stdout.write(CLEAR_LINE + line + `
` + footer);
}
function startChatInput(opts) {
  const promptText = opts.prompt ?? PROMPT_DEFAULT;
  if (!process.stdin.isTTY) {
    const rl = createInterface2({ input: process.stdin, terminal: false });
    rl.on("line", (line) => {
      opts.onSubmit(line);
    });
    rl.on("close", () => opts.onExit());
    return {
      showAbove: (text) => process.stdout.write(text + `
`),
      refresh: () => {},
      close: () => rl.close()
    };
  }
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  const statusLine = opts.status;
  const footerHeight = statusLine ? 2 : 1;
  let buffer = "";
  let cursor = 0;
  let closed = false;
  function redrawPrompt() {
    process.stdout.write(CLEAR_LINE + promptText + buffer);
    const offset = buffer.length - cursor;
    if (offset > 0)
      process.stdout.write(`${CSI}${offset}D`);
  }
  function drawFooter() {
    if (statusLine)
      process.stdout.write(statusLine + `
`);
    process.stdout.write(promptText + buffer);
    const offset = buffer.length - cursor;
    if (offset > 0)
      process.stdout.write(`${CSI}${offset}D`);
  }
  function gotoFooterTop() {
    process.stdout.write("\r");
    if (footerHeight > 1)
      process.stdout.write(`${CSI}${footerHeight - 1}A`);
  }
  function showAbove(text) {
    gotoFooterTop();
    process.stdout.write(CLEAR_TO_END);
    process.stdout.write(text + `
`);
    drawFooter();
  }
  function close() {
    if (closed)
      return;
    closed = true;
    if (process.stdin.isTTY)
      process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeListener("data", onData);
  }
  function onData(chunk) {
    let i = 0;
    while (i < chunk.length) {
      const c = chunk[i];
      const code = c.charCodeAt(0);
      if (code === 3) {
        process.stdout.write(`
`);
        close();
        opts.onExit();
        return;
      }
      if (code === 4) {
        if (buffer.length === 0) {
          process.stdout.write(`
`);
          close();
          opts.onExit();
          return;
        }
        if (cursor < buffer.length) {
          buffer = buffer.slice(0, cursor) + buffer.slice(cursor + 1);
          redrawPrompt();
        }
        i++;
        continue;
      }
      if (code === 12) {
        process.stdout.write("\x1B[2J\x1B[H");
        drawFooter();
        i++;
        continue;
      }
      if (code === 1) {
        cursor = 0;
        redrawPrompt();
        i++;
        continue;
      }
      if (code === 5) {
        cursor = buffer.length;
        redrawPrompt();
        i++;
        continue;
      }
      if (code === 11) {
        buffer = buffer.slice(0, cursor);
        redrawPrompt();
        i++;
        continue;
      }
      if (code === 21) {
        buffer = buffer.slice(cursor);
        cursor = 0;
        redrawPrompt();
        i++;
        continue;
      }
      if (code === 23) {
        if (cursor === 0) {
          i++;
          continue;
        }
        let j = cursor;
        while (j > 0 && buffer[j - 1] === " ")
          j--;
        while (j > 0 && buffer[j - 1] !== " ")
          j--;
        buffer = buffer.slice(0, j) + buffer.slice(cursor);
        cursor = j;
        redrawPrompt();
        i++;
        continue;
      }
      if (code === 13 || code === 10) {
        const line = buffer;
        buffer = "";
        cursor = 0;
        redrawPrompt();
        opts.onSubmit(line);
        i++;
        continue;
      }
      if (code === 127 || code === 8) {
        if (cursor > 0) {
          buffer = buffer.slice(0, cursor - 1) + buffer.slice(cursor);
          cursor--;
          redrawPrompt();
        }
        i++;
        continue;
      }
      if (code === 9) {
        buffer = buffer.slice(0, cursor) + "    " + buffer.slice(cursor);
        cursor += 4;
        redrawPrompt();
        i++;
        continue;
      }
      if (code < 32) {
        i++;
        continue;
      }
      if (c === "\x1B" && i + 2 < chunk.length) {
        const seq = chunk.slice(i, i + 3);
        if (seq === "\x1B[D") {
          if (cursor > 0)
            cursor--;
          redrawPrompt();
          i += 3;
          continue;
        }
        if (seq === "\x1B[C") {
          if (cursor < buffer.length)
            cursor++;
          redrawPrompt();
          i += 3;
          continue;
        }
        if (seq === "\x1B[H") {
          cursor = 0;
          redrawPrompt();
          i += 3;
          continue;
        }
        if (seq === "\x1B[F") {
          cursor = buffer.length;
          redrawPrompt();
          i += 3;
          continue;
        }
        i += 3;
        continue;
      }
      if (code >= 32) {
        buffer = buffer.slice(0, cursor) + c + buffer.slice(cursor);
        cursor += c.length;
        redrawPrompt();
        i++;
        continue;
      }
      i++;
    }
  }
  process.stdin.on("data", onData);
  drawFooter();
  return {
    showAbove,
    refresh: redrawPrompt,
    close
  };
}

// src/progress.ts
var CLEAR_LINE2 = "\x1B[2K\r";
var PLAIN_THROTTLE_MS = 1000;
function resolveMode(json, isTty) {
  if (json)
    return "json";
  return isTty ? "tty" : "plain";
}
function parseRate(s) {
  const parts = s.split(";");
  const rateM = /^(\d+(?:\.\d+)?)\/min$/.exec((parts[0] ?? "").trim());
  if (!rateM)
    return;
  const rate = parseFloat(rateM[1]);
  let burst = rate;
  const burstM = /^burst=(\d+)$/.exec((parts[1] ?? "").trim());
  if (burstM)
    burst = parseInt(burstM[1], 10);
  return { rate, burst };
}
function etaSeconds(act, rateLimit) {
  if (rateLimit === undefined)
    return;
  const p = parseRate(rateLimit);
  if (!p)
    return;
  if (p.rate <= 0)
    return;
  const floor = Math.ceil(p.burst * 0.2);
  const instant = Math.max(0, p.burst - floor);
  const throttled = Math.max(0, act - instant);
  return Math.round(throttled / p.rate * 60);
}
function pct(n, total) {
  return total === 0 ? 100 : Math.floor(n / total * 100);
}
function humanEta(s) {
  if (s < 60)
    return `~${s}s`;
  return `~${Math.round(s / 60)} min`;
}
function createReporter(opts) {
  const out = opts.out ?? ((s) => {
    process.stderr.write(s);
  });
  const jsonOut = opts.jsonOut ?? ((s) => {
    process.stdout.write(s);
  });
  const now = opts.now ?? (() => Date.now());
  const { mode } = opts;
  let curN = 0, curTotal = 0, curPath = "";
  let waited = 0;
  let rateNoticeShown = false;
  let startMs = 0;
  let doneCount = 0;
  let lastPlainMs = 0;
  const tally = {};
  function liveEtaStr() {
    if (doneCount < 1 || startMs === 0)
      return "";
    const elapsedS = (now() - startMs) / 1000;
    if (elapsedS <= 0)
      return "";
    const perFile = elapsedS / doneCount;
    const remaining = Math.max(0, curTotal - curN);
    return `   ${DIM2}~${humanEta(Math.round(perFile * remaining)).replace(/^~/, "")} left${RESET2}`;
  }
  function renderTtyLine() {
    const p = curTotal ? ` (${pct(curN, curTotal)}%)` : "";
    const wait = waited > 0 ? `   ${DIM2}rate-limited, waited ${waited}s${RESET2}` : "";
    out(`${CLEAR_LINE2}${UP} ${curN}/${curTotal}${p}  ${curPath}${wait}${liveEtaStr()}`);
  }
  const sink = (e) => {
    switch (e.kind) {
      case "plan": {
        if (mode === "json") {
          jsonOut(JSON.stringify({
            type: "plan",
            op: e.op,
            label: e.label,
            total: e.total,
            upload: e.upload,
            new: e.newCount,
            changed: e.changed,
            unchanged: e.unchanged,
            locked: e.locked,
            skipped: e.skipped,
            eta_s: e.op === "put" ? etaSeconds(e.upload, opts.rateLimit) ?? null : null
          }) + `
`);
          return;
        }
        const verb = e.op === "put" ? "upload" : "download";
        const eta = e.op === "put" ? etaSeconds(e.upload, opts.rateLimit) : undefined;
        const etaStr = eta !== undefined && eta > 0 ? `, ${humanEta(eta)} est. at current rate limit` : "";
        out(`${e.op} ${e.label}
`);
        out(`  ${e.total} files: ${e.upload} to ${verb}` + (e.op === "put" ? ` (${e.newCount} new, ${e.changed} changed)` : "") + `, ${e.unchanged} unchanged` + (e.locked ? `, ${e.locked} locked` : "") + (e.skipped ? `, ${e.skipped} skipped` : "") + `${etaStr}
`);
        curTotal = e.total;
        return;
      }
      case "start": {
        if (startMs === 0)
          startMs = now();
        curN = e.n;
        curTotal = e.total;
        curPath = e.path;
        waited = 0;
        if (mode === "tty")
          renderTtyLine();
        return;
      }
      case "put-file":
      case "get-file": {
        curN = e.n;
        curTotal = e.total;
        curPath = e.path;
        doneCount++;
        tally[e.outcome.kind] = (tally[e.outcome.kind] ?? 0) + 1;
        if (mode === "json") {
          const extra = e.outcome.kind === "error" ? { error: e.outcome.error, ...e.outcome.detail !== undefined && { detail: e.outcome.detail } } : {};
          jsonOut(JSON.stringify({ type: "file", n: e.n, total: e.total, path: e.path, outcome: e.outcome.kind, ...extra }) + `
`);
          return;
        }
        if (mode === "tty") {
          renderTtyLine();
          return;
        }
        {
          const t = now();
          if (t - lastPlainMs >= PLAIN_THROTTLE_MS) {
            lastPlainMs = t;
            const p = curTotal ? ` (${pct(curN, curTotal)}%)` : "";
            const wait = waited > 0 ? `  (rate-limited, waited ${waited}s)` : "";
            out(`  ${UP} ${curN}/${curTotal}${p}  ${curPath}${wait}
`);
          }
        }
        return;
      }
      case "finish": {
        if (mode === "json") {
          const elapsed_s = startMs === 0 ? 0 : Math.max(0, Math.round((now() - startMs) / 1000));
          jsonOut(JSON.stringify({
            type: "done",
            op: e.op,
            total: e.total,
            act: e.act,
            exit: e.exitCode,
            elapsed_s,
            stopped: e.stopped ?? false,
            outcomes: tally,
            ...e.error !== undefined && { error: e.error },
            ...e.detail !== undefined && { detail: e.detail }
          }) + `
`);
          return;
        }
        if (mode === "tty") {
          out(CLEAR_LINE2);
          return;
        }
        return;
      }
    }
  };
  const onWait = (cumWaitedS) => {
    waited = cumWaitedS;
    if (mode === "json") {
      jsonOut(JSON.stringify({ type: "ratelimit", waited_s: cumWaitedS }) + `
`);
      return;
    }
    if (mode === "tty") {
      renderTtyLine();
      return;
    }
    if (!rateNoticeShown) {
      rateNoticeShown = true;
      out(`  … rate-limited; throttling to the room's limit (normal — will continue)
`);
    }
  };
  return { sink, onWait };
}
var UP = "⬆";
var DIM2 = "\x1B[2m";
var RESET2 = "\x1B[0m";

// src/main.ts
import { readFileSync as readFileSync14, statSync as statSync5, lstatSync as lstatSync2, existsSync as existsSync8 } from "node:fs";
import * as os5 from "node:os";
import { resolve as resolve8, join as join14, sep as sep3, relative, isAbsolute as isAbsolute3, basename as basename4 } from "node:path";

// src/deps.ts
import { dirname as dirname6, join as join8, normalize } from "node:path";
var IMPORT_RE = /(?:import|export)[^"']*?from\s*["']([^"']+)["']|import\s*["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;
function resolveRel(fromFile, spec) {
  if (!spec.startsWith("."))
    return null;
  const p = normalize(join8(dirname6(fromFile), spec));
  return p.endsWith(".ts") || p.endsWith(".js") ? p : p + ".ts";
}
var tsResolver = {
  async closure(entry, read) {
    const seen = new Set;
    const out = new Set;
    const stack = [entry];
    while (stack.length > 0) {
      const f = stack.pop();
      if (seen.has(f))
        continue;
      seen.add(f);
      const src = await read(f);
      for (const m of src.matchAll(IMPORT_RE)) {
        const spec = m[1] ?? m[2] ?? m[3];
        if (!spec)
          continue;
        const r = resolveRel(f, spec);
        if (r && r !== entry) {
          out.add(r);
          stack.push(r);
        }
      }
    }
    return [...out];
  }
};

// ../../node_modules/lib0/map.js
var create = () => new Map;
var copy = (m) => {
  const r = create();
  m.forEach((v, k) => {
    r.set(k, v);
  });
  return r;
};
var setIfUndefined = (map, key, createT) => {
  let set = map.get(key);
  if (set === undefined) {
    map.set(key, set = createT());
  }
  return set;
};
var any = (m, f) => {
  for (const [key, value] of m) {
    if (f(value, key)) {
      return true;
    }
  }
  return false;
};

// ../../node_modules/lib0/set.js
var create2 = () => new Set;

// ../../node_modules/lib0/array.js
var last = (arr) => arr[arr.length - 1];
var appendTo = (dest, src) => {
  for (let i = 0;i < src.length; i++) {
    dest.push(src[i]);
  }
};
var from = Array.from;
var isArray = Array.isArray;

// ../../node_modules/lib0/observable.js
class ObservableV2 {
  constructor() {
    this._observers = create();
  }
  on(name, f) {
    setIfUndefined(this._observers, name, create2).add(f);
    return f;
  }
  once(name, f) {
    const _f = (...args) => {
      this.off(name, _f);
      f(...args);
    };
    this.on(name, _f);
  }
  off(name, f) {
    const observers = this._observers.get(name);
    if (observers !== undefined) {
      observers.delete(f);
      if (observers.size === 0) {
        this._observers.delete(name);
      }
    }
  }
  emit(name, args) {
    return from((this._observers.get(name) || create()).values()).forEach((f) => f(...args));
  }
  destroy() {
    this._observers = create();
  }
}

// ../../node_modules/lib0/math.js
var floor = Math.floor;
var abs = Math.abs;
var min = (a, b) => a < b ? a : b;
var max = (a, b) => a > b ? a : b;
var isNegativeZero = (n) => n !== 0 ? n < 0 : 1 / n < 0;

// ../../node_modules/lib0/binary.js
var BIT1 = 1;
var BIT2 = 2;
var BIT3 = 4;
var BIT4 = 8;
var BIT6 = 32;
var BIT7 = 64;
var BIT8 = 128;
var BIT18 = 1 << 17;
var BIT19 = 1 << 18;
var BIT20 = 1 << 19;
var BIT21 = 1 << 20;
var BIT22 = 1 << 21;
var BIT23 = 1 << 22;
var BIT24 = 1 << 23;
var BIT25 = 1 << 24;
var BIT26 = 1 << 25;
var BIT27 = 1 << 26;
var BIT28 = 1 << 27;
var BIT29 = 1 << 28;
var BIT30 = 1 << 29;
var BIT31 = 1 << 30;
var BIT32 = 1 << 31;
var BITS5 = 31;
var BITS6 = 63;
var BITS7 = 127;
var BITS17 = BIT18 - 1;
var BITS18 = BIT19 - 1;
var BITS19 = BIT20 - 1;
var BITS20 = BIT21 - 1;
var BITS21 = BIT22 - 1;
var BITS22 = BIT23 - 1;
var BITS23 = BIT24 - 1;
var BITS24 = BIT25 - 1;
var BITS25 = BIT26 - 1;
var BITS26 = BIT27 - 1;
var BITS27 = BIT28 - 1;
var BITS28 = BIT29 - 1;
var BITS29 = BIT30 - 1;
var BITS30 = BIT31 - 1;
var BITS31 = 2147483647;

// ../../node_modules/lib0/number.js
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
var MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
var LOWEST_INT32 = 1 << 31;
var isInteger = Number.isInteger || ((num) => typeof num === "number" && isFinite(num) && floor(num) === num);

// ../../node_modules/lib0/string.js
var fromCharCode = String.fromCharCode;
var fromCodePoint = String.fromCodePoint;
var MAX_UTF16_CHARACTER = fromCharCode(65535);
var toLowerCase = (s) => s.toLowerCase();
var trimLeftRegex = /^\s*/g;
var trimLeft = (s) => s.replace(trimLeftRegex, "");
var fromCamelCaseRegex = /([A-Z])/g;
var fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, (match) => `${separator}${toLowerCase(match)}`));
var _encodeUtf8Polyfill = (str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  const buf = new Uint8Array(len);
  for (let i = 0;i < len; i++) {
    buf[i] = encodedString.codePointAt(i);
  }
  return buf;
};
var utf8TextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder : null;
var _encodeUtf8Native = (str) => utf8TextEncoder.encode(str);
var encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array).length === 1) {
  utf8TextDecoder = null;
}

// ../../node_modules/lib0/encoding.js
class Encoder {
  constructor() {
    this.cpos = 0;
    this.cbuf = new Uint8Array(100);
    this.bufs = [];
  }
}
var createEncoder = () => new Encoder;
var length = (encoder) => {
  let len = encoder.cpos;
  for (let i = 0;i < encoder.bufs.length; i++) {
    len += encoder.bufs[i].length;
  }
  return len;
};
var toUint8Array = (encoder) => {
  const uint8arr = new Uint8Array(length(encoder));
  let curPos = 0;
  for (let i = 0;i < encoder.bufs.length; i++) {
    const d = encoder.bufs[i];
    uint8arr.set(d, curPos);
    curPos += d.length;
  }
  uint8arr.set(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
  return uint8arr;
};
var verifyLen = (encoder, len) => {
  const bufferLen = encoder.cbuf.length;
  if (bufferLen - encoder.cpos < len) {
    encoder.bufs.push(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos));
    encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
    encoder.cpos = 0;
  }
};
var write = (encoder, num) => {
  const bufferLen = encoder.cbuf.length;
  if (encoder.cpos === bufferLen) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(bufferLen * 2);
    encoder.cpos = 0;
  }
  encoder.cbuf[encoder.cpos++] = num;
};
var writeUint8 = write;
var writeVarUint = (encoder, num) => {
  while (num > BITS7) {
    write(encoder, BIT8 | BITS7 & num);
    num = floor(num / 128);
  }
  write(encoder, BITS7 & num);
};
var writeVarInt = (encoder, num) => {
  const isNegative = isNegativeZero(num);
  if (isNegative) {
    num = -num;
  }
  write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | BITS6 & num);
  num = floor(num / 64);
  while (num > 0) {
    write(encoder, (num > BITS7 ? BIT8 : 0) | BITS7 & num);
    num = floor(num / 128);
  }
};
var _strBuffer = new Uint8Array(30000);
var _maxStrBSize = _strBuffer.length / 3;
var _writeVarStringNative = (encoder, str) => {
  if (str.length < _maxStrBSize) {
    const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
    writeVarUint(encoder, written);
    for (let i = 0;i < written; i++) {
      write(encoder, _strBuffer[i]);
    }
  } else {
    writeVarUint8Array(encoder, encodeUtf8(str));
  }
};
var _writeVarStringPolyfill = (encoder, str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  writeVarUint(encoder, len);
  for (let i = 0;i < len; i++) {
    write(encoder, encodedString.codePointAt(i));
  }
};
var writeVarString = utf8TextEncoder && utf8TextEncoder.encodeInto ? _writeVarStringNative : _writeVarStringPolyfill;
var writeUint8Array = (encoder, uint8Array) => {
  const bufferLen = encoder.cbuf.length;
  const cpos = encoder.cpos;
  const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
  const rightCopyLen = uint8Array.length - leftCopyLen;
  encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
  encoder.cpos += leftCopyLen;
  if (rightCopyLen > 0) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
    encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
    encoder.cpos = rightCopyLen;
  }
};
var writeVarUint8Array = (encoder, uint8Array) => {
  writeVarUint(encoder, uint8Array.byteLength);
  writeUint8Array(encoder, uint8Array);
};
var writeOnDataView = (encoder, len) => {
  verifyLen(encoder, len);
  const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
  encoder.cpos += len;
  return dview;
};
var writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);
var writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);
var writeBigInt64 = (encoder, num) => writeOnDataView(encoder, 8).setBigInt64(0, num, false);
var floatTestBed = new DataView(new ArrayBuffer(4));
var isFloat32 = (num) => {
  floatTestBed.setFloat32(0, num);
  return floatTestBed.getFloat32(0) === num;
};
var writeAny = (encoder, data) => {
  switch (typeof data) {
    case "string":
      write(encoder, 119);
      writeVarString(encoder, data);
      break;
    case "number":
      if (isInteger(data) && abs(data) <= BITS31) {
        write(encoder, 125);
        writeVarInt(encoder, data);
      } else if (isFloat32(data)) {
        write(encoder, 124);
        writeFloat32(encoder, data);
      } else {
        write(encoder, 123);
        writeFloat64(encoder, data);
      }
      break;
    case "bigint":
      write(encoder, 122);
      writeBigInt64(encoder, data);
      break;
    case "object":
      if (data === null) {
        write(encoder, 126);
      } else if (isArray(data)) {
        write(encoder, 117);
        writeVarUint(encoder, data.length);
        for (let i = 0;i < data.length; i++) {
          writeAny(encoder, data[i]);
        }
      } else if (data instanceof Uint8Array) {
        write(encoder, 116);
        writeVarUint8Array(encoder, data);
      } else {
        write(encoder, 118);
        const keys = Object.keys(data);
        writeVarUint(encoder, keys.length);
        for (let i = 0;i < keys.length; i++) {
          const key = keys[i];
          writeVarString(encoder, key);
          writeAny(encoder, data[key]);
        }
      }
      break;
    case "boolean":
      write(encoder, data ? 120 : 121);
      break;
    default:
      write(encoder, 127);
  }
};

class RleEncoder extends Encoder {
  constructor(writer) {
    super();
    this.w = writer;
    this.s = null;
    this.count = 0;
  }
  write(v) {
    if (this.s === v) {
      this.count++;
    } else {
      if (this.count > 0) {
        writeVarUint(this, this.count - 1);
      }
      this.count = 1;
      this.w(this, v);
      this.s = v;
    }
  }
}
var flushUintOptRleEncoder = (encoder) => {
  if (encoder.count > 0) {
    writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
    if (encoder.count > 1) {
      writeVarUint(encoder.encoder, encoder.count - 2);
    }
  }
};

class UintOptRleEncoder {
  constructor() {
    this.encoder = new Encoder;
    this.s = 0;
    this.count = 0;
  }
  write(v) {
    if (this.s === v) {
      this.count++;
    } else {
      flushUintOptRleEncoder(this);
      this.count = 1;
      this.s = v;
    }
  }
  toUint8Array() {
    flushUintOptRleEncoder(this);
    return toUint8Array(this.encoder);
  }
}
var flushIntDiffOptRleEncoder = (encoder) => {
  if (encoder.count > 0) {
    const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1);
    writeVarInt(encoder.encoder, encodedDiff);
    if (encoder.count > 1) {
      writeVarUint(encoder.encoder, encoder.count - 2);
    }
  }
};

class IntDiffOptRleEncoder {
  constructor() {
    this.encoder = new Encoder;
    this.s = 0;
    this.count = 0;
    this.diff = 0;
  }
  write(v) {
    if (this.diff === v - this.s) {
      this.s = v;
      this.count++;
    } else {
      flushIntDiffOptRleEncoder(this);
      this.count = 1;
      this.diff = v - this.s;
      this.s = v;
    }
  }
  toUint8Array() {
    flushIntDiffOptRleEncoder(this);
    return toUint8Array(this.encoder);
  }
}

class StringEncoder {
  constructor() {
    this.sarr = [];
    this.s = "";
    this.lensE = new UintOptRleEncoder;
  }
  write(string) {
    this.s += string;
    if (this.s.length > 19) {
      this.sarr.push(this.s);
      this.s = "";
    }
    this.lensE.write(string.length);
  }
  toUint8Array() {
    const encoder = new Encoder;
    this.sarr.push(this.s);
    this.s = "";
    writeVarString(encoder, this.sarr.join(""));
    writeUint8Array(encoder, this.lensE.toUint8Array());
    return toUint8Array(encoder);
  }
}

// ../../node_modules/lib0/error.js
var create3 = (s) => new Error(s);
var methodUnimplemented = () => {
  throw create3("Method unimplemented");
};
var unexpectedCase = () => {
  throw create3("Unexpected case");
};

// ../../node_modules/lib0/decoding.js
var errorUnexpectedEndOfArray = create3("Unexpected end of array");
var errorIntegerOutOfRange = create3("Integer out of Range");

class Decoder {
  constructor(uint8Array) {
    this.arr = uint8Array;
    this.pos = 0;
  }
}
var createDecoder = (uint8Array) => new Decoder(uint8Array);
var hasContent = (decoder) => decoder.pos !== decoder.arr.length;
var readUint8Array = (decoder, len) => {
  const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
  decoder.pos += len;
  return view;
};
var readVarUint8Array = (decoder) => readUint8Array(decoder, readVarUint(decoder));
var readUint8 = (decoder) => decoder.arr[decoder.pos++];
var readVarUint = (decoder) => {
  let num = 0;
  let mult = 1;
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    const r = decoder.arr[decoder.pos++];
    num = num + (r & BITS7) * mult;
    mult *= 128;
    if (r < BIT8) {
      return num;
    }
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange;
    }
  }
  throw errorUnexpectedEndOfArray;
};
var readVarInt = (decoder) => {
  let r = decoder.arr[decoder.pos++];
  let num = r & BITS6;
  let mult = 64;
  const sign2 = (r & BIT7) > 0 ? -1 : 1;
  if ((r & BIT8) === 0) {
    return sign2 * num;
  }
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    r = decoder.arr[decoder.pos++];
    num = num + (r & BITS7) * mult;
    mult *= 128;
    if (r < BIT8) {
      return sign2 * num;
    }
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange;
    }
  }
  throw errorUnexpectedEndOfArray;
};
var _readVarStringPolyfill = (decoder) => {
  let remainingLen = readVarUint(decoder);
  if (remainingLen === 0) {
    return "";
  } else {
    let encodedString = String.fromCodePoint(readUint8(decoder));
    if (--remainingLen < 100) {
      while (remainingLen--) {
        encodedString += String.fromCodePoint(readUint8(decoder));
      }
    } else {
      while (remainingLen > 0) {
        const nextLen = remainingLen < 1e4 ? remainingLen : 1e4;
        const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
        decoder.pos += nextLen;
        encodedString += String.fromCodePoint.apply(null, bytes);
        remainingLen -= nextLen;
      }
    }
    return decodeURIComponent(escape(encodedString));
  }
};
var _readVarStringNative = (decoder) => utf8TextDecoder.decode(readVarUint8Array(decoder));
var readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;
var readFromDataView = (decoder, len) => {
  const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
  decoder.pos += len;
  return dv;
};
var readFloat32 = (decoder) => readFromDataView(decoder, 4).getFloat32(0, false);
var readFloat64 = (decoder) => readFromDataView(decoder, 8).getFloat64(0, false);
var readBigInt64 = (decoder) => readFromDataView(decoder, 8).getBigInt64(0, false);
var readAnyLookupTable = [
  (decoder) => {
    return;
  },
  (decoder) => null,
  readVarInt,
  readFloat32,
  readFloat64,
  readBigInt64,
  (decoder) => false,
  (decoder) => true,
  readVarString,
  (decoder) => {
    const len = readVarUint(decoder);
    const obj = {};
    for (let i = 0;i < len; i++) {
      const key = readVarString(decoder);
      obj[key] = readAny(decoder);
    }
    return obj;
  },
  (decoder) => {
    const len = readVarUint(decoder);
    const arr = [];
    for (let i = 0;i < len; i++) {
      arr.push(readAny(decoder));
    }
    return arr;
  },
  readVarUint8Array
];
var readAny = (decoder) => readAnyLookupTable[127 - readUint8(decoder)](decoder);

class RleDecoder extends Decoder {
  constructor(uint8Array, reader) {
    super(uint8Array);
    this.reader = reader;
    this.s = null;
    this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = this.reader(this);
      if (hasContent(this)) {
        this.count = readVarUint(this) + 1;
      } else {
        this.count = -1;
      }
    }
    this.count--;
    return this.s;
  }
}
class UintOptRleDecoder extends Decoder {
  constructor(uint8Array) {
    super(uint8Array);
    this.s = 0;
    this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = readVarInt(this);
      const isNegative = isNegativeZero(this.s);
      this.count = 1;
      if (isNegative) {
        this.s = -this.s;
        this.count = readVarUint(this) + 2;
      }
    }
    this.count--;
    return this.s;
  }
}
class IntDiffOptRleDecoder extends Decoder {
  constructor(uint8Array) {
    super(uint8Array);
    this.s = 0;
    this.count = 0;
    this.diff = 0;
  }
  read() {
    if (this.count === 0) {
      const diff = readVarInt(this);
      const hasCount = diff & 1;
      this.diff = floor(diff / 2);
      this.count = 1;
      if (hasCount) {
        this.count = readVarUint(this) + 2;
      }
    }
    this.s += this.diff;
    this.count--;
    return this.s;
  }
}

class StringDecoder {
  constructor(uint8Array) {
    this.decoder = new UintOptRleDecoder(uint8Array);
    this.str = readVarString(this.decoder);
    this.spos = 0;
  }
  read() {
    const end = this.spos + this.decoder.read();
    const res = this.str.slice(this.spos, end);
    this.spos = end;
    return res;
  }
}

// ../../node_modules/lib0/webcrypto.node.js
import { webcrypto } from "node:crypto";
var subtle2 = webcrypto.subtle;
var getRandomValues = webcrypto.getRandomValues.bind(webcrypto);

// ../../node_modules/lib0/random.js
var uint32 = () => getRandomValues(new Uint32Array(1))[0];
var uuidv4Template = [1e7] + -1000 + -4000 + -8000 + -100000000000;
var uuidv4 = () => uuidv4Template.replace(/[018]/g, (c) => (c ^ uint32() & 15 >> c / 4).toString(16));

// ../../node_modules/lib0/time.js
var getUnixTime = Date.now;

// ../../node_modules/lib0/promise.js
var create4 = (f) => new Promise(f);
var all = Promise.all.bind(Promise);

// ../../node_modules/lib0/conditions.js
var undefinedToNull = (v) => v === undefined ? null : v;

// ../../node_modules/lib0/storage.js
class VarStoragePolyfill {
  constructor() {
    this.map = new Map;
  }
  setItem(key, newValue) {
    this.map.set(key, newValue);
  }
  getItem(key) {
    return this.map.get(key);
  }
}
var _localStorage = new VarStoragePolyfill;
var usePolyfill = true;
try {
  if (typeof localStorage !== "undefined" && localStorage) {
    _localStorage = localStorage;
    usePolyfill = false;
  }
} catch (e) {}
var varStorage = _localStorage;

// ../../node_modules/lib0/trait/equality.js
var EqualityTraitSymbol = Symbol("Equality");
var equals = (a, b) => a === b || !!a?.[EqualityTraitSymbol]?.(b) || false;

// ../../node_modules/lib0/object.js
var assign = Object.assign;
var keys = Object.keys;
var forEach = (obj, f) => {
  for (const key in obj) {
    f(obj[key], key);
  }
};
var size = (obj) => keys(obj).length;
var isEmpty = (obj) => {
  for (const _k in obj) {
    return false;
  }
  return true;
};
var every = (obj, f) => {
  for (const key in obj) {
    if (!f(obj[key], key)) {
      return false;
    }
  }
  return true;
};
var hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
var equalFlat = (a, b) => a === b || size(a) === size(b) && every(a, (val, key) => (val !== undefined || hasProperty(b, key)) && equals(b[key], val));
var freeze = Object.freeze;
var deepFreeze = (o) => {
  for (const key in o) {
    const c = o[key];
    if (typeof c === "object" || typeof c === "function") {
      deepFreeze(o[key]);
    }
  }
  return freeze(o);
};

// ../../node_modules/lib0/function.js
var callAll = (fs7, args, i = 0) => {
  try {
    for (;i < fs7.length; i++) {
      fs7[i](...args);
    }
  } finally {
    if (i < fs7.length) {
      callAll(fs7, args, i + 1);
    }
  }
};
var id = (a) => a;
var isOneOf = (value, options) => options.includes(value);

// ../../node_modules/lib0/environment.js
var isNode = typeof process !== "undefined" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
var isMac = typeof navigator !== "undefined" ? /Mac/.test(navigator.platform) : false;
var params;
var args = [];
var computeParams = () => {
  if (params === undefined) {
    if (isNode) {
      params = create();
      const pargs = process.argv;
      let currParamName = null;
      for (let i = 0;i < pargs.length; i++) {
        const parg = pargs[i];
        if (parg[0] === "-") {
          if (currParamName !== null) {
            params.set(currParamName, "");
          }
          currParamName = parg;
        } else {
          if (currParamName !== null) {
            params.set(currParamName, parg);
            currParamName = null;
          } else {
            args.push(parg);
          }
        }
      }
      if (currParamName !== null) {
        params.set(currParamName, "");
      }
    } else if (typeof location === "object") {
      params = create();
      (location.search || "?").slice(1).split("&").forEach((kv) => {
        if (kv.length !== 0) {
          const [key, value] = kv.split("=");
          params.set(`--${fromCamelCase(key, "-")}`, value);
          params.set(`-${fromCamelCase(key, "-")}`, value);
        }
      });
    } else {
      params = create();
    }
  }
  return params;
};
var hasParam = (name) => computeParams().has(name);
var getVariable = (name) => isNode ? undefinedToNull(process.env[name.toUpperCase().replaceAll("-", "_")]) : undefinedToNull(varStorage.getItem(name));
var hasConf = (name) => hasParam("--" + name) || getVariable(name) !== null;
var production = hasConf("production");
var forceColor = isNode && isOneOf(process.env.FORCE_COLOR, ["true", "1", "2"]);
var supportsColor = forceColor || !hasParam("--no-colors") && !hasConf("no-color") && (!isNode || process.stdout.isTTY) && (!isNode || hasParam("--color") || getVariable("COLORTERM") !== null || (getVariable("TERM") || "").includes("color"));

// ../../node_modules/lib0/buffer.js
var createUint8ArrayFromLen = (len) => new Uint8Array(len);
var copyUint8Array = (uint8Array) => {
  const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
  newBuf.set(uint8Array);
  return newBuf;
};

// ../../node_modules/lib0/symbol.js
var create5 = Symbol;

// ../../node_modules/lib0/logging.common.js
var BOLD2 = create5();
var UNBOLD = create5();
var BLUE = create5();
var GREY = create5();
var GREEN = create5();
var RED = create5();
var PURPLE = create5();
var ORANGE = create5();
var UNCOLOR = create5();
var computeNoColorLoggingArgs = (args2) => {
  if (args2.length === 1 && args2[0]?.constructor === Function) {
    args2 = args2[0]();
  }
  const strBuilder = [];
  const logArgs = [];
  let i = 0;
  for (;i < args2.length; i++) {
    const arg = args2[i];
    if (arg === undefined) {
      break;
    } else if (arg.constructor === String || arg.constructor === Number) {
      strBuilder.push(arg);
    } else if (arg.constructor === Object) {
      break;
    }
  }
  if (i > 0) {
    logArgs.push(strBuilder.join(""));
  }
  for (;i < args2.length; i++) {
    const arg = args2[i];
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs;
};
var lastLoggingTime = getUnixTime();

// ../../node_modules/lib0/logging.node.js
var _nodeStyleMap = {
  [BOLD2]: "\x1B[1m",
  [UNBOLD]: "\x1B[2m",
  [BLUE]: "\x1B[34m",
  [GREEN]: "\x1B[32m",
  [GREY]: "\x1B[37m",
  [RED]: "\x1B[31m",
  [PURPLE]: "\x1B[35m",
  [ORANGE]: "\x1B[38;5;208m",
  [UNCOLOR]: "\x1B[0m"
};
var computeNodeLoggingArgs = (args2) => {
  if (args2.length === 1 && args2[0]?.constructor === Function) {
    args2 = args2[0]();
  }
  const strBuilder = [];
  const logArgs = [];
  let i = 0;
  for (;i < args2.length; i++) {
    const arg = args2[i];
    const style = _nodeStyleMap[arg];
    if (style !== undefined) {
      strBuilder.push(style);
    } else {
      if (arg === undefined) {
        break;
      } else if (arg.constructor === String || arg.constructor === Number) {
        strBuilder.push(arg);
      } else {
        break;
      }
    }
  }
  if (i > 0) {
    strBuilder.push("\x1B[0m");
    logArgs.push(strBuilder.join(""));
  }
  for (;i < args2.length; i++) {
    const arg = args2[i];
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs;
};
var computeLoggingArgs = supportsColor ? computeNodeLoggingArgs : computeNoColorLoggingArgs;
var print = (...args2) => {
  console.log(...computeLoggingArgs(args2));
};
var warn = (...args2) => {
  console.warn(...computeLoggingArgs(args2));
};

// ../../node_modules/lib0/iterator.js
var createIterator = (next) => ({
  [Symbol.iterator]() {
    return this;
  },
  next
});
var iteratorFilter = (iterator, filter) => createIterator(() => {
  let res;
  do {
    res = iterator.next();
  } while (!res.done && !filter(res.value));
  return res;
});
var iteratorMap = (iterator, fmap) => createIterator(() => {
  const { done, value } = iterator.next();
  return { done, value: done ? undefined : fmap(value) };
});

// ../../node_modules/yjs/dist/yjs.mjs
class DeleteItem {
  constructor(clock, len) {
    this.clock = clock;
    this.len = len;
  }
}

class DeleteSet {
  constructor() {
    this.clients = new Map;
  }
}
var iterateDeletedStructs = (transaction, ds, f) => ds.clients.forEach((deletes, clientid) => {
  const structs = transaction.doc.store.clients.get(clientid);
  if (structs != null) {
    const lastStruct = structs[structs.length - 1];
    const clockState = lastStruct.id.clock + lastStruct.length;
    for (let i = 0, del = deletes[i];i < deletes.length && del.clock < clockState; del = deletes[++i]) {
      iterateStructs(transaction, structs, del.clock, del.len, f);
    }
  }
});
var findIndexDS = (dis, clock) => {
  let left = 0;
  let right = dis.length - 1;
  while (left <= right) {
    const midindex = floor((left + right) / 2);
    const mid = dis[midindex];
    const midclock = mid.clock;
    if (midclock <= clock) {
      if (clock < midclock + mid.len) {
        return midindex;
      }
      left = midindex + 1;
    } else {
      right = midindex - 1;
    }
  }
  return null;
};
var isDeleted = (ds, id2) => {
  const dis = ds.clients.get(id2.client);
  return dis !== undefined && findIndexDS(dis, id2.clock) !== null;
};
var sortAndMergeDeleteSet = (ds) => {
  ds.clients.forEach((dels) => {
    dels.sort((a, b) => a.clock - b.clock);
    let i, j;
    for (i = 1, j = 1;i < dels.length; i++) {
      const left = dels[j - 1];
      const right = dels[i];
      if (left.clock + left.len >= right.clock) {
        dels[j - 1] = new DeleteItem(left.clock, max(left.len, right.clock + right.len - left.clock));
      } else {
        if (j < i) {
          dels[j] = right;
        }
        j++;
      }
    }
    dels.length = j;
  });
};
var mergeDeleteSets = (dss) => {
  const merged = new DeleteSet;
  for (let dssI = 0;dssI < dss.length; dssI++) {
    dss[dssI].clients.forEach((delsLeft, client2) => {
      if (!merged.clients.has(client2)) {
        const dels = delsLeft.slice();
        for (let i = dssI + 1;i < dss.length; i++) {
          appendTo(dels, dss[i].clients.get(client2) || []);
        }
        merged.clients.set(client2, dels);
      }
    });
  }
  sortAndMergeDeleteSet(merged);
  return merged;
};
var addToDeleteSet = (ds, client2, clock, length2) => {
  setIfUndefined(ds.clients, client2, () => []).push(new DeleteItem(clock, length2));
};
var createDeleteSet = () => new DeleteSet;
var createDeleteSetFromStructStore = (ss) => {
  const ds = createDeleteSet();
  ss.clients.forEach((structs, client2) => {
    const dsitems = [];
    for (let i = 0;i < structs.length; i++) {
      const struct = structs[i];
      if (struct.deleted) {
        const clock = struct.id.clock;
        let len = struct.length;
        if (i + 1 < structs.length) {
          for (let next = structs[i + 1];i + 1 < structs.length && next.deleted; next = structs[++i + 1]) {
            len += next.length;
          }
        }
        dsitems.push(new DeleteItem(clock, len));
      }
    }
    if (dsitems.length > 0) {
      ds.clients.set(client2, dsitems);
    }
  });
  return ds;
};
var writeDeleteSet = (encoder, ds) => {
  writeVarUint(encoder.restEncoder, ds.clients.size);
  from(ds.clients.entries()).sort((a, b) => b[0] - a[0]).forEach(([client2, dsitems]) => {
    encoder.resetDsCurVal();
    writeVarUint(encoder.restEncoder, client2);
    const len = dsitems.length;
    writeVarUint(encoder.restEncoder, len);
    for (let i = 0;i < len; i++) {
      const item = dsitems[i];
      encoder.writeDsClock(item.clock);
      encoder.writeDsLen(item.len);
    }
  });
};
var readDeleteSet = (decoder) => {
  const ds = new DeleteSet;
  const numClients = readVarUint(decoder.restDecoder);
  for (let i = 0;i < numClients; i++) {
    decoder.resetDsCurVal();
    const client2 = readVarUint(decoder.restDecoder);
    const numberOfDeletes = readVarUint(decoder.restDecoder);
    if (numberOfDeletes > 0) {
      const dsField = setIfUndefined(ds.clients, client2, () => []);
      for (let i2 = 0;i2 < numberOfDeletes; i2++) {
        dsField.push(new DeleteItem(decoder.readDsClock(), decoder.readDsLen()));
      }
    }
  }
  return ds;
};
var readAndApplyDeleteSet = (decoder, transaction, store) => {
  const unappliedDS = new DeleteSet;
  const numClients = readVarUint(decoder.restDecoder);
  for (let i = 0;i < numClients; i++) {
    decoder.resetDsCurVal();
    const client2 = readVarUint(decoder.restDecoder);
    const numberOfDeletes = readVarUint(decoder.restDecoder);
    const structs = store.clients.get(client2) || [];
    const state = getState(store, client2);
    for (let i2 = 0;i2 < numberOfDeletes; i2++) {
      const clock = decoder.readDsClock();
      const clockEnd = clock + decoder.readDsLen();
      if (clock < state) {
        if (state < clockEnd) {
          addToDeleteSet(unappliedDS, client2, state, clockEnd - state);
        }
        let index = findIndexSS(structs, clock);
        let struct = structs[index];
        if (!struct.deleted && struct.id.clock < clock) {
          structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
          index++;
        }
        while (index < structs.length) {
          struct = structs[index++];
          if (struct.id.clock < clockEnd) {
            if (!struct.deleted) {
              if (clockEnd < struct.id.clock + struct.length) {
                structs.splice(index, 0, splitItem(transaction, struct, clockEnd - struct.id.clock));
              }
              struct.delete(transaction);
            }
          } else {
            break;
          }
        }
      } else {
        addToDeleteSet(unappliedDS, client2, clock, clockEnd - clock);
      }
    }
  }
  if (unappliedDS.clients.size > 0) {
    const ds = new UpdateEncoderV2;
    writeVarUint(ds.restEncoder, 0);
    writeDeleteSet(ds, unappliedDS);
    return ds.toUint8Array();
  }
  return null;
};
var generateNewClientId = uint32;

class Doc extends ObservableV2 {
  constructor({ guid = uuidv4(), collectionid = null, gc = true, gcFilter = () => true, meta = null, autoLoad = false, shouldLoad = true } = {}) {
    super();
    this.gc = gc;
    this.gcFilter = gcFilter;
    this.clientID = generateNewClientId();
    this.guid = guid;
    this.collectionid = collectionid;
    this.share = new Map;
    this.store = new StructStore;
    this._transaction = null;
    this._transactionCleanups = [];
    this.subdocs = new Set;
    this._item = null;
    this.shouldLoad = shouldLoad;
    this.autoLoad = autoLoad;
    this.meta = meta;
    this.isLoaded = false;
    this.isSynced = false;
    this.isDestroyed = false;
    this.whenLoaded = create4((resolve5) => {
      this.on("load", () => {
        this.isLoaded = true;
        resolve5(this);
      });
    });
    const provideSyncedPromise = () => create4((resolve5) => {
      const eventHandler = (isSynced) => {
        if (isSynced === undefined || isSynced === true) {
          this.off("sync", eventHandler);
          resolve5();
        }
      };
      this.on("sync", eventHandler);
    });
    this.on("sync", (isSynced) => {
      if (isSynced === false && this.isSynced) {
        this.whenSynced = provideSyncedPromise();
      }
      this.isSynced = isSynced === undefined || isSynced === true;
      if (this.isSynced && !this.isLoaded) {
        this.emit("load", [this]);
      }
    });
    this.whenSynced = provideSyncedPromise();
  }
  load() {
    const item = this._item;
    if (item !== null && !this.shouldLoad) {
      transact(item.parent.doc, (transaction) => {
        transaction.subdocsLoaded.add(this);
      }, null, true);
    }
    this.shouldLoad = true;
  }
  getSubdocs() {
    return this.subdocs;
  }
  getSubdocGuids() {
    return new Set(from(this.subdocs).map((doc) => doc.guid));
  }
  transact(f, origin = null) {
    return transact(this, f, origin);
  }
  get(name, TypeConstructor = AbstractType) {
    const type = setIfUndefined(this.share, name, () => {
      const t = new TypeConstructor;
      t._integrate(this, null);
      return t;
    });
    const Constr = type.constructor;
    if (TypeConstructor !== AbstractType && Constr !== TypeConstructor) {
      if (Constr === AbstractType) {
        const t = new TypeConstructor;
        t._map = type._map;
        type._map.forEach((n) => {
          for (;n !== null; n = n.left) {
            n.parent = t;
          }
        });
        t._start = type._start;
        for (let n = t._start;n !== null; n = n.right) {
          n.parent = t;
        }
        t._length = type._length;
        this.share.set(name, t);
        t._integrate(this, null);
        return t;
      } else {
        throw new Error(`Type with the name ${name} has already been defined with a different constructor`);
      }
    }
    return type;
  }
  getArray(name = "") {
    return this.get(name, YArray);
  }
  getText(name = "") {
    return this.get(name, YText);
  }
  getMap(name = "") {
    return this.get(name, YMap);
  }
  getXmlElement(name = "") {
    return this.get(name, YXmlElement);
  }
  getXmlFragment(name = "") {
    return this.get(name, YXmlFragment);
  }
  toJSON() {
    const doc = {};
    this.share.forEach((value, key) => {
      doc[key] = value.toJSON();
    });
    return doc;
  }
  destroy() {
    this.isDestroyed = true;
    from(this.subdocs).forEach((subdoc) => subdoc.destroy());
    const item = this._item;
    if (item !== null) {
      this._item = null;
      const content = item.content;
      content.doc = new Doc({ guid: this.guid, ...content.opts, shouldLoad: false });
      content.doc._item = item;
      transact(item.parent.doc, (transaction) => {
        const doc = content.doc;
        if (!item.deleted) {
          transaction.subdocsAdded.add(doc);
        }
        transaction.subdocsRemoved.add(this);
      }, null, true);
    }
    this.emit("destroyed", [true]);
    this.emit("destroy", [this]);
    super.destroy();
  }
}

class DSDecoderV1 {
  constructor(decoder) {
    this.restDecoder = decoder;
  }
  resetDsCurVal() {}
  readDsClock() {
    return readVarUint(this.restDecoder);
  }
  readDsLen() {
    return readVarUint(this.restDecoder);
  }
}

class UpdateDecoderV1 extends DSDecoderV1 {
  readLeftID() {
    return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
  }
  readRightID() {
    return createID(readVarUint(this.restDecoder), readVarUint(this.restDecoder));
  }
  readClient() {
    return readVarUint(this.restDecoder);
  }
  readInfo() {
    return readUint8(this.restDecoder);
  }
  readString() {
    return readVarString(this.restDecoder);
  }
  readParentInfo() {
    return readVarUint(this.restDecoder) === 1;
  }
  readTypeRef() {
    return readVarUint(this.restDecoder);
  }
  readLen() {
    return readVarUint(this.restDecoder);
  }
  readAny() {
    return readAny(this.restDecoder);
  }
  readBuf() {
    return copyUint8Array(readVarUint8Array(this.restDecoder));
  }
  readJSON() {
    return JSON.parse(readVarString(this.restDecoder));
  }
  readKey() {
    return readVarString(this.restDecoder);
  }
}

class DSDecoderV2 {
  constructor(decoder) {
    this.dsCurrVal = 0;
    this.restDecoder = decoder;
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  readDsClock() {
    this.dsCurrVal += readVarUint(this.restDecoder);
    return this.dsCurrVal;
  }
  readDsLen() {
    const diff = readVarUint(this.restDecoder) + 1;
    this.dsCurrVal += diff;
    return diff;
  }
}

class UpdateDecoderV2 extends DSDecoderV2 {
  constructor(decoder) {
    super(decoder);
    this.keys = [];
    readVarUint(decoder);
    this.keyClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
    this.clientDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
    this.leftClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
    this.rightClockDecoder = new IntDiffOptRleDecoder(readVarUint8Array(decoder));
    this.infoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
    this.stringDecoder = new StringDecoder(readVarUint8Array(decoder));
    this.parentInfoDecoder = new RleDecoder(readVarUint8Array(decoder), readUint8);
    this.typeRefDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
    this.lenDecoder = new UintOptRleDecoder(readVarUint8Array(decoder));
  }
  readLeftID() {
    return new ID(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  readRightID() {
    return new ID(this.clientDecoder.read(), this.rightClockDecoder.read());
  }
  readClient() {
    return this.clientDecoder.read();
  }
  readInfo() {
    return this.infoDecoder.read();
  }
  readString() {
    return this.stringDecoder.read();
  }
  readParentInfo() {
    return this.parentInfoDecoder.read() === 1;
  }
  readTypeRef() {
    return this.typeRefDecoder.read();
  }
  readLen() {
    return this.lenDecoder.read();
  }
  readAny() {
    return readAny(this.restDecoder);
  }
  readBuf() {
    return readVarUint8Array(this.restDecoder);
  }
  readJSON() {
    return readAny(this.restDecoder);
  }
  readKey() {
    const keyClock = this.keyClockDecoder.read();
    if (keyClock < this.keys.length) {
      return this.keys[keyClock];
    } else {
      const key = this.stringDecoder.read();
      this.keys.push(key);
      return key;
    }
  }
}

class DSEncoderV1 {
  constructor() {
    this.restEncoder = createEncoder();
  }
  toUint8Array() {
    return toUint8Array(this.restEncoder);
  }
  resetDsCurVal() {}
  writeDsClock(clock) {
    writeVarUint(this.restEncoder, clock);
  }
  writeDsLen(len) {
    writeVarUint(this.restEncoder, len);
  }
}

class UpdateEncoderV1 extends DSEncoderV1 {
  writeLeftID(id2) {
    writeVarUint(this.restEncoder, id2.client);
    writeVarUint(this.restEncoder, id2.clock);
  }
  writeRightID(id2) {
    writeVarUint(this.restEncoder, id2.client);
    writeVarUint(this.restEncoder, id2.clock);
  }
  writeClient(client2) {
    writeVarUint(this.restEncoder, client2);
  }
  writeInfo(info) {
    writeUint8(this.restEncoder, info);
  }
  writeString(s) {
    writeVarString(this.restEncoder, s);
  }
  writeParentInfo(isYKey) {
    writeVarUint(this.restEncoder, isYKey ? 1 : 0);
  }
  writeTypeRef(info) {
    writeVarUint(this.restEncoder, info);
  }
  writeLen(len) {
    writeVarUint(this.restEncoder, len);
  }
  writeAny(any2) {
    writeAny(this.restEncoder, any2);
  }
  writeBuf(buf) {
    writeVarUint8Array(this.restEncoder, buf);
  }
  writeJSON(embed) {
    writeVarString(this.restEncoder, JSON.stringify(embed));
  }
  writeKey(key) {
    writeVarString(this.restEncoder, key);
  }
}

class DSEncoderV2 {
  constructor() {
    this.restEncoder = createEncoder();
    this.dsCurrVal = 0;
  }
  toUint8Array() {
    return toUint8Array(this.restEncoder);
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  writeDsClock(clock) {
    const diff = clock - this.dsCurrVal;
    this.dsCurrVal = clock;
    writeVarUint(this.restEncoder, diff);
  }
  writeDsLen(len) {
    if (len === 0) {
      unexpectedCase();
    }
    writeVarUint(this.restEncoder, len - 1);
    this.dsCurrVal += len;
  }
}

class UpdateEncoderV2 extends DSEncoderV2 {
  constructor() {
    super();
    this.keyMap = new Map;
    this.keyClock = 0;
    this.keyClockEncoder = new IntDiffOptRleEncoder;
    this.clientEncoder = new UintOptRleEncoder;
    this.leftClockEncoder = new IntDiffOptRleEncoder;
    this.rightClockEncoder = new IntDiffOptRleEncoder;
    this.infoEncoder = new RleEncoder(writeUint8);
    this.stringEncoder = new StringEncoder;
    this.parentInfoEncoder = new RleEncoder(writeUint8);
    this.typeRefEncoder = new UintOptRleEncoder;
    this.lenEncoder = new UintOptRleEncoder;
  }
  toUint8Array() {
    const encoder = createEncoder();
    writeVarUint(encoder, 0);
    writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
    writeVarUint8Array(encoder, toUint8Array(this.infoEncoder));
    writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
    writeVarUint8Array(encoder, toUint8Array(this.parentInfoEncoder));
    writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
    writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
    writeUint8Array(encoder, toUint8Array(this.restEncoder));
    return toUint8Array(encoder);
  }
  writeLeftID(id2) {
    this.clientEncoder.write(id2.client);
    this.leftClockEncoder.write(id2.clock);
  }
  writeRightID(id2) {
    this.clientEncoder.write(id2.client);
    this.rightClockEncoder.write(id2.clock);
  }
  writeClient(client2) {
    this.clientEncoder.write(client2);
  }
  writeInfo(info) {
    this.infoEncoder.write(info);
  }
  writeString(s) {
    this.stringEncoder.write(s);
  }
  writeParentInfo(isYKey) {
    this.parentInfoEncoder.write(isYKey ? 1 : 0);
  }
  writeTypeRef(info) {
    this.typeRefEncoder.write(info);
  }
  writeLen(len) {
    this.lenEncoder.write(len);
  }
  writeAny(any2) {
    writeAny(this.restEncoder, any2);
  }
  writeBuf(buf) {
    writeVarUint8Array(this.restEncoder, buf);
  }
  writeJSON(embed) {
    writeAny(this.restEncoder, embed);
  }
  writeKey(key) {
    const clock = this.keyMap.get(key);
    if (clock === undefined) {
      this.keyClockEncoder.write(this.keyClock++);
      this.stringEncoder.write(key);
    } else {
      this.keyClockEncoder.write(clock);
    }
  }
}
var writeStructs = (encoder, structs, client2, clock) => {
  clock = max(clock, structs[0].id.clock);
  const startNewStructs = findIndexSS(structs, clock);
  writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
  encoder.writeClient(client2);
  writeVarUint(encoder.restEncoder, clock);
  const firstStruct = structs[startNewStructs];
  firstStruct.write(encoder, clock - firstStruct.id.clock);
  for (let i = startNewStructs + 1;i < structs.length; i++) {
    structs[i].write(encoder, 0);
  }
};
var writeClientsStructs = (encoder, store, _sm) => {
  const sm = new Map;
  _sm.forEach((clock, client2) => {
    if (getState(store, client2) > clock) {
      sm.set(client2, clock);
    }
  });
  getStateVector(store).forEach((_clock, client2) => {
    if (!_sm.has(client2)) {
      sm.set(client2, 0);
    }
  });
  writeVarUint(encoder.restEncoder, sm.size);
  from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client2, clock]) => {
    writeStructs(encoder, store.clients.get(client2), client2, clock);
  });
};
var readClientsStructRefs = (decoder, doc) => {
  const clientRefs = create();
  const numOfStateUpdates = readVarUint(decoder.restDecoder);
  for (let i = 0;i < numOfStateUpdates; i++) {
    const numberOfStructs = readVarUint(decoder.restDecoder);
    const refs = new Array(numberOfStructs);
    const client2 = decoder.readClient();
    let clock = readVarUint(decoder.restDecoder);
    clientRefs.set(client2, { i: 0, refs });
    for (let i2 = 0;i2 < numberOfStructs; i2++) {
      const info = decoder.readInfo();
      switch (BITS5 & info) {
        case 0: {
          const len = decoder.readLen();
          refs[i2] = new GC(createID(client2, clock), len);
          clock += len;
          break;
        }
        case 10: {
          const len = readVarUint(decoder.restDecoder);
          refs[i2] = new Skip(createID(client2, clock), len);
          clock += len;
          break;
        }
        default: {
          const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
          const struct = new Item(createID(client2, clock), null, (info & BIT8) === BIT8 ? decoder.readLeftID() : null, null, (info & BIT7) === BIT7 ? decoder.readRightID() : null, cantCopyParentInfo ? decoder.readParentInfo() ? doc.get(decoder.readString()) : decoder.readLeftID() : null, cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null, readItemContent(decoder, info));
          refs[i2] = struct;
          clock += struct.length;
        }
      }
    }
  }
  return clientRefs;
};
var integrateStructs = (transaction, store, clientsStructRefs) => {
  const stack = [];
  let clientsStructRefsIds = from(clientsStructRefs.keys()).sort((a, b) => a - b);
  if (clientsStructRefsIds.length === 0) {
    return null;
  }
  const getNextStructTarget = () => {
    if (clientsStructRefsIds.length === 0) {
      return null;
    }
    let nextStructsTarget = clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
    while (nextStructsTarget.refs.length === nextStructsTarget.i) {
      clientsStructRefsIds.pop();
      if (clientsStructRefsIds.length > 0) {
        nextStructsTarget = clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
      } else {
        return null;
      }
    }
    return nextStructsTarget;
  };
  let curStructsTarget = getNextStructTarget();
  if (curStructsTarget === null) {
    return null;
  }
  const restStructs = new StructStore;
  const missingSV = new Map;
  const updateMissingSv = (client2, clock) => {
    const mclock = missingSV.get(client2);
    if (mclock == null || mclock > clock) {
      missingSV.set(client2, clock);
    }
  };
  let stackHead = curStructsTarget.refs[curStructsTarget.i++];
  const state = new Map;
  const addStackToRestSS = () => {
    for (const item of stack) {
      const client2 = item.id.client;
      const inapplicableItems = clientsStructRefs.get(client2);
      if (inapplicableItems) {
        inapplicableItems.i--;
        restStructs.clients.set(client2, inapplicableItems.refs.slice(inapplicableItems.i));
        clientsStructRefs.delete(client2);
        inapplicableItems.i = 0;
        inapplicableItems.refs = [];
      } else {
        restStructs.clients.set(client2, [item]);
      }
      clientsStructRefsIds = clientsStructRefsIds.filter((c) => c !== client2);
    }
    stack.length = 0;
  };
  while (true) {
    if (stackHead.constructor !== Skip) {
      const localClock = setIfUndefined(state, stackHead.id.client, () => getState(store, stackHead.id.client));
      const offset = localClock - stackHead.id.clock;
      if (offset < 0) {
        stack.push(stackHead);
        updateMissingSv(stackHead.id.client, stackHead.id.clock - 1);
        addStackToRestSS();
      } else {
        const missing = stackHead.getMissing(transaction, store);
        if (missing !== null) {
          stack.push(stackHead);
          const structRefs = clientsStructRefs.get(missing) || { refs: [], i: 0 };
          if (structRefs.refs.length === structRefs.i) {
            updateMissingSv(missing, getState(store, missing));
            addStackToRestSS();
          } else {
            stackHead = structRefs.refs[structRefs.i++];
            continue;
          }
        } else if (offset === 0 || offset < stackHead.length) {
          stackHead.integrate(transaction, offset);
          state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
        }
      }
    }
    if (stack.length > 0) {
      stackHead = stack.pop();
    } else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) {
      stackHead = curStructsTarget.refs[curStructsTarget.i++];
    } else {
      curStructsTarget = getNextStructTarget();
      if (curStructsTarget === null) {
        break;
      } else {
        stackHead = curStructsTarget.refs[curStructsTarget.i++];
      }
    }
  }
  if (restStructs.clients.size > 0) {
    const encoder = new UpdateEncoderV2;
    writeClientsStructs(encoder, restStructs, new Map);
    writeVarUint(encoder.restEncoder, 0);
    return { missing: missingSV, update: encoder.toUint8Array() };
  }
  return null;
};
var writeStructsFromTransaction = (encoder, transaction) => writeClientsStructs(encoder, transaction.doc.store, transaction.beforeState);
var readUpdateV2 = (decoder, ydoc, transactionOrigin, structDecoder = new UpdateDecoderV2(decoder)) => transact(ydoc, (transaction) => {
  transaction.local = false;
  let retry = false;
  const doc = transaction.doc;
  const store = doc.store;
  const ss = readClientsStructRefs(structDecoder, doc);
  const restStructs = integrateStructs(transaction, store, ss);
  const pending = store.pendingStructs;
  if (pending) {
    for (const [client2, clock] of pending.missing) {
      if (clock < getState(store, client2)) {
        retry = true;
        break;
      }
    }
    if (restStructs) {
      for (const [client2, clock] of restStructs.missing) {
        const mclock = pending.missing.get(client2);
        if (mclock == null || mclock > clock) {
          pending.missing.set(client2, clock);
        }
      }
      pending.update = mergeUpdatesV2([pending.update, restStructs.update]);
    }
  } else {
    store.pendingStructs = restStructs;
  }
  const dsRest = readAndApplyDeleteSet(structDecoder, transaction, store);
  if (store.pendingDs) {
    const pendingDSUpdate = new UpdateDecoderV2(createDecoder(store.pendingDs));
    readVarUint(pendingDSUpdate.restDecoder);
    const dsRest2 = readAndApplyDeleteSet(pendingDSUpdate, transaction, store);
    if (dsRest && dsRest2) {
      store.pendingDs = mergeUpdatesV2([dsRest, dsRest2]);
    } else {
      store.pendingDs = dsRest || dsRest2;
    }
  } else {
    store.pendingDs = dsRest;
  }
  if (retry) {
    const update = store.pendingStructs.update;
    store.pendingStructs = null;
    applyUpdateV2(transaction.doc, update);
  }
}, transactionOrigin, false);
var applyUpdateV2 = (ydoc, update, transactionOrigin, YDecoder = UpdateDecoderV2) => {
  const decoder = createDecoder(update);
  readUpdateV2(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
};
var applyUpdate = (ydoc, update, transactionOrigin) => applyUpdateV2(ydoc, update, transactionOrigin, UpdateDecoderV1);
var writeStateAsUpdate = (encoder, doc, targetStateVector = new Map) => {
  writeClientsStructs(encoder, doc.store, targetStateVector);
  writeDeleteSet(encoder, createDeleteSetFromStructStore(doc.store));
};
var encodeStateAsUpdateV2 = (doc, encodedTargetStateVector = new Uint8Array([0]), encoder = new UpdateEncoderV2) => {
  const targetStateVector = decodeStateVector(encodedTargetStateVector);
  writeStateAsUpdate(encoder, doc, targetStateVector);
  const updates = [encoder.toUint8Array()];
  if (doc.store.pendingDs) {
    updates.push(doc.store.pendingDs);
  }
  if (doc.store.pendingStructs) {
    updates.push(diffUpdateV2(doc.store.pendingStructs.update, encodedTargetStateVector));
  }
  if (updates.length > 1) {
    if (encoder.constructor === UpdateEncoderV1) {
      return mergeUpdates(updates.map((update, i) => i === 0 ? update : convertUpdateFormatV2ToV1(update)));
    } else if (encoder.constructor === UpdateEncoderV2) {
      return mergeUpdatesV2(updates);
    }
  }
  return updates[0];
};
var encodeStateAsUpdate = (doc, encodedTargetStateVector) => encodeStateAsUpdateV2(doc, encodedTargetStateVector, new UpdateEncoderV1);
var readStateVector = (decoder) => {
  const ss = new Map;
  const ssLength = readVarUint(decoder.restDecoder);
  for (let i = 0;i < ssLength; i++) {
    const client2 = readVarUint(decoder.restDecoder);
    const clock = readVarUint(decoder.restDecoder);
    ss.set(client2, clock);
  }
  return ss;
};
var decodeStateVector = (decodedState) => readStateVector(new DSDecoderV1(createDecoder(decodedState)));
class EventHandler {
  constructor() {
    this.l = [];
  }
}
var createEventHandler = () => new EventHandler;
var addEventHandlerListener = (eventHandler, f) => eventHandler.l.push(f);
var removeEventHandlerListener = (eventHandler, f) => {
  const l = eventHandler.l;
  const len = l.length;
  eventHandler.l = l.filter((g) => f !== g);
  if (len === eventHandler.l.length) {
    console.error("[yjs] Tried to remove event handler that doesn't exist.");
  }
};
var callEventHandlerListeners = (eventHandler, arg0, arg1) => callAll(eventHandler.l, [arg0, arg1]);

class ID {
  constructor(client2, clock) {
    this.client = client2;
    this.clock = clock;
  }
}
var compareIDs = (a, b) => a === b || a !== null && b !== null && a.client === b.client && a.clock === b.clock;
var createID = (client2, clock) => new ID(client2, clock);
var findRootTypeKey = (type) => {
  for (const [key, value] of type.doc.share.entries()) {
    if (value === type) {
      return key;
    }
  }
  throw unexpectedCase();
};
class Snapshot {
  constructor(ds, sv) {
    this.ds = ds;
    this.sv = sv;
  }
}
var createSnapshot = (ds, sm) => new Snapshot(ds, sm);
var emptySnapshot = createSnapshot(createDeleteSet(), new Map);
var isVisible = (item, snapshot) => snapshot === undefined ? !item.deleted : snapshot.sv.has(item.id.client) && (snapshot.sv.get(item.id.client) || 0) > item.id.clock && !isDeleted(snapshot.ds, item.id);
var splitSnapshotAffectedStructs = (transaction, snapshot) => {
  const meta = setIfUndefined(transaction.meta, splitSnapshotAffectedStructs, create2);
  const store = transaction.doc.store;
  if (!meta.has(snapshot)) {
    snapshot.sv.forEach((clock, client2) => {
      if (clock < getState(store, client2)) {
        getItemCleanStart(transaction, createID(client2, clock));
      }
    });
    iterateDeletedStructs(transaction, snapshot.ds, (_item) => {});
    meta.add(snapshot);
  }
};
class StructStore {
  constructor() {
    this.clients = new Map;
    this.pendingStructs = null;
    this.pendingDs = null;
  }
}
var getStateVector = (store) => {
  const sm = new Map;
  store.clients.forEach((structs, client2) => {
    const struct = structs[structs.length - 1];
    sm.set(client2, struct.id.clock + struct.length);
  });
  return sm;
};
var getState = (store, client2) => {
  const structs = store.clients.get(client2);
  if (structs === undefined) {
    return 0;
  }
  const lastStruct = structs[structs.length - 1];
  return lastStruct.id.clock + lastStruct.length;
};
var addStruct = (store, struct) => {
  let structs = store.clients.get(struct.id.client);
  if (structs === undefined) {
    structs = [];
    store.clients.set(struct.id.client, structs);
  } else {
    const lastStruct = structs[structs.length - 1];
    if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) {
      throw unexpectedCase();
    }
  }
  structs.push(struct);
};
var findIndexSS = (structs, clock) => {
  let left = 0;
  let right = structs.length - 1;
  let mid = structs[right];
  let midclock = mid.id.clock;
  if (midclock === clock) {
    return right;
  }
  let midindex = floor(clock / (midclock + mid.length - 1) * right);
  while (left <= right) {
    mid = structs[midindex];
    midclock = mid.id.clock;
    if (midclock <= clock) {
      if (clock < midclock + mid.length) {
        return midindex;
      }
      left = midindex + 1;
    } else {
      right = midindex - 1;
    }
    midindex = floor((left + right) / 2);
  }
  throw unexpectedCase();
};
var find = (store, id2) => {
  const structs = store.clients.get(id2.client);
  return structs[findIndexSS(structs, id2.clock)];
};
var getItem = find;
var findIndexCleanStart = (transaction, structs, clock) => {
  const index = findIndexSS(structs, clock);
  const struct = structs[index];
  if (struct.id.clock < clock && struct instanceof Item) {
    structs.splice(index + 1, 0, splitItem(transaction, struct, clock - struct.id.clock));
    return index + 1;
  }
  return index;
};
var getItemCleanStart = (transaction, id2) => {
  const structs = transaction.doc.store.clients.get(id2.client);
  return structs[findIndexCleanStart(transaction, structs, id2.clock)];
};
var getItemCleanEnd = (transaction, store, id2) => {
  const structs = store.clients.get(id2.client);
  const index = findIndexSS(structs, id2.clock);
  const struct = structs[index];
  if (id2.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== GC) {
    structs.splice(index + 1, 0, splitItem(transaction, struct, id2.clock - struct.id.clock + 1));
  }
  return struct;
};
var replaceStruct = (store, struct, newStruct) => {
  const structs = store.clients.get(struct.id.client);
  structs[findIndexSS(structs, struct.id.clock)] = newStruct;
};
var iterateStructs = (transaction, structs, clockStart, len, f) => {
  if (len === 0) {
    return;
  }
  const clockEnd = clockStart + len;
  let index = findIndexCleanStart(transaction, structs, clockStart);
  let struct;
  do {
    struct = structs[index++];
    if (clockEnd < struct.id.clock + struct.length) {
      findIndexCleanStart(transaction, structs, clockEnd);
    }
    f(struct);
  } while (index < structs.length && structs[index].id.clock < clockEnd);
};

class Transaction {
  constructor(doc, origin, local) {
    this.doc = doc;
    this.deleteSet = new DeleteSet;
    this.beforeState = getStateVector(doc.store);
    this.afterState = new Map;
    this.changed = new Map;
    this.changedParentTypes = new Map;
    this._mergeStructs = [];
    this.origin = origin;
    this.meta = new Map;
    this.local = local;
    this.subdocsAdded = new Set;
    this.subdocsRemoved = new Set;
    this.subdocsLoaded = new Set;
    this._needFormattingCleanup = false;
  }
}
var writeUpdateMessageFromTransaction = (encoder, transaction) => {
  if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client2) => transaction.beforeState.get(client2) !== clock)) {
    return false;
  }
  sortAndMergeDeleteSet(transaction.deleteSet);
  writeStructsFromTransaction(encoder, transaction);
  writeDeleteSet(encoder, transaction.deleteSet);
  return true;
};
var addChangedTypeToTransaction = (transaction, type, parentSub) => {
  const item = type._item;
  if (item === null || item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted) {
    setIfUndefined(transaction.changed, type, create2).add(parentSub);
  }
};
var tryToMergeWithLefts = (structs, pos) => {
  let right = structs[pos];
  let left = structs[pos - 1];
  let i = pos;
  for (;i > 0; right = left, left = structs[--i - 1]) {
    if (left.deleted === right.deleted && left.constructor === right.constructor) {
      if (left.mergeWith(right)) {
        if (right instanceof Item && right.parentSub !== null && right.parent._map.get(right.parentSub) === right) {
          right.parent._map.set(right.parentSub, left);
        }
        continue;
      }
    }
    break;
  }
  const merged = pos - i;
  if (merged) {
    structs.splice(pos + 1 - merged, merged);
  }
  return merged;
};
var tryGcDeleteSet = (ds, store, gcFilter) => {
  for (const [client2, deleteItems] of ds.clients.entries()) {
    const structs = store.clients.get(client2);
    for (let di = deleteItems.length - 1;di >= 0; di--) {
      const deleteItem = deleteItems[di];
      const endDeleteItemClock = deleteItem.clock + deleteItem.len;
      for (let si = findIndexSS(structs, deleteItem.clock), struct = structs[si];si < structs.length && struct.id.clock < endDeleteItemClock; struct = structs[++si]) {
        const struct2 = structs[si];
        if (deleteItem.clock + deleteItem.len <= struct2.id.clock) {
          break;
        }
        if (struct2 instanceof Item && struct2.deleted && !struct2.keep && gcFilter(struct2)) {
          struct2.gc(store, false);
        }
      }
    }
  }
};
var tryMergeDeleteSet = (ds, store) => {
  ds.clients.forEach((deleteItems, client2) => {
    const structs = store.clients.get(client2);
    for (let di = deleteItems.length - 1;di >= 0; di--) {
      const deleteItem = deleteItems[di];
      const mostRightIndexToCheck = min(structs.length - 1, 1 + findIndexSS(structs, deleteItem.clock + deleteItem.len - 1));
      for (let si = mostRightIndexToCheck, struct = structs[si];si > 0 && struct.id.clock >= deleteItem.clock; struct = structs[si]) {
        si -= 1 + tryToMergeWithLefts(structs, si);
      }
    }
  });
};
var cleanupTransactions = (transactionCleanups, i) => {
  if (i < transactionCleanups.length) {
    const transaction = transactionCleanups[i];
    const doc = transaction.doc;
    const store = doc.store;
    const ds = transaction.deleteSet;
    const mergeStructs = transaction._mergeStructs;
    try {
      sortAndMergeDeleteSet(ds);
      transaction.afterState = getStateVector(transaction.doc.store);
      doc.emit("beforeObserverCalls", [transaction, doc]);
      const fs7 = [];
      transaction.changed.forEach((subs, itemtype) => fs7.push(() => {
        if (itemtype._item === null || !itemtype._item.deleted) {
          itemtype._callObserver(transaction, subs);
        }
      }));
      fs7.push(() => {
        transaction.changedParentTypes.forEach((events, type) => {
          if (type._dEH.l.length > 0 && (type._item === null || !type._item.deleted)) {
            events = events.filter((event) => event.target._item === null || !event.target._item.deleted);
            events.forEach((event) => {
              event.currentTarget = type;
              event._path = null;
            });
            events.sort((event1, event2) => event1.path.length - event2.path.length);
            fs7.push(() => {
              callEventHandlerListeners(type._dEH, events, transaction);
            });
          }
        });
        fs7.push(() => doc.emit("afterTransaction", [transaction, doc]));
        fs7.push(() => {
          if (transaction._needFormattingCleanup) {
            cleanupYTextAfterTransaction(transaction);
          }
        });
      });
      callAll(fs7, []);
    } finally {
      if (doc.gc) {
        tryGcDeleteSet(ds, store, doc.gcFilter);
      }
      tryMergeDeleteSet(ds, store);
      transaction.afterState.forEach((clock, client2) => {
        const beforeClock = transaction.beforeState.get(client2) || 0;
        if (beforeClock !== clock) {
          const structs = store.clients.get(client2);
          const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
          for (let i2 = structs.length - 1;i2 >= firstChangePos; ) {
            i2 -= 1 + tryToMergeWithLefts(structs, i2);
          }
        }
      });
      for (let i2 = mergeStructs.length - 1;i2 >= 0; i2--) {
        const { client: client2, clock } = mergeStructs[i2].id;
        const structs = store.clients.get(client2);
        const replacedStructPos = findIndexSS(structs, clock);
        if (replacedStructPos + 1 < structs.length) {
          if (tryToMergeWithLefts(structs, replacedStructPos + 1) > 1) {
            continue;
          }
        }
        if (replacedStructPos > 0) {
          tryToMergeWithLefts(structs, replacedStructPos);
        }
      }
      if (!transaction.local && transaction.afterState.get(doc.clientID) !== transaction.beforeState.get(doc.clientID)) {
        print(ORANGE, BOLD2, "[yjs] ", UNBOLD, RED, "Changed the client-id because another client seems to be using it.");
        doc.clientID = generateNewClientId();
      }
      doc.emit("afterTransactionCleanup", [transaction, doc]);
      if (doc._observers.has("update")) {
        const encoder = new UpdateEncoderV1;
        const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
        if (hasContent2) {
          doc.emit("update", [encoder.toUint8Array(), transaction.origin, doc, transaction]);
        }
      }
      if (doc._observers.has("updateV2")) {
        const encoder = new UpdateEncoderV2;
        const hasContent2 = writeUpdateMessageFromTransaction(encoder, transaction);
        if (hasContent2) {
          doc.emit("updateV2", [encoder.toUint8Array(), transaction.origin, doc, transaction]);
        }
      }
      const { subdocsAdded, subdocsLoaded, subdocsRemoved } = transaction;
      if (subdocsAdded.size > 0 || subdocsRemoved.size > 0 || subdocsLoaded.size > 0) {
        subdocsAdded.forEach((subdoc) => {
          subdoc.clientID = doc.clientID;
          if (subdoc.collectionid == null) {
            subdoc.collectionid = doc.collectionid;
          }
          doc.subdocs.add(subdoc);
        });
        subdocsRemoved.forEach((subdoc) => doc.subdocs.delete(subdoc));
        doc.emit("subdocs", [{ loaded: subdocsLoaded, added: subdocsAdded, removed: subdocsRemoved }, doc, transaction]);
        subdocsRemoved.forEach((subdoc) => subdoc.destroy());
      }
      if (transactionCleanups.length <= i + 1) {
        doc._transactionCleanups = [];
        doc.emit("afterAllTransactions", [doc, transactionCleanups]);
      } else {
        cleanupTransactions(transactionCleanups, i + 1);
      }
    }
  }
};
var transact = (doc, f, origin = null, local = true) => {
  const transactionCleanups = doc._transactionCleanups;
  let initialCall = false;
  let result = null;
  if (doc._transaction === null) {
    initialCall = true;
    doc._transaction = new Transaction(doc, origin, local);
    transactionCleanups.push(doc._transaction);
    if (transactionCleanups.length === 1) {
      doc.emit("beforeAllTransactions", [doc]);
    }
    doc.emit("beforeTransaction", [doc._transaction, doc]);
  }
  try {
    result = f(doc._transaction);
  } finally {
    if (initialCall) {
      const finishCleanup = doc._transaction === transactionCleanups[0];
      doc._transaction = null;
      if (finishCleanup) {
        cleanupTransactions(transactionCleanups, 0);
      }
    }
  }
  return result;
};
function* lazyStructReaderGenerator(decoder) {
  const numOfStateUpdates = readVarUint(decoder.restDecoder);
  for (let i = 0;i < numOfStateUpdates; i++) {
    const numberOfStructs = readVarUint(decoder.restDecoder);
    const client2 = decoder.readClient();
    let clock = readVarUint(decoder.restDecoder);
    for (let i2 = 0;i2 < numberOfStructs; i2++) {
      const info = decoder.readInfo();
      if (info === 10) {
        const len = readVarUint(decoder.restDecoder);
        yield new Skip(createID(client2, clock), len);
        clock += len;
      } else if ((BITS5 & info) !== 0) {
        const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
        const struct = new Item(createID(client2, clock), null, (info & BIT8) === BIT8 ? decoder.readLeftID() : null, null, (info & BIT7) === BIT7 ? decoder.readRightID() : null, cantCopyParentInfo ? decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID() : null, cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null, readItemContent(decoder, info));
        yield struct;
        clock += struct.length;
      } else {
        const len = decoder.readLen();
        yield new GC(createID(client2, clock), len);
        clock += len;
      }
    }
  }
}

class LazyStructReader {
  constructor(decoder, filterSkips) {
    this.gen = lazyStructReaderGenerator(decoder);
    this.curr = null;
    this.done = false;
    this.filterSkips = filterSkips;
    this.next();
  }
  next() {
    do {
      this.curr = this.gen.next().value || null;
    } while (this.filterSkips && this.curr !== null && this.curr.constructor === Skip);
    return this.curr;
  }
}
class LazyStructWriter {
  constructor(encoder) {
    this.currClient = 0;
    this.startClock = 0;
    this.written = 0;
    this.encoder = encoder;
    this.clientStructs = [];
  }
}
var mergeUpdates = (updates) => mergeUpdatesV2(updates, UpdateDecoderV1, UpdateEncoderV1);
var sliceStruct = (left, diff) => {
  if (left.constructor === GC) {
    const { client: client2, clock } = left.id;
    return new GC(createID(client2, clock + diff), left.length - diff);
  } else if (left.constructor === Skip) {
    const { client: client2, clock } = left.id;
    return new Skip(createID(client2, clock + diff), left.length - diff);
  } else {
    const leftItem = left;
    const { client: client2, clock } = leftItem.id;
    return new Item(createID(client2, clock + diff), null, createID(client2, clock + diff - 1), null, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
  }
};
var mergeUpdatesV2 = (updates, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
  if (updates.length === 1) {
    return updates[0];
  }
  const updateDecoders = updates.map((update) => new YDecoder(createDecoder(update)));
  let lazyStructDecoders = updateDecoders.map((decoder) => new LazyStructReader(decoder, true));
  let currWrite = null;
  const updateEncoder = new YEncoder;
  const lazyStructEncoder = new LazyStructWriter(updateEncoder);
  while (true) {
    lazyStructDecoders = lazyStructDecoders.filter((dec) => dec.curr !== null);
    lazyStructDecoders.sort((dec1, dec2) => {
      if (dec1.curr.id.client === dec2.curr.id.client) {
        const clockDiff = dec1.curr.id.clock - dec2.curr.id.clock;
        if (clockDiff === 0) {
          return dec1.curr.constructor === dec2.curr.constructor ? 0 : dec1.curr.constructor === Skip ? 1 : -1;
        } else {
          return clockDiff;
        }
      } else {
        return dec2.curr.id.client - dec1.curr.id.client;
      }
    });
    if (lazyStructDecoders.length === 0) {
      break;
    }
    const currDecoder = lazyStructDecoders[0];
    const firstClient = currDecoder.curr.id.client;
    if (currWrite !== null) {
      let curr = currDecoder.curr;
      let iterated = false;
      while (curr !== null && curr.id.clock + curr.length <= currWrite.struct.id.clock + currWrite.struct.length && curr.id.client >= currWrite.struct.id.client) {
        curr = currDecoder.next();
        iterated = true;
      }
      if (curr === null || curr.id.client !== firstClient || iterated && curr.id.clock > currWrite.struct.id.clock + currWrite.struct.length) {
        continue;
      }
      if (firstClient !== currWrite.struct.id.client) {
        writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
        currWrite = { struct: curr, offset: 0 };
        currDecoder.next();
      } else {
        if (currWrite.struct.id.clock + currWrite.struct.length < curr.id.clock) {
          if (currWrite.struct.constructor === Skip) {
            currWrite.struct.length = curr.id.clock + curr.length - currWrite.struct.id.clock;
          } else {
            writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
            const diff = curr.id.clock - currWrite.struct.id.clock - currWrite.struct.length;
            const struct = new Skip(createID(firstClient, currWrite.struct.id.clock + currWrite.struct.length), diff);
            currWrite = { struct, offset: 0 };
          }
        } else {
          const diff = currWrite.struct.id.clock + currWrite.struct.length - curr.id.clock;
          if (diff > 0) {
            if (currWrite.struct.constructor === Skip) {
              currWrite.struct.length -= diff;
            } else {
              curr = sliceStruct(curr, diff);
            }
          }
          if (!currWrite.struct.mergeWith(curr)) {
            writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
            currWrite = { struct: curr, offset: 0 };
            currDecoder.next();
          }
        }
      }
    } else {
      currWrite = { struct: currDecoder.curr, offset: 0 };
      currDecoder.next();
    }
    for (let next = currDecoder.curr;next !== null && next.id.client === firstClient && next.id.clock === currWrite.struct.id.clock + currWrite.struct.length && next.constructor !== Skip; next = currDecoder.next()) {
      writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
      currWrite = { struct: next, offset: 0 };
    }
  }
  if (currWrite !== null) {
    writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
    currWrite = null;
  }
  finishLazyStructWriting(lazyStructEncoder);
  const dss = updateDecoders.map((decoder) => readDeleteSet(decoder));
  const ds = mergeDeleteSets(dss);
  writeDeleteSet(updateEncoder, ds);
  return updateEncoder.toUint8Array();
};
var diffUpdateV2 = (update, sv, YDecoder = UpdateDecoderV2, YEncoder = UpdateEncoderV2) => {
  const state = decodeStateVector(sv);
  const encoder = new YEncoder;
  const lazyStructWriter = new LazyStructWriter(encoder);
  const decoder = new YDecoder(createDecoder(update));
  const reader = new LazyStructReader(decoder, false);
  while (reader.curr) {
    const curr = reader.curr;
    const currClient = curr.id.client;
    const svClock = state.get(currClient) || 0;
    if (reader.curr.constructor === Skip) {
      reader.next();
      continue;
    }
    if (curr.id.clock + curr.length > svClock) {
      writeStructToLazyStructWriter(lazyStructWriter, curr, max(svClock - curr.id.clock, 0));
      reader.next();
      while (reader.curr && reader.curr.id.client === currClient) {
        writeStructToLazyStructWriter(lazyStructWriter, reader.curr, 0);
        reader.next();
      }
    } else {
      while (reader.curr && reader.curr.id.client === currClient && reader.curr.id.clock + reader.curr.length <= svClock) {
        reader.next();
      }
    }
  }
  finishLazyStructWriting(lazyStructWriter);
  const ds = readDeleteSet(decoder);
  writeDeleteSet(encoder, ds);
  return encoder.toUint8Array();
};
var flushLazyStructWriter = (lazyWriter) => {
  if (lazyWriter.written > 0) {
    lazyWriter.clientStructs.push({ written: lazyWriter.written, restEncoder: toUint8Array(lazyWriter.encoder.restEncoder) });
    lazyWriter.encoder.restEncoder = createEncoder();
    lazyWriter.written = 0;
  }
};
var writeStructToLazyStructWriter = (lazyWriter, struct, offset) => {
  if (lazyWriter.written > 0 && lazyWriter.currClient !== struct.id.client) {
    flushLazyStructWriter(lazyWriter);
  }
  if (lazyWriter.written === 0) {
    lazyWriter.currClient = struct.id.client;
    lazyWriter.encoder.writeClient(struct.id.client);
    writeVarUint(lazyWriter.encoder.restEncoder, struct.id.clock + offset);
  }
  struct.write(lazyWriter.encoder, offset);
  lazyWriter.written++;
};
var finishLazyStructWriting = (lazyWriter) => {
  flushLazyStructWriter(lazyWriter);
  const restEncoder = lazyWriter.encoder.restEncoder;
  writeVarUint(restEncoder, lazyWriter.clientStructs.length);
  for (let i = 0;i < lazyWriter.clientStructs.length; i++) {
    const partStructs = lazyWriter.clientStructs[i];
    writeVarUint(restEncoder, partStructs.written);
    writeUint8Array(restEncoder, partStructs.restEncoder);
  }
};
var convertUpdateFormat = (update, blockTransformer, YDecoder, YEncoder) => {
  const updateDecoder = new YDecoder(createDecoder(update));
  const lazyDecoder = new LazyStructReader(updateDecoder, false);
  const updateEncoder = new YEncoder;
  const lazyWriter = new LazyStructWriter(updateEncoder);
  for (let curr = lazyDecoder.curr;curr !== null; curr = lazyDecoder.next()) {
    writeStructToLazyStructWriter(lazyWriter, blockTransformer(curr), 0);
  }
  finishLazyStructWriting(lazyWriter);
  const ds = readDeleteSet(updateDecoder);
  writeDeleteSet(updateEncoder, ds);
  return updateEncoder.toUint8Array();
};
var convertUpdateFormatV2ToV1 = (update) => convertUpdateFormat(update, id, UpdateDecoderV2, UpdateEncoderV1);
var errorComputeChanges = "You must not compute changes after the event-handler fired.";

class YEvent {
  constructor(target, transaction) {
    this.target = target;
    this.currentTarget = target;
    this.transaction = transaction;
    this._changes = null;
    this._keys = null;
    this._delta = null;
    this._path = null;
  }
  get path() {
    return this._path || (this._path = getPathTo(this.currentTarget, this.target));
  }
  deletes(struct) {
    return isDeleted(this.transaction.deleteSet, struct.id);
  }
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0) {
        throw create3(errorComputeChanges);
      }
      const keys2 = new Map;
      const target = this.target;
      const changed = this.transaction.changed.get(target);
      changed.forEach((key) => {
        if (key !== null) {
          const item = target._map.get(key);
          let action;
          let oldValue;
          if (this.adds(item)) {
            let prev = item.left;
            while (prev !== null && this.adds(prev)) {
              prev = prev.left;
            }
            if (this.deletes(item)) {
              if (prev !== null && this.deletes(prev)) {
                action = "delete";
                oldValue = last(prev.content.getContent());
              } else {
                return;
              }
            } else {
              if (prev !== null && this.deletes(prev)) {
                action = "update";
                oldValue = last(prev.content.getContent());
              } else {
                action = "add";
                oldValue = undefined;
              }
            }
          } else {
            if (this.deletes(item)) {
              action = "delete";
              oldValue = last(item.content.getContent());
            } else {
              return;
            }
          }
          keys2.set(key, { action, oldValue });
        }
      });
      this._keys = keys2;
    }
    return this._keys;
  }
  get delta() {
    return this.changes.delta;
  }
  adds(struct) {
    return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0);
  }
  get changes() {
    let changes = this._changes;
    if (changes === null) {
      if (this.transaction.doc._transactionCleanups.length === 0) {
        throw create3(errorComputeChanges);
      }
      const target = this.target;
      const added = create2();
      const deleted = create2();
      const delta = [];
      changes = {
        added,
        deleted,
        delta,
        keys: this.keys
      };
      const changed = this.transaction.changed.get(target);
      if (changed.has(null)) {
        let lastOp = null;
        const packOp = () => {
          if (lastOp) {
            delta.push(lastOp);
          }
        };
        for (let item = target._start;item !== null; item = item.right) {
          if (item.deleted) {
            if (this.deletes(item) && !this.adds(item)) {
              if (lastOp === null || lastOp.delete === undefined) {
                packOp();
                lastOp = { delete: 0 };
              }
              lastOp.delete += item.length;
              deleted.add(item);
            }
          } else {
            if (this.adds(item)) {
              if (lastOp === null || lastOp.insert === undefined) {
                packOp();
                lastOp = { insert: [] };
              }
              lastOp.insert = lastOp.insert.concat(item.content.getContent());
              added.add(item);
            } else {
              if (lastOp === null || lastOp.retain === undefined) {
                packOp();
                lastOp = { retain: 0 };
              }
              lastOp.retain += item.length;
            }
          }
        }
        if (lastOp !== null && lastOp.retain === undefined) {
          packOp();
        }
      }
      this._changes = changes;
    }
    return changes;
  }
}
var getPathTo = (parent, child) => {
  const path7 = [];
  while (child._item !== null && child !== parent) {
    if (child._item.parentSub !== null) {
      path7.unshift(child._item.parentSub);
    } else {
      let i = 0;
      let c = child._item.parent._start;
      while (c !== child._item && c !== null) {
        if (!c.deleted && c.countable) {
          i += c.length;
        }
        c = c.right;
      }
      path7.unshift(i);
    }
    child = child._item.parent;
  }
  return path7;
};
var warnPrematureAccess = () => {
  warn("Invalid access: Add Yjs type to a document before reading data.");
};
var maxSearchMarker = 80;
var globalSearchMarkerTimestamp = 0;

class ArraySearchMarker {
  constructor(p, index) {
    p.marker = true;
    this.p = p;
    this.index = index;
    this.timestamp = globalSearchMarkerTimestamp++;
  }
}
var refreshMarkerTimestamp = (marker) => {
  marker.timestamp = globalSearchMarkerTimestamp++;
};
var overwriteMarker = (marker, p, index) => {
  marker.p.marker = false;
  marker.p = p;
  p.marker = true;
  marker.index = index;
  marker.timestamp = globalSearchMarkerTimestamp++;
};
var markPosition = (searchMarker, p, index) => {
  if (searchMarker.length >= maxSearchMarker) {
    const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
    overwriteMarker(marker, p, index);
    return marker;
  } else {
    const pm = new ArraySearchMarker(p, index);
    searchMarker.push(pm);
    return pm;
  }
};
var findMarker = (yarray, index) => {
  if (yarray._start === null || index === 0 || yarray._searchMarker === null) {
    return null;
  }
  const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => abs(index - a.index) < abs(index - b.index) ? a : b);
  let p = yarray._start;
  let pindex = 0;
  if (marker !== null) {
    p = marker.p;
    pindex = marker.index;
    refreshMarkerTimestamp(marker);
  }
  while (p.right !== null && pindex < index) {
    if (!p.deleted && p.countable) {
      if (index < pindex + p.length) {
        break;
      }
      pindex += p.length;
    }
    p = p.right;
  }
  while (p.left !== null && pindex > index) {
    p = p.left;
    if (!p.deleted && p.countable) {
      pindex -= p.length;
    }
  }
  while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
    p = p.left;
    if (!p.deleted && p.countable) {
      pindex -= p.length;
    }
  }
  if (marker !== null && abs(marker.index - pindex) < p.parent.length / maxSearchMarker) {
    overwriteMarker(marker, p, pindex);
    return marker;
  } else {
    return markPosition(yarray._searchMarker, p, pindex);
  }
};
var updateMarkerChanges = (searchMarker, index, len) => {
  for (let i = searchMarker.length - 1;i >= 0; i--) {
    const m = searchMarker[i];
    if (len > 0) {
      let p = m.p;
      p.marker = false;
      while (p && (p.deleted || !p.countable)) {
        p = p.left;
        if (p && !p.deleted && p.countable) {
          m.index -= p.length;
        }
      }
      if (p === null || p.marker === true) {
        searchMarker.splice(i, 1);
        continue;
      }
      m.p = p;
      p.marker = true;
    }
    if (index < m.index || len > 0 && index === m.index) {
      m.index = max(index, m.index + len);
    }
  }
};
var callTypeObservers = (type, transaction, event) => {
  const changedType = type;
  const changedParentTypes = transaction.changedParentTypes;
  while (true) {
    setIfUndefined(changedParentTypes, type, () => []).push(event);
    if (type._item === null) {
      break;
    }
    type = type._item.parent;
  }
  callEventHandlerListeners(changedType._eH, event, transaction);
};

class AbstractType {
  constructor() {
    this._item = null;
    this._map = new Map;
    this._start = null;
    this.doc = null;
    this._length = 0;
    this._eH = createEventHandler();
    this._dEH = createEventHandler();
    this._searchMarker = null;
  }
  get parent() {
    return this._item ? this._item.parent : null;
  }
  _integrate(y, item) {
    this.doc = y;
    this._item = item;
  }
  _copy() {
    throw methodUnimplemented();
  }
  clone() {
    throw methodUnimplemented();
  }
  _write(_encoder2) {}
  get _first() {
    let n = this._start;
    while (n !== null && n.deleted) {
      n = n.right;
    }
    return n;
  }
  _callObserver(transaction, _parentSubs) {
    if (!transaction.local && this._searchMarker) {
      this._searchMarker.length = 0;
    }
  }
  observe(f) {
    addEventHandlerListener(this._eH, f);
  }
  observeDeep(f) {
    addEventHandlerListener(this._dEH, f);
  }
  unobserve(f) {
    removeEventHandlerListener(this._eH, f);
  }
  unobserveDeep(f) {
    removeEventHandlerListener(this._dEH, f);
  }
  toJSON() {}
}
var typeListSlice = (type, start, end) => {
  type.doc ?? warnPrematureAccess();
  if (start < 0) {
    start = type._length + start;
  }
  if (end < 0) {
    end = type._length + end;
  }
  let len = end - start;
  const cs = [];
  let n = type._start;
  while (n !== null && len > 0) {
    if (n.countable && !n.deleted) {
      const c = n.content.getContent();
      if (c.length <= start) {
        start -= c.length;
      } else {
        for (let i = start;i < c.length && len > 0; i++) {
          cs.push(c[i]);
          len--;
        }
        start = 0;
      }
    }
    n = n.right;
  }
  return cs;
};
var typeListToArray = (type) => {
  type.doc ?? warnPrematureAccess();
  const cs = [];
  let n = type._start;
  while (n !== null) {
    if (n.countable && !n.deleted) {
      const c = n.content.getContent();
      for (let i = 0;i < c.length; i++) {
        cs.push(c[i]);
      }
    }
    n = n.right;
  }
  return cs;
};
var typeListForEach = (type, f) => {
  let index = 0;
  let n = type._start;
  type.doc ?? warnPrematureAccess();
  while (n !== null) {
    if (n.countable && !n.deleted) {
      const c = n.content.getContent();
      for (let i = 0;i < c.length; i++) {
        f(c[i], index++, type);
      }
    }
    n = n.right;
  }
};
var typeListMap = (type, f) => {
  const result = [];
  typeListForEach(type, (c, i) => {
    result.push(f(c, i, type));
  });
  return result;
};
var typeListCreateIterator = (type) => {
  let n = type._start;
  let currentContent = null;
  let currentContentIndex = 0;
  return {
    [Symbol.iterator]() {
      return this;
    },
    next: () => {
      if (currentContent === null) {
        while (n !== null && n.deleted) {
          n = n.right;
        }
        if (n === null) {
          return {
            done: true,
            value: undefined
          };
        }
        currentContent = n.content.getContent();
        currentContentIndex = 0;
        n = n.right;
      }
      const value = currentContent[currentContentIndex++];
      if (currentContent.length <= currentContentIndex) {
        currentContent = null;
      }
      return {
        done: false,
        value
      };
    }
  };
};
var typeListGet = (type, index) => {
  type.doc ?? warnPrematureAccess();
  const marker = findMarker(type, index);
  let n = type._start;
  if (marker !== null) {
    n = marker.p;
    index -= marker.index;
  }
  for (;n !== null; n = n.right) {
    if (!n.deleted && n.countable) {
      if (index < n.length) {
        return n.content.getContent()[index];
      }
      index -= n.length;
    }
  }
};
var typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
  let left = referenceItem;
  const doc = transaction.doc;
  const ownClientId = doc.clientID;
  const store = doc.store;
  const right = referenceItem === null ? parent._start : referenceItem.right;
  let jsonContent = [];
  const packJsonContent = () => {
    if (jsonContent.length > 0) {
      left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentAny(jsonContent));
      left.integrate(transaction, 0);
      jsonContent = [];
    }
  };
  content.forEach((c) => {
    if (c === null) {
      jsonContent.push(c);
    } else {
      switch (c.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          jsonContent.push(c);
          break;
        default:
          packJsonContent();
          switch (c.constructor) {
            case Uint8Array:
            case ArrayBuffer:
              left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentBinary(new Uint8Array(c)));
              left.integrate(transaction, 0);
              break;
            case Doc:
              left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentDoc(c));
              left.integrate(transaction, 0);
              break;
            default:
              if (c instanceof AbstractType) {
                left = new Item(createID(ownClientId, getState(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentType(c));
                left.integrate(transaction, 0);
              } else {
                throw new Error("Unexpected content type in insert operation");
              }
          }
      }
    }
  });
  packJsonContent();
};
var lengthExceeded = () => create3("Length exceeded!");
var typeListInsertGenerics = (transaction, parent, index, content) => {
  if (index > parent._length) {
    throw lengthExceeded();
  }
  if (index === 0) {
    if (parent._searchMarker) {
      updateMarkerChanges(parent._searchMarker, index, content.length);
    }
    return typeListInsertGenericsAfter(transaction, parent, null, content);
  }
  const startIndex = index;
  const marker = findMarker(parent, index);
  let n = parent._start;
  if (marker !== null) {
    n = marker.p;
    index -= marker.index;
    if (index === 0) {
      n = n.prev;
      index += n && n.countable && !n.deleted ? n.length : 0;
    }
  }
  for (;n !== null; n = n.right) {
    if (!n.deleted && n.countable) {
      if (index <= n.length) {
        if (index < n.length) {
          getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
        }
        break;
      }
      index -= n.length;
    }
  }
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, startIndex, content.length);
  }
  return typeListInsertGenericsAfter(transaction, parent, n, content);
};
var typeListPushGenerics = (transaction, parent, content) => {
  const marker = (parent._searchMarker || []).reduce((maxMarker, currMarker) => currMarker.index > maxMarker.index ? currMarker : maxMarker, { index: 0, p: parent._start });
  let n = marker.p;
  if (n) {
    while (n.right) {
      n = n.right;
    }
  }
  return typeListInsertGenericsAfter(transaction, parent, n, content);
};
var typeListDelete = (transaction, parent, index, length2) => {
  if (length2 === 0) {
    return;
  }
  const startIndex = index;
  const startLength = length2;
  const marker = findMarker(parent, index);
  let n = parent._start;
  if (marker !== null) {
    n = marker.p;
    index -= marker.index;
  }
  for (;n !== null && index > 0; n = n.right) {
    if (!n.deleted && n.countable) {
      if (index < n.length) {
        getItemCleanStart(transaction, createID(n.id.client, n.id.clock + index));
      }
      index -= n.length;
    }
  }
  while (length2 > 0 && n !== null) {
    if (!n.deleted) {
      if (length2 < n.length) {
        getItemCleanStart(transaction, createID(n.id.client, n.id.clock + length2));
      }
      n.delete(transaction);
      length2 -= n.length;
    }
    n = n.right;
  }
  if (length2 > 0) {
    throw lengthExceeded();
  }
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, startIndex, -startLength + length2);
  }
};
var typeMapDelete = (transaction, parent, key) => {
  const c = parent._map.get(key);
  if (c !== undefined) {
    c.delete(transaction);
  }
};
var typeMapSet = (transaction, parent, key, value) => {
  const left = parent._map.get(key) || null;
  const doc = transaction.doc;
  const ownClientId = doc.clientID;
  let content;
  if (value == null) {
    content = new ContentAny([value]);
  } else {
    switch (value.constructor) {
      case Number:
      case Object:
      case Boolean:
      case Array:
      case String:
      case Date:
      case BigInt:
        content = new ContentAny([value]);
        break;
      case Uint8Array:
        content = new ContentBinary(value);
        break;
      case Doc:
        content = new ContentDoc(value);
        break;
      default:
        if (value instanceof AbstractType) {
          content = new ContentType(value);
        } else {
          throw new Error("Unexpected content type");
        }
    }
  }
  new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
};
var typeMapGet = (parent, key) => {
  parent.doc ?? warnPrematureAccess();
  const val = parent._map.get(key);
  return val !== undefined && !val.deleted ? val.content.getContent()[val.length - 1] : undefined;
};
var typeMapGetAll = (parent) => {
  const res = {};
  parent.doc ?? warnPrematureAccess();
  parent._map.forEach((value, key) => {
    if (!value.deleted) {
      res[key] = value.content.getContent()[value.length - 1];
    }
  });
  return res;
};
var typeMapHas = (parent, key) => {
  parent.doc ?? warnPrematureAccess();
  const val = parent._map.get(key);
  return val !== undefined && !val.deleted;
};
var typeMapGetAllSnapshot = (parent, snapshot) => {
  const res = {};
  parent._map.forEach((value, key) => {
    let v = value;
    while (v !== null && (!snapshot.sv.has(v.id.client) || v.id.clock >= (snapshot.sv.get(v.id.client) || 0))) {
      v = v.left;
    }
    if (v !== null && isVisible(v, snapshot)) {
      res[key] = v.content.getContent()[v.length - 1];
    }
  });
  return res;
};
var createMapIterator = (type) => {
  type.doc ?? warnPrematureAccess();
  return iteratorFilter(type._map.entries(), (entry) => !entry[1].deleted);
};

class YArrayEvent extends YEvent {
}

class YArray extends AbstractType {
  constructor() {
    super();
    this._prelimContent = [];
    this._searchMarker = [];
  }
  static from(items) {
    const a = new YArray;
    a.push(items);
    return a;
  }
  _integrate(y, item) {
    super._integrate(y, item);
    this.insert(0, this._prelimContent);
    this._prelimContent = null;
  }
  _copy() {
    return new YArray;
  }
  clone() {
    const arr = new YArray;
    arr.insert(0, this.toArray().map((el) => el instanceof AbstractType ? el.clone() : el));
    return arr;
  }
  get length() {
    this.doc ?? warnPrematureAccess();
    return this._length;
  }
  _callObserver(transaction, parentSubs) {
    super._callObserver(transaction, parentSubs);
    callTypeObservers(this, transaction, new YArrayEvent(this, transaction));
  }
  insert(index, content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListInsertGenerics(transaction, this, index, content);
      });
    } else {
      this._prelimContent.splice(index, 0, ...content);
    }
  }
  push(content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListPushGenerics(transaction, this, content);
      });
    } else {
      this._prelimContent.push(...content);
    }
  }
  unshift(content) {
    this.insert(0, content);
  }
  delete(index, length2 = 1) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListDelete(transaction, this, index, length2);
      });
    } else {
      this._prelimContent.splice(index, length2);
    }
  }
  get(index) {
    return typeListGet(this, index);
  }
  toArray() {
    return typeListToArray(this);
  }
  slice(start = 0, end = this.length) {
    return typeListSlice(this, start, end);
  }
  toJSON() {
    return this.map((c) => c instanceof AbstractType ? c.toJSON() : c);
  }
  map(f) {
    return typeListMap(this, f);
  }
  forEach(f) {
    typeListForEach(this, f);
  }
  [Symbol.iterator]() {
    return typeListCreateIterator(this);
  }
  _write(encoder) {
    encoder.writeTypeRef(YArrayRefID);
  }
}
var readYArray = (_decoder) => new YArray;

class YMapEvent extends YEvent {
  constructor(ymap, transaction, subs) {
    super(ymap, transaction);
    this.keysChanged = subs;
  }
}

class YMap extends AbstractType {
  constructor(entries) {
    super();
    this._prelimContent = null;
    if (entries === undefined) {
      this._prelimContent = new Map;
    } else {
      this._prelimContent = new Map(entries);
    }
  }
  _integrate(y, item) {
    super._integrate(y, item);
    this._prelimContent.forEach((value, key) => {
      this.set(key, value);
    });
    this._prelimContent = null;
  }
  _copy() {
    return new YMap;
  }
  clone() {
    const map = new YMap;
    this.forEach((value, key) => {
      map.set(key, value instanceof AbstractType ? value.clone() : value);
    });
    return map;
  }
  _callObserver(transaction, parentSubs) {
    callTypeObservers(this, transaction, new YMapEvent(this, transaction, parentSubs));
  }
  toJSON() {
    this.doc ?? warnPrematureAccess();
    const map = {};
    this._map.forEach((item, key) => {
      if (!item.deleted) {
        const v = item.content.getContent()[item.length - 1];
        map[key] = v instanceof AbstractType ? v.toJSON() : v;
      }
    });
    return map;
  }
  get size() {
    return [...createMapIterator(this)].length;
  }
  keys() {
    return iteratorMap(createMapIterator(this), (v) => v[0]);
  }
  values() {
    return iteratorMap(createMapIterator(this), (v) => v[1].content.getContent()[v[1].length - 1]);
  }
  entries() {
    return iteratorMap(createMapIterator(this), (v) => [v[0], v[1].content.getContent()[v[1].length - 1]]);
  }
  forEach(f) {
    this.doc ?? warnPrematureAccess();
    this._map.forEach((item, key) => {
      if (!item.deleted) {
        f(item.content.getContent()[item.length - 1], key, this);
      }
    });
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  delete(key) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapDelete(transaction, this, key);
      });
    } else {
      this._prelimContent.delete(key);
    }
  }
  set(key, value) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapSet(transaction, this, key, value);
      });
    } else {
      this._prelimContent.set(key, value);
    }
    return value;
  }
  get(key) {
    return typeMapGet(this, key);
  }
  has(key) {
    return typeMapHas(this, key);
  }
  clear() {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        this.forEach(function(_value, key, map) {
          typeMapDelete(transaction, map, key);
        });
      });
    } else {
      this._prelimContent.clear();
    }
  }
  _write(encoder) {
    encoder.writeTypeRef(YMapRefID);
  }
}
var readYMap = (_decoder) => new YMap;
var equalAttrs = (a, b) => a === b || typeof a === "object" && typeof b === "object" && a && b && equalFlat(a, b);

class ItemTextListPosition {
  constructor(left, right, index, currentAttributes) {
    this.left = left;
    this.right = right;
    this.index = index;
    this.currentAttributes = currentAttributes;
  }
  forward() {
    if (this.right === null) {
      unexpectedCase();
    }
    switch (this.right.content.constructor) {
      case ContentFormat:
        if (!this.right.deleted) {
          updateCurrentAttributes(this.currentAttributes, this.right.content);
        }
        break;
      default:
        if (!this.right.deleted) {
          this.index += this.right.length;
        }
        break;
    }
    this.left = this.right;
    this.right = this.right.right;
  }
}
var findNextPosition = (transaction, pos, count) => {
  while (pos.right !== null && count > 0) {
    switch (pos.right.content.constructor) {
      case ContentFormat:
        if (!pos.right.deleted) {
          updateCurrentAttributes(pos.currentAttributes, pos.right.content);
        }
        break;
      default:
        if (!pos.right.deleted) {
          if (count < pos.right.length) {
            getItemCleanStart(transaction, createID(pos.right.id.client, pos.right.id.clock + count));
          }
          pos.index += pos.right.length;
          count -= pos.right.length;
        }
        break;
    }
    pos.left = pos.right;
    pos.right = pos.right.right;
  }
  return pos;
};
var findPosition = (transaction, parent, index, useSearchMarker) => {
  const currentAttributes = new Map;
  const marker = useSearchMarker ? findMarker(parent, index) : null;
  if (marker) {
    const pos = new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes);
    return findNextPosition(transaction, pos, index - marker.index);
  } else {
    const pos = new ItemTextListPosition(null, parent._start, 0, currentAttributes);
    return findNextPosition(transaction, pos, index);
  }
};
var insertNegatedAttributes = (transaction, parent, currPos, negatedAttributes) => {
  while (currPos.right !== null && (currPos.right.deleted === true || currPos.right.content.constructor === ContentFormat && equalAttrs(negatedAttributes.get(currPos.right.content.key), currPos.right.content.value))) {
    if (!currPos.right.deleted) {
      negatedAttributes.delete(currPos.right.content.key);
    }
    currPos.forward();
  }
  const doc = transaction.doc;
  const ownClientId = doc.clientID;
  negatedAttributes.forEach((val, key) => {
    const left = currPos.left;
    const right = currPos.right;
    const nextFormat = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
    nextFormat.integrate(transaction, 0);
    currPos.right = nextFormat;
    currPos.forward();
  });
};
var updateCurrentAttributes = (currentAttributes, format) => {
  const { key, value } = format;
  if (value === null) {
    currentAttributes.delete(key);
  } else {
    currentAttributes.set(key, value);
  }
};
var minimizeAttributeChanges = (currPos, attributes) => {
  while (true) {
    if (currPos.right === null) {
      break;
    } else if (currPos.right.deleted || currPos.right.content.constructor === ContentFormat && equalAttrs(attributes[currPos.right.content.key] ?? null, currPos.right.content.value))
      ;
    else {
      break;
    }
    currPos.forward();
  }
};
var insertAttributes = (transaction, parent, currPos, attributes) => {
  const doc = transaction.doc;
  const ownClientId = doc.clientID;
  const negatedAttributes = new Map;
  for (const key in attributes) {
    const val = attributes[key];
    const currentVal = currPos.currentAttributes.get(key) ?? null;
    if (!equalAttrs(currentVal, val)) {
      negatedAttributes.set(key, currentVal);
      const { left, right } = currPos;
      currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new ContentFormat(key, val));
      currPos.right.integrate(transaction, 0);
      currPos.forward();
    }
  }
  return negatedAttributes;
};
var insertText = (transaction, parent, currPos, text, attributes) => {
  currPos.currentAttributes.forEach((_val, key) => {
    if (attributes[key] === undefined) {
      attributes[key] = null;
    }
  });
  const doc = transaction.doc;
  const ownClientId = doc.clientID;
  minimizeAttributeChanges(currPos, attributes);
  const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
  const content = text.constructor === String ? new ContentString(text) : text instanceof AbstractType ? new ContentType(text) : new ContentEmbed(text);
  let { left, right, index } = currPos;
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, currPos.index, content.getLength());
  }
  right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
  right.integrate(transaction, 0);
  currPos.right = right;
  currPos.index = index;
  currPos.forward();
  insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
};
var formatText = (transaction, parent, currPos, length2, attributes) => {
  const doc = transaction.doc;
  const ownClientId = doc.clientID;
  minimizeAttributeChanges(currPos, attributes);
  const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
  iterationLoop:
    while (currPos.right !== null && (length2 > 0 || negatedAttributes.size > 0 && (currPos.right.deleted || currPos.right.content.constructor === ContentFormat))) {
      if (!currPos.right.deleted) {
        switch (currPos.right.content.constructor) {
          case ContentFormat: {
            const { key, value } = currPos.right.content;
            const attr = attributes[key];
            if (attr !== undefined) {
              if (equalAttrs(attr, value)) {
                negatedAttributes.delete(key);
              } else {
                if (length2 === 0) {
                  break iterationLoop;
                }
                negatedAttributes.set(key, value);
              }
              currPos.right.delete(transaction);
            } else {
              currPos.currentAttributes.set(key, value);
            }
            break;
          }
          default:
            if (length2 < currPos.right.length) {
              getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
            }
            length2 -= currPos.right.length;
            break;
        }
      }
      currPos.forward();
    }
  if (length2 > 0) {
    let newlines = "";
    for (;length2 > 0; length2--) {
      newlines += `
`;
    }
    currPos.right = new Item(createID(ownClientId, getState(doc.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new ContentString(newlines));
    currPos.right.integrate(transaction, 0);
    currPos.forward();
  }
  insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
};
var cleanupFormattingGap = (transaction, start, curr, startAttributes, currAttributes) => {
  let end = start;
  const endFormats = create();
  while (end && (!end.countable || end.deleted)) {
    if (!end.deleted && end.content.constructor === ContentFormat) {
      const cf = end.content;
      endFormats.set(cf.key, cf);
    }
    end = end.right;
  }
  let cleanups = 0;
  let reachedCurr = false;
  while (start !== end) {
    if (curr === start) {
      reachedCurr = true;
    }
    if (!start.deleted) {
      const content = start.content;
      switch (content.constructor) {
        case ContentFormat: {
          const { key, value } = content;
          const startAttrValue = startAttributes.get(key) ?? null;
          if (endFormats.get(key) !== content || startAttrValue === value) {
            start.delete(transaction);
            cleanups++;
            if (!reachedCurr && (currAttributes.get(key) ?? null) === value && startAttrValue !== value) {
              if (startAttrValue === null) {
                currAttributes.delete(key);
              } else {
                currAttributes.set(key, startAttrValue);
              }
            }
          }
          if (!reachedCurr && !start.deleted) {
            updateCurrentAttributes(currAttributes, content);
          }
          break;
        }
      }
    }
    start = start.right;
  }
  return cleanups;
};
var cleanupContextlessFormattingGap = (transaction, item) => {
  while (item && item.right && (item.right.deleted || !item.right.countable)) {
    item = item.right;
  }
  const attrs = new Set;
  while (item && (item.deleted || !item.countable)) {
    if (!item.deleted && item.content.constructor === ContentFormat) {
      const key = item.content.key;
      if (attrs.has(key)) {
        item.delete(transaction);
      } else {
        attrs.add(key);
      }
    }
    item = item.left;
  }
};
var cleanupYTextFormatting = (type) => {
  let res = 0;
  transact(type.doc, (transaction) => {
    let start = type._start;
    let end = type._start;
    let startAttributes = create();
    const currentAttributes = copy(startAttributes);
    while (end) {
      if (end.deleted === false) {
        switch (end.content.constructor) {
          case ContentFormat:
            updateCurrentAttributes(currentAttributes, end.content);
            break;
          default:
            res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
            startAttributes = copy(currentAttributes);
            start = end;
            break;
        }
      }
      end = end.right;
    }
  });
  return res;
};
var cleanupYTextAfterTransaction = (transaction) => {
  const needFullCleanup = new Set;
  const doc = transaction.doc;
  for (const [client2, afterClock] of transaction.afterState.entries()) {
    const clock = transaction.beforeState.get(client2) || 0;
    if (afterClock === clock) {
      continue;
    }
    iterateStructs(transaction, doc.store.clients.get(client2), clock, afterClock, (item) => {
      if (!item.deleted && item.content.constructor === ContentFormat && item.constructor !== GC) {
        needFullCleanup.add(item.parent);
      }
    });
  }
  transact(doc, (t) => {
    iterateDeletedStructs(transaction, transaction.deleteSet, (item) => {
      if (item instanceof GC || !item.parent._hasFormatting || needFullCleanup.has(item.parent)) {
        return;
      }
      const parent = item.parent;
      if (item.content.constructor === ContentFormat) {
        needFullCleanup.add(parent);
      } else {
        cleanupContextlessFormattingGap(t, item);
      }
    });
    for (const yText of needFullCleanup) {
      cleanupYTextFormatting(yText);
    }
  });
};
var deleteText = (transaction, currPos, length2) => {
  const startLength = length2;
  const startAttrs = copy(currPos.currentAttributes);
  const start = currPos.right;
  while (length2 > 0 && currPos.right !== null) {
    if (currPos.right.deleted === false) {
      switch (currPos.right.content.constructor) {
        case ContentType:
        case ContentEmbed:
        case ContentString:
          if (length2 < currPos.right.length) {
            getItemCleanStart(transaction, createID(currPos.right.id.client, currPos.right.id.clock + length2));
          }
          length2 -= currPos.right.length;
          currPos.right.delete(transaction);
          break;
      }
    }
    currPos.forward();
  }
  if (start) {
    cleanupFormattingGap(transaction, start, currPos.right, startAttrs, currPos.currentAttributes);
  }
  const parent = (currPos.left || currPos.right).parent;
  if (parent._searchMarker) {
    updateMarkerChanges(parent._searchMarker, currPos.index, -startLength + length2);
  }
  return currPos;
};

class YTextEvent extends YEvent {
  constructor(ytext, transaction, subs) {
    super(ytext, transaction);
    this.childListChanged = false;
    this.keysChanged = new Set;
    subs.forEach((sub) => {
      if (sub === null) {
        this.childListChanged = true;
      } else {
        this.keysChanged.add(sub);
      }
    });
  }
  get changes() {
    if (this._changes === null) {
      const changes = {
        keys: this.keys,
        delta: this.delta,
        added: new Set,
        deleted: new Set
      };
      this._changes = changes;
    }
    return this._changes;
  }
  get delta() {
    if (this._delta === null) {
      const y = this.target.doc;
      const delta = [];
      transact(y, (transaction) => {
        const currentAttributes = new Map;
        const oldAttributes = new Map;
        let item = this.target._start;
        let action = null;
        const attributes = {};
        let insert = "";
        let retain = 0;
        let deleteLen = 0;
        const addOp = () => {
          if (action !== null) {
            let op = null;
            switch (action) {
              case "delete":
                if (deleteLen > 0) {
                  op = { delete: deleteLen };
                }
                deleteLen = 0;
                break;
              case "insert":
                if (typeof insert === "object" || insert.length > 0) {
                  op = { insert };
                  if (currentAttributes.size > 0) {
                    op.attributes = {};
                    currentAttributes.forEach((value, key) => {
                      if (value !== null) {
                        op.attributes[key] = value;
                      }
                    });
                  }
                }
                insert = "";
                break;
              case "retain":
                if (retain > 0) {
                  op = { retain };
                  if (!isEmpty(attributes)) {
                    op.attributes = assign({}, attributes);
                  }
                }
                retain = 0;
                break;
            }
            if (op)
              delta.push(op);
            action = null;
          }
        };
        while (item !== null) {
          switch (item.content.constructor) {
            case ContentType:
            case ContentEmbed:
              if (this.adds(item)) {
                if (!this.deletes(item)) {
                  addOp();
                  action = "insert";
                  insert = item.content.getContent()[0];
                  addOp();
                }
              } else if (this.deletes(item)) {
                if (action !== "delete") {
                  addOp();
                  action = "delete";
                }
                deleteLen += 1;
              } else if (!item.deleted) {
                if (action !== "retain") {
                  addOp();
                  action = "retain";
                }
                retain += 1;
              }
              break;
            case ContentString:
              if (this.adds(item)) {
                if (!this.deletes(item)) {
                  if (action !== "insert") {
                    addOp();
                    action = "insert";
                  }
                  insert += item.content.str;
                }
              } else if (this.deletes(item)) {
                if (action !== "delete") {
                  addOp();
                  action = "delete";
                }
                deleteLen += item.length;
              } else if (!item.deleted) {
                if (action !== "retain") {
                  addOp();
                  action = "retain";
                }
                retain += item.length;
              }
              break;
            case ContentFormat: {
              const { key, value } = item.content;
              if (this.adds(item)) {
                if (!this.deletes(item)) {
                  const curVal = currentAttributes.get(key) ?? null;
                  if (!equalAttrs(curVal, value)) {
                    if (action === "retain") {
                      addOp();
                    }
                    if (equalAttrs(value, oldAttributes.get(key) ?? null)) {
                      delete attributes[key];
                    } else {
                      attributes[key] = value;
                    }
                  } else if (value !== null) {
                    item.delete(transaction);
                  }
                }
              } else if (this.deletes(item)) {
                oldAttributes.set(key, value);
                const curVal = currentAttributes.get(key) ?? null;
                if (!equalAttrs(curVal, value)) {
                  if (action === "retain") {
                    addOp();
                  }
                  attributes[key] = curVal;
                }
              } else if (!item.deleted) {
                oldAttributes.set(key, value);
                const attr = attributes[key];
                if (attr !== undefined) {
                  if (!equalAttrs(attr, value)) {
                    if (action === "retain") {
                      addOp();
                    }
                    if (value === null) {
                      delete attributes[key];
                    } else {
                      attributes[key] = value;
                    }
                  } else if (attr !== null) {
                    item.delete(transaction);
                  }
                }
              }
              if (!item.deleted) {
                if (action === "insert") {
                  addOp();
                }
                updateCurrentAttributes(currentAttributes, item.content);
              }
              break;
            }
          }
          item = item.right;
        }
        addOp();
        while (delta.length > 0) {
          const lastOp = delta[delta.length - 1];
          if (lastOp.retain !== undefined && lastOp.attributes === undefined) {
            delta.pop();
          } else {
            break;
          }
        }
      });
      this._delta = delta;
    }
    return this._delta;
  }
}

class YText extends AbstractType {
  constructor(string) {
    super();
    this._pending = string !== undefined ? [() => this.insert(0, string)] : [];
    this._searchMarker = [];
    this._hasFormatting = false;
  }
  get length() {
    this.doc ?? warnPrematureAccess();
    return this._length;
  }
  _integrate(y, item) {
    super._integrate(y, item);
    try {
      this._pending.forEach((f) => f());
    } catch (e) {
      console.error(e);
    }
    this._pending = null;
  }
  _copy() {
    return new YText;
  }
  clone() {
    const text = new YText;
    text.applyDelta(this.toDelta());
    return text;
  }
  _callObserver(transaction, parentSubs) {
    super._callObserver(transaction, parentSubs);
    const event = new YTextEvent(this, transaction, parentSubs);
    callTypeObservers(this, transaction, event);
    if (!transaction.local && this._hasFormatting) {
      transaction._needFormattingCleanup = true;
    }
  }
  toString() {
    this.doc ?? warnPrematureAccess();
    let str = "";
    let n = this._start;
    while (n !== null) {
      if (!n.deleted && n.countable && n.content.constructor === ContentString) {
        str += n.content.str;
      }
      n = n.right;
    }
    return str;
  }
  toJSON() {
    return this.toString();
  }
  applyDelta(delta, { sanitize = true } = {}) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        const currPos = new ItemTextListPosition(null, this._start, 0, new Map);
        for (let i = 0;i < delta.length; i++) {
          const op = delta[i];
          if (op.insert !== undefined) {
            const ins = !sanitize && typeof op.insert === "string" && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === `
` ? op.insert.slice(0, -1) : op.insert;
            if (typeof ins !== "string" || ins.length > 0) {
              insertText(transaction, this, currPos, ins, op.attributes || {});
            }
          } else if (op.retain !== undefined) {
            formatText(transaction, this, currPos, op.retain, op.attributes || {});
          } else if (op.delete !== undefined) {
            deleteText(transaction, currPos, op.delete);
          }
        }
      });
    } else {
      this._pending.push(() => this.applyDelta(delta));
    }
  }
  toDelta(snapshot, prevSnapshot, computeYChange) {
    this.doc ?? warnPrematureAccess();
    const ops = [];
    const currentAttributes = new Map;
    const doc = this.doc;
    let str = "";
    let n = this._start;
    function packStr() {
      if (str.length > 0) {
        const attributes = {};
        let addAttributes = false;
        currentAttributes.forEach((value, key) => {
          addAttributes = true;
          attributes[key] = value;
        });
        const op = { insert: str };
        if (addAttributes) {
          op.attributes = attributes;
        }
        ops.push(op);
        str = "";
      }
    }
    const computeDelta = () => {
      while (n !== null) {
        if (isVisible(n, snapshot) || prevSnapshot !== undefined && isVisible(n, prevSnapshot)) {
          switch (n.content.constructor) {
            case ContentString: {
              const cur = currentAttributes.get("ychange");
              if (snapshot !== undefined && !isVisible(n, snapshot)) {
                if (cur === undefined || cur.user !== n.id.client || cur.type !== "removed") {
                  packStr();
                  currentAttributes.set("ychange", computeYChange ? computeYChange("removed", n.id) : { type: "removed" });
                }
              } else if (prevSnapshot !== undefined && !isVisible(n, prevSnapshot)) {
                if (cur === undefined || cur.user !== n.id.client || cur.type !== "added") {
                  packStr();
                  currentAttributes.set("ychange", computeYChange ? computeYChange("added", n.id) : { type: "added" });
                }
              } else if (cur !== undefined) {
                packStr();
                currentAttributes.delete("ychange");
              }
              str += n.content.str;
              break;
            }
            case ContentType:
            case ContentEmbed: {
              packStr();
              const op = {
                insert: n.content.getContent()[0]
              };
              if (currentAttributes.size > 0) {
                const attrs = {};
                op.attributes = attrs;
                currentAttributes.forEach((value, key) => {
                  attrs[key] = value;
                });
              }
              ops.push(op);
              break;
            }
            case ContentFormat:
              if (isVisible(n, snapshot)) {
                packStr();
                updateCurrentAttributes(currentAttributes, n.content);
              }
              break;
          }
        }
        n = n.right;
      }
      packStr();
    };
    if (snapshot || prevSnapshot) {
      transact(doc, (transaction) => {
        if (snapshot) {
          splitSnapshotAffectedStructs(transaction, snapshot);
        }
        if (prevSnapshot) {
          splitSnapshotAffectedStructs(transaction, prevSnapshot);
        }
        computeDelta();
      }, "cleanup");
    } else {
      computeDelta();
    }
    return ops;
  }
  insert(index, text, attributes) {
    if (text.length <= 0) {
      return;
    }
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        const pos = findPosition(transaction, this, index, !attributes);
        if (!attributes) {
          attributes = {};
          pos.currentAttributes.forEach((v, k) => {
            attributes[k] = v;
          });
        }
        insertText(transaction, this, pos, text, attributes);
      });
    } else {
      this._pending.push(() => this.insert(index, text, attributes));
    }
  }
  insertEmbed(index, embed, attributes) {
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        const pos = findPosition(transaction, this, index, !attributes);
        insertText(transaction, this, pos, embed, attributes || {});
      });
    } else {
      this._pending.push(() => this.insertEmbed(index, embed, attributes || {}));
    }
  }
  delete(index, length2) {
    if (length2 === 0) {
      return;
    }
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        deleteText(transaction, findPosition(transaction, this, index, true), length2);
      });
    } else {
      this._pending.push(() => this.delete(index, length2));
    }
  }
  format(index, length2, attributes) {
    if (length2 === 0) {
      return;
    }
    const y = this.doc;
    if (y !== null) {
      transact(y, (transaction) => {
        const pos = findPosition(transaction, this, index, false);
        if (pos.right === null) {
          return;
        }
        formatText(transaction, this, pos, length2, attributes);
      });
    } else {
      this._pending.push(() => this.format(index, length2, attributes));
    }
  }
  removeAttribute(attributeName) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapDelete(transaction, this, attributeName);
      });
    } else {
      this._pending.push(() => this.removeAttribute(attributeName));
    }
  }
  setAttribute(attributeName, attributeValue) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapSet(transaction, this, attributeName, attributeValue);
      });
    } else {
      this._pending.push(() => this.setAttribute(attributeName, attributeValue));
    }
  }
  getAttribute(attributeName) {
    return typeMapGet(this, attributeName);
  }
  getAttributes() {
    return typeMapGetAll(this);
  }
  _write(encoder) {
    encoder.writeTypeRef(YTextRefID);
  }
}
var readYText = (_decoder) => new YText;

class YXmlTreeWalker {
  constructor(root, f = () => true) {
    this._filter = f;
    this._root = root;
    this._currentNode = root._start;
    this._firstCall = true;
    root.doc ?? warnPrematureAccess();
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    let n = this._currentNode;
    let type = n && n.content && n.content.type;
    if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) {
      do {
        type = n.content.type;
        if (!n.deleted && (type.constructor === YXmlElement || type.constructor === YXmlFragment) && type._start !== null) {
          n = type._start;
        } else {
          while (n !== null) {
            const nxt = n.next;
            if (nxt !== null) {
              n = nxt;
              break;
            } else if (n.parent === this._root) {
              n = null;
            } else {
              n = n.parent._item;
            }
          }
        }
      } while (n !== null && (n.deleted || !this._filter(n.content.type)));
    }
    this._firstCall = false;
    if (n === null) {
      return { value: undefined, done: true };
    }
    this._currentNode = n;
    return { value: n.content.type, done: false };
  }
}

class YXmlFragment extends AbstractType {
  constructor() {
    super();
    this._prelimContent = [];
  }
  get firstChild() {
    const first = this._first;
    return first ? first.content.getContent()[0] : null;
  }
  _integrate(y, item) {
    super._integrate(y, item);
    this.insert(0, this._prelimContent);
    this._prelimContent = null;
  }
  _copy() {
    return new YXmlFragment;
  }
  clone() {
    const el = new YXmlFragment;
    el.insert(0, this.toArray().map((item) => item instanceof AbstractType ? item.clone() : item));
    return el;
  }
  get length() {
    this.doc ?? warnPrematureAccess();
    return this._prelimContent === null ? this._length : this._prelimContent.length;
  }
  createTreeWalker(filter) {
    return new YXmlTreeWalker(this, filter);
  }
  querySelector(query) {
    query = query.toUpperCase();
    const iterator = new YXmlTreeWalker(this, (element) => element.nodeName && element.nodeName.toUpperCase() === query);
    const next = iterator.next();
    if (next.done) {
      return null;
    } else {
      return next.value;
    }
  }
  querySelectorAll(query) {
    query = query.toUpperCase();
    return from(new YXmlTreeWalker(this, (element) => element.nodeName && element.nodeName.toUpperCase() === query));
  }
  _callObserver(transaction, parentSubs) {
    callTypeObservers(this, transaction, new YXmlEvent(this, parentSubs, transaction));
  }
  toString() {
    return typeListMap(this, (xml) => xml.toString()).join("");
  }
  toJSON() {
    return this.toString();
  }
  toDOM(_document = document, hooks = {}, binding) {
    const fragment = _document.createDocumentFragment();
    if (binding !== undefined) {
      binding._createAssociation(fragment, this);
    }
    typeListForEach(this, (xmlType) => {
      fragment.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
    });
    return fragment;
  }
  insert(index, content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListInsertGenerics(transaction, this, index, content);
      });
    } else {
      this._prelimContent.splice(index, 0, ...content);
    }
  }
  insertAfter(ref, content) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        const refItem = ref && ref instanceof AbstractType ? ref._item : ref;
        typeListInsertGenericsAfter(transaction, this, refItem, content);
      });
    } else {
      const pc = this._prelimContent;
      const index = ref === null ? 0 : pc.findIndex((el) => el === ref) + 1;
      if (index === 0 && ref !== null) {
        throw create3("Reference item not found");
      }
      pc.splice(index, 0, ...content);
    }
  }
  delete(index, length2 = 1) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeListDelete(transaction, this, index, length2);
      });
    } else {
      this._prelimContent.splice(index, length2);
    }
  }
  toArray() {
    return typeListToArray(this);
  }
  push(content) {
    this.insert(this.length, content);
  }
  unshift(content) {
    this.insert(0, content);
  }
  get(index) {
    return typeListGet(this, index);
  }
  slice(start = 0, end = this.length) {
    return typeListSlice(this, start, end);
  }
  forEach(f) {
    typeListForEach(this, f);
  }
  _write(encoder) {
    encoder.writeTypeRef(YXmlFragmentRefID);
  }
}
var readYXmlFragment = (_decoder) => new YXmlFragment;

class YXmlElement extends YXmlFragment {
  constructor(nodeName = "UNDEFINED") {
    super();
    this.nodeName = nodeName;
    this._prelimAttrs = new Map;
  }
  get nextSibling() {
    const n = this._item ? this._item.next : null;
    return n ? n.content.type : null;
  }
  get prevSibling() {
    const n = this._item ? this._item.prev : null;
    return n ? n.content.type : null;
  }
  _integrate(y, item) {
    super._integrate(y, item);
    this._prelimAttrs.forEach((value, key) => {
      this.setAttribute(key, value);
    });
    this._prelimAttrs = null;
  }
  _copy() {
    return new YXmlElement(this.nodeName);
  }
  clone() {
    const el = new YXmlElement(this.nodeName);
    const attrs = this.getAttributes();
    forEach(attrs, (value, key) => {
      el.setAttribute(key, value);
    });
    el.insert(0, this.toArray().map((v) => v instanceof AbstractType ? v.clone() : v));
    return el;
  }
  toString() {
    const attrs = this.getAttributes();
    const stringBuilder = [];
    const keys2 = [];
    for (const key in attrs) {
      keys2.push(key);
    }
    keys2.sort();
    const keysLen = keys2.length;
    for (let i = 0;i < keysLen; i++) {
      const key = keys2[i];
      stringBuilder.push(key + '="' + attrs[key] + '"');
    }
    const nodeName = this.nodeName.toLocaleLowerCase();
    const attrsString = stringBuilder.length > 0 ? " " + stringBuilder.join(" ") : "";
    return `<${nodeName}${attrsString}>${super.toString()}</${nodeName}>`;
  }
  removeAttribute(attributeName) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapDelete(transaction, this, attributeName);
      });
    } else {
      this._prelimAttrs.delete(attributeName);
    }
  }
  setAttribute(attributeName, attributeValue) {
    if (this.doc !== null) {
      transact(this.doc, (transaction) => {
        typeMapSet(transaction, this, attributeName, attributeValue);
      });
    } else {
      this._prelimAttrs.set(attributeName, attributeValue);
    }
  }
  getAttribute(attributeName) {
    return typeMapGet(this, attributeName);
  }
  hasAttribute(attributeName) {
    return typeMapHas(this, attributeName);
  }
  getAttributes(snapshot) {
    return snapshot ? typeMapGetAllSnapshot(this, snapshot) : typeMapGetAll(this);
  }
  toDOM(_document = document, hooks = {}, binding) {
    const dom = _document.createElement(this.nodeName);
    const attrs = this.getAttributes();
    for (const key in attrs) {
      const value = attrs[key];
      if (typeof value === "string") {
        dom.setAttribute(key, value);
      }
    }
    typeListForEach(this, (yxml) => {
      dom.appendChild(yxml.toDOM(_document, hooks, binding));
    });
    if (binding !== undefined) {
      binding._createAssociation(dom, this);
    }
    return dom;
  }
  _write(encoder) {
    encoder.writeTypeRef(YXmlElementRefID);
    encoder.writeKey(this.nodeName);
  }
}
var readYXmlElement = (decoder) => new YXmlElement(decoder.readKey());

class YXmlEvent extends YEvent {
  constructor(target, subs, transaction) {
    super(target, transaction);
    this.childListChanged = false;
    this.attributesChanged = new Set;
    subs.forEach((sub) => {
      if (sub === null) {
        this.childListChanged = true;
      } else {
        this.attributesChanged.add(sub);
      }
    });
  }
}

class YXmlHook extends YMap {
  constructor(hookName) {
    super();
    this.hookName = hookName;
  }
  _copy() {
    return new YXmlHook(this.hookName);
  }
  clone() {
    const el = new YXmlHook(this.hookName);
    this.forEach((value, key) => {
      el.set(key, value);
    });
    return el;
  }
  toDOM(_document = document, hooks = {}, binding) {
    const hook = hooks[this.hookName];
    let dom;
    if (hook !== undefined) {
      dom = hook.createDom(this);
    } else {
      dom = document.createElement(this.hookName);
    }
    dom.setAttribute("data-yjs-hook", this.hookName);
    if (binding !== undefined) {
      binding._createAssociation(dom, this);
    }
    return dom;
  }
  _write(encoder) {
    encoder.writeTypeRef(YXmlHookRefID);
    encoder.writeKey(this.hookName);
  }
}
var readYXmlHook = (decoder) => new YXmlHook(decoder.readKey());

class YXmlText extends YText {
  get nextSibling() {
    const n = this._item ? this._item.next : null;
    return n ? n.content.type : null;
  }
  get prevSibling() {
    const n = this._item ? this._item.prev : null;
    return n ? n.content.type : null;
  }
  _copy() {
    return new YXmlText;
  }
  clone() {
    const text = new YXmlText;
    text.applyDelta(this.toDelta());
    return text;
  }
  toDOM(_document = document, hooks, binding) {
    const dom = _document.createTextNode(this.toString());
    if (binding !== undefined) {
      binding._createAssociation(dom, this);
    }
    return dom;
  }
  toString() {
    return this.toDelta().map((delta) => {
      const nestedNodes = [];
      for (const nodeName in delta.attributes) {
        const attrs = [];
        for (const key in delta.attributes[nodeName]) {
          attrs.push({ key, value: delta.attributes[nodeName][key] });
        }
        attrs.sort((a, b) => a.key < b.key ? -1 : 1);
        nestedNodes.push({ nodeName, attrs });
      }
      nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
      let str = "";
      for (let i = 0;i < nestedNodes.length; i++) {
        const node = nestedNodes[i];
        str += `<${node.nodeName}`;
        for (let j = 0;j < node.attrs.length; j++) {
          const attr = node.attrs[j];
          str += ` ${attr.key}="${attr.value}"`;
        }
        str += ">";
      }
      str += delta.insert;
      for (let i = nestedNodes.length - 1;i >= 0; i--) {
        str += `</${nestedNodes[i].nodeName}>`;
      }
      return str;
    }).join("");
  }
  toJSON() {
    return this.toString();
  }
  _write(encoder) {
    encoder.writeTypeRef(YXmlTextRefID);
  }
}
var readYXmlText = (decoder) => new YXmlText;

class AbstractStruct {
  constructor(id2, length2) {
    this.id = id2;
    this.length = length2;
  }
  get deleted() {
    throw methodUnimplemented();
  }
  mergeWith(right) {
    return false;
  }
  write(encoder, offset, encodingRef) {
    throw methodUnimplemented();
  }
  integrate(transaction, offset) {
    throw methodUnimplemented();
  }
}
var structGCRefNumber = 0;

class GC extends AbstractStruct {
  get deleted() {
    return true;
  }
  delete() {}
  mergeWith(right) {
    if (this.constructor !== right.constructor) {
      return false;
    }
    this.length += right.length;
    return true;
  }
  integrate(transaction, offset) {
    if (offset > 0) {
      this.id.clock += offset;
      this.length -= offset;
    }
    addStruct(transaction.doc.store, this);
  }
  write(encoder, offset) {
    encoder.writeInfo(structGCRefNumber);
    encoder.writeLen(this.length - offset);
  }
  getMissing(transaction, store) {
    return null;
  }
}

class ContentBinary {
  constructor(content) {
    this.content = content;
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [this.content];
  }
  isCountable() {
    return true;
  }
  copy() {
    return new ContentBinary(this.content);
  }
  splice(offset) {
    throw methodUnimplemented();
  }
  mergeWith(right) {
    return false;
  }
  integrate(transaction, item) {}
  delete(transaction) {}
  gc(store) {}
  write(encoder, offset) {
    encoder.writeBuf(this.content);
  }
  getRef() {
    return 3;
  }
}
var readContentBinary = (decoder) => new ContentBinary(decoder.readBuf());

class ContentDeleted {
  constructor(len) {
    this.len = len;
  }
  getLength() {
    return this.len;
  }
  getContent() {
    return [];
  }
  isCountable() {
    return false;
  }
  copy() {
    return new ContentDeleted(this.len);
  }
  splice(offset) {
    const right = new ContentDeleted(this.len - offset);
    this.len = offset;
    return right;
  }
  mergeWith(right) {
    this.len += right.len;
    return true;
  }
  integrate(transaction, item) {
    addToDeleteSet(transaction.deleteSet, item.id.client, item.id.clock, this.len);
    item.markDeleted();
  }
  delete(transaction) {}
  gc(store) {}
  write(encoder, offset) {
    encoder.writeLen(this.len - offset);
  }
  getRef() {
    return 1;
  }
}
var readContentDeleted = (decoder) => new ContentDeleted(decoder.readLen());
var createDocFromOpts = (guid, opts) => new Doc({ guid, ...opts, shouldLoad: opts.shouldLoad || opts.autoLoad || false });

class ContentDoc {
  constructor(doc) {
    if (doc._item) {
      console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid.");
    }
    this.doc = doc;
    const opts = {};
    this.opts = opts;
    if (!doc.gc) {
      opts.gc = false;
    }
    if (doc.autoLoad) {
      opts.autoLoad = true;
    }
    if (doc.meta !== null) {
      opts.meta = doc.meta;
    }
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [this.doc];
  }
  isCountable() {
    return true;
  }
  copy() {
    return new ContentDoc(createDocFromOpts(this.doc.guid, this.opts));
  }
  splice(offset) {
    throw methodUnimplemented();
  }
  mergeWith(right) {
    return false;
  }
  integrate(transaction, item) {
    this.doc._item = item;
    transaction.subdocsAdded.add(this.doc);
    if (this.doc.shouldLoad) {
      transaction.subdocsLoaded.add(this.doc);
    }
  }
  delete(transaction) {
    if (transaction.subdocsAdded.has(this.doc)) {
      transaction.subdocsAdded.delete(this.doc);
    } else {
      transaction.subdocsRemoved.add(this.doc);
    }
  }
  gc(store) {}
  write(encoder, offset) {
    encoder.writeString(this.doc.guid);
    encoder.writeAny(this.opts);
  }
  getRef() {
    return 9;
  }
}
var readContentDoc = (decoder) => new ContentDoc(createDocFromOpts(decoder.readString(), decoder.readAny()));

class ContentEmbed {
  constructor(embed) {
    this.embed = embed;
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [this.embed];
  }
  isCountable() {
    return true;
  }
  copy() {
    return new ContentEmbed(this.embed);
  }
  splice(offset) {
    throw methodUnimplemented();
  }
  mergeWith(right) {
    return false;
  }
  integrate(transaction, item) {}
  delete(transaction) {}
  gc(store) {}
  write(encoder, offset) {
    encoder.writeJSON(this.embed);
  }
  getRef() {
    return 5;
  }
}
var readContentEmbed = (decoder) => new ContentEmbed(decoder.readJSON());

class ContentFormat {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [];
  }
  isCountable() {
    return false;
  }
  copy() {
    return new ContentFormat(this.key, this.value);
  }
  splice(_offset) {
    throw methodUnimplemented();
  }
  mergeWith(_right) {
    return false;
  }
  integrate(_transaction, item) {
    const p = item.parent;
    p._searchMarker = null;
    p._hasFormatting = true;
  }
  delete(transaction) {}
  gc(store) {}
  write(encoder, offset) {
    encoder.writeKey(this.key);
    encoder.writeJSON(this.value);
  }
  getRef() {
    return 6;
  }
}
var readContentFormat = (decoder) => new ContentFormat(decoder.readKey(), decoder.readJSON());

class ContentJSON {
  constructor(arr) {
    this.arr = arr;
  }
  getLength() {
    return this.arr.length;
  }
  getContent() {
    return this.arr;
  }
  isCountable() {
    return true;
  }
  copy() {
    return new ContentJSON(this.arr);
  }
  splice(offset) {
    const right = new ContentJSON(this.arr.slice(offset));
    this.arr = this.arr.slice(0, offset);
    return right;
  }
  mergeWith(right) {
    this.arr = this.arr.concat(right.arr);
    return true;
  }
  integrate(transaction, item) {}
  delete(transaction) {}
  gc(store) {}
  write(encoder, offset) {
    const len = this.arr.length;
    encoder.writeLen(len - offset);
    for (let i = offset;i < len; i++) {
      const c = this.arr[i];
      encoder.writeString(c === undefined ? "undefined" : JSON.stringify(c));
    }
  }
  getRef() {
    return 2;
  }
}
var readContentJSON = (decoder) => {
  const len = decoder.readLen();
  const cs = [];
  for (let i = 0;i < len; i++) {
    const c = decoder.readString();
    if (c === "undefined") {
      cs.push(undefined);
    } else {
      cs.push(JSON.parse(c));
    }
  }
  return new ContentJSON(cs);
};
var isDevMode = getVariable("node_env") === "development";

class ContentAny {
  constructor(arr) {
    this.arr = arr;
    isDevMode && deepFreeze(arr);
  }
  getLength() {
    return this.arr.length;
  }
  getContent() {
    return this.arr;
  }
  isCountable() {
    return true;
  }
  copy() {
    return new ContentAny(this.arr);
  }
  splice(offset) {
    const right = new ContentAny(this.arr.slice(offset));
    this.arr = this.arr.slice(0, offset);
    return right;
  }
  mergeWith(right) {
    this.arr = this.arr.concat(right.arr);
    return true;
  }
  integrate(transaction, item) {}
  delete(transaction) {}
  gc(store) {}
  write(encoder, offset) {
    const len = this.arr.length;
    encoder.writeLen(len - offset);
    for (let i = offset;i < len; i++) {
      const c = this.arr[i];
      encoder.writeAny(c);
    }
  }
  getRef() {
    return 8;
  }
}
var readContentAny = (decoder) => {
  const len = decoder.readLen();
  const cs = [];
  for (let i = 0;i < len; i++) {
    cs.push(decoder.readAny());
  }
  return new ContentAny(cs);
};

class ContentString {
  constructor(str) {
    this.str = str;
  }
  getLength() {
    return this.str.length;
  }
  getContent() {
    return this.str.split("");
  }
  isCountable() {
    return true;
  }
  copy() {
    return new ContentString(this.str);
  }
  splice(offset) {
    const right = new ContentString(this.str.slice(offset));
    this.str = this.str.slice(0, offset);
    const firstCharCode = this.str.charCodeAt(offset - 1);
    if (firstCharCode >= 55296 && firstCharCode <= 56319) {
      this.str = this.str.slice(0, offset - 1) + "�";
      right.str = "�" + right.str.slice(1);
    }
    return right;
  }
  mergeWith(right) {
    this.str += right.str;
    return true;
  }
  integrate(transaction, item) {}
  delete(transaction) {}
  gc(store) {}
  write(encoder, offset) {
    encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
  }
  getRef() {
    return 4;
  }
}
var readContentString = (decoder) => new ContentString(decoder.readString());
var typeRefs = [
  readYArray,
  readYMap,
  readYText,
  readYXmlElement,
  readYXmlFragment,
  readYXmlHook,
  readYXmlText
];
var YArrayRefID = 0;
var YMapRefID = 1;
var YTextRefID = 2;
var YXmlElementRefID = 3;
var YXmlFragmentRefID = 4;
var YXmlHookRefID = 5;
var YXmlTextRefID = 6;

class ContentType {
  constructor(type) {
    this.type = type;
  }
  getLength() {
    return 1;
  }
  getContent() {
    return [this.type];
  }
  isCountable() {
    return true;
  }
  copy() {
    return new ContentType(this.type._copy());
  }
  splice(offset) {
    throw methodUnimplemented();
  }
  mergeWith(right) {
    return false;
  }
  integrate(transaction, item) {
    this.type._integrate(transaction.doc, item);
  }
  delete(transaction) {
    let item = this.type._start;
    while (item !== null) {
      if (!item.deleted) {
        item.delete(transaction);
      } else if (item.id.clock < (transaction.beforeState.get(item.id.client) || 0)) {
        transaction._mergeStructs.push(item);
      }
      item = item.right;
    }
    this.type._map.forEach((item2) => {
      if (!item2.deleted) {
        item2.delete(transaction);
      } else if (item2.id.clock < (transaction.beforeState.get(item2.id.client) || 0)) {
        transaction._mergeStructs.push(item2);
      }
    });
    transaction.changed.delete(this.type);
  }
  gc(store) {
    let item = this.type._start;
    while (item !== null) {
      item.gc(store, true);
      item = item.right;
    }
    this.type._start = null;
    this.type._map.forEach((item2) => {
      while (item2 !== null) {
        item2.gc(store, true);
        item2 = item2.left;
      }
    });
    this.type._map = new Map;
  }
  write(encoder, offset) {
    this.type._write(encoder);
  }
  getRef() {
    return 7;
  }
}
var readContentType = (decoder) => new ContentType(typeRefs[decoder.readTypeRef()](decoder));
var splitItem = (transaction, leftItem, diff) => {
  const { client: client2, clock } = leftItem.id;
  const rightItem = new Item(createID(client2, clock + diff), leftItem, createID(client2, clock + diff - 1), leftItem.right, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
  if (leftItem.deleted) {
    rightItem.markDeleted();
  }
  if (leftItem.keep) {
    rightItem.keep = true;
  }
  if (leftItem.redone !== null) {
    rightItem.redone = createID(leftItem.redone.client, leftItem.redone.clock + diff);
  }
  leftItem.right = rightItem;
  if (rightItem.right !== null) {
    rightItem.right.left = rightItem;
  }
  transaction._mergeStructs.push(rightItem);
  if (rightItem.parentSub !== null && rightItem.right === null) {
    rightItem.parent._map.set(rightItem.parentSub, rightItem);
  }
  leftItem.length = diff;
  return rightItem;
};
class Item extends AbstractStruct {
  constructor(id2, left, origin, right, rightOrigin, parent, parentSub, content) {
    super(id2, content.getLength());
    this.origin = origin;
    this.left = left;
    this.right = right;
    this.rightOrigin = rightOrigin;
    this.parent = parent;
    this.parentSub = parentSub;
    this.redone = null;
    this.content = content;
    this.info = this.content.isCountable() ? BIT2 : 0;
  }
  set marker(isMarked) {
    if ((this.info & BIT4) > 0 !== isMarked) {
      this.info ^= BIT4;
    }
  }
  get marker() {
    return (this.info & BIT4) > 0;
  }
  get keep() {
    return (this.info & BIT1) > 0;
  }
  set keep(doKeep) {
    if (this.keep !== doKeep) {
      this.info ^= BIT1;
    }
  }
  get countable() {
    return (this.info & BIT2) > 0;
  }
  get deleted() {
    return (this.info & BIT3) > 0;
  }
  set deleted(doDelete) {
    if (this.deleted !== doDelete) {
      this.info ^= BIT3;
    }
  }
  markDeleted() {
    this.info |= BIT3;
  }
  getMissing(transaction, store) {
    if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= getState(store, this.origin.client)) {
      return this.origin.client;
    }
    if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= getState(store, this.rightOrigin.client)) {
      return this.rightOrigin.client;
    }
    if (this.parent && this.parent.constructor === ID && this.id.client !== this.parent.client && this.parent.clock >= getState(store, this.parent.client)) {
      return this.parent.client;
    }
    if (this.origin) {
      this.left = getItemCleanEnd(transaction, store, this.origin);
      this.origin = this.left.lastId;
    }
    if (this.rightOrigin) {
      this.right = getItemCleanStart(transaction, this.rightOrigin);
      this.rightOrigin = this.right.id;
    }
    if (this.left && this.left.constructor === GC || this.right && this.right.constructor === GC) {
      this.parent = null;
    } else if (!this.parent) {
      if (this.left && this.left.constructor === Item) {
        this.parent = this.left.parent;
        this.parentSub = this.left.parentSub;
      } else if (this.right && this.right.constructor === Item) {
        this.parent = this.right.parent;
        this.parentSub = this.right.parentSub;
      }
    } else if (this.parent.constructor === ID) {
      const parentItem = getItem(store, this.parent);
      if (parentItem.constructor === GC) {
        this.parent = null;
      } else {
        this.parent = parentItem.content.type;
      }
    }
    return null;
  }
  integrate(transaction, offset) {
    if (offset > 0) {
      this.id.clock += offset;
      this.left = getItemCleanEnd(transaction, transaction.doc.store, createID(this.id.client, this.id.clock - 1));
      this.origin = this.left.lastId;
      this.content = this.content.splice(offset);
      this.length -= offset;
    }
    if (this.parent) {
      if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
        let left = this.left;
        let o;
        if (left !== null) {
          o = left.right;
        } else if (this.parentSub !== null) {
          o = this.parent._map.get(this.parentSub) || null;
          while (o !== null && o.left !== null) {
            o = o.left;
          }
        } else {
          o = this.parent._start;
        }
        const conflictingItems = new Set;
        const itemsBeforeOrigin = new Set;
        while (o !== null && o !== this.right) {
          itemsBeforeOrigin.add(o);
          conflictingItems.add(o);
          if (compareIDs(this.origin, o.origin)) {
            if (o.id.client < this.id.client) {
              left = o;
              conflictingItems.clear();
            } else if (compareIDs(this.rightOrigin, o.rightOrigin)) {
              break;
            }
          } else if (o.origin !== null && itemsBeforeOrigin.has(getItem(transaction.doc.store, o.origin))) {
            if (!conflictingItems.has(getItem(transaction.doc.store, o.origin))) {
              left = o;
              conflictingItems.clear();
            }
          } else {
            break;
          }
          o = o.right;
        }
        this.left = left;
      }
      if (this.left !== null) {
        const right = this.left.right;
        this.right = right;
        this.left.right = this;
      } else {
        let r;
        if (this.parentSub !== null) {
          r = this.parent._map.get(this.parentSub) || null;
          while (r !== null && r.left !== null) {
            r = r.left;
          }
        } else {
          r = this.parent._start;
          this.parent._start = this;
        }
        this.right = r;
      }
      if (this.right !== null) {
        this.right.left = this;
      } else if (this.parentSub !== null) {
        this.parent._map.set(this.parentSub, this);
        if (this.left !== null) {
          this.left.delete(transaction);
        }
      }
      if (this.parentSub === null && this.countable && !this.deleted) {
        this.parent._length += this.length;
      }
      addStruct(transaction.doc.store, this);
      this.content.integrate(transaction, this);
      addChangedTypeToTransaction(transaction, this.parent, this.parentSub);
      if (this.parent._item !== null && this.parent._item.deleted || this.parentSub !== null && this.right !== null) {
        this.delete(transaction);
      }
    } else {
      new GC(this.id, this.length).integrate(transaction, 0);
    }
  }
  get next() {
    let n = this.right;
    while (n !== null && n.deleted) {
      n = n.right;
    }
    return n;
  }
  get prev() {
    let n = this.left;
    while (n !== null && n.deleted) {
      n = n.left;
    }
    return n;
  }
  get lastId() {
    return this.length === 1 ? this.id : createID(this.id.client, this.id.clock + this.length - 1);
  }
  mergeWith(right) {
    if (this.constructor === right.constructor && compareIDs(right.origin, this.lastId) && this.right === right && compareIDs(this.rightOrigin, right.rightOrigin) && this.id.client === right.id.client && this.id.clock + this.length === right.id.clock && this.deleted === right.deleted && this.redone === null && right.redone === null && this.content.constructor === right.content.constructor && this.content.mergeWith(right.content)) {
      const searchMarker = this.parent._searchMarker;
      if (searchMarker) {
        searchMarker.forEach((marker) => {
          if (marker.p === right) {
            marker.p = this;
            if (!this.deleted && this.countable) {
              marker.index -= this.length;
            }
          }
        });
      }
      if (right.keep) {
        this.keep = true;
      }
      this.right = right.right;
      if (this.right !== null) {
        this.right.left = this;
      }
      this.length += right.length;
      return true;
    }
    return false;
  }
  delete(transaction) {
    if (!this.deleted) {
      const parent = this.parent;
      if (this.countable && this.parentSub === null) {
        parent._length -= this.length;
      }
      this.markDeleted();
      addToDeleteSet(transaction.deleteSet, this.id.client, this.id.clock, this.length);
      addChangedTypeToTransaction(transaction, parent, this.parentSub);
      this.content.delete(transaction);
    }
  }
  gc(store, parentGCd) {
    if (!this.deleted) {
      throw unexpectedCase();
    }
    this.content.gc(store);
    if (parentGCd) {
      replaceStruct(store, this, new GC(this.id, this.length));
    } else {
      this.content = new ContentDeleted(this.length);
    }
  }
  write(encoder, offset) {
    const origin = offset > 0 ? createID(this.id.client, this.id.clock + offset - 1) : this.origin;
    const rightOrigin = this.rightOrigin;
    const parentSub = this.parentSub;
    const info = this.content.getRef() & BITS5 | (origin === null ? 0 : BIT8) | (rightOrigin === null ? 0 : BIT7) | (parentSub === null ? 0 : BIT6);
    encoder.writeInfo(info);
    if (origin !== null) {
      encoder.writeLeftID(origin);
    }
    if (rightOrigin !== null) {
      encoder.writeRightID(rightOrigin);
    }
    if (origin === null && rightOrigin === null) {
      const parent = this.parent;
      if (parent._item !== undefined) {
        const parentItem = parent._item;
        if (parentItem === null) {
          const ykey = findRootTypeKey(parent);
          encoder.writeParentInfo(true);
          encoder.writeString(ykey);
        } else {
          encoder.writeParentInfo(false);
          encoder.writeLeftID(parentItem.id);
        }
      } else if (parent.constructor === String) {
        encoder.writeParentInfo(true);
        encoder.writeString(parent);
      } else if (parent.constructor === ID) {
        encoder.writeParentInfo(false);
        encoder.writeLeftID(parent);
      } else {
        unexpectedCase();
      }
      if (parentSub !== null) {
        encoder.writeString(parentSub);
      }
    }
    this.content.write(encoder, offset);
  }
}
var readItemContent = (decoder, info) => contentRefs[info & BITS5](decoder);
var contentRefs = [
  () => {
    unexpectedCase();
  },
  readContentDeleted,
  readContentJSON,
  readContentBinary,
  readContentString,
  readContentEmbed,
  readContentFormat,
  readContentType,
  readContentAny,
  readContentDoc,
  () => {
    unexpectedCase();
  }
];
var structSkipRefNumber = 10;

class Skip extends AbstractStruct {
  get deleted() {
    return true;
  }
  delete() {}
  mergeWith(right) {
    if (this.constructor !== right.constructor) {
      return false;
    }
    this.length += right.length;
    return true;
  }
  integrate(transaction, offset) {
    unexpectedCase();
  }
  write(encoder, offset) {
    encoder.writeInfo(structSkipRefNumber);
    writeVarUint(encoder.restEncoder, this.length - offset);
  }
  getMissing(transaction, store) {
    return null;
  }
}
var glo = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
var importIdentifier = "__ $YJS$ __";
if (glo[importIdentifier] === true) {
  console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
}
glo[importIdentifier] = true;

// src/crdt.ts
var TEXT_KEY = "content";
function newDoc() {
  return new Doc;
}
function setText(doc, text) {
  const ytext = doc.getText(TEXT_KEY);
  doc.transact(() => {
    if (ytext.length > 0)
      ytext.delete(0, ytext.length);
    if (text.length > 0)
      ytext.insert(0, text);
  });
}
function docToText(doc) {
  return doc.getText(TEXT_KEY).toString();
}
function encodeStateB64(doc) {
  return Buffer.from(encodeStateAsUpdate(doc)).toString("base64");
}
function applyUpdateB64(doc, b64) {
  applyUpdate(doc, new Uint8Array(Buffer.from(b64, "base64")));
}
function snapshotToBytes(doc) {
  return encodeStateAsUpdate(doc);
}
function bytesToDoc(bytes) {
  const doc = new Doc;
  applyUpdate(doc, bytes);
  return doc;
}

// src/fs-edit.ts
import { mkdirSync as mkdirSync5, writeFileSync as writeFileSync4, readFileSync as readFileSync7 } from "node:fs";
import { resolve as resolve6, dirname as dirname7, sep as sep2 } from "node:path";

// src/watch-auto.ts
function isExactPathWatch(predicate, path7) {
  if (predicate.kind !== "entry")
    return false;
  const p = predicate;
  return p.path === path7 && p.performative === undefined && p.thread === undefined && p.mention_me === undefined && p.participant === undefined && p.task_ref === undefined;
}
async function subscribePathWatch(client2, path7) {
  const result = await client2.postWatch({ kind: "entry", path: path7 });
  if (!result.ok)
    return { ok: false, error: result.error, detail: result.detail };
  return { ok: true };
}
function isExactTaskStateWatch(predicate, taskRef, to) {
  return predicate.kind === "task_state" && predicate.task_ref === taskRef && predicate.to === to;
}
async function subscribeTaskStateWatch(client2, taskRef, to, existing) {
  try {
    const watches = existing ?? await client2.getWatches();
    if (watches.some((w) => isExactTaskStateWatch(w.predicate, taskRef, to)))
      return { ok: true };
  } catch {}
  const result = await client2.postWatch({ kind: "task_state", task_ref: taskRef, to });
  if (!result.ok)
    return { ok: false, error: result.error, detail: result.detail };
  return { ok: true };
}
async function registerDeliverAutoWatch(client2, taskRef) {
  let existing;
  try {
    existing = await client2.getWatches();
  } catch {
    existing = undefined;
  }
  return Promise.all(["ANNOUNCED", "DONE"].map((to) => subscribeTaskStateWatch(client2, taskRef, to, existing)));
}
async function unsubscribePathWatch(client2, path7) {
  try {
    const watches = await client2.getWatches();
    const mine = watches.find((w) => isExactPathWatch(w.predicate, path7));
    if (!mine)
      return false;
    await client2.deleteWatch(mine.id);
    return true;
  } catch {
    return false;
  }
}
function extractLockHolder(detail) {
  const m = /is locked by '([^']+)'/.exec(detail);
  return m?.[1];
}

// src/attachment.ts
import { realpathSync } from "node:fs";
import { resolve as resolve5 } from "node:path";
import * as os4 from "node:os";
function resolveAndAttachRoot(opts) {
  const rootFlag = opts.rootFlag === "" ? undefined : opts.rootFlag;
  const resolved = resolveStatusRoot(rootFlag, opts.cwd, { origin: opts.origin, roomId: opts.roomId });
  const root = resolved?.root ?? resolve5(opts.cwd);
  const real = (p) => {
    try {
      return realpathSync(p);
    } catch {
      return p;
    }
  };
  const isGuardedRoot = real(root) === real(resolve5(os4.homedir())) || real(root) === real(resolve5(opts.home));
  if (isGuardedRoot) {
    return {
      ok: false,
      error: `refusing to attach ${root} — it is $HOME or this room's MESH_HOME, never a room checkout. Run this from your actual working copy, or pass --root/--into.`
    };
  }
  upsertAttachment(root, { origin: opts.origin, roomId: opts.roomId });
  setDefaultWorkspaceRoot(roomKeyFor(opts.origin, opts.roomId), root, opts.home);
  return { ok: true, root, resolved };
}
function resolveRootFlag(intoFlag, rootFlag) {
  return (intoFlag || undefined) ?? (rootFlag || undefined);
}

// src/fs-edit.ts
function flag(args2, name) {
  const v = args2.flags[name];
  return typeof v === "string" ? v : undefined;
}
function die(msg) {
  process.stderr.write(msg + `
`);
  process.exit(1);
}
function ok(msg) {
  process.stdout.write(msg + `
`);
}
async function fsCmdEdit(client2, args2, senderId, origin) {
  const repopath = args2.positional[0];
  if (!repopath)
    die("fs edit: <path> is required");
  const home = flag(args2, "home") ?? meshHome();
  const attach = resolveAndAttachRoot({ rootFlag: resolveRootFlag(flag(args2, "into"), flag(args2, "root")), cwd: process.cwd(), home, origin, roomId: client2.roomId });
  if (!attach.ok)
    die(attach.error);
  const { root: into, resolved } = attach;
  if (resolved !== null && into !== resolve6(process.cwd()))
    process.stderr.write(`root: ${into} (resolved via ${resolved.source})
`);
  const roomKey = roomKeyFor(origin, client2.roomId);
  const ac = new AbortController;
  const buffered = [];
  let liveApply = false;
  const editState = { doc: newDoc() };
  const followTask = (async () => {
    try {
      for await (const frame of client2.follow(undefined, ac.signal)) {
        if (frame.type !== "crdt" || frame.path !== repopath)
          continue;
        if (liveApply) {
          applyUpdateB64(editState.doc, frame.update);
        } else {
          buffered.push(frame.update);
        }
      }
    } catch {}
  })();
  await new Promise((r) => setTimeout(r, 0));
  const treeResult = await client2.getTree(repopath);
  if ("error" in treeResult) {
    ac.abort();
    await followTask;
    die(`fs edit: [${treeResult.error}] ${treeResult.detail}`);
  }
  const node = resolveNode(treeResult.tree, repopath);
  let nodeHashRef;
  if (node) {
    nodeHashRef = node.content_hash;
    let hashHex;
    try {
      hashHex = hashFromRef(node.content_hash);
    } catch {
      hashHex = "";
    }
    if (hashHex) {
      const blob = await client2.getArtifact(hashHex);
      if (blob instanceof Uint8Array) {
        try {
          editState.doc = bytesToDoc(blob);
        } catch {
          setText(editState.doc, Buffer.from(blob).toString("utf8"));
        }
      }
    }
  }
  liveApply = true;
  for (const u of buffered)
    applyUpdateB64(editState.doc, u);
  buffered.length = 0;
  const fsBase = resolve6(into);
  const fsDest = resolve6(into, repopath);
  if (fsDest !== fsBase && !fsDest.startsWith(fsBase + sep2)) {
    ac.abort();
    await followTask;
    die("fs edit: path escapes target directory");
  }
  mkdirSync5(dirname7(fsDest), { recursive: true });
  const roomId = client2.roomId;
  const tipText = docToText(editState.doc);
  let localBytes;
  try {
    localBytes = readFileSync7(fsDest);
  } catch {
    localBytes = undefined;
  }
  if (hasPreExistingConflictMarkers(localBytes)) {
    ac.abort();
    await followTask;
    die(`fs edit: ${repopath} contains unresolved conflict markers from a previous session — resolve them (or delete the local file) and re-run`);
  }
  const decision = decideEditWrite({
    sidecar: readSidecarResolved(into, roomKey, roomId, repopath, home),
    tipText,
    tipHash: nodeHashRef ?? "",
    localBytes
  });
  let conflictPending = false;
  let conflictBaseText = "";
  switch (decision.kind) {
    case "binary":
      ok(decision.warning);
      break;
    case "clean":
      writeFileSync4(fsDest, decision.text, "utf8");
      writeFolderSidecar(into, roomKey, repopath, decision.sidecar);
      ok(`fs edit: loaded ${repopath} → ${fsDest}`);
      break;
    case "merged":
      setText(editState.doc, decision.text);
      writeFileSync4(fsDest, decision.text, "utf8");
      writeFolderSidecar(into, roomKey, repopath, decision.sidecar);
      if (decision.warning)
        ok(decision.warning);
      ok(`fs edit: loaded ${repopath} → ${fsDest} (local edits merged with room tip)`);
      break;
    case "conflict":
      writeFileSync4(fsDest, decision.text, "utf8");
      conflictPending = true;
      conflictBaseText = tipText;
      ok(decision.warning);
      ok(`fs edit: loaded ${repopath} → ${fsDest} (conflict markers written — resolve before publishing)`);
      break;
  }
  const watchSub = await subscribePathWatch(client2, repopath);
  if (!watchSub.ok)
    ok(`fs edit: warning — watch registration failed [${watchSub.error}] ${watchSub.detail} — you will not be notified of conflicts`);
  await client2.relay(repopath, encodeStateB64(editState.doc));
  const publishSnapshot = async () => {
    let localText;
    try {
      localText = readFileSync7(fsDest, "utf8");
    } catch {
      localText = docToText(editState.doc);
    }
    if (hasConflictMarkers(localText)) {
      ok("fs edit: conflict markers present — resolve before publishing (skipped this flush)");
      return;
    }
    if (conflictPending) {
      const currentDocText = docToText(editState.doc);
      const fold = decideFoldBack(conflictBaseText, currentDocText, localText);
      if (fold.kind === "conflict") {
        writeFileSync4(fsDest, fold.text, "utf8");
        ok(fold.warning);
        return;
      }
      if (fold.kind === "merged") {
        writeFileSync4(fsDest, fold.text, "utf8");
        ok(fold.warning);
      }
      setText(editState.doc, fold.text);
      conflictPending = false;
      conflictBaseText = fold.text;
    }
    const snapBytes = snapshotToBytes(editState.doc);
    const snapHash = sha256hex(snapBytes);
    const up = await client2.putArtifact(snapHash, snapBytes);
    if (!up.ok) {
      ok(`fs edit: snapshot upload failed: [${up.error}]`);
      return;
    }
    const postData = {
      path: repopath,
      content_hash: "r2:" + snapHash,
      size: snapBytes.length
    };
    if (nodeHashRef !== undefined)
      postData["base_hash"] = nodeHashRef;
    const r = await client2.postEntry({ performative: "file.write", data: postData });
    if (r.ok) {
      nodeHashRef = "r2:" + snapHash;
      writeFolderSidecar(into, roomKey, repopath, { content: docToText(editState.doc), tip_hash: nodeHashRef });
      ok(`fs edit: snapshot published (r2:${snapHash}, seq=${r.seq})`);
    } else {
      ok(`fs edit: snapshot post failed: [${r.error}]`);
    }
  };
  const snapshotInterval = setInterval(() => {
    publishSnapshot();
  }, 30000);
  const cleanup = async () => {
    clearInterval(snapshotInterval);
    ac.abort();
    await followTask;
    await publishSnapshot();
    await unsubscribePathWatch(client2, repopath);
    process.exit(0);
  };
  process.once("SIGINT", () => {
    cleanup();
  });
  process.once("SIGTERM", () => {
    cleanup();
  });
  await followTask;
  clearInterval(snapshotInterval);
  await publishSnapshot();
  await unsubscribePathWatch(client2, repopath);
}

// src/fs-acl.ts
function flag2(args2, name) {
  const v = args2.flags[name];
  return typeof v === "string" ? v : undefined;
}
function flagBool(args2, name) {
  return args2.flags[name] !== undefined;
}
function die2(msg) {
  process.stderr.write(msg + `
`);
  process.exit(1);
}
function ok2(msg) {
  process.stdout.write(msg + `
`);
}
async function fsCmdGrant(client2, args2, _senderId) {
  const subject = args2.positional[0];
  const path7 = args2.positional[1];
  const grade = args2.positional[2];
  if (!subject || !path7 || !grade)
    die2("fs grant: <subject> <path> <grade> are required");
  if (!isAccessGrade(grade)) {
    die2("fs grant: grade must be discover|read|write|exclusive");
  }
  const r = await client2.grant(subject, path7, grade);
  if (!r.ok)
    die2(`fs grant: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok2(`fs grant ${grade} on ${path7} → ${subject} (seq=${r.seq})`);
}
async function fsCmdRevoke(client2, args2, _senderId) {
  const subject = args2.positional[0];
  const path7 = args2.positional[1];
  if (!subject || !path7)
    die2("fs revoke: <subject> <path> are required");
  const r = await client2.revokeGrant(subject, path7);
  if (!r.ok)
    die2(`fs revoke: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok2(`fs revoke: removed grant on ${path7} from ${subject} (seq=${r.seq})`);
}
async function fsCmdGrants(client2, _args, _senderId) {
  const grants = await client2.listGrants();
  if (!Array.isArray(grants)) {
    die2(`fs grants: [${grants.error}] ${grants.detail}`);
    return;
  }
  if (grants.length === 0) {
    ok2("(no grants)");
    return;
  }
  ok2(renderGrants(grants));
}
async function fsCmdRole(client2, args2, _senderId) {
  const participant = args2.positional[0];
  const role = args2.positional[1];
  if (!participant || !role)
    die2("fs role: <participant> <role> are required");
  const replaces = flag2(args2, "replaces");
  const depthFlag = flag2(args2, "depth");
  const fromFlag = flag2(args2, "from");
  const untilFlag = flag2(args2, "until");
  const override = flagBool(args2, "override");
  const depth = depthFlag !== undefined ? Number(depthFlag) : undefined;
  if (depthFlag !== undefined && Number.isNaN(depth))
    die2("fs role: --depth must be a number");
  const active_from = fromFlag !== undefined ? Date.parse(fromFlag) : undefined;
  const active_until = untilFlag !== undefined ? Date.parse(untilFlag) : undefined;
  if (fromFlag !== undefined && Number.isNaN(active_from))
    die2("fs role: --from must be a valid ISO timestamp");
  if (untilFlag !== undefined && Number.isNaN(active_until))
    die2("fs role: --until must be a valid ISO timestamp");
  const r = await client2.assignRole(participant, role, {
    ...replaces !== undefined && { replaces },
    ...depth !== undefined && { depth },
    ...active_from !== undefined && { active_from },
    ...active_until !== undefined && { active_until },
    ...override && { override }
  });
  if (!r.ok)
    die2(`fs role: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok2(`fs role ${participant} → ${role} (seq=${r.seq})`);
  if (replaces !== undefined) {
    const roles = await client2.listRoles();
    if (Array.isArray(roles) && roles.some((row) => row.participant === replaces && row.role === role)) {
      process.stderr.write(`fs role: WARNING — ${replaces} still holds ${role} after the swap. ` + `This room may predate roster registry v1.12.0 and silently ignored --replaces. ` + `Run 'mesh fs role-rm ${replaces} ${role}' to finish the swap manually.
`);
    }
  }
}
async function fsCmdRoleRm(client2, args2, _senderId) {
  const participant = args2.positional[0];
  const role = args2.positional[1];
  if (!participant || !role)
    die2("fs role-rm: <participant> <role> are required");
  const r = await client2.removeRole(participant, role);
  if (!r.ok)
    die2(`fs role-rm: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok2(`fs role-rm: unbound ${participant} from ${role} (seq=${r.seq})`);
}
async function fsCmdRoles(client2, _args, _senderId) {
  const roles = await client2.listRoles();
  if (!Array.isArray(roles)) {
    die2(`fs roles: [${roles.error}] ${roles.detail}`);
    return;
  }
  if (roles.length === 0) {
    ok2("(no role bindings)");
    return;
  }
  ok2(renderRoleBindings(roles));
}
async function fsCmdLeases(client2, _args, _senderId) {
  const leases = await client2.listLeases();
  if (!Array.isArray(leases)) {
    die2(`fs leases: [${leases.error}] ${leases.detail}`);
    return;
  }
  if (leases.length === 0) {
    ok2("(no active leases)");
    return;
  }
  ok2(renderLeases(leases));
}
async function fsCmdConfig(client2, args2, _senderId) {
  const first = args2.positional[0];
  if (first === "rate") {
    const spec = args2.positional[1];
    if (!spec)
      die2('fs config: rate <spec> is required (e.g. "30/min;burst=60")');
    const r2 = await client2.setRateLimit(spec);
    if (!r2.ok)
      die2(`fs config: [${r2.error}] ${r2.detail}${r2.hint ? " — " + r2.hint : ""}`);
    ok2(`fs config: rate_limit → ${spec} (seq=${r2.seq})`);
    return;
  }
  if (first === "authority-source") {
    const value = args2.positional[1];
    if (value !== "card" && value !== "bindings")
      die2("fs config: authority-source <card|bindings> is required");
    const r2 = await client2.setAuthoritySource(value);
    if (!r2.ok)
      die2(`fs config: [${r2.error}] ${r2.detail}${r2.hint ? " — " + r2.hint : ""}`);
    ok2(`fs config: authority_source → ${value} (seq=${r2.seq})`);
    return;
  }
  if (first === "archive") {
    const spec = args2.positional[1];
    const n = spec !== undefined ? parseInt(spec, 10) : NaN;
    if (spec === undefined || !Number.isInteger(n) || String(n) !== spec) {
      die2("fs config: archive <n> is required (0 = off, or an integer in [100,1000000])");
    }
    const r2 = await client2.setArchiveThreshold(n);
    if (!r2.ok)
      die2(`fs config: [${r2.error}] ${r2.detail}${r2.hint ? " — " + r2.hint : ""}`);
    ok2(`fs config: archive.threshold_entries → ${n} (seq=${r2.seq})`);
    return;
  }
  if (first === "fts") {
    const spec = args2.positional[1];
    const n = spec !== undefined ? parseInt(spec, 10) : NaN;
    if (spec === undefined || !Number.isInteger(n) || String(n) !== spec) {
      die2("fs config: fts <bytes> is required (integer in [1024,5242880])");
    }
    const r2 = await client2.setFtsMaxFileBytes(n);
    if (!r2.ok)
      die2(`fs config: [${r2.error}] ${r2.detail}${r2.hint ? " — " + r2.hint : ""}`);
    ok2(`fs config: fts_max_file_bytes → ${n} (seq=${r2.seq})`);
    return;
  }
  if (first === "artifact") {
    const spec = args2.positional[1];
    const n = spec !== undefined ? parseInt(spec, 10) : NaN;
    if (spec === undefined || !Number.isInteger(n) || String(n) !== spec) {
      die2("fs config: artifact <bytes> is required (integer in [1048576,524288000])");
    }
    const r2 = await client2.setArtifactMaxBytes(n);
    if (!r2.ok)
      die2(`fs config: [${r2.error}] ${r2.detail}${r2.hint ? " — " + r2.hint : ""}`);
    ok2(`fs config: artifact_max_bytes → ${n} (seq=${r2.seq})`);
    return;
  }
  if (first === "public-share") {
    const value = args2.positional[1];
    if (value !== "on" && value !== "off")
      die2("fs config: public-share <on|off> is required");
    const r2 = await client2.setPublicShare(value === "on");
    if (!r2.ok)
      die2(`fs config: [${r2.error}] ${r2.detail}${r2.hint ? " — " + r2.hint : ""}`);
    ok2(`fs config: public_share → ${value} (seq=${r2.seq})`);
    return;
  }
  if (first === "write" || first === "discover") {
    const value = args2.positional[1];
    if (value !== "open" && value !== "closed")
      die2(`fs config: ${first} <open|closed> is required`);
    const grade = value === "open" ? "open" : "closed";
    const state = await client2.getState();
    const current = normalizeDefaultAccess(state.defaults.default_access);
    const posture = first === "write" ? { discover: current.discover, write: grade } : { discover: grade, write: current.write };
    const r2 = await client2.setDefaultAccessSplit(posture);
    if (!r2.ok)
      die2(`fs config: [${r2.error}] ${r2.detail}${r2.hint ? " — " + r2.hint : ""}`);
    ok2(`fs config: default_access.${first} → ${value} (seq=${r2.seq})`);
    return;
  }
  if (first !== "open" && first !== "closed")
    die2("fs config: <open|closed> is required");
  const r = await client2.setDefaultAccess(first);
  if (!r.ok)
    die2(`fs config: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok2(`fs config: default_access → ${first} (seq=${r.seq}). Tip: "fs config write <open|closed>" / "fs config discover <open|closed>" set one grade independently.`);
}

// src/wait-report.ts
function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0)
    return null;
  const idx = Math.min(sortedAsc.length - 1, Math.max(0, Math.ceil(p / 100 * sortedAsc.length) - 1));
  return sortedAsc[idx];
}
function computeWaitReport(entries, claims, roomDefaults, opts = {}) {
  const now = opts.nowMs ?? Date.now();
  const sinceMs = opts.sinceIso !== undefined ? Date.parse(opts.sinceIso) : -Infinity;
  const humanSet = opts.humanIds !== undefined ? new Set(opts.humanIds) : null;
  const leaseTtlSByTaskRef = new Map;
  for (const e of entries) {
    if (e.submission.performative === "announce" && e.submission.task_ref) {
      const d = e.submission.data;
      leaseTtlSByTaskRef.set(e.submission.task_ref, d?.lease_ttl_s ?? roomDefaults.lease_ttl_s);
    }
  }
  const claimByTaskRef = new Map(claims.map((c) => [c.task_ref, c]));
  const consumedAnswerSeqs = new Set;
  const rows = [];
  for (let i = 0;i < entries.length; i++) {
    const q = entries[i];
    const qs = q.submission;
    if (consumedAnswerSeqs.has(q.seq))
      continue;
    if (qs.performative !== "request" && qs.performative !== "inform")
      continue;
    if (!qs.mentions || qs.mentions.length === 0)
      continue;
    const qTsMs = Date.parse(q.room_ts);
    if (qTsMs < sinceMs)
      continue;
    if (humanSet && !qs.mentions.some((m) => humanSet.has(m)))
      continue;
    let answer = null;
    let matchTier = null;
    if (qs.thread !== undefined || qs.task_ref !== undefined) {
      let looseAnswer = null;
      for (let j = i + 1;j < entries.length; j++) {
        const a = entries[j];
        if (consumedAnswerSeqs.has(a.seq))
          continue;
        const as = a.submission;
        const sameKey = qs.thread !== undefined ? as.thread === qs.thread : as.task_ref === qs.task_ref;
        if (!sameKey || !qs.mentions.includes(as.sender))
          continue;
        if (looseAnswer === null)
          looseAnswer = a;
        if (as.mentions?.includes(qs.sender)) {
          answer = a;
          matchTier = "strict";
          break;
        }
      }
      if (answer === null && looseAnswer !== null) {
        answer = looseAnswer;
        matchTier = "loose";
      }
    }
    if (answer)
      consumedAnswerSeqs.add(answer.seq);
    const answerTsMs = answer ? Date.parse(answer.room_ts) : null;
    const wait_ms = answerTsMs !== null ? answerTsMs - qTsMs : null;
    let lease_burned_ms = null;
    if (qs.task_ref) {
      const claim = claimByTaskRef.get(qs.task_ref);
      const leaseExpiresMs = claim?.lease_expires ? Date.parse(claim.lease_expires) : null;
      if (leaseExpiresMs !== null) {
        const endMs = answerTsMs ?? now;
        lease_burned_ms = Math.max(0, Math.min(endMs, leaseExpiresMs) - qTsMs);
      }
    }
    rows.push({
      question_seq: q.seq,
      question_sender: qs.sender,
      mentions: qs.mentions,
      task_ref: qs.task_ref ?? null,
      thread: qs.thread ?? null,
      question_ts: q.room_ts,
      answer_seq: answer?.seq ?? null,
      answer_sender: answer?.submission.sender ?? null,
      answer_ts: answer?.room_ts ?? null,
      wait_ms,
      lease_burned_ms,
      match: matchTier
    });
  }
  const answeredWaits = rows.filter((r) => r.wait_ms !== null).map((r) => r.wait_ms).sort((a, b) => a - b);
  const answered = answeredWaits.length;
  const leaseStarvedCount = rows.filter((r) => {
    if (r.lease_burned_ms === null || !r.task_ref)
      return false;
    const ttlS = leaseTtlSByTaskRef.get(r.task_ref) ?? roomDefaults.lease_ttl_s;
    return r.lease_burned_ms >= 0.8 * ttlS * 1000;
  }).length;
  const strictCount = rows.filter((r) => r.match === "strict").length;
  const looseCount = rows.filter((r) => r.match === "loose").length;
  return {
    rows,
    summary: {
      count: rows.length,
      answered,
      answered_pct: rows.length > 0 ? answered / rows.length * 100 : 0,
      p50_wait_ms: percentile(answeredWaits, 50),
      p90_wait_ms: percentile(answeredWaits, 90),
      p95_wait_ms: percentile(answeredWaits, 95),
      lease_starved_count: leaseStarvedCount,
      strict_count: strictCount,
      loose_count: looseCount
    }
  };
}

// src/decide.ts
function flag3(args2, name) {
  const v = args2.flags[name];
  return typeof v === "string" ? v : undefined;
}
function die3(msg) {
  process.stderr.write(msg + `
`);
  process.exit(1);
}
function ok3(msg) {
  process.stdout.write(msg + `
`);
}
async function fetchAllEntries(client2) {
  const all2 = [];
  let since = -1;
  for (;; ) {
    const page = await client2.getEntries({ since, limit: 100 });
    if (page.entries.length === 0)
      break;
    all2.push(...page.entries);
    since = page.entries[page.entries.length - 1].seq;
    if (page.entries.length < 100)
      break;
  }
  return all2;
}
async function decideCmdWaitReport(client2, args2, _senderId) {
  const sinceIso = flag3(args2, "since");
  const humanArg = flag3(args2, "human");
  const humanIds = humanArg ? humanArg.split(",").map((s) => s.trim()) : undefined;
  const [entries, state] = await Promise.all([fetchAllEntries(client2), client2.getState()]);
  const report = computeWaitReport(entries, state.claims, state.defaults, { sinceIso, humanIds });
  ok3(JSON.stringify(report.rows, null, 2));
  ok3("");
  ok3(`questions: ${report.summary.count}  answered: ${report.summary.answered} (${report.summary.answered_pct.toFixed(1)}%)`);
  ok3(`wait_ms  p50=${report.summary.p50_wait_ms ?? "-"}  p90=${report.summary.p90_wait_ms ?? "-"}  p95=${report.summary.p95_wait_ms ?? "-"}`);
  ok3(`lease-starved (>=80% of lease_ttl_ms burned while waiting): ${report.summary.lease_starved_count}`);
  ok3(`match confidence  strict=${report.summary.strict_count}  loose=${report.summary.loose_count}`);
}
async function decideCmdAsk(client2, args2, _senderId) {
  const question = args2.positional[0];
  if (!question)
    die3('decide ask: "<question>" is required');
  const byArg = flag3(args2, "by");
  if (!byArg)
    die3("decide ask: --by <arm[,arm...]> is required (e.g. --by id:dana,role:reviewer-backend)");
  const authority = byArg.split(",").map((s) => s.trim());
  const deadline = flag3(args2, "deadline");
  const fallbackNote = flag3(args2, "fallback-note");
  const refArg = flag3(args2, "ref");
  const decisionId = "d-" + Buffer.from(crypto.getRandomValues(new Uint8Array(8))).toString("hex");
  const data = { question, authority };
  if (deadline)
    data["deadline"] = deadline;
  if (fallbackNote)
    data["fallback_note"] = fallbackNote;
  if (refArg)
    data["refs"] = refArg.split(",").map((s) => s.trim());
  const result = await client2.postEntry({ performative: "decide.request", thread: decisionId, data });
  if (!result.ok)
    die3(`decide ask failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  ok3(`Decision ${decisionId} asked (seq=${result.seq})`);
}
async function decideCmdAnswer(client2, args2, _senderId) {
  const decisionId = args2.positional[0];
  if (!decisionId)
    die3("decide answer: <decision-id> is required");
  const resolutionArg = flag3(args2, "resolution");
  if (resolutionArg === undefined)
    die3("decide answer: --resolution is required");
  let resolution;
  try {
    resolution = JSON.parse(resolutionArg);
  } catch {
    resolution = resolutionArg;
  }
  const result = await client2.postEntry({ performative: "decide.resolve", thread: decisionId, data: { resolution } });
  if (!result.ok)
    die3(`decide answer failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  ok3(`Decision ${decisionId} resolved (seq=${result.seq})`);
}
function filterAndSortDecisions(rows, opts) {
  let filtered = rows;
  if (opts.mine !== undefined) {
    filtered = filtered.filter((r) => r.authority.includes(`id:${opts.mine}`));
  } else if (opts.role !== undefined) {
    filtered = filtered.filter((r) => r.authority.includes(`role:${opts.role}`));
  }
  return [...filtered].sort((a, b) => {
    if (a.deadline === null && b.deadline === null)
      return 0;
    if (a.deadline === null)
      return 1;
    if (b.deadline === null)
      return -1;
    return Date.parse(a.deadline) - Date.parse(b.deadline);
  });
}
async function decideCmdList(client2, args2, senderId) {
  const mine = args2.flags["mine"] !== undefined ? senderId : undefined;
  const role = flag3(args2, "role");
  const state = await client2.getState();
  const rows = filterAndSortDecisions(state.decisions, { mine, role });
  if (rows.length === 0) {
    ok3("(no decisions)");
    return;
  }
  ok3(renderDecisions(rows));
}
function renderResolutionLine(row) {
  if (row.status !== "resolved")
    return null;
  const value = typeof row.resolution === "string" ? row.resolution : JSON.stringify(row.resolution);
  return `resolution: ${value}${row.resolved_via ? `  (via ${row.resolved_via})` : ""}`;
}
async function decideCmdShow(client2, args2, _senderId) {
  const decisionId = args2.positional[0];
  if (!decisionId)
    die3(`decide show: <decision-id> is required`);
  const state = await client2.getState();
  const row = state.decisions.find((d) => d.id === decisionId);
  if (!row)
    die3(`decide show: unknown decision ${decisionId}`);
  ok3(renderDecisions([row]));
  const resolutionLine = renderResolutionLine(row);
  if (resolutionLine !== null)
    ok3(scrubControl(resolutionLine));
  ok3("");
  const entries = await fetchAllEntries(client2);
  const thread = entries.filter((e) => e.submission.thread === decisionId);
  ok3(renderEntries(thread));
}
var DECIDE_CMDS = {
  "wait-report": decideCmdWaitReport,
  ask: decideCmdAsk,
  answer: decideCmdAnswer,
  list: decideCmdList,
  show: decideCmdShow
};

// src/doctor.ts
import { readFileSync as readFileSync8, statSync } from "node:fs";
import { join as join9 } from "node:path";
function flagBool2(args2, name) {
  return args2.flags[name] !== undefined;
}
function ok4(msg) {
  process.stdout.write(msg + `
`);
}
function errMsg(e) {
  return e instanceof Error ? e.message : String(e);
}
function computeDoctorReport(input) {
  const { state, nowMs, workspace, verify: verify2, artifacts } = input;
  const warnings = [];
  const escalationRows = [];
  for (const e of state.escalations) {
    if (e.status !== "open")
      continue;
    escalationRows.push({
      kind: "escalation",
      ref: String(e.escalate_seq),
      detail: e.task_ref ? `${e.reason} (task ${e.task_ref})` : e.reason,
      hint: `mesh ack ${e.escalate_seq}`
    });
  }
  const stalledRows = [];
  for (const c of state.claims) {
    if (!isClaimStalled({ state: c.state, holder: c.holder, max_claim_until: c.max_claim_until != null ? Date.parse(c.max_claim_until) : null }, null, nowMs))
      continue;
    stalledRows.push({
      kind: "stalled",
      ref: c.task_ref,
      detail: `holder=${c.holder ?? "?"} max_claim_until=${c.max_claim_until}`
    });
  }
  const decisionRows = [];
  for (const d of state.decisions) {
    if (d.status === "lapsed") {
      decisionRows.push({ kind: "decision", ref: d.id, detail: `lapsed: ${d.question}` });
    } else if (d.status === "open" && d.deadline != null && Date.parse(d.deadline) <= nowMs) {
      decisionRows.push({ kind: "decision", ref: d.id, detail: `overdue (deadline ${d.deadline}): ${d.question}` });
    }
  }
  const conditionRows = [];
  for (const p of state.roster) {
    if (!p.condition)
      continue;
    const withStaleness = conditionWithStaleness(p.condition, p.condition_ts, { nowMs });
    const isStale = withStaleness !== p.condition;
    const isGone = p.condition === "gone";
    if (!isStale && !isGone)
      continue;
    conditionRows.push({ kind: "condition", ref: p.participant_id, detail: withStaleness ?? p.condition });
  }
  const conflictRows = [];
  if (workspace.ok) {
    for (const row of workspace.rows) {
      if (row.state !== "diverged" && row.overlay !== "conflict-markers")
        continue;
      const label = row.overlay ?? row.state;
      conflictRows.push({ kind: "conflict", ref: row.path, detail: row.detail ? `${label}: ${row.detail}` : label });
    }
  } else {
    warnings.push(`workspace: skipped (${workspace.reason})`);
  }
  const verifyRows = [];
  if (verify2.ok) {
    if (!verify2.chainOk) {
      verifyRows.push({ kind: "verify", ref: "chain", detail: `chain verification failed (head seq=${state.head.seq})` });
    }
  } else {
    warnings.push(`verify: skipped (${verify2.reason})`);
  }
  const artifactRows = [];
  if (artifacts.ok) {
    for (const p of artifacts.probes) {
      if (p.kind === "missing") {
        artifactRows.push({
          kind: "artifact",
          ref: p.taskRef,
          detail: `missing artifact r2:${p.hash}`,
          hint: `re-deliver: mesh deliver ${p.taskRef} --dir <path> | --artifact <ref>`
        });
      } else if (p.kind === "error") {
        warnings.push(`artifact r2:${p.hash} (task ${p.taskRef}): skipped (${p.reason})`);
      }
    }
  } else {
    warnings.push(`artifacts: skipped (${artifacts.reason})`);
  }
  const sections = [
    { title: "Open escalations", rows: escalationRows },
    { title: "Stalled holds", rows: stalledRows },
    { title: "Decisions", rows: decisionRows },
    { title: "Conditions", rows: conditionRows },
    { title: "Workspace conflicts", rows: conflictRows },
    { title: "Chain verify", rows: verifyRows },
    { title: "Artifacts", rows: artifactRows }
  ];
  const problemCount = sections.reduce((n, s) => n + s.rows.length, 0);
  return { sections, warnings, problemCount, exitCode: problemCount > 0 ? 1 : 0 };
}
function formatDoctorPorcelain(report) {
  return report.sections.flatMap((s) => s.rows.map((r) => `${r.kind}	${r.ref}	${r.detail}`));
}
function renderDoctorHuman(report) {
  const lines = [];
  for (const section of report.sections) {
    if (section.rows.length === 0)
      continue;
    lines.push(`${section.title}:`);
    for (const row of section.rows) {
      lines.push(row.hint ? `  ${row.ref}  ${row.detail}  (${row.hint})` : `  ${row.ref}  ${row.detail}`);
    }
  }
  for (const w of report.warnings)
    lines.push(`⚠ ${w}`);
  lines.push(report.problemCount === 0 ? "doctor: all clear" : `doctor: ${report.problemCount} problem(s) found`);
  return lines;
}
async function scanWorkspace(client2, root, home, roomKey, legacyAmbiguous) {
  try {
    const [treeResult, leasesResult] = await Promise.all([client2.getTree(), client2.listLeases()]);
    if ("error" in treeResult)
      return { ok: false, reason: `[${treeResult.error}] ${treeResult.detail}` };
    if (!Array.isArray(leasesResult))
      return { ok: false, reason: `[${leasesResult.error}] ${leasesResult.detail}` };
    const localAbsByPath = new Map;
    try {
      if (statSync(root).isDirectory()) {
        for (const rel of walkDirFiles(root, makeIgnore(loadMeshignore(root), {}))) {
          localAbsByPath.set(normalizeId(rel), join9(root, rel));
        }
      }
    } catch {}
    const local = new Map;
    for (const [p, abs2] of localAbsByPath) {
      const bytes = readFileSync8(abs2);
      const text = isValidUtf8Bytes(new Uint8Array(bytes)) ? bytes.toString("utf8") : undefined;
      local.set(p, { hash: "r2:" + sha256hex(new Uint8Array(bytes)), text });
    }
    const tip = new Map(treeResult.tree.map((n) => [n.path, n]));
    const lease = new Map(leasesResult.map((l) => [l.path, { holder: l.holder, expiresAtMs: l.lease_expires }]));
    const sidecarOnlyPaths = roomKey !== undefined ? [...new Set([...listFolderSidecarPaths(root, roomKey), ...legacyAmbiguous ? [] : listSidecarPaths(client2.roomId, home)])] : legacyAmbiguous ? [] : listSidecarPaths(client2.roomId, home);
    const baseTipHash = new Map;
    for (const p of new Set([...local.keys(), ...tip.keys(), ...sidecarOnlyPaths])) {
      const sidecar = roomKey !== undefined ? readSidecarResolved(root, roomKey, client2.roomId, p, home, legacyAmbiguous) : readSidecar(client2.roomId, p, home);
      if (sidecar)
        baseTipHash.set(p, sidecar.tip_hash);
    }
    const rows = composeStatusRows({ local, tip, baseTipHash, lease, sidecarOnlyPaths }, Date.now());
    return { ok: true, rows };
  } catch (e) {
    return { ok: false, reason: errMsg(e) };
  }
}
async function computeVerifyOutcome(client2, state) {
  try {
    const result = await client2.verify(0, state.head.seq);
    if (!result.ok)
      return { ok: false, reason: `[${result.error}] ${result.detail}` };
    return { ok: true, chainOk: result.chain_ok };
  } catch (e) {
    return { ok: false, reason: errMsg(e) };
  }
}
async function computeArtifactsOutcome(client2, state) {
  let entries;
  try {
    entries = await fetchAllEntries(client2);
  } catch (e) {
    return { ok: false, reason: errMsg(e) };
  }
  const delivered = state.claims.filter((c) => c.state === "DELIVERED" && c.delivered_seq !== undefined).sort((a, b) => b.delivered_seq - a.delivered_seq).slice(0, 10);
  const entriesBySeq = new Map(entries.map((e) => [e.seq, e]));
  const probes = [];
  for (const claim of delivered) {
    const entry = entriesBySeq.get(claim.delivered_seq);
    for (const raw of entry?.submission.artifacts ?? []) {
      const ref = parseArtifactRef(raw);
      if (ref.kind !== "r2")
        continue;
      try {
        const found = await client2.headArtifact(ref.hash);
        probes.push({ taskRef: claim.task_ref, hash: ref.hash, kind: found ? "ok" : "missing" });
      } catch (e) {
        probes.push({ taskRef: claim.task_ref, hash: ref.hash, kind: "error", reason: errMsg(e) });
      }
    }
  }
  return { ok: true, probes };
}
async function runDoctor(client2, args2, opts) {
  let state;
  try {
    state = await client2.getState();
  } catch (e) {
    process.stderr.write(`mesh doctor: ${errMsg(e)}
`);
    process.exitCode = 2;
    return;
  }
  const [workspace, verify2, artifacts] = await Promise.all([
    scanWorkspace(client2, opts.root, opts.home, opts.roomKey, opts.legacyAmbiguous),
    computeVerifyOutcome(client2, state),
    computeArtifactsOutcome(client2, state)
  ]);
  const report = computeDoctorReport({ state, nowMs: Date.now(), workspace, verify: verify2, artifacts });
  const lines = flagBool2(args2, "porcelain") ? formatDoctorPorcelain(report) : renderDoctorHuman(report);
  for (const line of lines)
    ok4(line);
  process.exitCode = report.exitCode;
}

// src/badge.ts
function composeBadge(counts) {
  const segments = [];
  if (counts.unread > 0)
    segments.push(`unread: ${counts.unread}`);
  const fsParts = [];
  if (counts.fsBehind > 0)
    fsParts.push(`${counts.fsBehind} behind`);
  if (counts.fsConflict > 0)
    fsParts.push(`${counts.fsConflict} conflict`);
  if (fsParts.length > 0)
    segments.push(`fs: ${fsParts.join(", ")}`);
  if (counts.openDecisions > 0)
    segments.push(`${counts.openDecisions} open decisions`);
  return segments.length > 0 ? segments.join(" · ") : null;
}

// src/brief.ts
function flag4(args2, name) {
  const v = args2.flags[name];
  return typeof v === "string" ? v : undefined;
}
function die4(msg) {
  process.stderr.write(msg + `
`);
  process.exit(1);
}
function ok5(msg) {
  process.stdout.write(msg + `
`);
}
async function readCharterFile(client2, path7) {
  const t = await client2.getTree(path7);
  if (!("tree" in t))
    return { content: null, tip_seq: null };
  const node = resolveNode(t.tree, path7);
  if (!node)
    return { content: null, tip_seq: null };
  let hash;
  try {
    hash = hashFromRef(node.content_hash);
  } catch {
    return { content: null, tip_seq: null };
  }
  const blob = await client2.getArtifact(hash);
  if (!(blob instanceof Uint8Array))
    return { content: null, tip_seq: null };
  return { content: Buffer.from(blob).toString("utf8"), tip_seq: node.tip_seq };
}
async function authorOf(client2, seq) {
  try {
    const result = await client2.getEntries({ since: seq - 1, limit: 1 });
    const entry = result.entries.find((e) => e.seq === seq);
    return entry?.submission.sender ?? null;
  } catch {
    return null;
  }
}
async function resolveCharterSection(client2, path7) {
  const { content, tip_seq } = await readCharterFile(client2, path7);
  if (content === null)
    return { path: path7, content: null, tip_seq: null, author: null };
  const author = await authorOf(client2, tip_seq);
  return { path: path7, content, tip_seq, author };
}
async function resolveMyRoles(client2, selfId) {
  try {
    const rows = await client2.listRoles();
    return Array.isArray(rows) ? myRoles(rows, selfId) : [];
  } catch {
    return [];
  }
}
async function resolveMyWriteGrants(client2, selfId, roles) {
  try {
    const rows = await client2.listGrants();
    if (!Array.isArray(rows))
      return null;
    const subjects = new Set([selfId, ...roles.map((r) => `role:${r}`)]);
    return rows.filter((g) => subjects.has(g.subject) && gte(g.access, "write")).map((g) => ({ path_prefix: g.path_prefix, access: g.access }));
  } catch {
    return null;
  }
}
async function resolveActiveLeases(client2) {
  try {
    const rows = await client2.listLeases();
    if (!Array.isArray(rows))
      return null;
    return rows.map((r) => ({ path: r.path, holder: r.holder, lease_expires: r.lease_expires }));
  } catch {
    return null;
  }
}
async function resolveWorkspaceSection(client2, selfId, roles, posture) {
  const [writeGrants, leases] = await Promise.all([
    resolveMyWriteGrants(client2, selfId, roles),
    resolveActiveLeases(client2)
  ]);
  return { posture, writeGrants, leases };
}
function toDutyClaims(claims) {
  return claims.map((c) => ({
    task_ref: c.task_ref,
    state: c.state,
    holder: c.holder,
    depends_on: c.depends_on,
    verdict_by: c.verdict_by,
    max_claim_until: c.max_claim_until != null ? Date.parse(c.max_claim_until) : undefined
  }));
}
function buildTeamRows(state, selfId) {
  const bindings = state.bindings ?? [];
  return state.roster.map((p) => {
    const claimedRefs = p.participant_id === selfId ? [] : state.claims.filter((c) => c.state === "CLAIMED" && c.holder === p.participant_id).map((c) => c.task_ref);
    return {
      participant_id: p.participant_id,
      boundRoles: myRoles(bindings, p.participant_id),
      condition: p.condition ?? null,
      condition_ts: p.condition_ts ?? null,
      claimedRefs
    };
  });
}
function buildBriefInput(state, selfId, roles, roomId, room, roleCharters, workspace, nowMs) {
  const duties = computeDuties(toDutyClaims(state.claims), selfId, roles, nowMs);
  const openDecisions = decisionsAwaitingAuthority(state.decisions, selfId, roles).map((d) => ({ id: d.id, question: d.question }));
  const badge = composeBadge({ unread: 0, fsBehind: 0, fsConflict: 0, openDecisions: openDecisions.length });
  const team = buildTeamRows(state, selfId);
  return { selfId, roomId, roles: [...roles], room, roleCharters, duties, openDecisions, workspace, badge, team };
}
function ownerAuthorityPostureWarning(state, selfId) {
  const isOwner = state.roster.some((p) => p.joined_seq === 0 && p.participant_id === selfId);
  const authoritySource = state.defaults.authority_source ?? "card";
  if (!isOwner || authoritySource !== "card")
    return "";
  return `⚠ room is on legacy card authority (self-declared card roles can pass verdicts) — upgrade: mesh fs config authority-source bindings

`;
}
async function cmdBrief(args2) {
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag4(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const [state, roles] = await Promise.all([
    client2.getState(),
    resolveMyRoles(client2, identity.id)
  ]);
  const [roomSection, roleCharters, workspace] = await Promise.all([
    resolveCharterSection(client2, CHARTER_ROOM_PATH),
    Promise.all(roles.map((role) => resolveCharterSection(client2, charterRolePath(role)))),
    resolveWorkspaceSection(client2, identity.id, roles, normalizeDefaultAccess(state.defaults.default_access).write)
  ]);
  const input = buildBriefInput(state, identity.id, roles, roomId, roomSection, roleCharters, workspace, Date.now());
  ok5(ownerAuthorityPostureWarning(state, identity.id) + renderBrief(input));
}

// src/open.ts
import { spawn as spawn2 } from "node:child_process";
function flag5(args2, name) {
  const v = args2.flags[name];
  return typeof v === "string" ? v : undefined;
}
function flagBool3(args2, name) {
  return args2.flags[name] !== undefined;
}
function die5(msg) {
  process.stderr.write(msg + `
`);
  process.exit(1);
}
function ok6(msg) {
  process.stdout.write(msg + `
`);
}
function terminalSafeQuote(text) {
  const quoted = JSON.stringify(text);
  if (quoted === undefined)
    throw new TypeError("Unable to quote terminal text");
  return quoted.replace(/[\u007f-\u009f\u061c\u200e\u200f\u2028-\u202e\u2066-\u2069]/g, (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
var ROOM_URL_SUFFIX = /\/v1\/rooms\/[^/]+\/?$/;
function buildOpenUrl(entry, secretBytes, readOnly) {
  const match = ROOM_URL_SUFFIX.exec(entry.url);
  if (!match)
    die5(`open: room url "${entry.url}" is not a ".../v1/rooms/<id>" url`);
  const origin = entry.url.slice(0, match.index);
  const roomId = entry.url.replace(/\/$/, "").split("/").pop();
  const base = `${origin}/room/${encodeURIComponent(roomId)}/${encodeURIComponent(entry.token)}`;
  if (readOnly || secretBytes === null)
    return base;
  return `${base}#k=${Buffer.from(secretBytes).toString("base64url")}`;
}
function defaultSpawnOpener(command, args2, onError) {
  const child = spawn2(command, args2, { detached: true, stdio: "ignore" });
  child.on("error", onError);
  child.unref();
}
function openerFor(url) {
  if (process.platform === "darwin")
    return { command: "open", args: [url] };
  if (process.platform === "win32")
    return { command: "cmd", args: ["/c", "start", "", url] };
  return { command: "xdg-open", args: [url] };
}
async function cmdOpen(args2, spawnOpener) {
  const home = flag5(args2, "home");
  const roomArg = flag5(args2, "room");
  const readOnly = flagBool3(args2, "read-only");
  const printOnly = flagBool3(args2, "print");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag5(args2, "url") || undefined);
  let secretBytes = null;
  if (!readOnly) {
    const identity = loadIdentityWithSecret(home);
    if (!identity)
      die5('No identity. Run "mesh keygen" first.');
    if (room.participant_id === undefined) {
      die5("open: this room entry predates participant tracking — re-run `mesh room join` to refresh it, or use --read-only");
    }
    if (room.participant_id !== identity.id) {
      die5(`open: local identity "${identity.id}" does not match this room's joined participant "${room.participant_id}" — use --read-only, or switch identity/profile`);
    }
    secretBytes = identity.secretBytes;
  }
  const url = buildOpenUrl(room, secretBytes, readOnly);
  if (printOnly) {
    ok6(url);
    return;
  }
  const copyHint = "rerun the same command with `--print` added to copy it";
  const { command, args: openerArgs } = openerFor(url);
  const onError = () => {
    process.stderr.write(`open: could not launch a browser (${command} not available) — ${copyHint}
`);
  };
  if (spawnOpener === undefined)
    defaultSpawnOpener(command, openerArgs, onError);
  else
    spawnOpener(command, openerArgs, onError);
  const label = readOnly ? "read-only link" : "write link kept private";
  ok6(`opening room ${terminalSafeQuote(roomId)} in your browser (${label}; ${copyHint})`);
}

// src/flags.ts
function parseArgs(argv, arity) {
  const positional = [];
  const flags = {};
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq !== -1) {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
        i++;
        continue;
      }
      const key = arg.slice(2);
      const next = argv[i + 1];
      const kind = arity[key];
      if (kind === "boolean") {
        flags[key] = true;
        i++;
      } else if (kind === "value") {
        if (next !== undefined && !next.startsWith("--")) {
          flags[key] = next;
          i += 2;
        } else {
          flags[key] = true;
          i++;
        }
      } else {
        flags[key] = true;
        i++;
      }
    } else if (arg.length > 1 && arg.startsWith("-") && !arg.startsWith("--")) {
      flags[arg.slice(1)] = true;
      i++;
    } else {
      positional.push(arg);
      i++;
    }
  }
  return { positional, flags };
}
var GLOBAL_CLI_FLAGS = [
  "home",
  "profile",
  "url",
  "room",
  "json",
  "help",
  "h",
  "version",
  "V"
];
var GROUP_COMMANDS = new Set(["fs", "room", "identity", "key", "profile", "decide", "watch"]);
function specKeyFor(positional) {
  const p0 = positional[0] ?? "";
  if (GROUP_COMMANDS.has(p0) && positional[1] !== undefined)
    return `${p0} ${positional[1]}`;
  return p0;
}
var COMMAND_SPEC = {
  init: { flags: [], max: 0, names: [] },
  keygen: { flags: ["id", "roles", "force"], max: 0, names: [] },
  use: { flags: [], max: 1, names: ["profile-name"] },
  "profile list": { flags: [], max: 0, names: [] },
  whoami: { flags: [], max: 0, names: [] },
  "identity list": { flags: [], max: 0, names: [] },
  "identity copy": { flags: ["from", "to", "force"], max: 0, names: [] },
  "key rotate": { flags: [], max: 0, names: [] },
  "key retire": { flags: [], max: 0, names: [] },
  "room create": { flags: ["owner", "host"], max: 1, names: ["room_id"] },
  "room join": { flags: ["passphrase", "host"], max: 2, names: ["room-url", "room-or-invite"] },
  "room invite": { flags: ["show", "rotate", "for", "passphrase", "ttl", "list", "revoke"], max: 1, names: ["room_id"] },
  "room list": { flags: [], max: 0, names: [] },
  rooms: { flags: [], max: 0, names: [] },
  "room rm": { flags: [], max: 1, names: ["room_id"] },
  "room delete": { flags: [], max: 1, names: ["room_id"] },
  "room log": { flags: ["f", "all"], max: 0, names: [] },
  log: { flags: ["f", "all"], max: 0, names: [] },
  chat: { flags: [], max: 0, names: [] },
  open: { flags: ["read-only", "print"], max: 0, names: [] },
  ui: { flags: ["port", "profile", "print", "no-open", "status", "stop", "restart"], max: 0, names: [] },
  post: { flags: ["body", "thread"], max: 1, names: ["body"] },
  announce: { flags: ["body", "verdict-by", "claim-window-s", "lease-ttl-s", "max-claim-s", "depends-on"], max: 1, names: ["task_ref"] },
  claim: { flags: ["body", "artifact"], max: 1, names: ["task_ref"] },
  release: { flags: ["body", "artifact"], max: 1, names: ["task_ref"] },
  deliver: { flags: ["dir", "artifact", "body"], max: 1, names: ["task_ref"] },
  accept: { flags: ["body", "artifact"], max: 1, names: ["task_ref"] },
  reject: { flags: ["body", "artifact"], max: 1, names: ["task_ref"] },
  inform: { flags: ["body", "artifact"], max: 1, names: ["task_ref"] },
  ack: { flags: [], max: 1, names: ["escalate_seq"] },
  fetch: { flags: ["into"], max: 1, names: ["task-or-hash"] },
  "watch task": { flags: [], max: 2, names: ["task_ref", "STATE"] },
  "watch entry": { flags: ["performative", "thread", "mention-me", "path", "participant", "task-ref"], max: 0, names: [] },
  "fs put": { flags: ["as", "root", "all", "strict", "prune-ignored", "verbose", "v", "stop-on-error"], max: 1, names: ["path"] },
  "fs ls": { flags: ["f", "into", "root"], max: 1, names: ["prefix"] },
  "fs get": { flags: ["into", "root", "prune"], max: 1, names: ["repopath"] },
  "fs rm": { flags: ["r", "recursive"], max: 1, names: ["repopath"] },
  "fs edit": { flags: ["into", "root"], max: 1, names: ["path"] },
  "fs lock": { flags: [], max: 1, names: ["path"] },
  "fs unlock": { flags: [], max: 1, names: ["path"] },
  "fs grep": { flags: ["prefix", "limit", "hydrate", "into", "root"], max: 1, names: ["query"] },
  "fs log": { flags: ["f"], max: 0, names: [] },
  "fs hydrate": { flags: ["into", "root", "prune"], max: 1, names: ["prefix"] },
  "fs grant": { flags: [], max: 3, names: ["subject", "path", "grade"] },
  "fs grants": { flags: [], max: 0, names: [] },
  "fs revoke": { flags: [], max: 2, names: ["subject", "path"] },
  "fs role": { flags: ["replaces", "depth", "from", "until", "override"], max: 2, names: ["participant", "role"] },
  "fs roles": { flags: [], max: 0, names: [] },
  "fs role-rm": { flags: [], max: 2, names: ["participant", "role"] },
  "fs leases": { flags: [], max: 0, names: [] },
  "fs config": { flags: [], max: 2, names: ["setting", "value"] },
  "fs deps": { flags: [], max: 1, names: ["path"] },
  "fs request": { flags: ["grade"], max: 1, names: ["path"] },
  "fs status": { flags: ["deep", "porcelain", "root"], max: 1, names: ["prefix"] },
  "fs diff": { flags: ["base", "root"], max: 1, names: ["path"] },
  state: { flags: [], max: 0, names: [] },
  inbox: { flags: ["since", "mark"], max: 0, names: [] },
  brief: { flags: [], max: 0, names: [] },
  doctor: { flags: ["porcelain", "root"], max: 0, names: [] },
  "decide ask": { flags: ["by", "deadline", "fallback-note", "ref"], max: 1, names: ["question"] },
  "decide answer": { flags: ["resolution"], max: 1, names: ["decision-id"] },
  "decide list": { flags: ["mine", "role"], max: 0, names: [] },
  "decide show": { flags: [], max: 1, names: ["decision-id"] },
  "decide wait-report": { flags: ["since", "human"], max: 0, names: [] },
  version: { flags: [], max: 0, names: [] }
};
var ALIAS_OF = {
  "room remove": "room rm",
  "room forget": "room rm",
  "create-room": "room create",
  join: "room join"
};
for (const [alias, target] of Object.entries(ALIAS_OF))
  COMMAND_SPEC[alias] = COMMAND_SPEC[target];
var FLAG_ARITY = {
  home: "value",
  profile: "value",
  url: "value",
  room: "value",
  json: "boolean",
  help: "boolean",
  h: "boolean",
  version: "boolean",
  V: "boolean",
  id: "value",
  roles: "value",
  force: "boolean",
  from: "value",
  to: "value",
  owner: "value",
  host: "value",
  passphrase: "value",
  show: "boolean",
  rotate: "boolean",
  for: "value",
  ttl: "value",
  list: "boolean",
  revoke: "value",
  f: "boolean",
  all: "boolean",
  body: "value",
  thread: "value",
  "read-only": "boolean",
  print: "boolean",
  port: "value",
  "no-open": "boolean",
  status: "boolean",
  stop: "boolean",
  restart: "boolean",
  "verdict-by": "value",
  "claim-window-s": "value",
  "lease-ttl-s": "value",
  "max-claim-s": "value",
  "depends-on": "value",
  artifact: "value",
  dir: "value",
  into: "value",
  performative: "value",
  "mention-me": "boolean",
  path: "value",
  participant: "value",
  "task-ref": "value",
  as: "value",
  strict: "boolean",
  "prune-ignored": "boolean",
  verbose: "boolean",
  v: "boolean",
  "stop-on-error": "boolean",
  root: "value",
  prune: "boolean",
  r: "boolean",
  recursive: "boolean",
  prefix: "value",
  limit: "value",
  hydrate: "boolean",
  replaces: "value",
  depth: "value",
  until: "value",
  override: "boolean",
  grade: "value",
  deep: "boolean",
  porcelain: "boolean",
  base: "boolean",
  since: "value",
  mark: "boolean",
  by: "value",
  deadline: "value",
  "fallback-note": "value",
  ref: "value",
  resolution: "value",
  mine: "boolean",
  role: "value",
  human: "value"
};
function nearestFlag(name, allowed) {
  let best = null;
  let bestDistance = 3;
  for (const candidate of allowed) {
    const dp = Array.from({ length: name.length + 1 }, (_, i) => [i, ...Array(candidate.length).fill(0)]);
    for (let j = 1;j <= candidate.length; j++)
      dp[0][j] = j;
    for (let i = 1;i <= name.length; i++) {
      for (let j = 1;j <= candidate.length; j++) {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (name[i - 1] === candidate[j - 1] ? 0 : 1));
      }
    }
    const distance = dp[name.length][candidate.length];
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}
function validateAgainst(allowed, arity, args2) {
  for (const [key, value] of Object.entries(args2.flags)) {
    if (!allowed.includes(key)) {
      const hint = nearestFlag(key, allowed);
      return `unknown flag --${key}${hint !== null ? ` (did you mean --${hint}?)` : ""}`;
    }
    if (arity[key] === "value" && value === true)
      return `--${key} requires a value`;
    if (arity[key] === "boolean" && typeof value === "string")
      return `--${key} takes no value`;
  }
  return null;
}
function validateFlags(specKey, args2) {
  const spec = COMMAND_SPEC[specKey];
  if (spec === undefined)
    return null;
  const core = validateAgainst([...GLOBAL_CLI_FLAGS, ...spec.flags], FLAG_ARITY, args2);
  return core === null ? null : `${specKey}: ${core}. Run: mesh ${specKey} --help`;
}
function validatePositionals(specKey, args2) {
  const spec = COMMAND_SPEC[specKey];
  if (spec === undefined)
    return null;
  const words = specKey.split(" ").length;
  if (args2.positional.length - words <= spec.max)
    return null;
  const first = args2.positional[words + spec.max];
  const takes = spec.max === 0 ? "takes no arguments" : `takes at most ${spec.max} (${spec.names.join(" ")})`;
  return `${specKey}: unexpected argument "${first}" — ${takes}. Run: mesh ${specKey} --help`;
}
function flag6(args2, name) {
  const v = args2.flags[name];
  return typeof v === "string" ? v : undefined;
}
function flagBool4(args2, name) {
  return args2.flags[name] !== undefined;
}
function requiredFlag(args2, name, cmd) {
  const v = flag6(args2, name);
  if (!v)
    die6(`${cmd}: --${name} is required`);
  return v;
}
function die6(msg) {
  process.stderr.write(msg + `
`);
  process.exit(1);
}

// src/ui/server.ts
import { createServer } from "node:http";
import { randomBytes as randomBytes4, timingSafeEqual } from "node:crypto";

// src/ui/router.ts
class Router {
  routes = [];
  add(method, pattern, handler) {
    this.routes.push({ method, segments: pattern.split("/").filter((s) => s.length > 0), handler });
  }
  get(pattern, handler) {
    this.add("GET", pattern, handler);
  }
  post(pattern, handler) {
    this.add("POST", pattern, handler);
  }
  match(method, pathname) {
    const segs = pathname.split("/").filter((s) => s.length > 0);
    for (const route of this.routes) {
      if (route.method !== method || route.segments.length !== segs.length)
        continue;
      const params2 = {};
      let matched = true;
      for (let i = 0;i < segs.length; i++) {
        const routeSeg = route.segments[i];
        const pathSeg = segs[i];
        if (routeSeg.startsWith(":")) {
          try {
            params2[routeSeg.slice(1)] = decodeURIComponent(pathSeg);
          } catch {
            return null;
          }
        } else if (routeSeg !== pathSeg) {
          matched = false;
          break;
        }
      }
      if (matched)
        return { handler: route.handler, params: params2 };
    }
    return null;
  }
}

// src/ui/session.ts
import { randomBytes as randomBytes3 } from "node:crypto";
var SESSION_COOKIE_NAME = "mesh_ui_v2";
var LAUNCH_TOKEN_TTL_MS = 120000;
var MAX_PENDING_LAUNCH_TOKENS = 16;

class SessionStore {
  launches = new Map;
  sessionCookie = randomBytes3(32).toString("hex");
  pruneLaunches(now) {
    for (const [token, expiresAtMs] of this.launches) {
      if (now > expiresAtMs)
        this.launches.delete(token);
    }
  }
  mintLaunch(now = performance.now()) {
    this.pruneLaunches(now);
    while (this.launches.size >= MAX_PENDING_LAUNCH_TOKENS) {
      const oldest = this.launches.keys().next().value;
      if (oldest === undefined)
        break;
      this.launches.delete(oldest);
    }
    const token = randomBytes3(32).toString("hex");
    this.launches.set(token, now + LAUNCH_TOKEN_TTL_MS);
    return token;
  }
  exchangeLaunchToken(token, now = performance.now()) {
    const expiresAtMs = this.launches.get(token);
    if (expiresAtMs === undefined)
      return null;
    this.launches.delete(token);
    if (now > expiresAtMs)
      return null;
    return this.sessionCookie;
  }
  isValidCookie(cookie) {
    return cookie === this.sessionCookie;
  }
}

// src/ui/request-guard.ts
var OK = { ok: true };
var STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
function checkHost(host, expectedHostPort) {
  if (host !== expectedHostPort) {
    return {
      ok: false,
      status: 403,
      rule: "host",
      hint: "Host header didn't match this broker's bound port — reload; mesh ui may have relaunched on a different port"
    };
  }
  return OK;
}
function checkStateChanging(method, origin, meshUiHeader, expectedOrigin) {
  if (!STATE_CHANGING_METHODS.has(method))
    return OK;
  if (origin !== expectedOrigin)
    return { ok: false, status: 403, rule: "origin" };
  if (meshUiHeader !== "1")
    return { ok: false, status: 403, rule: "x-mesh-ui" };
  return OK;
}
function extractCookie(cookieHeader, name) {
  if (cookieHeader === null)
    return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1)
      continue;
    const key = part.slice(0, eq).trim();
    if (key === name)
      return part.slice(eq + 1).trim();
  }
  return null;
}

// src/ui/types.ts
function observedOk(source, data, now = Date.now()) {
  return { source, observedAt: now, availability: "ok", data };
}
function observedFailed(source, error, now = Date.now()) {
  return { source, observedAt: now, availability: "failed", data: null, error };
}

// src/ui/routes/inventory.ts
function buildInventory(registryDir, now = Date.now()) {
  const homes = scanMachineInventory(registryDir);
  const profiles = homes.map((h2) => ({
    label: h2.label,
    identityId: h2.identityId,
    pubkey: h2.pubkey,
    memberships: h2.memberships.map((m) => ({
      membershipId: membershipId(h2.home, m.origin, m.roomId),
      roomId: m.roomId,
      origin: m.origin,
      workspaceRoot: m.workspace_root,
      active: m.active
    }))
  }));
  return observedOk("local", profiles, now);
}

// src/ui/membership.ts
function matchMembership(homes, mid) {
  for (const scannedHome of homes) {
    for (const membership of scannedHome.memberships) {
      if (membershipId(scannedHome.home, membership.origin, membership.roomId) === mid) {
        return {
          home: scannedHome.home,
          origin: membership.origin,
          roomId: membership.roomId,
          workspaceRoot: membership.workspace_root
        };
      }
    }
  }
  return null;
}
function resolveMembership(mid, registryDir) {
  return matchMembership(scanMachineInventory(registryDir), mid);
}
var DEFAULT_INVENTORY_MEMO_TTL_MS = 1000;
function createMembershipResolver(registryDir, ttlMs = DEFAULT_INVENTORY_MEMO_TTL_MS, now = Date.now) {
  let memo = null;
  function freshScan() {
    const homes = scanMachineInventory(registryDir);
    memo = { homes, expiresAt: now() + ttlMs };
    return homes;
  }
  return {
    resolve(mid) {
      const nowMs = now();
      const memoWasWarm = memo !== null && nowMs < memo.expiresAt;
      const homes = memoWasWarm ? memo.homes : freshScan();
      const hit = matchMembership(homes, mid);
      if (hit !== null)
        return hit;
      if (!memoWasWarm)
        return null;
      return matchMembership(freshScan(), mid);
    }
  };
}
function buildRoomClient(membership) {
  try {
    if (membership.home.length === 0 || membership.roomId.length === 0)
      return null;
    const expectedOrigin = new URL(membership.origin).origin;
    if (expectedOrigin !== membership.origin)
      return null;
    const identity = loadIdentityWithSecret(membership.home);
    if (identity === null || typeof identity.id !== "string" || identity.id.length === 0 || !(identity.secretBytes instanceof Uint8Array) || identity.secretBytes.length !== 32) {
      return null;
    }
    const rooms = loadRooms(membership.home);
    const entry = rooms.memberships[roomKeyFor(membership.origin, membership.roomId)];
    if (typeof entry !== "object" || entry === null || typeof entry.url !== "string" || typeof entry.token !== "string" || entry.token.length === 0 || typeof entry.participant_id !== "string" || entry.participant_id !== identity.id) {
      return null;
    }
    const roomUrl = new URL(entry.url);
    if (roomUrl.origin !== membership.origin)
      return null;
    return new MeshClient({
      roomUrl: entry.url,
      token: entry.token,
      senderId: identity.id,
      roomId: membership.roomId,
      secretBytes: identity.secretBytes
    });
  } catch {
    return null;
  }
}

// src/ui/routes/room.ts
function isApiError(value) {
  return typeof value === "object" && value !== null && "error" in value && typeof value.error === "string" && "detail" in value && typeof value.detail === "string";
}
function roomErrorMessage(error) {
  if (error instanceof Error && error.message.length > 0)
    return error.message;
  return "room_request_failed";
}
async function proxyTree(client2, now = Date.now()) {
  try {
    const result = await client2.getTree();
    if (isApiError(result)) {
      return observedFailed("remote", `[${result.error}] ${result.detail}`, now);
    }
    return observedOk("remote", result, now);
  } catch (error) {
    return observedFailed("remote", roomErrorMessage(error), now);
  }
}
async function proxyState(client2, now = Date.now()) {
  try {
    return observedOk("remote", await client2.getState(), now);
  } catch (error) {
    return observedFailed("remote", roomErrorMessage(error), now);
  }
}
async function proxyEntries(client2, options, now = Date.now()) {
  try {
    return observedOk("remote", await client2.getEntries(options), now);
  } catch (error) {
    return observedFailed("remote", roomErrorMessage(error), now);
  }
}
function parseEntriesOptions(requestUrl) {
  let url;
  try {
    url = new URL(requestUrl ?? "/", "http://127.0.0.1");
  } catch {
    return null;
  }
  const sinceValues = url.searchParams.getAll("since");
  const limitValues = url.searchParams.getAll("limit");
  if (sinceValues.length > 1 || limitValues.length > 1)
    return null;
  let since;
  if (sinceValues.length === 1) {
    const rawSince = sinceValues[0];
    if (!/^-?\d+$/.test(rawSince))
      return null;
    since = Number(rawSince);
    if (!Number.isSafeInteger(since) || since < -1)
      return null;
  }
  let limit;
  if (limitValues.length === 1) {
    const rawLimit = limitValues[0];
    if (!/^\d+$/.test(rawLimit))
      return null;
    limit = Number(rawLimit);
    if (!Number.isSafeInteger(limit) || limit < 1)
      return null;
  }
  return {
    ...since !== undefined ? { since } : {},
    ...limit !== undefined ? { limit } : {}
  };
}
function resolveRouteClient(mid, resolve7) {
  try {
    const membership = resolve7(mid);
    if (membership === null) {
      return { ok: false, status: 404, error: "unknown_membership" };
    }
    const client2 = buildRoomClient(membership);
    if (client2 === null) {
      return { ok: false, status: 200, error: "membership_credentials_unavailable" };
    }
    return { ok: true, client: client2 };
  } catch {
    return { ok: false, status: 200, error: "membership_resolution_failed" };
  }
}
function registerRoomRoutes(router, registryDir, testSeam = {}) {
  const resolve7 = testSeam.resolveMembershipForTest ?? ((mid) => resolveMembership(mid, registryDir));
  router.get("/api/memberships/:mid/tree", async (_req, res, params2) => {
    const resolved = resolveRouteClient(params2["mid"] ?? "", resolve7);
    if (!resolved.ok) {
      sendJson(res, resolved.status, observedFailed("remote", resolved.error));
      return;
    }
    sendJson(res, 200, await proxyTree(resolved.client));
  });
  router.get("/api/memberships/:mid/state", async (_req, res, params2) => {
    const resolved = resolveRouteClient(params2["mid"] ?? "", resolve7);
    if (!resolved.ok) {
      sendJson(res, resolved.status, observedFailed("remote", resolved.error));
      return;
    }
    sendJson(res, 200, await proxyState(resolved.client));
  });
  router.get("/api/memberships/:mid/entries", async (req, res, params2) => {
    const options = parseEntriesOptions(req.url);
    if (options === null) {
      sendJson(res, 400, observedFailed("remote", "invalid_entries_query"));
      return;
    }
    const resolved = resolveRouteClient(params2["mid"] ?? "", resolve7);
    if (!resolved.ok) {
      sendJson(res, resolved.status, observedFailed("remote", resolved.error));
      return;
    }
    sendJson(res, 200, await proxyEntries(resolved.client, options));
  });
}

// src/ui/room-hub.ts
class RoomHub {
  rooms = new Map;
  subscribe(mid, makeClient, onFrame, onEnd = () => {}) {
    let entry = this.rooms.get(mid);
    let client2 = null;
    let shouldStart = false;
    if (entry === undefined) {
      try {
        client2 = makeClient();
      } catch {
        return () => {};
      }
      if (client2 === null)
        return () => {};
      entry = {
        controller: new AbortController,
        subscribers: new Set
      };
      this.rooms.set(mid, entry);
      shouldStart = true;
    }
    const subscriber = { onFrame, onEnd };
    entry.subscribers.add(subscriber);
    if (shouldStart)
      this.pump(mid, entry, client2);
    let subscribed = true;
    return () => {
      if (!subscribed)
        return;
      subscribed = false;
      entry.subscribers.delete(subscriber);
      if (this.rooms.get(mid) !== entry || entry.subscribers.size !== 0)
        return;
      this.rooms.delete(mid);
      entry.controller.abort();
    };
  }
  async pump(mid, entry, client2) {
    try {
      for await (const frame of client2.follow(undefined, entry.controller.signal)) {
        for (const subscriber of [...entry.subscribers]) {
          if (!entry.subscribers.has(subscriber))
            continue;
          try {
            subscriber.onFrame(frame);
          } catch {}
        }
      }
    } catch {} finally {
      const intentionalAbort = entry.controller.signal.aborted;
      if (this.rooms.get(mid) === entry)
        this.rooms.delete(mid);
      if (!intentionalAbort) {
        const remaining = [...entry.subscribers];
        entry.subscribers.clear();
        for (const subscriber of remaining) {
          try {
            subscriber.onEnd();
          } catch {}
        }
      } else {
        entry.subscribers.clear();
      }
    }
  }
}

// src/ui/routes/events.ts
var ENTRIES_PAGE_LIMIT = 100;
function parseEventsOptions(requestUrl) {
  let url;
  try {
    url = new URL(requestUrl ?? "/", "http://127.0.0.1");
  } catch {
    return null;
  }
  const values = url.searchParams.getAll("since");
  if (values.length > 1)
    return null;
  if (values.length === 0)
    return {};
  const rawSince = values[0];
  if (!/^-?\d+$/.test(rawSince))
    return null;
  const since = Number(rawSince);
  if (!Number.isSafeInteger(since) || since < -1)
    return null;
  return { since };
}
function writeSseFrame(res, frame) {
  res.write(`data: ${JSON.stringify(frame)}

`);
}
function writeUpstreamEnded(res) {
  res.write(`event: error
data: {"error":"upstream_ended"}

`);
  res.end();
}
async function fetchBackfillEntries(client2, since, shouldStop) {
  const entries = [];
  let pageSince = since;
  for (;; ) {
    const page = await client2.getEntries({ since: pageSince, limit: ENTRIES_PAGE_LIMIT });
    entries.push(...page.entries);
    if (page.entries.length < ENTRIES_PAGE_LIMIT || shouldStop())
      break;
    pageSince = page.entries[page.entries.length - 1].seq;
  }
  return entries;
}
function registerEventsRoute(router, hub, registryDir, testSeam = {}) {
  const activeRequests = new Set;
  let disposed = false;
  const resolve7 = testSeam.resolveMembershipForTest ?? ((mid) => resolveMembership(mid, registryDir));
  const buildClient = testSeam.buildRoomClientForTest ?? ((membership) => buildRoomClient(membership));
  router.get("/api/memberships/:mid/events", async (req, res, params2) => {
    if (disposed) {
      res.destroy();
      return;
    }
    const options = parseEventsOptions(req.url);
    if (options === null) {
      sendJson(res, 400, observedFailed("remote", "invalid_events_query"));
      return;
    }
    let membership;
    try {
      membership = resolve7(params2["mid"] ?? "");
    } catch {
      sendJson(res, 200, observedFailed("remote", "membership_resolution_failed"));
      return;
    }
    if (membership === null) {
      sendJson(res, 404, observedFailed("remote", "unknown_membership"));
      return;
    }
    let client2;
    try {
      client2 = buildClient(membership);
    } catch {
      sendJson(res, 200, observedFailed("remote", "membership_client_failed"));
      return;
    }
    if (client2 === null) {
      sendJson(res, 200, observedFailed("remote", "membership_credentials_unavailable"));
      return;
    }
    let live = false;
    let terminal = false;
    let upstreamEnded = false;
    let unsubscribeRaw = () => {};
    let subscribed = true;
    let disposeRequest = () => {};
    const stopSubscription = () => {
      if (!subscribed)
        return;
      subscribed = false;
      unsubscribeRaw();
    };
    const cleanupRequest = () => {
      if (terminal)
        return false;
      terminal = true;
      stopSubscription();
      activeRequests.delete(disposeRequest);
      return true;
    };
    disposeRequest = () => {
      if (!cleanupRequest() || res.destroyed || res.writableEnded)
        return;
      if (res.headersSent)
        res.end();
      else
        res.destroy();
    };
    activeRequests.add(disposeRequest);
    const buffered = [];
    const replayedEntrySeqs = new Set;
    let highestEntrySeq = -1;
    const emitLive = (frame) => {
      if (terminal)
        return;
      if (frame.type === "entry") {
        if (frame.entry.seq <= highestEntrySeq)
          return;
        highestEntrySeq = frame.entry.seq;
      }
      writeSseFrame(res, frame);
    };
    unsubscribeRaw = hub.subscribe(params2["mid"] ?? "", () => client2, (frame) => {
      if (terminal || upstreamEnded)
        return;
      if (live)
        emitLive(frame);
      else
        buffered.push(frame);
    }, () => {
      if (terminal || upstreamEnded)
        return;
      upstreamEnded = true;
      if (!live || !cleanupRequest())
        return;
      writeUpstreamEnded(res);
    });
    req.on("close", () => {
      cleanupRequest();
    });
    let backfillEntries;
    try {
      backfillEntries = await fetchBackfillEntries(client2, options.since, () => terminal);
    } catch {
      if (!cleanupRequest())
        return;
      sendJson(res, 200, observedFailed("remote", "entries_backfill_failed"));
      return;
    }
    if (terminal)
      return;
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    });
    res.flushHeaders();
    for (const entry of backfillEntries) {
      if (replayedEntrySeqs.has(entry.seq))
        continue;
      replayedEntrySeqs.add(entry.seq);
      highestEntrySeq = Math.max(highestEntrySeq, entry.seq);
      writeSseFrame(res, { type: "entry", entry });
    }
    for (const frame of buffered) {
      if (frame.type === "entry") {
        if (replayedEntrySeqs.has(frame.entry.seq))
          continue;
        replayedEntrySeqs.add(frame.entry.seq);
        highestEntrySeq = Math.max(highestEntrySeq, frame.entry.seq);
      }
      writeSseFrame(res, frame);
    }
    buffered.length = 0;
    live = true;
    if (upstreamEnded && cleanupRequest()) {
      writeUpstreamEnded(res);
    }
  });
  return {
    dispose() {
      if (disposed)
        return;
      disposed = true;
      for (const disposeRequest of [...activeRequests])
        disposeRequest();
      activeRequests.clear();
    }
  };
}

// src/ui/routes/post.ts
var ALLOWED_POST_PERFORMATIVES = new Set([
  ...COMPOSER_SPEC.map((template) => template.performative),
  "request"
]);
function ownProperty(value, key) {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (descriptor === undefined)
    return { kind: "missing" };
  if (!("value" in descriptor))
    return { kind: "accessor" };
  return { kind: "data", value: descriptor.value };
}
function hasPlainPrototype(value) {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function cloneJson(value) {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return { ok: true, value };
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? { ok: true, value } : { ok: false };
  }
  if (Array.isArray(value)) {
    const output = [];
    for (const item of value) {
      const cloned = cloneJson(item);
      if (!cloned.ok)
        return cloned;
      output.push(cloned.value);
    }
    return { ok: true, value: output };
  }
  if (typeof value !== "object" || !hasPlainPrototype(value))
    return { ok: false };
  const entries = [];
  for (const key of Object.keys(value)) {
    const property = ownProperty(value, key);
    if (property.kind !== "data")
      return { ok: false };
    const cloned = cloneJson(property.value);
    if (!cloned.ok)
      return cloned;
    entries.push([key, cloned.value]);
  }
  return { ok: true, value: Object.fromEntries(entries) };
}
function jsonValuesEqual(left, right) {
  if (Object.is(left, right))
    return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => jsonValuesEqual(value, right[index]));
  }
  if (typeof left !== "object" || left === null || typeof right !== "object" || right === null || !hasPlainPrototype(left) || !hasPlainPrototype(right)) {
    return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length)
    return false;
  return leftKeys.every((key) => {
    const leftProperty = ownProperty(left, key);
    const rightProperty = ownProperty(right, key);
    return leftProperty.kind === "data" && rightProperty.kind === "data" && jsonValuesEqual(leftProperty.value, rightProperty.value);
  });
}
function compileComposerSchema(template) {
  const allowedTopLevel = new Set(["performative"]);
  const allowedData = new Set;
  const dataFields = new Map;
  for (const field of template.fields) {
    if (field.target.startsWith("data.")) {
      const key = field.target.slice("data.".length);
      allowedData.add(key);
      dataFields.set(key, field);
    } else {
      allowedTopLevel.add(field.target);
    }
  }
  for (const key of Object.keys(template.fixedData ?? {}))
    allowedData.add(key);
  if (allowedData.size > 0)
    allowedTopLevel.add("data");
  return { template, allowedTopLevel, allowedData, dataFields };
}
var COMPOSER_SCHEMAS = new Map(COMPOSER_SPEC.map((template) => [template.performative, compileComposerSchema(template)]));
function validateComposerField(performative, field, property) {
  if (property.kind === "missing") {
    if (!field.required)
      return { ok: true, present: false };
    return {
      ok: false,
      detail: performative === "request" && field.target === "body" ? "body is required" : `${field.label} is required`
    };
  }
  if (property.kind === "accessor") {
    return { ok: false, detail: `${field.target} must be a data property` };
  }
  switch (field.type) {
    case "text": {
      if (typeof property.value !== "string") {
        const target = performative === "request" && field.target === "body" ? "body" : field.label;
        return { ok: false, detail: `${target} must be a string` };
      }
      const value = property.value.trim();
      if (value.length === 0) {
        if (!field.required)
          return { ok: true, present: false };
        return {
          ok: false,
          detail: performative === "request" && field.target === "body" ? "body is required" : `${field.label} is required`
        };
      }
      return { ok: true, present: true, value };
    }
    case "number":
      return typeof property.value === "number" && Number.isInteger(property.value) ? { ok: true, present: true, value: property.value } : { ok: false, detail: `${field.label} must be an integer` };
    case "enum": {
      if (typeof property.value !== "string" || !field.options?.includes(property.value)) {
        return {
          ok: false,
          detail: `${field.label} must be one of: ${(field.options ?? []).join(", ")}`
        };
      }
      return { ok: true, present: true, value: property.value };
    }
    case "csv": {
      if (!Array.isArray(property.value) || field.required && property.value.length === 0 || !property.value.every((item) => typeof item === "string" && item.trim().length > 0)) {
        return {
          ok: false,
          detail: `${field.label} must be an array of non-empty strings`
        };
      }
      return {
        ok: true,
        present: true,
        value: property.value.map((item) => item.trim())
      };
    }
  }
}
function validatePostBody(body) {
  try {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return { ok: false, detail: "request body must be an object" };
    }
    if (!hasPlainPrototype(body)) {
      return { ok: false, detail: "request body must be a plain object" };
    }
    const performativeProperty = ownProperty(body, "performative");
    if (performativeProperty.kind === "accessor") {
      return { ok: false, detail: "performative must be a data property" };
    }
    const performative = performativeProperty.kind === "data" ? performativeProperty.value : undefined;
    if (typeof performative !== "string" || performative.length === 0) {
      return { ok: false, detail: "performative is required" };
    }
    const schema = COMPOSER_SCHEMAS.get(performative);
    if (!ALLOWED_POST_PERFORMATIVES.has(performative) || schema === undefined) {
      return {
        ok: false,
        detail: `performative "${performative}" is not composable from the manager`
      };
    }
    for (const key of Object.keys(body)) {
      const property = ownProperty(body, key);
      if (property.kind === "accessor") {
        return { ok: false, detail: `${key} must be a data property` };
      }
      if (!schema.allowedTopLevel.has(key)) {
        return { ok: false, detail: `field "${key}" is not declared for ${performative}` };
      }
    }
    const dataProperty = ownProperty(body, "data");
    let sourceData;
    if (dataProperty.kind === "accessor") {
      return { ok: false, detail: "data must be a data property" };
    }
    if (dataProperty.kind === "data") {
      if (typeof dataProperty.value !== "object" || dataProperty.value === null || Array.isArray(dataProperty.value) || !hasPlainPrototype(dataProperty.value)) {
        return { ok: false, detail: "data must be a JSON object" };
      }
      sourceData = dataProperty.value;
      for (const key of Object.keys(sourceData)) {
        const property = ownProperty(sourceData, key);
        if (property.kind === "accessor") {
          return { ok: false, detail: `data.${key} must be a data property` };
        }
        if (!schema.allowedData.has(key)) {
          return { ok: false, detail: `data field "${key}" is not declared for ${performative}` };
        }
      }
    }
    const input = { performative: schema.template.performative };
    const outputData = {};
    for (const field of schema.template.fields) {
      const dataKey = field.target.startsWith("data.") ? field.target.slice("data.".length) : undefined;
      const property = dataKey === undefined ? ownProperty(body, field.target) : sourceData === undefined ? { kind: "missing" } : ownProperty(sourceData, dataKey);
      const validation = validateComposerField(performative, field, property);
      if (!validation.ok)
        return validation;
      if (!validation.present)
        continue;
      if (dataKey !== undefined) {
        outputData[dataKey] = validation.value;
      } else if (field.target === "body") {
        input.body = validation.value;
      } else if (field.target === "task_ref") {
        input.task_ref = validation.value;
      } else if (field.target === "thread") {
        input.thread = validation.value;
      } else if (field.target === "artifacts") {
        input.artifacts = validation.value;
      }
    }
    for (const [key, fixedValue] of Object.entries(schema.template.fixedData ?? {})) {
      if (schema.dataFields.has(key))
        continue;
      const property = sourceData === undefined ? { kind: "missing" } : ownProperty(sourceData, key);
      if (property.kind !== "data" || !jsonValuesEqual(property.value, fixedValue)) {
        return { ok: false, detail: `data.${key} must equal the composer-fixed value` };
      }
      const cloned = cloneJson(fixedValue);
      if (!cloned.ok) {
        return { ok: false, detail: `data.${key} has an invalid composer-fixed value` };
      }
      outputData[key] = cloned.value;
    }
    if (Object.keys(outputData).length > 0)
      input.data = outputData;
    return { ok: true, input };
  } catch {
    return { ok: false, detail: "request body must be a plain object" };
  }
}
function registerPostRoute(router, registryDir, testSeam = {}) {
  const resolve7 = testSeam.resolveMembershipForTest ?? ((mid) => resolveMembership(mid, registryDir));
  router.post("/api/memberships/:mid/post", async (req, res, params2) => {
    let membership;
    try {
      membership = resolve7(params2["mid"] ?? "");
    } catch {
      sendJson(res, 500, {
        ok: false,
        error: "membership_resolution_failed",
        detail: "Membership could not be resolved",
        status: 500
      });
      return;
    }
    if (membership === null) {
      sendJson(res, 404, {
        ok: false,
        error: "unknown_membership",
        detail: "Unknown membership",
        status: 404
      });
      return;
    }
    const client2 = buildRoomClient(membership);
    if (client2 === null) {
      sendJson(res, 409, {
        ok: false,
        error: "identity_mismatch",
        detail: "local identity does not match this membership's participant — cannot sign",
        status: 409
      });
      return;
    }
    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      sendJson(res, 400, {
        ok: false,
        error: "invalid_json_body",
        detail: "Request body must be valid JSON",
        status: 400
      });
      return;
    }
    const validation = validatePostBody(body);
    if (!validation.ok) {
      sendJson(res, 400, {
        ok: false,
        error: "invalid_post_body",
        detail: validation.detail,
        status: 400
      });
      return;
    }
    let result;
    try {
      result = await client2.postEntry(validation.input);
    } catch {
      sendJson(res, 200, {
        ok: false,
        error: "upstream_unreachable",
        detail: "Room is unavailable",
        status: 503
      });
      return;
    }
    sendJson(res, result.ok ? 200 : 422, result);
  });
}

// src/ui/daemon-status.ts
import { existsSync as existsSync6, readFileSync as readFileSync9 } from "node:fs";
import { isAbsolute, join as join10 } from "node:path";
function probeProcess(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0)
    return;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = error instanceof Error && "code" in error ? error.code : undefined;
    if (code === "EPERM")
      return true;
    if (code === "ESRCH")
      return false;
    return;
  }
}
function readWakeCursor(stateDir) {
  const file = join10(stateDir, "wake_cursor.json");
  if (!existsSync6(file))
    return "none";
  try {
    const value = JSON.parse(readFileSync9(file, "utf8"));
    if (typeof value !== "object" || value === null || !("seq" in value) || typeof value.seq !== "number" || !Number.isSafeInteger(value.seq) || value.seq < 0) {
      return "unknown";
    }
    return value.seq;
  } catch {
    return "unknown";
  }
}
function readPendingWake(stateDir, now) {
  const file = join10(stateDir, "pending_wake.json");
  if (!existsSync6(file))
    return null;
  try {
    const value = JSON.parse(readFileSync9(file, "utf8"));
    if (typeof value !== "object" || value === null || !("through_seq" in value) || typeof value.through_seq !== "number" || !Number.isSafeInteger(value.through_seq) || value.through_seq < 0 || !("ts" in value) || typeof value.ts !== "number" || !Number.isFinite(value.ts) || value.ts < 0 || value.ts > now) {
      return "unknown";
    }
    return { throughSeq: value.through_seq, ageMs: now - value.ts };
  } catch {
    return "unknown";
  }
}
function readHookState(stateDir) {
  const file = join10(stateDir, "agent_state");
  if (!existsSync6(file))
    return "unknown";
  try {
    const value = readFileSync9(file, "utf8").trim();
    return value === "idle" || value === "busy" ? value : "unknown";
  } catch {
    return "unknown";
  }
}
function isReadableRegistration(value) {
  return typeof value === "object" && value !== null && "stateDir" in value && typeof value.stateDir === "string" && isAbsolute(value.stateDir) && "pid" in value && typeof value.pid === "number";
}
function readDaemonStatus(registration, now = Date.now()) {
  if (registration === undefined)
    return { registered: false };
  if (!isReadableRegistration(registration)) {
    return {
      registered: true,
      alive: undefined,
      wakeCursorSeq: "unknown",
      pendingWake: "unknown",
      hookState: "unknown"
    };
  }
  return {
    registered: true,
    pid: registration.pid,
    alive: probeProcess(registration.pid),
    wakeCursorSeq: readWakeCursor(registration.stateDir),
    pendingWake: readPendingWake(registration.stateDir, now),
    hookState: readHookState(registration.stateDir)
  };
}

// src/ui/fs-status-scan.ts
import { readFileSync as readFileSync10, statSync as statSync2 } from "node:fs";
import { isAbsolute as isAbsolute2, join as join11 } from "node:path";
function isApiError2(value) {
  return typeof value === "object" && value !== null && "error" in value && typeof value.error === "string" && "detail" in value && typeof value.detail === "string";
}
var fileCaches = new Map;
async function scanFolderStatus(client2, root, roomKey, home) {
  if (!isAbsolute2(root))
    return { ok: false, reason: "local_workspace_unavailable" };
  let rootStat;
  try {
    rootStat = statSync2(root);
  } catch {
    return { ok: false, reason: "local_workspace_unavailable" };
  }
  if (!rootStat.isDirectory())
    return { ok: false, reason: "local_workspace_unavailable" };
  let treeResult;
  let leasesResult;
  try {
    [treeResult, leasesResult] = await Promise.all([client2.getTree(), client2.listLeases()]);
  } catch {
    return { ok: false, reason: "remote_status_unavailable" };
  }
  if (isApiError2(treeResult))
    return { ok: false, reason: "remote_tree_unavailable" };
  if (isApiError2(leasesResult))
    return { ok: false, reason: "remote_leases_unavailable" };
  try {
    const resolvedRoot = root;
    const cacheScope = `${roomKey}\x00${resolvedRoot}`;
    const cache = fileCaches.get(cacheScope) ?? new Map;
    fileCaches.set(cacheScope, cache);
    const local = new Map;
    const currentFiles = new Set;
    const ignored = makeIgnore(loadMeshignore(resolvedRoot), {});
    for (const rel of walkDirFiles(resolvedRoot, ignored)) {
      const repopath = normalizeId(rel);
      const absolutePath = join11(resolvedRoot, rel);
      currentFiles.add(absolutePath);
      const stat = statSync2(absolutePath);
      const cached = cache.get(absolutePath);
      if (cached !== undefined && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
        local.set(repopath, { hash: cached.hash, text: cached.text });
        continue;
      }
      const bytes = readFileSync10(absolutePath);
      const text = isValidUtf8Bytes(new Uint8Array(bytes)) ? bytes.toString("utf8") : undefined;
      const hash = `r2:${sha256hex(new Uint8Array(bytes))}`;
      cache.set(absolutePath, { mtimeMs: stat.mtimeMs, size: stat.size, hash, text });
      local.set(repopath, { hash, text });
    }
    for (const cachedPath of cache.keys()) {
      if (!currentFiles.has(cachedPath))
        cache.delete(cachedPath);
    }
    const tip = new Map(treeResult.tree.map((node) => [node.path, node]));
    const lease = new Map(leasesResult.map((entry) => [
      entry.path,
      { holder: entry.holder, expiresAtMs: entry.lease_expires }
    ]));
    const legacyAmbiguous = isRoomIdAmbiguous(client2.roomId, home);
    const sidecarOnlyPaths = [...new Set([
      ...listFolderSidecarPaths(resolvedRoot, roomKey),
      ...legacyAmbiguous ? [] : listSidecarPaths(client2.roomId, home)
    ])];
    const baseTipHash = new Map;
    for (const repopath of new Set([...local.keys(), ...tip.keys(), ...sidecarOnlyPaths])) {
      const sidecar = readSidecarResolved(resolvedRoot, roomKey, client2.roomId, repopath, home, legacyAmbiguous);
      if (sidecar !== undefined)
        baseTipHash.set(repopath, sidecar.tip_hash);
    }
    return {
      ok: true,
      rows: composeStatusRows({ local, tip, baseTipHash, lease, sidecarOnlyPaths }, Date.now())
    };
  } catch {
    return { ok: false, reason: "local_status_scan_failed" };
  }
}

// src/ui/routes/status.ts
var defaultDeps = {
  loadRegistry: loadMachineRegistry,
  buildClient: buildRoomClient,
  scanFolder: scanFolderStatus
};
async function buildStatusResponse(membership, registryDir, now = Date.now(), deps = defaultDeps) {
  let registry;
  try {
    registry = deps.loadRegistry(registryDir);
  } catch {
    return {
      source: "local",
      observedAt: now,
      availability: "failed",
      data: null,
      error: "machine_registry_unavailable"
    };
  }
  const roomKey = roomKeyFor(membership.origin, membership.roomId);
  const daemon = readDaemonStatus(registry.daemons[daemonKey(membership.home, roomKey)], now);
  if (membership.workspaceRoot === undefined) {
    return {
      source: "local",
      observedAt: now,
      availability: "unavailable",
      data: { fs: null, daemon },
      error: "no local workspace attached to this membership"
    };
  }
  const client2 = deps.buildClient(membership);
  if (client2 === null) {
    return {
      source: "local",
      observedAt: now,
      availability: "failed",
      data: { fs: null, daemon },
      error: "local identity does not match this membership's participant"
    };
  }
  const outcome = await deps.scanFolder(client2, membership.workspaceRoot, roomKey, membership.home);
  if (!outcome.ok) {
    const noWorkspace = outcome.reason === "local_workspace_unavailable";
    const localFailure = noWorkspace || outcome.reason === "local_status_scan_failed";
    return {
      source: localFailure ? "local" : "remote",
      observedAt: now,
      availability: noWorkspace ? "unavailable" : "failed",
      data: { fs: null, daemon },
      error: outcome.reason
    };
  }
  return observedOk("derived", { fs: outcome.rows, daemon }, now);
}
var STATUS_DEBOUNCE_MS = 1000;
function registerStatusRoute(router, registryDir, testSeam = {}) {
  const resolve7 = testSeam.resolveMembershipForTest ?? createMembershipResolver(registryDir).resolve;
  const clock = testSeam.clockForTest ?? Date.now;
  const deps = {
    loadRegistry: testSeam.loadRegistry ?? defaultDeps.loadRegistry,
    buildClient: testSeam.buildClient ?? defaultDeps.buildClient,
    scanFolder: testSeam.scanFolder ?? defaultDeps.scanFolder
  };
  const statusCache = new Map;
  router.get("/api/memberships/:mid/status", async (_request, response, params2) => {
    const mid = params2["mid"] ?? "";
    const now = clock();
    const cached = statusCache.get(mid);
    if (cached !== undefined && now - cached.computedAtMs < STATUS_DEBOUNCE_MS) {
      sendJson(response, 200, cached.response);
      return;
    }
    let membership;
    try {
      membership = resolve7(mid);
    } catch {
      sendJson(response, 200, {
        source: "local",
        observedAt: now,
        availability: "failed",
        data: null,
        error: "membership_resolution_failed"
      });
      return;
    }
    if (membership === null) {
      sendJson(response, 404, { error: "unknown_membership" });
      return;
    }
    const status = await buildStatusResponse(membership, registryDir, now, deps);
    statusCache.set(mid, { response: status, computedAtMs: now });
    sendJson(response, 200, status);
  });
}

// src/ui-app.generated.ts
var UI_APP_JS = 'var k8=Object.create;var{getPrototypeOf:V8,defineProperty:k$,getOwnPropertyNames:R8}=Object;var M8=Object.prototype.hasOwnProperty;function I8($){return this[$]}var L8,P8,B8=($,J,Q)=>{var Y=$!=null&&typeof $==="object";if(Y){var Z=J?L8??=new WeakMap:P8??=new WeakMap,X=Z.get($);if(X)return X}Q=$!=null?k8(V8($)):{};let z=J||!$||!$.__esModule?k$(Q,"default",{value:$,enumerable:!0}):Q;for(let N of R8($))if(!M8.call(z,N))k$(z,N,{get:I8.bind($,N),enumerable:!0});if(Y)Z.set($,z);return z};var E8=($,J)=>()=>(J||$((J={exports:{}}).exports,J),J.exports);var o$=E8((PQ,i$)=>{i$.exports=function $(J){if(typeof J==="number"&&isNaN(J))throw Error("NaN is not allowed");if(typeof J==="number"&&!isFinite(J))throw Error("Infinity is not allowed");if(J===null||typeof J!=="object")return JSON.stringify(J);if(J.toJSON instanceof Function)return $(J.toJSON());if(Array.isArray(J))return`[${J.reduce((Z,X,z)=>{return`${Z}${z===0?"":","}${$(X===void 0||typeof X==="symbol"?null:X)}`},"")}]`;return`{${Object.keys(J).sort().reduce((Y,Z)=>{if(J[Z]===void 0||typeof J[Z]==="symbol")return Y;let X=Y.length===0?"":",";return`${Y}${X}${$(Z)}:${$(J[Z])}`},"")}}`}});function R($,J){let Q=document.createElement($);if(J)Q.className=J;return Q}function j($,J,Q){let Y=R($,J);return Y.textContent=Q==null?"":String(Q),Y}function E($){while($.firstChild)$.removeChild($.firstChild)}function c0($){if($==null||isNaN($))return"";let J=["B","KB","MB","GB","TB"],Q=0,Y=Number($);while(Y>=1024&&Q<J.length-1)Y/=1024,Q++;return(Q===0?Y:Y.toFixed(Y<10?1:0))+" "+J[Q]}function i($){if(!$)return"";let J=new Date($);if(isNaN(J.getTime()))return"";let Q=(Date.now()-J.getTime())/1000;if(Q<60)return"just now";if(Q<3600)return Math.floor(Q/60)+"m ago";if(Q<86400)return Math.floor(Q/3600)+"h ago";if(Q<2592000)return Math.floor(Q/86400)+"d ago";return J.toISOString().slice(0,10)}function b0($){if(!$)return"";let J=($-Date.now())/1000;if(J<=0)return"expired";if(J<60)return Math.ceil(J)+"s left";if(J<3600)return Math.ceil(J/60)+"m left";if(J<86400)return Math.floor(J/3600)+"h left";return Math.floor(J/86400)+"d left"}function v($){let J=new Date($);return isNaN(J.getTime())?"":J.toLocaleString()}function T0($){return(String($||"?").replace(/^[^a-zA-Z0-9]+/,"")[0]||"?").toUpperCase()}function v0($){return $.content_hash==null}function n0($,J,Q){E($);let Y=R("div","card"),Z=R("div","idrow"),X=Q.identity??{participant_id:"",pubkey:"",roles:[],specialties:[]};Z.appendChild(j("div","avatar",T0(X.participant_id)));let z=R("div","idmain");z.appendChild(j("div","name",X.participant_id||"(unknown identity)"));let N=[];if(X.specialties&&X.specialties.length)N.push(X.specialties.join(", "));else if(X.roles&&X.roles.length)N.push(X.roles.join(", "));z.appendChild(j("div","sub",N.join(" · ")||"member of "+J)),Z.appendChild(z);let G=R("div","badges");if(G.appendChild(j("span","badge "+(Q.mode==="member"?"member":"public"),Q.mode==="member"?"member view":"public view")),Z.appendChild(G),Y.appendChild(Z),X.pubkey)Y.appendChild(j("div","pubkey",X.pubkey));if($.appendChild(Y),!Q.tree_visible){let k=R("div","card");return k.appendChild(j("div","msg","This room\'s file listing is private. The owner has not enabled public sharing, so only the identity above is shown. Open this page with your member token to see the files you can access.")),$.appendChild(k),{treeVisible:!1}}let q=Q.tree??[],U=Q.mode==="member",K={mode:"tree",sort:"name",dir:1},D=[],O=null;function C(k,P,B){let I;if(K.sort==="size")I=(Number(k.size)||0)-(Number(P.size)||0);else if(K.sort==="modified")I=new Date(k.tip_ts||0).getTime()-new Date(P.tip_ts||0).getTime();else{let A=B?k.name??k.path:k.path,d=B?P.name??P.path:P.path;I=A<d?-1:A>d?1:0}return I*K.dir}function V(k){if(k.lease_holder){let P=k.lease_expires?" · "+b0(k.lease_expires):"",B=j("span","lease","\\uD83D\\uDD12 "+k.lease_holder+P);if(k.lease_expires)B.title="leased by "+k.lease_holder+" until "+v(k.lease_expires);return B}if(k.locked)return j("span","lease","\\uD83D\\uDD12 locked");return null}function F(k){let P=R("span","meta"),B=V(k);if(B)P.appendChild(B);if(v0(k))P.appendChild(j("span","lock","no read"));if(k.last_editor){let I=j("span","editor","✎ "+k.last_editor);I.title="last edited by "+k.last_editor,P.appendChild(I)}if(k.tip_ts){let I=j("span","mt",i(k.tip_ts));I.title="last modified "+v(k.tip_ts),P.appendChild(I)}return P.appendChild(j("span","sz",c0(k.size))),P}function M(k){let P={dirs:{},files:[]};for(let B of k){let I=String(B.path).split("/").filter(Boolean),A=P;for(let d=0;d<I.length-1;d++){let F0=I[d];A.dirs[F0]??={dirs:{},files:[]},A=A.dirs[F0]}A.files.push({...B,name:I.length?I[I.length-1]:B.path})}return P}function T(k){let P=k.files.length;for(let B of Object.keys(k.dirs))P+=T(k.dirs[B]);return P}function L(k,P){for(let B of Object.keys(k.dirs).sort()){let I=k.dirs[B],A=R("div","row dir"),d=j("span","twist","▾");A.appendChild(d),A.appendChild(j("span","icon","\\uD83D\\uDCC1")),A.appendChild(j("span","nm",B));let F0=R("span","meta");F0.appendChild(j("span","cnt",T(I)+" items")),A.appendChild(F0);let L0=R("div","children");D.push(L0),A.addEventListener("click",()=>{let C8=L0.classList.toggle("collapsed");d.textContent=C8?"▸":"▾"}),P.appendChild(A),P.appendChild(L0),L(I,L0)}k.files.slice().sort((B,I)=>C(B,I,!0)).forEach((B)=>{let I=R("div","row file");I.appendChild(j("span","twist","")),I.appendChild(j("span","icon",v0(B)?"\\uD83D\\uDEAB":"\\uD83D\\uDCC4")),I.appendChild(j("span","nm",B.name)),I.appendChild(F(B)),P.appendChild(I)})}function f(k,P){k.slice().sort((B,I)=>C(B,I,!1)).forEach((B)=>{let I=R("div","row file");I.appendChild(j("span","icon",v0(B)?"\\uD83D\\uDEAB":"\\uD83D\\uDCC4")),I.appendChild(j("span","nm path",B.path)),I.appendChild(F(B)),P.appendChild(I)})}function c(){if(!O)return;if(E(O),!q.length){O.appendChild(j("div","empty","No files in this room yet."));return}D=[];let k=R("div",K.mode==="tree"?"tree":"list");if(K.mode==="tree")L(M(q),k);else f(q,k);O.appendChild(k)}function b(k,P,B){let I=j("button","seg-btn"+(P?" active":""),k);return I.addEventListener("click",B),I}let x=R("div","toolbar");x.appendChild(j("span","count",q.length+" file"+(q.length===1?"":"s")));let g=R("span","seg"),m=R("span","seg"),S=j("button","link spacer","expand all"),s=j("button","link","collapse all");S.addEventListener("click",()=>{D.forEach((k)=>k.classList.remove("collapsed")),$.querySelectorAll(".row.dir .twist").forEach((k)=>k.textContent="▾")}),s.addEventListener("click",()=>{D.forEach((k)=>k.classList.add("collapsed")),$.querySelectorAll(".row.dir .twist").forEach((k)=>k.textContent="▸")});function a(){E(g),g.appendChild(j("span","seg-label","view")),g.appendChild(b("Tree",K.mode==="tree",()=>{K.mode="tree",a()})),g.appendChild(b("List",K.mode==="list",()=>{K.mode="list",a()})),E(m),m.appendChild(j("span","seg-label","sort")),[["name","Name"],["modified","Modified"],["size","Size"]].forEach(([P,B])=>{let I=K.sort===P,A=B+(I?K.dir<0?" ↓":" ↑":"");m.appendChild(b(A,I,()=>{if(K.sort===P)K.dir=K.dir===1?-1:1;else K.sort=P,K.dir=P==="name"?1:-1;a()}))});let k=K.mode==="tree";S.style.display=k?"":"none",s.style.display=k?"":"none",c()}x.appendChild(g),x.appendChild(m),x.appendChild(S),x.appendChild(s),$.appendChild(x);let e=R("div","legend");if(e.appendChild(j("span",null,"\\uD83D\\uDCC4 file")),e.appendChild(j("span",null,"\\uD83D\\uDEAB no read access")),e.appendChild(j("span",null,U?"\\uD83D\\uDD12 leased — holder · time left":"\\uD83D\\uDD12 leased (being edited)")),U)e.appendChild(j("span",null,"✎ last editor"));return e.appendChild(j("span",null,"time = last modified")),$.appendChild(e),O=R("div","card"),$.appendChild(O),a(),{treeVisible:!0}}/*! noble-ed25519 - MIT License (c) 2019 Paul Miller (paulmillr.com) */var f8={p:0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,n:0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,h:8n,a:0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,d:0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,Gx:0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,Gy:0x6666666666666666666666666666666666666666666666666666666666666658n},{p:y,n:h0,Gx:V$,Gy:R$,a:u0,d:d0}=f8,H8=8n;var p=($="")=>{throw Error($)},x8=($)=>typeof $==="bigint",f$=($)=>typeof $==="string",g8=($)=>$ instanceof Uint8Array||ArrayBuffer.isView($)&&$.constructor.name==="Uint8Array",D0=($,J)=>!g8($)||typeof J==="number"&&J>0&&$.length!==J?p("Uint8Array expected"):$,E0=($)=>new Uint8Array($),l0=($)=>Uint8Array.from($),H$=($,J)=>$.toString(16).padStart(J,"0"),r0=($)=>Array.from(D0($)).map((J)=>H$(J,2)).join(""),o={_0:48,_9:57,A:65,F:70,a:97,f:102},M$=($)=>{if($>=o._0&&$<=o._9)return $-o._0;if($>=o.A&&$<=o.F)return $-(o.A-10);if($>=o.a&&$<=o.f)return $-(o.a-10);return},t0=($)=>{if(!f$($))return p("hex invalid");let Q=$.length,Y=Q/2;if(Q%2)return p("hex invalid");let Z=E0(Y);for(let X=0,z=0;X<Y;X++,z+=2){let N=M$($.charCodeAt(z)),G=M$($.charCodeAt(z+1));if(N===void 0||G===void 0)return p("hex invalid");Z[X]=N*16+G}return Z},_8=($,J)=>D0(f$($)?t0($):l0(D0($)),J),x$=()=>globalThis?.crypto,S8=()=>x$()?.subtle??p("crypto.subtle must be defined"),I$=(...$)=>{let J=E0($.reduce((Y,Z)=>Y+D0(Z).length,0)),Q=0;return $.forEach((Y)=>{J.set(Y,Q),Q+=Y.length}),J},A8=($=32)=>{return x$().getRandomValues(E0($))},P0=BigInt,X0=($,J,Q,Y="bad number: out of range")=>x8($)&&J<=$&&$<Q?$:p(Y),W=($,J=y)=>{let Q=$%J;return Q>=0n?Q:J+Q};var g$=($,J)=>{if($===0n||J<=0n)p("no inverse n="+$+" mod="+J);let Q=W($,J),Y=J,Z=0n,X=1n,z=1n,N=0n;while(Q!==0n){let G=Y/Q,q=Y%Q,U=Z-z*G,K=X-N*G;Y=Q,Q=q,Z=z,X=N,z=U,N=K}return Y===1n?W(Z,J):p("no inverse")};var L$=($)=>$ instanceof w?$:p("Point expected"),i0=2n**256n;class w{static BASE;static ZERO;ex;ey;ez;et;constructor($,J,Q,Y){let Z=i0;this.ex=X0($,0n,Z),this.ey=X0(J,0n,Z),this.ez=X0(Q,1n,Z),this.et=X0(Y,0n,Z),Object.freeze(this)}static fromAffine($){return new w($.x,$.y,1n,W($.x*$.y))}static fromBytes($,J=!1){let Q=d0,Y=l0(D0($,32)),Z=$[31];Y[31]=Z&-129;let X=m8(Y);X0(X,0n,J?i0:y);let N=W(X*X),G=W(N-1n),q=W(Q*N+1n),{isValid:U,value:K}=p8(G,q);if(!U)p("bad point: y not sqrt");let D=(K&1n)===1n,O=(Z&128)!==0;if(!J&&K===0n&&O)p("bad point: x==0, isLastByteOdd");if(O!==D)K=W(-K);return new w(K,X,1n,W(K*X))}assertValidity(){let $=u0,J=d0,Q=this;if(Q.is0())throw Error("bad point: ZERO");let{ex:Y,ey:Z,ez:X,et:z}=Q,N=W(Y*Y),G=W(Z*Z),q=W(X*X),U=W(q*q),K=W(N*$),D=W(q*W(K+G)),O=W(U+W(J*W(N*G)));if(D!==O)throw Error("bad point: equation left != right (1)");let C=W(Y*Z),V=W(X*z);if(C!==V)throw Error("bad point: equation left != right (2)");return this}equals($){let{ex:J,ey:Q,ez:Y}=this,{ex:Z,ey:X,ez:z}=L$($),N=W(J*z),G=W(Z*Y),q=W(Q*z),U=W(X*Y);return N===G&&q===U}is0(){return this.equals(O0)}negate(){return new w(W(-this.ex),this.ey,this.ez,W(-this.et))}double(){let{ex:$,ey:J,ez:Q}=this,Y=u0,Z=W($*$),X=W(J*J),z=W(2n*W(Q*Q)),N=W(Y*Z),G=$+J,q=W(W(G*G)-Z-X),U=N+X,K=U-z,D=N-X,O=W(q*K),C=W(U*D),V=W(q*D),F=W(K*U);return new w(O,C,F,V)}add($){let{ex:J,ey:Q,ez:Y,et:Z}=this,{ex:X,ey:z,ez:N,et:G}=L$($),q=u0,U=d0,K=W(J*X),D=W(Q*z),O=W(Z*U*G),C=W(Y*N),V=W((J+Q)*(X+z)-K-D),F=W(C-O),M=W(C+O),T=W(D-q*K),L=W(V*F),f=W(M*T),c=W(V*T),b=W(F*M);return new w(L,f,b,c)}multiply($,J=!0){if(!J&&($===0n||this.is0()))return O0;if(X0($,1n,h0),$===1n)return this;if(this.equals(W0))return v8($).p;let Q=O0,Y=W0;for(let Z=this;$>0n;Z=Z.double(),$>>=1n)if($&1n)Q=Q.add(Z);else if(J)Y=Y.add(Z);return Q}toAffine(){let{ex:$,ey:J,ez:Q}=this;if(this.equals(O0))return{x:0n,y:1n};let Y=g$(Q,y);if(W(Q*Y)!==1n)p("invalid inverse");return{x:W($*Y),y:W(J*Y)}}toBytes(){let{x:$,y:J}=this.assertValidity().toAffine(),Q=y8(J);return Q[31]|=$&1n?128:0,Q}toHex(){return r0(this.toBytes())}clearCofactor(){return this.multiply(P0(H8),!1)}isSmallOrder(){return this.clearCofactor().is0()}isTorsionFree(){let $=this.multiply(h0/2n,!1).double();if(h0%2n)$=$.add(this);return $.is0()}static fromHex($,J){return w.fromBytes(_8($),J)}get x(){return this.toAffine().x}get y(){return this.toAffine().y}toRawBytes(){return this.toBytes()}}var W0=new w(V$,R$,1n,W(V$*R$)),O0=new w(0n,1n,1n,0n);w.BASE=W0;w.ZERO=O0;var y8=($)=>t0(H$(X0($,0n,i0),64)).reverse(),m8=($)=>P0("0x"+r0(l0(D0($)).reverse())),n=($,J)=>{let Q=$;while(J-- >0n)Q*=Q,Q%=y;return Q},w8=($)=>{let Q=$*$%y*$%y,Y=n(Q,2n)*Q%y,Z=n(Y,1n)*$%y,X=n(Z,5n)*Z%y,z=n(X,10n)*X%y,N=n(z,20n)*z%y,G=n(N,40n)*N%y,q=n(G,80n)*G%y,U=n(q,80n)*G%y,K=n(U,10n)*X%y;return{pow_p_5_8:n(K,2n)*$%y,b2:Q}},P$=0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n,p8=($,J)=>{let Q=W(J*J*J),Y=W(Q*Q*J),Z=w8($*Y).pow_p_5_8,X=W($*Q*Z),z=W(J*X*X),N=X,G=W(X*P$),q=z===$,U=z===W(-$),K=z===W(-$*P$);if(q)X=N;if(U||K)X=G;if((W(X)&1n)===1n)X=W(-X);return{isValid:q||U,value:X}};var s0={sha512Async:async(...$)=>{let J=S8(),Q=I$(...$);return E0(await J.digest("SHA-512",Q.buffer))},sha512Sync:void 0,bytesToHex:r0,hexToBytes:t0,concatBytes:I$,mod:W,invert:g$,randomBytes:A8};var B0=8,c8=256,_$=Math.ceil(c8/B0)+1,o0=2**(B0-1),b8=()=>{let $=[],J=W0,Q=J;for(let Y=0;Y<_$;Y++){Q=J,$.push(Q);for(let Z=1;Z<o0;Z++)Q=Q.add(J),$.push(Q);J=Q.double()}return $},B$=void 0,E$=($,J)=>{let Q=J.negate();return $?Q:J},v8=($)=>{let J=B$||(B$=b8()),Q=O0,Y=W0,Z=2**B0,X=Z,z=P0(Z-1),N=P0(B0);for(let G=0;G<_$;G++){let q=Number($&z);if($>>=N,q>o0)q-=X,$+=1n;let U=G*o0,K=U,D=U+Math.abs(q)-1,O=G%2!==0,C=q<0;if(q===0)Y=Y.add(E$(O,J[K]));else Q=Q.add(E$(C,J[D]))}return{p:Q,f:Y}};/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */function h8($){return $ instanceof Uint8Array||ArrayBuffer.isView($)&&$.constructor.name==="Uint8Array"}function f0($,...J){if(!h8($))throw Error("Uint8Array expected");if(J.length>0&&!J.includes($.length))throw Error("Uint8Array expected of length "+J+", got length="+$.length)}function a0($,J=!0){if($.destroyed)throw Error("Hash instance has been destroyed");if(J&&$.finished)throw Error("Hash#digest() has already been called")}function S$($,J){f0($);let Q=J.outputLen;if($.length<Q)throw Error("digestInto() expects output buffer of length at least "+Q)}function C0(...$){for(let J=0;J<$.length;J++)$[J].fill(0)}function H0($){return new DataView($.buffer,$.byteOffset,$.byteLength)}function u8($){if(typeof $!=="string")throw Error("string expected");return new Uint8Array(new TextEncoder().encode($))}function e0($){if(typeof $==="string")$=u8($);return f0($),$}class $${}function A$($){let J=(Y)=>$().update(e0(Y)).digest(),Q=$();return J.outputLen=Q.outputLen,J.blockLen=Q.blockLen,J.create=()=>$(),J}function d8($,J,Q,Y){if(typeof $.setBigUint64==="function")return $.setBigUint64(J,Q,Y);let Z=BigInt(32),X=BigInt(4294967295),z=Number(Q>>Z&X),N=Number(Q&X),G=Y?4:0,q=Y?0:4;$.setUint32(J+G,z,Y),$.setUint32(J+q,N,Y)}class J$ extends $${constructor($,J,Q,Y){super();this.finished=!1,this.length=0,this.pos=0,this.destroyed=!1,this.blockLen=$,this.outputLen=J,this.padOffset=Q,this.isLE=Y,this.buffer=new Uint8Array($),this.view=H0(this.buffer)}update($){a0(this),$=e0($),f0($);let{view:J,buffer:Q,blockLen:Y}=this,Z=$.length;for(let X=0;X<Z;){let z=Math.min(Y-this.pos,Z-X);if(z===Y){let N=H0($);for(;Y<=Z-X;X+=Y)this.process(N,X);continue}if(Q.set($.subarray(X,X+z),this.pos),this.pos+=z,X+=z,this.pos===Y)this.process(J,0),this.pos=0}return this.length+=$.length,this.roundClean(),this}digestInto($){a0(this),S$($,this),this.finished=!0;let{buffer:J,view:Q,blockLen:Y,isLE:Z}=this,{pos:X}=this;if(J[X++]=128,C0(this.buffer.subarray(X)),this.padOffset>Y-X)this.process(Q,0),X=0;for(let U=X;U<Y;U++)J[U]=0;d8(Q,Y-8,BigInt(this.length*8),Z),this.process(Q,0);let z=H0($),N=this.outputLen;if(N%4)throw Error("_sha2: outputLen should be aligned to 32bit");let G=N/4,q=this.get();if(G>q.length)throw Error("_sha2: outputLen bigger than state");for(let U=0;U<G;U++)z.setUint32(4*U,q[U],Z)}digest(){let{buffer:$,outputLen:J}=this;this.digestInto($);let Q=$.slice(0,J);return this.destroy(),Q}_cloneInto($){$||($=new this.constructor),$.set(...this.get());let{blockLen:J,buffer:Q,length:Y,finished:Z,destroyed:X,pos:z}=this;if($.destroyed=X,$.finished=Z,$.length=Y,$.pos=z,Y%J)$.buffer.set(Q);return $}clone(){return this._cloneInto()}}var _=Uint32Array.from([1779033703,4089235720,3144134277,2227873595,1013904242,4271175723,2773480762,1595750129,1359893119,2917565137,2600822924,725511199,528734635,4215389547,1541459225,327033209]);var x0=BigInt(4294967295),y$=BigInt(32);function i8($,J=!1){if(J)return{h:Number($&x0),l:Number($>>y$&x0)};return{h:Number($>>y$&x0)|0,l:Number($&x0)|0}}function m$($,J=!1){let Q=$.length,Y=new Uint32Array(Q),Z=new Uint32Array(Q);for(let X=0;X<Q;X++){let{h:z,l:N}=i8($[X],J);[Y[X],Z[X]]=[z,N]}return[Y,Z]}var Q$=($,J,Q)=>$>>>Q,Y$=($,J,Q)=>$<<32-Q|J>>>Q,z0=($,J,Q)=>$>>>Q|J<<32-Q,N0=($,J,Q)=>$<<32-Q|J>>>Q,k0=($,J,Q)=>$<<64-Q|J>>>Q-32,V0=($,J,Q)=>$>>>Q-32|J<<64-Q;function h($,J,Q,Y){let Z=(J>>>0)+(Y>>>0);return{h:$+Q+(Z/4294967296|0)|0,l:Z|0}}var w$=($,J,Q)=>($>>>0)+(J>>>0)+(Q>>>0),p$=($,J,Q,Y)=>J+Q+Y+($/4294967296|0)|0,c$=($,J,Q,Y)=>($>>>0)+(J>>>0)+(Q>>>0)+(Y>>>0),b$=($,J,Q,Y,Z)=>J+Q+Y+Z+($/4294967296|0)|0,v$=($,J,Q,Y,Z)=>($>>>0)+(J>>>0)+(Q>>>0)+(Y>>>0)+(Z>>>0),n$=($,J,Q,Y,Z,X)=>J+Q+Y+Z+X+($/4294967296|0)|0;var h$=(()=>m$(["0x428a2f98d728ae22","0x7137449123ef65cd","0xb5c0fbcfec4d3b2f","0xe9b5dba58189dbbc","0x3956c25bf348b538","0x59f111f1b605d019","0x923f82a4af194f9b","0xab1c5ed5da6d8118","0xd807aa98a3030242","0x12835b0145706fbe","0x243185be4ee4b28c","0x550c7dc3d5ffb4e2","0x72be5d74f27b896f","0x80deb1fe3b1696b1","0x9bdc06a725c71235","0xc19bf174cf692694","0xe49b69c19ef14ad2","0xefbe4786384f25e3","0x0fc19dc68b8cd5b5","0x240ca1cc77ac9c65","0x2de92c6f592b0275","0x4a7484aa6ea6e483","0x5cb0a9dcbd41fbd4","0x76f988da831153b5","0x983e5152ee66dfab","0xa831c66d2db43210","0xb00327c898fb213f","0xbf597fc7beef0ee4","0xc6e00bf33da88fc2","0xd5a79147930aa725","0x06ca6351e003826f","0x142929670a0e6e70","0x27b70a8546d22ffc","0x2e1b21385c26c926","0x4d2c6dfc5ac42aed","0x53380d139d95b3df","0x650a73548baf63de","0x766a0abb3c77b2a8","0x81c2c92e47edaee6","0x92722c851482353b","0xa2bfe8a14cf10364","0xa81a664bbc423001","0xc24b8b70d0f89791","0xc76c51a30654be30","0xd192e819d6ef5218","0xd69906245565a910","0xf40e35855771202a","0x106aa07032bbd1b8","0x19a4c116b8d2d0c8","0x1e376c085141ab53","0x2748774cdf8eeb99","0x34b0bcb5e19b48a8","0x391c0cb3c5c95a63","0x4ed8aa4ae3418acb","0x5b9cca4f7763e373","0x682e6ff3d6b2b8a3","0x748f82ee5defb2fc","0x78a5636f43172f60","0x84c87814a1f0ab72","0x8cc702081a6439ec","0x90befffa23631e28","0xa4506cebde82bde9","0xbef9a3f7b2c67915","0xc67178f2e372532b","0xca273eceea26619c","0xd186b8c721c0c207","0xeada7dd6cde0eb1e","0xf57d4f7fee6ed178","0x06f067aa72176fba","0x0a637dc5a2c898a6","0x113f9804bef90dae","0x1b710b35131c471b","0x28db77f523047d84","0x32caab7b40c72493","0x3c9ebe0a15c9bebc","0x431d67c49c100d4c","0x4cc5d4becb3e42b6","0x597f299cfc657e2a","0x5fcb6fab3ad6faec","0x6c44198c4a475817"].map(($)=>BigInt($))))(),l8=(()=>h$[0])(),r8=(()=>h$[1])(),$0=new Uint32Array(80),J0=new Uint32Array(80);class Z$ extends J${constructor($=64){super(128,$,16,!1);this.Ah=_[0]|0,this.Al=_[1]|0,this.Bh=_[2]|0,this.Bl=_[3]|0,this.Ch=_[4]|0,this.Cl=_[5]|0,this.Dh=_[6]|0,this.Dl=_[7]|0,this.Eh=_[8]|0,this.El=_[9]|0,this.Fh=_[10]|0,this.Fl=_[11]|0,this.Gh=_[12]|0,this.Gl=_[13]|0,this.Hh=_[14]|0,this.Hl=_[15]|0}get(){let{Ah:$,Al:J,Bh:Q,Bl:Y,Ch:Z,Cl:X,Dh:z,Dl:N,Eh:G,El:q,Fh:U,Fl:K,Gh:D,Gl:O,Hh:C,Hl:V}=this;return[$,J,Q,Y,Z,X,z,N,G,q,U,K,D,O,C,V]}set($,J,Q,Y,Z,X,z,N,G,q,U,K,D,O,C,V){this.Ah=$|0,this.Al=J|0,this.Bh=Q|0,this.Bl=Y|0,this.Ch=Z|0,this.Cl=X|0,this.Dh=z|0,this.Dl=N|0,this.Eh=G|0,this.El=q|0,this.Fh=U|0,this.Fl=K|0,this.Gh=D|0,this.Gl=O|0,this.Hh=C|0,this.Hl=V|0}process($,J){for(let T=0;T<16;T++,J+=4)$0[T]=$.getUint32(J),J0[T]=$.getUint32(J+=4);for(let T=16;T<80;T++){let L=$0[T-15]|0,f=J0[T-15]|0,c=z0(L,f,1)^z0(L,f,8)^Q$(L,f,7),b=N0(L,f,1)^N0(L,f,8)^Y$(L,f,7),x=$0[T-2]|0,g=J0[T-2]|0,m=z0(x,g,19)^k0(x,g,61)^Q$(x,g,6),S=N0(x,g,19)^V0(x,g,61)^Y$(x,g,6),s=c$(b,S,J0[T-7],J0[T-16]),a=b$(s,c,m,$0[T-7],$0[T-16]);$0[T]=a|0,J0[T]=s|0}let{Ah:Q,Al:Y,Bh:Z,Bl:X,Ch:z,Cl:N,Dh:G,Dl:q,Eh:U,El:K,Fh:D,Fl:O,Gh:C,Gl:V,Hh:F,Hl:M}=this;for(let T=0;T<80;T++){let L=z0(U,K,14)^z0(U,K,18)^k0(U,K,41),f=N0(U,K,14)^N0(U,K,18)^V0(U,K,41),c=U&D^~U&C,b=K&O^~K&V,x=v$(M,f,b,r8[T],J0[T]),g=n$(x,F,L,c,l8[T],$0[T]),m=x|0,S=z0(Q,Y,28)^k0(Q,Y,34)^k0(Q,Y,39),s=N0(Q,Y,28)^V0(Q,Y,34)^V0(Q,Y,39),a=Q&Z^Q&z^Z&z,e=Y&X^Y&N^X&N;F=C|0,M=V|0,C=D|0,V=O|0,D=U|0,O=K|0,{h:U,l:K}=h(G|0,q|0,g|0,m|0),G=z|0,q=N|0,z=Z|0,N=X|0,Z=Q|0,X=Y|0;let k=w$(m,s,e);Q=p$(k,g,S,a),Y=k|0}({h:Q,l:Y}=h(this.Ah|0,this.Al|0,Q|0,Y|0)),{h:Z,l:X}=h(this.Bh|0,this.Bl|0,Z|0,X|0),{h:z,l:N}=h(this.Ch|0,this.Cl|0,z|0,N|0),{h:G,l:q}=h(this.Dh|0,this.Dl|0,G|0,q|0),{h:U,l:K}=h(this.Eh|0,this.El|0,U|0,K|0),{h:D,l:O}=h(this.Fh|0,this.Fl|0,D|0,O|0),{h:C,l:V}=h(this.Gh|0,this.Gl|0,C|0,V|0),{h:F,l:M}=h(this.Hh|0,this.Hl|0,F|0,M|0),this.set(Q,Y,Z,X,z,N,G,q,U,K,D,O,C,V,F,M)}roundClean(){C0($0,J0)}destroy(){C0(this.buffer),this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)}}var u$=A$(()=>new Z$);var d$=u$;var t8=B8(o$(),1);s0.sha512Sync=(...$)=>d$(s0.concatBytes(...$));var X$={discover:1,read:2,write:3,exclusive:4};var l$={request:!0,inform:!0,deliver:!0,announce:!0,claim:!0,release:!0,accept:!0,reject:!0,escalate:!0,signal:!0,"key.rotate":!0,"file.write":!0,"file.delete":!0,"file.lock":!0,"file.unlock":!0,"file.request":!0,"system.genesis":!0,"system.join":!0,"system.leave":!0,"system.roles":!0,"system.grant":!0,"system.role":!0,"system.config":!0,"system.lease_clear":!0,"system.revoke":!0,"decide.request":!0,"decide.resolve":!0,"system.decision_lapse":!0,"system.role_lapse":!0,"escalate.ack":!0,"system.checkpoint":!0},z$=["working","stuck","gone"];var ZJ={escalate:!0,"system.genesis":!0,"system.join":!0,"system.leave":!0,"system.roles":!0,"system.grant":!0,"system.role":!0,"system.config":!0,"system.lease_clear":!0,"system.revoke":!0,"system.decision_lapse":!0,"system.role_lapse":!0,"system.checkpoint":!0};function N$($){return $ in l$}var XJ=Object.keys(l$).filter(($)=>!($ in ZJ)),K$=["file.*","system.*"];function j$($,J){for(let Q of J){if(Q===$)return!0;if(Q.endsWith(".*")&&$.startsWith(Q.slice(0,-1)))return!0}return!1}var zJ=Object.keys(X$),g0=[{performative:"request",label:"Request",hint:"Ask the room for something (free-text chat).",fields:[{target:"body",label:"Message",type:"text",required:!0,sample:"Can someone look at the flaky CI?"},{target:"thread",label:"Thread",type:"text",required:!1,sample:"ci-flake"}]},{performative:"inform",label:"Inform",hint:"Share information — no reply expected.",fields:[{target:"body",label:"Message",type:"text",required:!0,sample:"Deploy finished, all green."},{target:"task_ref",label:"Task",type:"text",required:!1,sample:"t-123"},{target:"thread",label:"Thread",type:"text",required:!1,sample:"deploys"}]},{performative:"announce",label:"Announce task",hint:"Post a task others can claim (volunteer mode).",fixedData:{mode:"volunteer"},fields:[{target:"task_ref",label:"Task id",type:"text",required:!0,sample:"t-123"},{target:"body",label:"Description",type:"text",required:!0,sample:"Fix the login redirect loop"},{target:"data.verdict_by",label:"Verdict by",type:"csv",required:!1,sample:"alice@team"},{target:"data.claim_window_s",label:"Claim window (s)",type:"number",required:!1,sample:"300"},{target:"data.lease_ttl_s",label:"Lease TTL (s)",type:"number",required:!1,sample:"900"},{target:"data.max_claim_s",label:"Max claim (s)",type:"number",required:!1,sample:"3600"},{target:"data.depends_on",label:"Depends on",type:"csv",required:!1,sample:"t-100,t-101"}]},{performative:"claim",label:"Claim",hint:"Take an announced task.",fields:[{target:"task_ref",label:"Task id",type:"text",required:!0,sample:"t-123"},{target:"body",label:"Note",type:"text",required:!1,sample:"Taking this one."}]},{performative:"release",label:"Release",hint:"Give a claimed task back to the room.",fields:[{target:"task_ref",label:"Task id",type:"text",required:!0,sample:"t-123"},{target:"body",label:"Note",type:"text",required:!1,sample:"Out of my depth — releasing."}]},{performative:"deliver",label:"Deliver",hint:"Hand in work for a task (needs at least one artifact ref).",fields:[{target:"task_ref",label:"Task id",type:"text",required:!0,sample:"t-123"},{target:"artifacts",label:"Artifacts",type:"csv",required:!0,sample:"pr://org/repo/42"},{target:"body",label:"Note",type:"text",required:!1,sample:"PR up, tests green."}]},{performative:"accept",label:"Accept",hint:"Accept a delivery (verdict).",fields:[{target:"task_ref",label:"Task id",type:"text",required:!0,sample:"t-123"},{target:"body",label:"Note",type:"text",required:!1,sample:"Looks good — merged."}]},{performative:"reject",label:"Reject",hint:"Reject a delivery (verdict, with reason).",fields:[{target:"task_ref",label:"Task id",type:"text",required:!0,sample:"t-123"},{target:"body",label:"Reason",type:"text",required:!1,sample:"Breaks the mobile layout."}]},{performative:"signal",label:"Signal",hint:"Broadcast your liveness condition.",fields:[{target:"data.condition",label:"Condition",type:"enum",options:z$,required:!0,sample:"working"},{target:"body",label:"Note",type:"text",required:!1,sample:"Deep in the merge conflict."}]},{performative:"decide.request",label:"Ask for decision",hint:"Open a decision with a named authority.",fields:[{target:"thread",label:"Decision id",type:"text",required:!0,sample:"d-1"},{target:"data.question",label:"Question",type:"text",required:!0,sample:"Ship option A or B?"},{target:"data.authority",label:"Authority",type:"csv",required:!0,sample:"id:alice@team,role:architect"},{target:"data.deadline",label:"Deadline (ISO)",type:"text",required:!1,sample:"2026-08-01T12:00:00Z"}]},{performative:"decide.resolve",label:"Resolve decision",hint:"Answer an open decision you hold authority over.",fields:[{target:"thread",label:"Decision id",type:"text",required:!0,sample:"d-1"},{target:"data.resolution",label:"Resolution",type:"text",required:!0,sample:"Option A"}]},{performative:"escalate.ack",label:"Ack escalation",hint:"Mark a room escalation as handled.",fields:[{target:"data.escalate_seq",label:"Escalation seq",type:"number",required:!0,sample:"42"}]},{performative:"file.request",label:"Request file access",hint:"Post an advisory access request for a path.",fields:[{target:"data.path",label:"Path",type:"text",required:!0,sample:"src/app.ts"},{target:"data.grade",label:"Grade",type:"enum",options:zJ,required:!0,sample:"read"}]}];function U$($,J){let Q={performative:$.performative},Y={...$.fixedData};for(let Z of $.fields){let X=(J[Z.target]??"").trim();if(X===""){if(Z.required)return{ok:!1,detail:`${Z.label} is required`};continue}let z;switch(Z.type){case"text":z=X;break;case"number":{let N=Number(X);if(!Number.isInteger(N))return{ok:!1,detail:`${Z.label} must be an integer`};z=N;break}case"enum":if(!Z.options?.includes(X))return{ok:!1,detail:`${Z.label} must be one of: ${(Z.options??[]).join(", ")}`};z=X;break;case"csv":z=X.split(",").map((N)=>N.trim()).filter((N)=>N.length>0);break}if(Z.target.startsWith("data."))Y[Z.target.slice(5)]=z;else if(Z.target==="artifacts")Q.artifacts=z;else if(Z.target==="body")Q.body=z;else if(Z.target==="task_ref")Q.task_ref=z;else if(Z.target==="thread")Q.thread=z}if(Object.keys(Y).length>0)Q.data=Y;return{ok:!0,input:Q}}var q$=100,r$=1000,jJ=48;function t$($){return j$($,K$)}function s$($){let J=$.submission,Q=R("div","feed-row"),Y=R("div","feed-row-head");if(Y.appendChild(j("span","feed-seq","#"+$.seq)),Y.appendChild(j("span","feed-sender",J.sender)),Y.appendChild(j("span","feed-perf",J.performative)),J.task_ref)Y.appendChild(j("span","feed-chip","task:"+J.task_ref));if(J.thread)Y.appendChild(j("span","feed-chip","thread:"+J.thread));let Z=j("span","feed-time",i($.room_ts));if(Z.title=v($.room_ts),Y.appendChild(Z),Q.appendChild(Y),J.body)Q.appendChild(j("div","feed-body",J.body));return Q}function G$($,J){E($);let Q=!1,Y=r$,Z=[],X=new Set,z=R("div","feed-toolbar"),N=R("label","feed-toggle"),G=document.createElement("input");G.type="checkbox",N.appendChild(G),N.appendChild(j("span",null,"show system")),z.appendChild(N),$.appendChild(z);let q=R("div","feed");$.appendChild(q);function U(){return q.scrollHeight-q.scrollTop-q.clientHeight<jJ}let K=!1;function D(){let F=U();if(E(q),K)q.appendChild(j("div","msg feed-truncated",`Showing the most recent ${Y} entries — older history via \\`mesh log --all\\`.`));let M=Z.filter((T)=>Q||!t$(T.submission.performative));if(M.length===0)q.appendChild(j("div","empty","No activity yet."));else for(let T of M)q.appendChild(s$(T));if(F)q.scrollTop=q.scrollHeight}function O(F){if(X.has(F.seq))return!1;X.add(F.seq);let M=!0;if(Z.length===0||F.seq>=Z[Z.length-1].seq)Z.push(F);else{let T=Z.length-1;while(T>0&&Z[T-1].seq>F.seq)T--;Z.splice(T,0,F),M=!1}if(Z.length>Y){let T=Z.splice(0,Z.length-Y);for(let L of T)X.delete(L.seq);K=!0,M=!1}return M}function C(F,M){if(!M){D();return}if(!Q&&t$(F.submission.performative))return;let T=U(),L=q.querySelector(".empty");if(L)L.remove();if(q.appendChild(s$(F)),T)q.scrollTop=q.scrollHeight}G.addEventListener("change",()=>{Q=G.checked,D()});let V=new AbortController;return(async()=>{try{let F=-1,M=-1,T=!0;for(let L=0;L<r$/q$;L++){let f=await J.getEntries({since:F,limit:q$});for(let c of f.entries)O(c);if(f.entries.length>0)M=f.entries[f.entries.length-1].seq,F=M;if(f.entries.length<q$){T=!1;break}}if(T)K=!0;D();for await(let L of J.follow(M,V.signal))if(L.type==="entry")C(L.entry,O(L.entry))}catch{D(),q.appendChild(j("div","msg err","Feed unavailable — reload the page to retry."))}})(),{stop:()=>V.abort()}}var a$="";function UJ($,J,Q,Y){if(Y==="enum"){let X=document.createElement("select");X.dataset.target=$;for(let z of Q??[]){let N=document.createElement("option");N.value=z,N.textContent=z,X.appendChild(N)}return X}let Z=document.createElement("input");return Z.dataset.target=$,Z.type=Y==="number"?"number":"text",Z.placeholder=J,Z}function O$($,J,Q){if(E($),Q){$.appendChild(j("div","msg composer-hint","read-only — run `mesh open` locally to chat"));return}let Y=j("div","msg err composer-error","");Y.style.display="none";function Z(K){Y.textContent=K,Y.style.display=""}function X(){Y.style.display="none"}let z=document.createElement("select");z.className="composer-select";let N=document.createElement("option");N.value=a$,N.textContent="Message",z.appendChild(N);for(let K of g0){let D=document.createElement("option");D.value=K.performative,D.textContent=K.label,D.title=K.hint,z.appendChild(D)}let G=R("div","composer-form");function q(){E(G);let K=R("div","composer-msg-row"),D=document.createElement("input");D.type="text",D.placeholder="Message the room…",D.className="composer-msg-input",K.appendChild(D),G.appendChild(K),D.addEventListener("keydown",(O)=>{if(O.key!=="Enter"||D.disabled)return;let C=D.value.trim();if(!C)return;X(),D.disabled=!0,J.postEntry({performative:"request",body:C}).then((V)=>{if(!V.ok)Z(`post failed: [${V.error}] ${V.detail}`);else D.value=""}).catch((V)=>{Z(`post failed: ${V instanceof Error?V.message:String(V)}`)}).finally(()=>{D.disabled=!1,D.focus()})})}function U(K){E(G);let D=[];for(let C of K.fields){let V=R("div","composer-field"),F=j("label",null,C.label+(C.required?" *":"")),M=UJ(C.target,C.sample,C.options,C.type);D.push(M),V.appendChild(F),V.appendChild(M),G.appendChild(V)}let O=j("button","link","Send");G.appendChild(O),O.addEventListener("click",()=>{if(O.disabled)return;X();let C={};for(let F of D)C[F.dataset.target??""]=F.value;let V=U$(K,C);if(!V.ok){Z(V.detail);return}O.disabled=!0,J.postEntry(V.input).then((F)=>{if(!F.ok)Z(`post failed: [${F.error}] ${F.detail}`);else for(let M of D)M.value=""}).catch((F)=>{Z(`post failed: ${F instanceof Error?F.message:String(F)}`)}).finally(()=>{O.disabled=!1})})}z.addEventListener("change",()=>{if(X(),z.value===a$){q();return}let K=g0.find((D)=>D.performative===z.value);if(K)U(K)}),$.appendChild(z),$.appendChild(G),$.appendChild(Y),q()}var $8=null,D$=!1;class l extends Error{reason;constructor($){super("session ended");this.reason=$;this.name="SessionEndedError"}}class r extends Error{reason="manager-unreachable";constructor(){super("manager unreachable");this.name="ManagerUnreachableError"}}function J8($){$8=$,D$=!1}function e$($){if(D$)return;D$=!0;try{$8?.($)}catch{}}async function u($,J={}){let Q=new Headers(J.headers);Q.set("X-Mesh-UI","1");let Y;try{Y=await fetch($,{...J,headers:Q})}catch(Z){if(J.signal?.aborted===!0)throw Z;throw e$("manager-unreachable"),new r}if(Y.status===401){let Z="session-invalidated";try{let X=await Y.clone().json();if(typeof X==="object"&&X!==null&&!Array.isArray(X)&&X.error==="missing_cookie")Z="missing-credential"}catch{}throw e$(Z),new l(Z)}return Y}var qJ={vacuous:!0,untracked:!0,"room-only":!0,"orphan-base":!0,"local-deleted":!0,"room-deleted-clean":!0,"room-deleted-dirty":!0,adopt:!0,"never-synced":!0,"in-sync":!0,ahead:!0,behind:!0,converged:!0,diverged:!0,gated:!0,ignored:!0},GJ="no local workspace attached to this membership",OJ={"local identity does not match this membership\'s participant":"local identity does not match this membership\'s participant",local_status_scan_failed:"local status scan failed",machine_registry_unavailable:"machine registry unavailable",membership_resolution_failed:"membership resolution failed"},DJ={remote_status_unavailable:"room status unavailable",remote_tree_unavailable:"room file tree unavailable",remote_leases_unavailable:"room lease list unavailable"};function Q0($){return typeof $==="object"&&$!==null&&!Array.isArray($)}function Y8($){return $==="remote"||$==="local"||$==="derived"}function Q8($){return typeof $==="number"&&Number.isSafeInteger($)&&$>=0}function FJ($){if($===""||$.includes("\\\\")||$.startsWith("/")||/^[a-zA-Z]:/.test($))return!1;return $.split("/").every((J)=>J!==""&&J!=="."&&J!=="..")}function Z8($){if(!Q0($)||typeof $.registered!=="boolean")return null;if(!$.registered)return{registered:!1};let J=$.pid;if(J!==void 0&&(!Number.isSafeInteger(J)||typeof J!=="number"||J<=0))return null;let Q=$.alive;if(Q!==void 0&&typeof Q!=="boolean")return null;let Y=$.wakeCursorSeq;if(Y!==void 0&&Y!=="none"&&Y!=="unknown"&&!Q8(Y))return null;let Z=$.pendingWake;if(Z!==void 0&&Z!==null&&Z!=="unknown"&&(!Q0(Z)||!Q8(Z.throughSeq)||typeof Z.ageMs!=="number"||!Number.isFinite(Z.ageMs)||Z.ageMs<0))return null;let X=$.hookState;if(X!==void 0&&X!=="idle"&&X!=="busy"&&X!=="unknown")return null;let z={registered:!0};if(typeof J==="number")z.pid=J;if(typeof Q==="boolean")z.alive=Q;if(typeof Y==="number"||Y==="none"||Y==="unknown")z.wakeCursorSeq=Y;if(Z===null||Z==="unknown")z.pendingWake=Z;else if(Q0(Z))z.pendingWake={throughSeq:Z.throughSeq,ageMs:Z.ageMs};if(X==="idle"||X==="busy"||X==="unknown")z.hookState=X;return z}function TJ($){if(!Array.isArray($))return null;let J=[];for(let Q of $){if(!Q0(Q))return null;let{path:Y,state:Z,glyph:X,detail:z}=Q;if(typeof Y!=="string"||!FJ(Y)||typeof Z!=="string"||qJ[Z]!==!0||typeof X!=="string"||z!==void 0&&typeof z!=="string")return null;let N={path:Y,state:Z,glyph:X};if(typeof z==="string")N.detail=z;J.push(N)}return J}function K0($){let J,Q,Y=null;if(Q0($)){if(Y8($.source))J=$.source;if(typeof $.observedAt==="number"&&Number.isFinite($.observedAt))Q=$.observedAt;let Z=$.data;if(Q0(Z))Y=Z8(Z.daemon)}return{...J===void 0?{}:{source:J},...Q===void 0?{}:{observedAt:Q},availability:"invalid",data:Y===null?null:{fs:null,daemon:Y}}}function S0($){if(!Q0($))return K0($);let{source:J,observedAt:Q,availability:Y,error:Z}=$;if(!Y8(J)||typeof Q!=="number"||!Number.isFinite(Q)||Y!=="ok"&&Y!=="failed"&&Y!=="unavailable"||Z!==void 0&&typeof Z!=="string")return K0($);let X=$.data;if(X===null){if(Y==="ok")return K0($);return{source:J,observedAt:Q,availability:Y,...typeof Z==="string"?{error:Z}:{},data:null}}if(!Q0(X))return K0($);let z=Z8(X.daemon);if(z===null)return K0($);if(Y==="ok"){let N=TJ(X.fs);if(N===null)return K0($);return{source:J,observedAt:Q,availability:Y,...typeof Z==="string"?{error:Z}:{},data:{fs:N,daemon:z}}}if(X.fs!==null)return K0($);return{source:J,observedAt:Q,availability:Y,...typeof Z==="string"?{error:Z}:{},data:{fs:null,daemon:z}}}function WJ($,J){let Q=J.source??"local";if(J.availability==="loading"){$.appendChild(j("p","source-label",`${Q} · loading`));return}let Y=J.observedAt;if(Y===void 0){$.appendChild(j("p","source-label",`${Q} · observation time unknown`));return}let Z=i(Y)||"observation time unknown",X=j("p","source-label",`${Q} · ${Z}`);X.title=v(Y),$.appendChild(X)}function _0($){let J=j("p","msg err",$);return J.setAttribute("role","alert"),J}function R0($,J,Q){let Y=R("div","local-card-row");Y.append(j("dt",null,J),j("dd",null,Q)),$.appendChild(Y)}function CJ($){let J=R("section","local-card daemon-card");if(J.appendChild(j("h3",null,"Daemon")),!$.registered)return J.appendChild(j("p","local-card-row","no daemon registered")),J;let Q=document.createElement("dl");R0(Q,"pid",$.pid===void 0?"unknown":String($.pid)),R0(Q,"liveness",$.alive===void 0?"unknown":$.alive?"running":"not running"),R0(Q,"wake cursor",$.wakeCursorSeq===void 0?"unknown":String($.wakeCursorSeq));let Y="unknown";if($.pendingWake===null)Y="none";else if($.pendingWake==="unknown")Y="unknown";else if($.pendingWake!==void 0)Y=`through seq ${$.pendingWake.throughSeq}, ${Math.round($.pendingWake.ageMs/1000)}s ago`;return R0(Q,"pending wake",Y),R0(Q,"hook state",$.hookState??"unknown"),J.appendChild(Q),J}function kJ($,J){let Q=J==="remote"?"room scan failed":"local status scan failed";if($===void 0)return Q;return OJ[$]??DJ[$]??Q}function VJ($){let J=$.source??"local",Q=kJ($.error,J);return J==="remote"?`Room scan failed — ${Q}. Check room access, then reselect this room to retry.`:`Local workspace scan failed — ${Q}. Check the workspace attachment and room access, then reselect this room to retry.`}function RJ($){if($===GJ)return"No local workspace attached — from your project folder, run mesh fs put . for an existing project or mesh fs hydrate for an empty checkout, then reselect this room.";if($==="local_workspace_unavailable")return"Attached workspace cannot be accessed — verify or re-attach the workspace, then reselect this room.";return"Local workspace status unavailable — verify the workspace attachment, then reselect this room."}function A0($,J){if(E($),$.appendChild(j("h2","pane-heading","Local workspace")),WJ($,J),J.availability==="loading"){$.appendChild(j("p","msg","Loading local workspace status — choose another room if this room is unavailable."));return}if(J.availability==="invalid")$.appendChild(_0("Invalid local status response — reselect this room to retry, or run mesh ui again."));else if(J.availability==="unavailable")$.appendChild(_0(RJ(J.error)));else if(J.availability==="failed")$.appendChild(_0(VJ(J)));else if(J.data===null||J.data.fs===null)$.appendChild(_0("Local workspace status unavailable — reselect this room to retry, or run mesh ui again."));else if(J.data.fs.length===0)$.appendChild(j("p","msg","Workspace clean — no differing paths"));else{let Q=R("ul","fs-status-table");Q.setAttribute("aria-label","Local workspace differences");for(let Y of J.data.fs){let Z=R("li","status-row");if(Z.appendChild(j("span","glyph",Y.glyph)),Z.appendChild(j("span","path",Y.path)),Y.detail!==void 0)Z.appendChild(j("span","detail",Y.detail));Q.appendChild(Z)}$.appendChild(Q)}if(J.data!==null)$.appendChild(CJ(J.data.daemon))}function t($){return typeof $==="object"&&$!==null&&!Array.isArray($)}function z8($){return typeof $==="number"&&Number.isFinite($)}function Y0($){return typeof $==="number"&&Number.isSafeInteger($)}function MJ($){return Array.isArray($)&&$.every((J)=>typeof J==="string")}function j0($,J){return $[J]===void 0||typeof $[J]==="string"}function IJ($,J){return $[J]===void 0||z8($[J])}function X8($,J){return $[J]===void 0||MJ($[J])}function LJ($){if(!t($))return!1;let{source:J,availability:Q}=$;return(J==="remote"||J==="local"||J==="derived")&&z8($.observedAt)&&(Q==="ok"||Q==="failed"||Q==="unavailable")&&j0($,"error")&&(Q==="ok"?$.data!==null:$.data===null)}function PJ($){if(!t($))return!1;return $.v===1&&typeof $.room==="string"&&typeof $.sender==="string"&&typeof $.performative==="string"&&N$($.performative)&&typeof $.client_ts==="string"&&typeof $.nonce==="string"&&j0($,"task_ref")&&j0($,"thread")&&j0($,"contingent_on")&&($.reply_to===void 0||Y0($.reply_to))&&X8($,"mentions")&&X8($,"artifacts")&&j0($,"body")&&j0($,"sig")}function N8($){if(!t($))return!1;return Y0($.seq)&&typeof $.prev_hash==="string"&&typeof $.room_ts==="string"&&PJ($.submission)&&typeof $.entry_hash==="string"}function BJ($){return t($)&&Y0($.seq)&&typeof $.entry_hash==="string"}function EJ($){if(!t($))return!1;let{entries:J,notifies:Q}=$;return Array.isArray(J)&&J.every(N8)&&Array.isArray(Q)&&Q.every((Y)=>t(Y)&&typeof Y.watch_id==="string"&&Y0(Y.entry_seq))&&BJ($.head)&&($.read_cursor===void 0||Y0($.read_cursor))&&($.notifies_truncated===void 0||typeof $.notifies_truncated==="boolean")}function fJ($){if(!t($)||typeof $.ok!=="boolean")return!1;if($.ok===!0)return Y0($.seq)&&typeof $.entry_hash==="string";return typeof $.error==="string"&&typeof $.detail==="string"&&Y0($.status)&&j0($,"hint")&&IJ($,"retry_after_s")}function HJ($){if(!t($)||typeof $.type!=="string")return!1;switch($.type){case"entry":return N8($.entry);case"notify":return typeof $.watch_id==="string"&&Y0($.entry_seq);case"crdt":return typeof $.path==="string"&&typeof $.update==="string";case"ping":case"pong":return!0;default:return!1}}function y0($){return Error(`invalid broker response for ${$}`)}async function K8($,J){try{return await $.json()}catch{throw y0(J)}}async function xJ($,J){let Q=await u($),Y=await K8(Q,J);if(!LJ(Y))throw y0(J);if(Y.availability!=="ok")throw Error(Y.error??`${J} unavailable`);if(!Q.ok)throw Error(`${J} failed with HTTP ${Q.status}`);return Y.data}function gJ($,J){let Q=new URLSearchParams;if(J.since!==void 0){if(!Number.isSafeInteger(J.since)||J.since<-1)throw Error("invalid entries since cursor");Q.set("since",String(J.since))}if(J.limit!==void 0){if(!Number.isSafeInteger(J.limit)||J.limit<1)throw Error("invalid entries limit");Q.set("limit",String(J.limit))}let Y=Q.toString();return`/api/memberships/${encodeURIComponent($)}/entries${Y.length>0?`?${Y}`:""}`}function _J($,J){let Q=new URLSearchParams;if(J!==void 0){if(!Number.isSafeInteger(J)||J<-1)throw Error("invalid events since cursor");Q.set("since",String(J))}let Y=Q.toString();return`/api/memberships/${encodeURIComponent($)}/events${Y.length>0?`?${Y}`:""}`}function SJ($){try{let J=JSON.parse($);return t(J)&&typeof J.error==="string"?J.error:null}catch{return null}}function AJ($){return $.replaceAll("_"," ")}function yJ($,J,Q){let Y=[],Z=[],X=null,z=!1,N=!1,G=!1,q=(O)=>{if(G)return;G=!0;try{Q?.(O)}catch{}},U=()=>{if(z)return;if(z=!0,J?.removeEventListener("abort",U),X!==null)X.onmessage=null,X.onerror=null,X.close();Y.length=0;for(let O of Z.splice(0))O({done:!0,value:void 0})},K=()=>{if(N)return;N=!0,U(),(async()=>{try{await u("/api/inventory"),q("Feed disconnected — reload the page or choose the room again to retry.")}catch(O){if(O instanceof l||O instanceof r)return;q("Feed disconnected and the session could not be checked — reload the page to retry.")}})()},D={next(){let O=Y.shift();if(O!==void 0)return Promise.resolve({done:!1,value:O});if(z)return Promise.resolve({done:!0,value:void 0});let{promise:C,resolve:V}=Promise.withResolvers();return Z.push(V),C},return(){return U(),Promise.resolve({done:!0,value:void 0})},throw(O){return U(),Promise.reject(O)},[Symbol.asyncIterator](){return this}};if(J?.aborted)return z=!0,D;J?.addEventListener("abort",U,{once:!0});try{X=new EventSource($)}catch{return U(),q("Feed unavailable — reload the page or choose the room again to retry."),D}return X.onmessage=(O)=>{if(z)return;let C;try{C=JSON.parse(O.data)}catch{q("Feed disconnected after an invalid event — reload the page to retry."),U();return}if(!HJ(C)){q("Feed disconnected after an invalid event — reload the page to retry."),U();return}let V=Z.shift();if(V!==void 0)V({done:!1,value:C});else Y.push(C)},X.onerror=(O)=>{if(z)return;let C=Reflect.get(O,"data");if(typeof C==="string"){let V=SJ(C)??"upstream error";q(`Feed disconnected — ${AJ(V)}. Reload the page to retry.`),U();return}if(X?.readyState===EventSource.CLOSED)K()},D}function j8($,J,Q,Y){return{roomId:J,async getEntries(Z){let z=await xJ(gJ($,Z),"room entries");if(!EJ(z))throw y0("room entries");return z},follow(Z,X){return yJ(_J($,Z),X,Y)},async postEntry(Z){let z=await u(`/api/memberships/${encodeURIComponent($)}/post`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Z)}),N=await K8(z,"room post");if(!fJ(N))throw y0("room post");return N}}}function M0($){return typeof $==="object"&&$!==null&&!Array.isArray($)}function mJ($){if(!M0($))return!1;let{source:J,availability:Q}=$;return(J==="remote"||J==="local"||J==="derived")&&typeof $.observedAt==="number"&&Number.isFinite($.observedAt)&&(Q==="ok"||Q==="failed"||Q==="unavailable")&&($.error===void 0||typeof $.error==="string")&&(Q==="ok"?$.data!==null:$.data===null)}function wJ($){if(!M0($)||!Array.isArray($.tree))return null;let J=[];for(let Q of $.tree){if(!M0(Q)||typeof Q.path!=="string"||typeof Q.size!=="number"||!Number.isFinite(Q.size)||Q.size<0||Q.content_hash!==void 0&&typeof Q.content_hash!=="string"||Q.tip_ts!==void 0&&typeof Q.tip_ts!=="string"||Q.lease_holder!==void 0&&typeof Q.lease_holder!=="string")return null;let Y={path:Q.path,size:Q.size};if(typeof Q.content_hash==="string")Y.content_hash=Q.content_hash;if(typeof Q.tip_ts==="string")Y.tip_ts=Q.tip_ts;if(typeof Q.lease_holder==="string")Y.lease_holder=Q.lease_holder;J.push(Y)}return J}function pJ($){if(!M0($)||!Array.isArray($.roster))return null;let J=[];for(let Q of $.roster){if(!M0(Q)||typeof Q.participant_id!=="string"||typeof Q.pubkey!=="string"||!Array.isArray(Q.roles)||!Q.roles.every((Y)=>typeof Y==="string")||Q.specialties!==void 0&&(!Array.isArray(Q.specialties)||!Q.specialties.every((Y)=>typeof Y==="string")))return null;J.push({participantId:Q.participant_id,pubkey:Q.pubkey,roles:[...Q.roles],specialties:Q.specialties===void 0?[]:[...Q.specialties]})}return{roster:J}}async function U8($,J,Q){let Y=await u($,{signal:Q}),Z;try{Z=await Y.json()}catch{throw Error(`invalid broker response for ${J}`)}if(!mJ(Z))throw Error(`invalid broker response for ${J}`);if(!Y.ok&&Z.availability==="ok")throw Error(`${J} failed with HTTP ${Y.status}`);return Z}var cJ=0;function bJ($){let J=$.querySelector(".composer-select");if(J===null)return;let Q=`manager-composer-${cJ++}`;J.id=`${Q}-type`;let Y=j("label","composer-control-label","Message type");Y.htmlFor=J.id,J.before(Y);let Z=()=>{let X=$.querySelector(".composer-msg-input");if(X!==null){X.id=`${Q}-message`;let N=j("label","composer-control-label","Message");N.htmlFor=X.id,X.before(N);return}$.querySelectorAll(".composer-field").forEach((N,G)=>{let q=N.querySelector("label"),U=N.querySelector("input, select");if(q===null||U===null)return;U.id=`${Q}-field-${G}`,q.htmlFor=U.id,q.classList.add("composer-control-label")})};J.addEventListener("change",Z),Z()}function q8($){E($),$.appendChild(j("h2","pane-heading","Room"));let J=j("div","source-label","room · not selected"),Q=R("section","files-pane"),Y=R("section","conversation-pane");Q.textContent="Choose a room from the Rooms pane to inspect its files.",Y.textContent="Choose a room to load its conversation and composer.",$.append(J,Q,Y);let Z=0,X=null,z=null,N=()=>{Z+=1,X?.abort(),X=null,z?.stop(),z=null,E(Q),E(Y)},G=(U)=>{J.textContent="room · unavailable",J.title="",Q.textContent=`Room unavailable — ${U}. Reload the page or choose another room to retry.`,Y.textContent="Conversation unavailable — choose another room or reload the page to retry."};async function q(U,K,D){N();let O=Z,C=new AbortController;X=C,J.textContent="room · loading",J.title="",Q.textContent="Loading room files — choose another room if this room is unavailable.",Y.textContent="Loading conversation — it will appear when the room responds.";let V,F;try{[V,F]=await Promise.all([U8(`/api/memberships/${encodeURIComponent(U)}/tree`,"room tree",C.signal),U8(`/api/memberships/${encodeURIComponent(U)}/state`,"room state",C.signal)])}catch(S){if(O!==Z||C.signal.aborted||S instanceof l||S instanceof r)return;G(S instanceof Error?S.message:"room request failed");return}if(O!==Z||C.signal.aborted)return;if(X=null,V.availability!=="ok"||F.availability!=="ok"){G(V.error??F.error??"room request failed");return}let M=wJ(V.data),T=pJ(F.data);if(M===null||T===null){G("invalid broker response for room data");return}let L=Math.max(V.observedAt,F.observedAt);J.textContent=`room · ${i(L)}`,J.title=v(L);let f=T.roster.find((S)=>S.participantId===D),c=f===void 0?null:{participant_id:f.participantId,pubkey:f.pubkey,roles:f.roles,specialties:f.specialties};n0(Q,K,{room:K,mode:"member",public_share:!1,tree_visible:!0,identity:c,tree:M}),E(Y);let x=R("div","feed-pane"),g=R("div","composer-pane");Y.append(x,g);let m=j8(U,K,D,(S)=>{if(O!==Z)return;Y.appendChild(j("div","feed-failure",S))});z=G$(x,m),O$(g,m,!1),bJ(g)}return{switchTo:q,stop(){N(),J.textContent="room · stopped",J.title=""}}}function G8($,J,Q){E($),$.appendChild(j("h2","pane-heading","Rooms"));let Y=new Map,Z=[];function X(N){if(N===void 0)return;for(let G of Z)G.tabIndex=G===N?0:-1}function z(N){let G=Z[(N+Z.length)%Z.length];if(G===void 0)return;X(G),G.focus()}for(let N of J){if(N.memberships.length===0)continue;let G=R("div","sidebar-group");G.setAttribute("role","group"),G.setAttribute("aria-label",`Profile ${N.label}, identity ${N.identityId}`);let q=R("h3","sidebar-group-label");q.appendChild(j("span","sidebar-profile-name",`${T0(N.pubkey)} ${N.label}`)),q.appendChild(j("span","sidebar-profile-identity",N.identityId)),G.appendChild(q);for(let U of N.memberships){let K=R("button","sidebar-row");K.type="button",K.dataset.mid=U.membershipId,K.tabIndex=Z.length===0?0:-1,K.setAttribute("aria-label",`${U.roomId} at ${U.origin} — profile ${N.label}, identity ${N.identityId}`);let D=R("span","sidebar-room-context");D.appendChild(j("span","sidebar-room-id",U.roomId)),D.appendChild(j("span","sidebar-room-origin",U.origin)),K.appendChild(D),K.addEventListener("click",()=>{X(K),Q(U.membershipId)}),K.addEventListener("keydown",(O)=>{let C=Z.indexOf(K);if(O.key==="ArrowDown")O.preventDefault(),z(C+1);else if(O.key==="ArrowUp")O.preventDefault(),z(C-1);else if(O.key==="Home")O.preventDefault(),z(0);else if(O.key==="End")O.preventDefault(),z(Z.length-1)}),G.appendChild(K),Y.set(U.membershipId,K),Z.push(K)}$.appendChild(G)}if(Z.length===0)$.appendChild(j("div","empty-state","No rooms yet — run mesh keygen + mesh join, then reload"));return{setActive(N){X(Y.get(N)??Z[0]);for(let[G,q]of Y)if(G===N)q.setAttribute("aria-current","true");else q.removeAttribute("aria-current")}}}function vJ(){let $=location.hash;if($.length===0)return{kind:"none"};let J=new URL(location.href);J.hash="",J.searchParams.delete("launch"),history.replaceState(null,"",J.pathname+J.search);let Q=/^#s=(.*)$/.exec($);if(Q===null)return{kind:"none"};let Y=Q[1];if(Y.length===0)return{kind:"none"};try{let Z=decodeURIComponent(Y);return Z.length===0?{kind:"none"}:{kind:"token",value:Z}}catch{return{kind:"none"}}}var O8=vJ();window.addEventListener("hashchange",()=>{if(location.hash.startsWith("#s="))history.go(0)});function T$($){let J=document.getElementById($);if(J===null)throw Error(`manager shell is missing #${$}`);return J}var q0=T$("identity-context"),p0=T$("room-context"),H=T$("app");function F$($){return typeof $==="object"&&$!==null&&!Array.isArray($)}function nJ($){if(!F$($))return!1;let{source:J,availability:Q}=$;return(J==="remote"||J==="local"||J==="derived")&&typeof $.observedAt==="number"&&Number.isFinite($.observedAt)&&(Q==="ok"||Q==="failed"||Q==="unavailable")&&($.error===void 0||typeof $.error==="string")&&(Q==="ok"?$.data!==null:$.data===null)}function hJ($){if(!Array.isArray($))return null;let J=[];for(let Q of $){if(!F$(Q)||typeof Q.label!=="string"||typeof Q.identityId!=="string"||typeof Q.pubkey!=="string"||!Array.isArray(Q.memberships))return null;let Y=[];for(let Z of Q.memberships){if(!F$(Z)||typeof Z.membershipId!=="string"||typeof Z.roomId!=="string"||typeof Z.origin!=="string"||typeof Z.active!=="boolean"||Z.workspaceRoot!==void 0&&typeof Z.workspaceRoot!=="string")return null;Y.push({membershipId:Z.membershipId,roomId:Z.roomId,origin:Z.origin,active:Z.active,...typeof Z.workspaceRoot==="string"?{workspaceRoot:Z.workspaceRoot}:{}})}J.push({label:Q.label,identityId:Q.identityId,pubkey:Q.pubkey,memberships:Y})}return J}function m0($,J){return{mid:J.membershipId,roomId:J.roomId,origin:J.origin,participantId:$.identityId,profileLabel:$.label}}function uJ($,J){let Q=J===null?void 0:$.find((Y)=>Y.label===J||Y.identityId===J);if(Q!==void 0){let Y=Q.memberships.find((Z)=>Z.active)??Q.memberships[0];if(Y!==void 0)return m0(Q,Y)}for(let Y of $){if(Y===Q)continue;let Z=Y.memberships.find((X)=>X.active);if(Z!==void 0)return m0(Y,Z)}for(let Y of $){let Z=Y.memberships[0];if(Z!==void 0)return m0(Y,Z)}return null}var I0=null,G0=null,Z0=!1,dJ=3000,w0=null,U0=null,D8=!1;function W$(){if(w0!==null)window.clearInterval(w0),w0=null;U0?.abort(),U0=null}function F8(){D8=!0,W$(),w0=window.setInterval(()=>{if(U0!==null){U0.abort(),C$("manager-unreachable");return}let $=new AbortController;U0=$,u("/api/health",{cache:"no-store",signal:$.signal}).catch(()=>{}).finally(()=>{if(U0===$)U0=null})},dJ)}function T8($){if($.persisted&&D8&&!Z0)F8()}function W8($){if(W$(),$.persisted)return;window.removeEventListener("pagehide",W8),window.removeEventListener("pageshow",T8)}window.addEventListener("pagehide",W8);window.addEventListener("pageshow",T8);var iJ={"missing-credential":{title:"This tab is missing its launch credential",happened:"The base manager URL is not enough to authenticate a new browser tab.",recovery:"Check the manager, then mint a fresh link and paste the complete URL into this tab. Do not restart a healthy manager just to add a screen.",commands:["mesh ui --status","mesh ui --no-open --print"],scope:"Launch URLs are sensitive, single-use, and expire after two minutes. Do not share them."},"credential-rejected":{title:"This launch link is expired or already used",happened:"The one-time launch credential was rejected. Restarting the manager is unnecessary.",recovery:"Check that the shared manager is running, then mint a new link and paste the complete URL into this tab. Do not restart a healthy manager.",commands:["mesh ui --status","mesh ui --no-open --print"],scope:"Each browser, screen, or agent needs its own freshly minted link; established tabs keep their existing sessions."},"session-invalidated":{title:"This tab’s session was invalidated",happened:"The machine-wide manager was stopped or restarted, so every tab attached to its previous session is now invalid.",recovery:"Check status first. If the manager is running, mint a fresh link. Restart only when status reports stopped or stale ownership.",commands:["mesh ui --status","mesh ui --no-open --print","mesh ui --restart --no-open --print"],scope:"One manager serves every browser, screen, profile, and agent on this machine. Stop and restart affect all of them."},"manager-unreachable":{title:"The local manager cannot be reached",happened:"This tab could not contact the loopback manager. The process may be stopped, stale, or unhealthy.",recovery:"Inspect status first. If running, mint a fresh link. If stopped or stale, start or restart only as status directs. Use stop only for an intentional machine-wide shutdown; an unhealthy owner needs the PID and last-resort guidance printed by status.",commands:["mesh ui --status","mesh ui --stop","mesh ui --no-open --print","mesh ui --restart --no-open --print"],scope:"One machine-wide manager serves every screen. Manual process termination is a last resort; remove runtime lock files only after confirming no owner is alive."}};function C$($){if(Z0)return;Z0=!0,W$(),G0?.(),G0=null,I0?.stop(),I0=null,E(q0),E(p0),E(H),H.className="session-ended",H.setAttribute("role","alert");let J=iJ[$];H.appendChild(j("h1","",J.title)),H.appendChild(j("h2","","What happened")),H.appendChild(j("p","",J.happened)),H.appendChild(j("h2","","Recover safely")),H.appendChild(j("p","",J.recovery));for(let Q of J.commands){let Y=document.createElement("pre");Y.appendChild(j("code","",Q)),H.appendChild(Y)}H.appendChild(j("h2","","Shared-manager scope")),H.appendChild(j("p","",J.scope))}function oJ($){C$($)}J8(oJ);function lJ($){if(Z0)return;G0?.(),G0=null,I0?.stop(),I0=null,E(q0),E(p0),H.className="",H.setAttribute("role","alert"),H.textContent=`Room inventory unavailable — ${$}. Reload the page to retry, or run mesh ui again.`}function rJ(){G0?.(),G0=null,E(q0),E(p0),H.className="empty-state",H.removeAttribute("role"),H.textContent="No rooms yet — run mesh keygen, then mesh join, then reload this page."}async function tJ($){try{let J=new Headers({"Content-Type":"application/json"});J.set("X-Mesh-UI","1");let Q=await fetch("/api/session",{method:"POST",headers:J,body:JSON.stringify({token:$})});if(Q.ok)return"ok";return Q.status===401?"credential-rejected":"manager-unreachable"}catch{return"manager-unreachable"}}async function sJ(){let $=await u("/api/inventory"),J;try{J=await $.json()}catch{throw Error("invalid broker response for room inventory")}if(!nJ(J))throw Error("invalid broker response for room inventory");if(J.availability!=="ok")throw Error(J.error??"room inventory scan failed");if(!$.ok)throw Error(`room inventory failed with HTTP ${$.status}`);let Q=hJ(J.data);if(Q===null)throw Error("invalid broker response for room inventory");return Q}async function aJ(){if(H.className="loading-state",H.removeAttribute("role"),H.textContent="Loading room inventory — please wait.",O8.kind==="token"){let F=await tJ(O8.value);if(F!=="ok"){C$(F);return}}let $;try{$=await sJ()}catch(F){if(F instanceof l||F instanceof r)return;lJ(F instanceof Error?F.message:"room inventory request failed");return}if(Z0)return;F8();let J=new URLSearchParams(location.search).get("focus"),Q=uJ($,J);if(Q===null){rJ();return}let Y=J===null?void 0:$.find((F)=>F.label===J||F.identityId===J),Z=Y?.memberships.some((F)=>F.membershipId===Q.mid)===!0?Y.label:void 0;E(H),H.className="layout-manager",H.removeAttribute("role");let X=document.createElement("nav");X.className="rooms-pane",X.setAttribute("aria-label","Rooms");let z=document.createElement("main");z.className="room-pane";let N=document.createElement("aside");N.className="local-pane",N.setAttribute("aria-label","Local workspace"),H.append(X,z,N);let G=q8(z);I0=G;let q=new Map;for(let F of $)for(let M of F.memberships)q.set(M.membershipId,m0(F,M));let U=0,K=null,D=()=>{U+=1,K?.abort(),K=null};G0=D;let O=(F)=>{D();let M=U,T=new AbortController;K=T,A0(N,{availability:"loading",source:"local",data:null}),(async()=>{try{let L=await u(`/api/memberships/${encodeURIComponent(F)}/status`,{signal:T.signal}),f;try{f=await L.json()}catch{f=null}if(M!==U||T.signal.aborted||Z0)return;A0(N,L.ok?S0(f):S0(null))}catch(L){if(M!==U||T.signal.aborted||Z0||L instanceof l||L instanceof r)return;A0(N,S0(null))}finally{if(M===U&&K===T)K=null}})()},C=null,V=(F,M)=>{let T=q.get(F);if(T===void 0||Z0)return;if(C?.setActive(F),E(q0),M!==void 0)q0.appendChild(j("span","label",`Profile: ${M}`));q0.appendChild(j("span","label","Acting as")),q0.appendChild(document.createTextNode(` ${T.profileLabel} · ${T.participantId}`)),p0.textContent=`${T.roomId} · ${T.origin}`,G.switchTo(F,T.roomId,T.participantId),O(F)};C=G8(X,$,V),V(Q.mid,Z)}aJ();export{uJ as pickInitialMembership};\n';
var UI_APP_JS_HASH = "e65b6a5636ebf9cb29dd56b738ed8fcc7bf7780d3cb9b3fc11f1fc45597e88cf";

// ../web-core/src/styles.ts
var SHARED_UI_CSS = `
  :root {
    --bg: #0b0d10; --panel: #14171c; --panel2: #1b1f26; --line: #262b33;
    --fg: #e6e9ee; --muted: #8b95a3; --accent: #58a6ff;
    --good: #3fb950; --warn: #d29922; --lock: #7d8590;
    --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  .card {
    background: var(--panel); border: 1px solid var(--line); border-radius: 10px;
    padding: 16px 18px; margin-bottom: 18px;
  }
  .idrow { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .avatar {
    width: 40px; height: 40px; border-radius: 8px; flex: none;
    display: grid; place-items: center; font-weight: 700; font-size: 18px;
    background: var(--panel2); color: var(--accent); border: 1px solid var(--line);
  }
  .idmain { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .idmain .name { font-weight: 600; font-family: var(--mono); }
  .idmain .sub { color: var(--muted); font-size: 12.5px; }
  .badges { display: flex; gap: 6px; flex-wrap: wrap; margin-left: auto; }
  .badge {
    font-size: 11px; font-family: var(--mono); padding: 2px 8px; border-radius: 999px;
    background: var(--panel2); border: 1px solid var(--line); color: var(--muted);
  }
  .badge.member { color: var(--good); border-color: #1c3b24; }
  .badge.public { color: var(--warn); border-color: #3d3211; }
  .pubkey { font-family: var(--mono); font-size: 11.5px; color: var(--muted); word-break: break-all; }
  .toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; margin: 6px 2px 6px; }
  .toolbar .count { color: var(--muted); font-size: 12.5px; }
  .seg { display: inline-flex; align-items: center; gap: 3px; }
  .seg-label { color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: .5px; margin-right: 2px; }
  .seg-btn {
    background: var(--panel2); border: 1px solid var(--line); color: var(--muted);
    font: 11.5px var(--mono); padding: 2px 9px; border-radius: 6px; cursor: pointer;
  }
  .seg-btn:hover { color: var(--fg); }
  .seg-btn.active { color: var(--accent); border-color: var(--accent); }
  .spacer { margin-left: auto; }
  .legend { display: flex; flex-wrap: wrap; gap: 6px 16px; color: var(--muted); font: 11.5px var(--mono); margin: 0 2px 10px; }
  button.link {
    background: none; border: none; color: var(--accent); cursor: pointer;
    font-size: 12.5px; padding: 2px 4px;
  }
  button.link:hover { text-decoration: underline; }
  .files-pane { min-width: 0; } /* shared: both room-view-page.ts's 2-col grid AND the manager's 3-col grid wrap renderFilesPane's output in this class */
  .tree { font-family: var(--mono); font-size: 13px; }
  .row {
    display: flex; align-items: center; gap: 8px; padding: 3px 6px; border-radius: 6px;
    white-space: nowrap;
  }
  .row:hover { background: var(--panel2); }
  .row .twist { width: 12px; color: var(--muted); flex: none; text-align: center; user-select: none; }
  .row.dir { cursor: pointer; }
  .row.dir .nm { color: var(--fg); font-weight: 600; }
  .row.file .nm { color: #c9d1d9; }
  .row .icon { flex: none; opacity: .8; }
  .row .nm { overflow: hidden; text-overflow: ellipsis; }
  .row .meta { margin-left: auto; display: flex; gap: 12px; align-items: center; color: var(--muted); font-size: 11.5px; }
  .row .meta .cnt, .row .meta .sz { white-space: nowrap; }
  .row .meta .lease { color: var(--warn); }
  .row .meta .lock { color: var(--lock); }
  .children { margin-left: 16px; border-left: 1px solid var(--line); padding-left: 2px; }
  .children.collapsed { display: none; }
  .list { font-family: var(--mono); font-size: 13px; }
  .list .row .nm.path { color: #c9d1d9; }
  .list .row .icon { margin-right: 2px; }
  .empty, .msg { color: var(--muted); padding: 20px 4px; }
  .msg.err { color: #f85149; }
  a { color: var(--accent); }
  .feed-pane { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
  .feed-toolbar {
    display: flex; align-items: center; gap: 10px; padding: 8px 12px;
    border-bottom: 1px solid var(--line); font-size: 12px; color: var(--muted);
  }
  .feed-toggle { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
  .feed { flex: 1 1 auto; overflow-y: auto; padding: 10px 12px; display: flex; flex-direction: column; gap: 10px; }
  .feed-row { font-size: 13px; }
  .feed-row-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; font-family: var(--mono); font-size: 11.5px; }
  .feed-seq { color: var(--muted); }
  .feed-sender { color: var(--fg); font-weight: 600; }
  .feed-perf { color: var(--accent); }
  .feed-chip {
    background: var(--panel2); border: 1px solid var(--line); border-radius: 999px;
    padding: 1px 7px; color: var(--muted); font-size: 10.5px;
  }
  .feed-time { margin-left: auto; color: var(--muted); }
  .feed-body { margin-top: 2px; white-space: pre-wrap; word-break: break-word; }
  .composer-pane { border-top: 1px solid var(--line); padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
  .composer-select {
    background: var(--panel2); border: 1px solid var(--line); color: var(--fg);
    border-radius: 6px; padding: 4px 8px; font-size: 16px;
  }
  .composer-select:hover { border-color: var(--accent); }
  .composer-select:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
  .composer-form { display: flex; flex-direction: column; gap: 6px; }
  .composer-msg-row { display: flex; }
  .composer-msg-input, .composer-field input, .composer-field select {
    flex: 1; background: var(--panel2); border: 1px solid var(--line); color: var(--fg);
    border-radius: 6px; padding: 6px 9px; font-size: 16px;
  }
  .composer-msg-input:hover, .composer-field input:hover, .composer-field select:hover { border-color: var(--accent); }
  .composer-msg-input:focus-visible, .composer-field input:focus-visible, .composer-field select:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 1px;
  }
  .composer-field { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--muted); }
  .composer-hint { padding: 8px 2px; }
  .composer-error { padding: 4px 2px; font-size: 12.5px; }
`;

// src/ui/shell-page.ts
var UI_SHELL_CSP = "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'";
var MANAGER_UI_CSS = `${SHARED_UI_CSS}
  :root { --mono: "SF Mono", Menlo, Consolas, monospace; }
  body { font-size: 16px; }

  .topbar {
    display: flex; align-items: center; gap: 14px; min-height: 49px; padding: 10px 16px;
    border-bottom: 1px solid var(--line); background: var(--panel);
  }
  .topbar .brand { font-weight: 700; letter-spacing: .5px; white-space: nowrap; }
  .topbar .brand b { color: var(--accent); }
  .topbar .identity { color: var(--fg); font-family: var(--mono); font-size: 13px; }
  .topbar .identity .label { color: var(--muted); margin-right: 4px; }
  .topbar .room-context {
    margin-left: auto; color: var(--muted); font-family: var(--mono); font-size: 12.5px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  #app.layout-manager {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr) 320px;
    grid-template-rows: 1fr;
    height: calc(100vh - 49px);
  }
  #app.loading-state { padding: 24px 16px; color: var(--muted); font-family: var(--mono); }
  .pane-heading {
    font-size: 12px; text-transform: uppercase; letter-spacing: .6px; color: var(--muted);
    padding: 12px 14px 8px; border-bottom: 1px solid var(--line);
  }
  h2.pane-heading { margin: 0; font-weight: 600; line-height: 1.5; }
  .rooms-pane, .local-pane { overflow-y: auto; min-height: 0; }
  .rooms-pane { border-right: 1px solid var(--line); }
  .room-pane {
    display: flex; flex-direction: column; overflow-y: auto; min-height: 0; min-width: 0;
  }
  .local-pane { border-left: 1px solid var(--line); padding: 0 14px 14px; }
  .conversation-pane { display: flex; flex-direction: column; min-height: 0; flex: 1 1 auto; }
  .feed-failure {
    padding: 8px 12px; color: var(--warn); font-size: 12px; border-top: 1px solid var(--line);
  }

  .sidebar-group { padding: 12px 14px 4px; }
  .sidebar-group + .sidebar-group { border-top: 1px solid var(--line); margin-top: 8px; }
  .sidebar-group-label {
    display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0 0 8px;
    font-family: var(--mono);
  }
  .sidebar-profile-name { color: var(--fg); font-size: 13px; font-weight: 700; }
  .sidebar-profile-identity { color: var(--muted); font-size: 11px; font-weight: 400; }
  .sidebar-row {
    display: flex; align-items: center; width: 100%; min-block-size: 44px; min-width: 0;
    padding: 4px 8px; border: none; background: none; color: var(--fg);
    font: 13px var(--mono); text-align: left; cursor: pointer;
  }
  .sidebar-room-context { display: flex; flex: 1 1 auto; flex-direction: column; gap: 2px; min-width: 0; }
  .sidebar-room-id, .sidebar-room-origin {
    display: block; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .sidebar-room-id { color: currentColor; font-weight: 600; }
  .sidebar-room-origin { color: var(--muted); font-size: 11px; font-weight: 400; }
  .sidebar-row:hover { background: var(--panel2); }
  .sidebar-row[aria-current="true"] { background: var(--panel2); color: var(--accent); font-weight: 600; }
  .sidebar-row:focus-visible, button:focus-visible, a:focus-visible, [tabindex]:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 2px;
  }
  .sidebar-row:focus-visible { outline-offset: -2px; }


  .room-pane .toolbar .seg-btn,
  .room-pane .toolbar button.link,
  .room-pane .feed-toggle,
  .room-pane .composer-select,
  .room-pane .composer-msg-input,
  .room-pane .composer-field input,
  .room-pane .composer-field select,
  .room-pane .composer-form button.link {
    min-block-size: 44px; min-inline-size: 44px;
  }
  .room-pane .composer-msg-row { flex-direction: column; gap: 4px; }
  .room-pane .composer-control-label {
    color: var(--fg); font-size: 13px; font-weight: 600; line-height: 1.4;
  }
  .local-card {
    background: var(--panel); border: 1px solid var(--line); border-radius: 8px;
    padding: 10px 12px; margin: 12px 0; font-size: 12.5px; color: var(--fg);
  }
  .local-card h3 {
    margin: 0 0 6px; font-size: 11px; text-transform: uppercase;
    letter-spacing: .5px; color: var(--muted);
  }
  .daemon-card { margin-top: 0; }
  .local-card-row { display: flex; gap: 8px; padding: 2px 0; font-family: var(--mono); font-size: 12px; }
  .local-card dl { margin: 0; }
  .local-card-row dt { min-width: 92px; color: var(--muted); }
  .local-card-row dd { margin: 0; overflow-wrap: anywhere; }
  .source-label { color: var(--muted); font-family: var(--mono); font-size: 11px; padding: 10px 0 4px; }
  .fs-status-table { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .status-row { display: flex; align-items: baseline; gap: 8px; padding: 3px 0; font-family: var(--mono); font-size: 12.5px; }
  .status-row .glyph { width: 14px; text-align: center; color: var(--muted); flex: none; }
  .status-row .path { color: var(--fg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .status-row .detail { color: var(--muted); font-size: 11px; }

  .empty-state { color: var(--muted); padding: 20px 14px; font-size: 13px; line-height: 1.6; }
  .empty-state code { font-family: var(--mono); color: var(--fg); }
  [role="alert"] { color: #f85149; padding: 10px 14px; font-size: 12.5px; }
  .session-ended[role="alert"] {
    max-width: 720px; margin: 0 auto; padding: 48px 32px 64px;
    color: var(--fg); font-size: 13px; line-height: 1.65;
  }
  .session-ended h1 {
    margin: 0 0 28px; max-width: 28ch; color: #f85149;
    font-size: 24px; line-height: 1.25; letter-spacing: -.01em; text-wrap: balance;
  }
  .session-ended h2 {
    margin: 24px 0 6px; color: var(--muted); font-size: 13px; line-height: 1.4;
  }
  .session-ended p { margin: 0; max-width: 70ch; text-wrap: pretty; }
  .session-ended pre {
    margin: 10px 0 0; padding: 10px 12px; overflow-x: auto;
    border: 1px solid var(--line); border-radius: 6px; background: var(--panel);
  }
  .session-ended pre + pre { margin-top: 6px; }
  .session-ended code { font-family: var(--mono); color: var(--accent); }
  [aria-live] { position: relative; }

  @media (min-width: 880px) and (max-width: 1279px) {
    #app.layout-manager {
      grid-template-columns: 240px minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr) 240px;
    }
    .local-pane {
      grid-column: 1 / -1; border-left: none; border-top: 1px solid var(--line);
    }
  }

  @media (max-width: 879px) {
    #app.layout-manager { display: block; height: auto; min-height: calc(100vh - 49px); }
    .rooms-pane { border-right: none; border-bottom: 1px solid var(--line); }
    .local-pane { border-left: none; }
    .session-ended[role="alert"] { padding: 32px 18px 48px; }
  }
`;
var UI_SHELL_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>mesh — local manager</title>
<style>
${MANAGER_UI_CSS}
</style>
</head>
<body>
<header class="topbar"><span class="brand"><b>mesh</b> local</span><span id="identity-context" class="identity"></span><span id="room-context" class="room-context"></span></header>
<div id="app"></div>
<script type="module" src="/ui-assets/app.js?v=${UI_APP_JS_HASH}"></script>
</body>
</html>`;

// src/ui/server.ts
function buildLaunchUrl(origin, token, focus) {
  const focusQuery = focus === undefined ? "" : `focus=${encodeURIComponent(focus)}&`;
  const navigationNonce = randomBytes4(16).toString("hex");
  return `${origin}?${focusQuery}launch=${navigationNonce}#s=${token}`;
}
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}
function readJsonBody(req) {
  const { promise, resolve: resolve7, reject } = Promise.withResolvers();
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    if (chunks.length === 0) {
      resolve7({});
      return;
    }
    try {
      resolve7(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
  req.on("error", reject);
  return promise;
}
function isSessionBody(body) {
  return typeof body === "object" && body !== null && !Array.isArray(body) && "token" in body && typeof body.token === "string";
}
function matchesCapability(actual, expected) {
  if (typeof actual !== "string")
    return false;
  const actualBytes = Buffer.from(actual, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}
function isControlLaunchBody(body, isValidFocus) {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return false;
  const candidate = body;
  if (!Number.isInteger(candidate.requestedPort) || candidate.requestedPort < 0 || candidate.requestedPort > 65535) {
    return false;
  }
  return candidate.focus === undefined || typeof candidate.focus === "string" && isValidFocus(candidate.focus);
}
async function createBroker(opts) {
  const router = new Router;
  const sessions = new SessionStore;
  router.post("/api/session", async (req, res) => {
    let body;
    try {
      body = await readJsonBody(req);
    } catch {
      sendJson(res, 400, { error: "invalid_json_body" });
      return;
    }
    if (!isSessionBody(body)) {
      sendJson(res, 400, { error: "invalid_json_body" });
      return;
    }
    const requestCookie = extractCookie(req.headers.cookie ?? null, SESSION_COOKIE_NAME);
    const exchanged = sessions.exchangeLaunchToken(body.token);
    const cookie = exchanged ?? (sessions.isValidCookie(requestCookie) ? requestCookie : null);
    if (cookie === null) {
      sendJson(res, 401, { error: "invalid_or_expired_launch_token" });
      return;
    }
    res.setHeader("Set-Cookie", `${SESSION_COOKIE_NAME}=${cookie}; HttpOnly; SameSite=Strict; Path=/`);
    sendJson(res, 200, { ok: true });
  });
  const control = opts.control;
  if (control !== undefined) {
    router.post("/control/launch", async (req, res) => {
      if (!matchesCapability(req.headers["x-mesh-ui-control"], control.capability)) {
        sendJson(res, 401, { error: "invalid_control_capability" });
        return;
      }
      let body;
      try {
        body = await readJsonBody(req);
      } catch {
        sendJson(res, 400, { error: "invalid_json_body" });
        return;
      }
      if (!isControlLaunchBody(body, control.isValidFocus)) {
        sendJson(res, 400, { error: "invalid_json_body" });
        return;
      }
      const address2 = server.address();
      const port2 = typeof address2 === "object" && address2 !== null ? address2.port : opts.port;
      if (body.requestedPort !== 0 && body.requestedPort !== port2) {
        sendJson(res, 409, {
          error: "port_conflict",
          liveOrigin: `http://127.0.0.1:${port2}/`
        });
        return;
      }
      const token = sessions.mintLaunch();
      sendJson(res, 200, {
        launchUrl: buildLaunchUrl(`http://127.0.0.1:${port2}/`, token, body.focus)
      });
    });
    router.post("/control/status", (req, res) => {
      if (!matchesCapability(req.headers["x-mesh-ui-control"], control.capability)) {
        sendJson(res, 401, { error: "invalid_control_capability" });
        return;
      }
      sendJson(res, 200, { ok: true });
    });
    router.post("/control/stop", (req, res) => {
      if (!matchesCapability(req.headers["x-mesh-ui-control"], control.capability)) {
        sendJson(res, 401, { error: "invalid_control_capability" });
        return;
      }
      res.once("finish", () => {
        try {
          control.onStop();
        } catch {}
      });
      sendJson(res, 200, { ok: true });
    });
  }
  router.get("/api/health", (_req, res) => {
    res.writeHead(204);
    res.end();
  });
  router.get("/api/inventory", (_req, res) => {
    sendJson(res, 200, buildInventory(opts.registryDir));
  });
  const membershipResolver = createMembershipResolver(opts.registryDir);
  const resolverSeam = { resolveMembershipForTest: membershipResolver.resolve };
  registerRoomRoutes(router, opts.registryDir, resolverSeam);
  const roomHub = new RoomHub;
  const eventsRoute = registerEventsRoute(router, roomHub, opts.registryDir, resolverSeam);
  registerPostRoute(router, opts.registryDir, resolverSeam);
  registerStatusRoute(router, opts.registryDir, resolverSeam);
  router.get("/", (_req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": UI_SHELL_CSP,
      "Cache-Control": "no-cache"
    });
    res.end(UI_SHELL_HTML);
  });
  router.get("/ui-assets/app.js", (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const versionMatches = url.searchParams.get("v") === UI_APP_JS_HASH;
    const etag = `"${UI_APP_JS_HASH}"`;
    const headers = {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": versionMatches ? "public, max-age=31536000, immutable" : "no-cache",
      ETag: etag
    };
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, headers);
      res.end();
      return;
    }
    res.writeHead(200, headers);
    res.end(UI_APP_JS);
  });
  const server = createServer((req, res) => {
    handleRequest(req, res);
  });
  const sockets = new Set;
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  async function handleRequest(req, res) {
    try {
      const address2 = server.address();
      const boundPort = typeof address2 === "object" && address2 !== null ? address2.port : opts.port;
      const hostCheck = checkHost(req.headers.host ?? null, `127.0.0.1:${boundPort}`);
      if (!hostCheck.ok) {
        sendJson(res, hostCheck.status ?? 403, {
          error: hostCheck.rule,
          ...hostCheck.hint !== undefined ? { hint: hostCheck.hint } : {}
        });
        return;
      }
      const url = new URL(req.url ?? "/", `http://127.0.0.1:${boundPort}`);
      const method = req.method ?? "GET";
      const match = router.match(method, url.pathname);
      if (match === null) {
        sendJson(res, 404, { error: "not_found" });
        return;
      }
      const isSessionRoute = url.pathname === "/api/session";
      const isApiRoute = url.pathname.startsWith("/api/");
      if (isApiRoute && !isSessionRoute) {
        const cookie = extractCookie(req.headers.cookie ?? null, SESSION_COOKIE_NAME);
        if (!sessions.isValidCookie(cookie)) {
          sendJson(res, 401, { error: cookie === null ? "missing_cookie" : "invalid_cookie" });
          return;
        }
      }
      if (url.pathname.startsWith("/control/")) {
        if (req.headers.origin !== undefined) {
          sendJson(res, 403, { error: "origin" });
          return;
        }
        if (req.headers["x-mesh-ui"] !== "1") {
          sendJson(res, 403, { error: "x-mesh-ui" });
          return;
        }
      } else {
        const stateCheck = checkStateChanging(method, req.headers.origin ?? null, req.headers["x-mesh-ui"] ?? null, `http://127.0.0.1:${boundPort}`);
        if (!stateCheck.ok) {
          sendJson(res, stateCheck.status ?? 403, {
            error: stateCheck.rule,
            ...stateCheck.hint !== undefined ? { hint: stateCheck.hint } : {}
          });
          return;
        }
      }
      await match.handler(req, res, match.params);
    } catch {
      if (!res.headersSent) {
        sendJson(res, 500, { error: "internal_error" });
      } else {
        res.destroy();
      }
    }
  }
  const listening = Promise.withResolvers();
  server.once("error", listening.reject);
  server.listen(opts.port, "127.0.0.1", () => {
    server.removeListener("error", listening.reject);
    listening.resolve();
  });
  await listening.promise;
  const address = server.address();
  const port = typeof address === "object" && address !== null ? address.port : opts.port;
  return {
    port,
    router,
    sessions,
    close() {
      eventsRoute.dispose();
      const { promise, resolve: resolve7, reject } = Promise.withResolvers();
      server.close((error) => error ? reject(error) : resolve7());
      for (const socket of sockets)
        socket.destroy();
      return promise;
    }
  };
}

// src/ui-runtime.ts
import { createHash as createHash3, randomBytes as randomBytes5 } from "node:crypto";
import {
  closeSync,
  fchmodSync,
  fstatSync,
  linkSync,
  mkdirSync as mkdirSync6,
  openSync,
  readFileSync as readFileSync11,
  readdirSync as readdirSync6,
  renameSync as renameSync2,
  rmSync as rmSync5,
  statSync as statSync3,
  writeFileSync as writeFileSync5
} from "node:fs";
import { dirname as dirname8, join as join12 } from "node:path";
import { setTimeout as sleepTimer } from "node:timers/promises";
var LOCK_FILE = "ui.lock";
var RUNTIME_FILE = "ui-runtime.json";
var DEFAULT_WAIT_MS = 3000;
var DEFAULT_POLL_MS = 50;
var RECLAIM_CLAIM_PREFIX = ".ui-reclaim-";
var RECLAIM_TAKEOVER_PREFIX = ".ui-reclaim-takeover-";
var RECLAIM_CLAIM_NAME = /^\.ui-reclaim-[0-9a-f]{16}$/;
var RECLAIM_TAKEOVER_NAME = /^\.ui-reclaim-takeover-[1-9][0-9]*-[0-9a-f]{16}(?:\.pulse-[0-9a-f]{16})?$/;
var HEX_64 = /^[0-9a-f]{64}$/;

class UiPortConflictError extends Error {
  requestedPort;
  liveOrigin;
  constructor(requestedPort, liveOrigin) {
    super(`UI port ${requestedPort} conflicts with the running UI at ${liveOrigin}`);
    this.requestedPort = requestedPort;
    this.liveOrigin = liveOrigin;
    this.name = "UiPortConflictError";
  }
}

class UiRuntimeVersionError extends Error {
  foundVersion;
  statePath;
  constructor(foundVersion, statePath) {
    super(`UI runtime state version ${foundVersion} is incompatible; stop all mesh UI processes and restart with one version`);
    this.foundVersion = foundVersion;
    this.statePath = statePath;
    this.name = "UiRuntimeVersionError";
  }
}

class UiRuntimeStateError extends Error {
  lockPath;
  recordPath;
  constructor(lockPath, recordPath) {
    super(`Unable to safely determine UI runtime ownership; inspect ${lockPath} and ${recordPath}`);
    this.lockPath = lockPath;
    this.recordPath = recordPath;
    this.name = "UiRuntimeStateError";
  }
}

class UiRuntimeStartingError extends Error {
  lock;
  constructor(lock) {
    super(`UI manager owner ${lock.pid} is still starting`);
    this.lock = lock;
    this.name = "UiRuntimeStartingError";
  }
}
function runtimePaths(dir = machineDir()) {
  return { dir, lock: join12(dir, LOCK_FILE), record: join12(dir, RUNTIME_FILE) };
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function readJson(path7) {
  let text;
  try {
    text = readFileSync11(path7, "utf8");
  } catch (error) {
    if (error.code === "ENOENT")
      return { kind: "absent" };
    return { kind: "malformed" };
  }
  try {
    const value = JSON.parse(text);
    if (!isObject(value))
      return { kind: "malformed" };
    if (typeof value.v === "number" && Number.isInteger(value.v) && value.v !== 2) {
      return { kind: "unsupported", version: value.v };
    }
    return { kind: "valid", value };
  } catch {
    return { kind: "malformed" };
  }
}
function parseLock(path7) {
  const parsed = readJson(path7);
  if (parsed.kind !== "valid")
    return parsed;
  const value = parsed.value;
  if (value.v !== 2 || typeof value.pid !== "number" || !Number.isSafeInteger(value.pid) || value.pid <= 0 || typeof value.ownerNonce !== "string" || value.ownerNonce.length === 0 || typeof value.startedAt !== "number" || !Number.isFinite(value.startedAt)) {
    return { kind: "malformed" };
  }
  return {
    kind: "valid",
    value: { v: 2, pid: value.pid, ownerNonce: value.ownerNonce, startedAt: value.startedAt }
  };
}
function parseRecord(path7) {
  const parsed = readJson(path7);
  if (parsed.kind !== "valid")
    return parsed;
  const value = parsed.value;
  if (value.v !== 2 || typeof value.pid !== "number" || !Number.isSafeInteger(value.pid) || value.pid <= 0 || typeof value.ownerNonce !== "string" || value.ownerNonce.length === 0 || typeof value.startedAt !== "number" || !Number.isFinite(value.startedAt) || typeof value.origin !== "string" || !isHttpOrigin(value.origin) || typeof value.controlCapability !== "string" || !HEX_64.test(value.controlCapability)) {
    return { kind: "malformed" };
  }
  return {
    kind: "valid",
    value: {
      v: 2,
      pid: value.pid,
      ownerNonce: value.ownerNonce,
      startedAt: value.startedAt,
      origin: value.origin,
      controlCapability: value.controlCapability
    }
  };
}
function isHttpOrigin(value) {
  const match = /^http:\/\/127\.0\.0\.1:([0-9]{1,5})\/$/.exec(value);
  if (match === null)
    return false;
  const port = Number(match[1]);
  return port >= 1 && port <= 65535 && String(port) === match[1];
}
function recordsMatch(lock, record) {
  return lock.pid === record.pid && lock.ownerNonce === record.ownerNonce && lock.startedAt === record.startedAt;
}
function writeExclusiveLock(path7, lock, onCreated) {
  mkdirSync6(dirname8(path7), { recursive: true, mode: 448 });
  let fd;
  try {
    fd = openSync(path7, "wx", 384);
  } catch (error) {
    if (error.code === "EEXIST")
      return false;
    throw error;
  }
  let created = null;
  let closed = false;
  try {
    created = fstatSync(fd, { bigint: true });
    onCreated?.(path7);
    writeFileSync5(fd, JSON.stringify(lock) + `
`, "utf8");
    if (process.platform !== "win32")
      fchmodSync(fd, 384);
    closeSync(fd);
    closed = true;
    return true;
  } catch (error) {
    if (!closed) {
      try {
        closeSync(fd);
      } catch {}
    }
    if (created !== null) {
      try {
        const current = statBigInt(path7);
        if (current !== null && sameInode(current, created))
          rmSync5(path7);
      } catch {}
    }
    throw error;
  }
}
function writeReadyRecord(path7, record) {
  writePrivateFileAtomic(path7, JSON.stringify(record) + `
`);
}
function ownerNonceFromText(text) {
  try {
    const value = JSON.parse(text);
    return isObject(value) && typeof value.ownerNonce === "string" ? value.ownerNonce : undefined;
  } catch {
    return;
  }
}
function observeFileFence(path7, expectedNonce) {
  const before = statBigInt(path7);
  if (before === null)
    return null;
  let text;
  try {
    text = readFileSync11(path7, "utf8");
  } catch (error) {
    if (["ENOENT", "EISDIR"].includes(error.code ?? ""))
      return null;
    throw error;
  }
  const after = statBigInt(path7);
  if (after === null || !sameInode(before, after) || before.ctimeNs !== after.ctimeNs) {
    return null;
  }
  const ownerNonce = ownerNonceFromText(text);
  if (expectedNonce !== undefined && ownerNonce !== expectedNonce)
    return null;
  return {
    dev: after.dev,
    ino: after.ino,
    ctimeNs: after.ctimeNs,
    digest: createHash3("sha256").update(text).digest("hex"),
    ownerNonce
  };
}
function sameFence(left, right) {
  return left.dev === right.dev && left.ino === right.ino && left.ctimeNs === right.ctimeNs && left.digest === right.digest && left.ownerNonce === right.ownerNonce;
}
function claimFenceIsOldEnough(context, path7, fence) {
  const claimCtimeMs = Number(fence.ctimeNs / 1000000n);
  const epochNow = context.epochNow();
  if (epochNow - claimCtimeMs > context.waitMs) {
    context.futureClaimObservations.delete(path7);
    return true;
  }
  if (claimCtimeMs <= epochNow) {
    context.futureClaimObservations.delete(path7);
    return false;
  }
  const monotonicNow = context.monotonicNow();
  const observed = context.futureClaimObservations.get(path7);
  if (observed === undefined || !sameFence(observed.fence, fence)) {
    context.futureClaimObservations.set(path7, {
      fence: { ...fence },
      firstSeenMonotonicMs: monotonicNow
    });
    return false;
  }
  const unchangedForMs = monotonicNow - observed.firstSeenMonotonicMs;
  const observationMs = Math.max(context.pollMs, context.waitMs - context.pollMs);
  return monotonicNow < context.monotonicDeadlineMs && unchangedForMs > 0 && unchangedForMs >= observationMs;
}
function sameFenceIdentityAndContent(left, right) {
  return left.dev === right.dev && left.ino === right.ino && left.digest === right.digest && left.ownerNonce === right.ownerNonce;
}
function removeFencedPath(context, path7, expected, expectedNonce) {
  context.onBeforeUnlink?.(path7);
  const current = observeFileFence(path7, expectedNonce);
  if (current === null || !sameFence(current, expected))
    return false;
  try {
    rmSync5(path7);
    return true;
  } catch (error) {
    if (error.code === "ENOENT")
      return false;
    throw error;
  }
}
function createOwner(context) {
  const lock = {
    v: 2,
    pid: context.pid,
    ownerNonce: randomBytes5(32).toString("hex"),
    startedAt: context.epochNow()
  };
  const controlCapability = randomBytes5(32).toString("hex");
  if (!writeExclusiveLock(context.paths.lock, lock, context.onExclusiveLockCreated))
    return null;
  let closed = false;
  return {
    lock,
    controlCapability,
    publish(origin) {
      if (!isHttpOrigin(origin))
        throw new Error("UI runtime origin must be canonical loopback");
      const runtimeRecord = { ...lock, origin, controlCapability };
      writeReadyRecord(context.paths.record, runtimeRecord);
      return runtimeRecord;
    },
    close() {
      if (closed)
        return;
      closed = true;
      const readyFence = observeFileFence(context.paths.record, lock.ownerNonce);
      const ready = parseRecord(context.paths.record);
      if (ready.kind === "valid" && ready.value.ownerNonce === lock.ownerNonce && readyFence !== null) {
        removeFencedPath(context, context.paths.record, readyFence, lock.ownerNonce);
      }
      const lockFence = observeFileFence(context.paths.lock, lock.ownerNonce);
      const currentLock = parseLock(context.paths.lock);
      if (currentLock.kind === "valid" && currentLock.value.ownerNonce === lock.ownerNonce && lockFence !== null) {
        removeFencedPath(context, context.paths.lock, lockFence, lock.ownerNonce);
      }
    }
  };
}
function defaultPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}
function reclaimClaimPath(dir, staleNonce, observed) {
  const staleKey = `${staleNonce}:${observed.dev}:${observed.ino}`;
  return join12(dir, `${RECLAIM_CLAIM_PREFIX}${createHash3("sha256").update(staleKey).digest("hex").slice(0, 16)}`);
}
function sameInode(left, right) {
  return left.dev === right.dev && left.ino === right.ino;
}
function statBigInt(path7) {
  try {
    return statSync3(path7, { bigint: true });
  } catch (error) {
    if (error.code === "ENOENT")
      return null;
    throw error;
  }
}
function claimObservedStaleLock(context, claimPath, observed, staleNonce) {
  try {
    linkSync(context.paths.lock, claimPath);
  } catch (error) {
    if (error.code === "EEXIST")
      return { kind: "exists" };
    if (error.code === "ENOENT")
      return { kind: "changed" };
    throw error;
  }
  const fence = observeFileFence(claimPath, staleNonce);
  if (fence === null)
    return { kind: "changed" };
  const owned = { path: claimPath, fence };
  const current = statBigInt(context.paths.lock);
  if (current !== null && sameInode(fence, observed) && sameInode(current, fence)) {
    return { kind: "won", owned };
  }
  removeFencedPath(context, claimPath, fence, staleNonce);
  return { kind: "changed" };
}
function takeOverWedgedClaim(claimPath, takeoverPath) {
  try {
    renameSync2(claimPath, takeoverPath);
  } catch (error) {
    if (error.code === "ENOENT")
      return false;
    throw error;
  }
  return true;
}
function removeStaleReadyRecord(context, staleLock) {
  const fence = observeFileFence(context.paths.record);
  const ready = parseRecord(context.paths.record);
  if (ready.kind === "unsupported") {
    throw new UiRuntimeVersionError(ready.version, context.paths.record);
  }
  if (ready.kind === "absent")
    return true;
  if (fence === null)
    return false;
  if (ready.kind === "valid" && ready.value.ownerNonce !== staleLock.ownerNonce)
    return false;
  const expectedNonce = ready.kind === "valid" ? staleLock.ownerNonce : undefined;
  return removeFencedPath(context, context.paths.record, fence, expectedNonce);
}
function refreshOwnedLinkCtimes(ownedLinks, staleNonce) {
  for (const owned of ownedLinks) {
    const refreshed = observeFileFence(owned.path, staleNonce);
    if (refreshed === null || !sameFenceIdentityAndContent(refreshed, owned.fence))
      return false;
    owned.fence.ctimeNs = refreshed.ctimeNs;
  }
  return true;
}
function refreshOwnedLinks(context, reason, ownedLinks, staleNonce) {
  context.onBeforeFenceRefresh?.(reason, ownedLinks.map((owned) => owned.path));
  return refreshOwnedLinkCtimes(ownedLinks, staleNonce);
}
function removeOwnedLink(context, owned, staleNonce) {
  return removeFencedPath(context, owned.path, owned.fence, staleNonce);
}
function removeUniqueTakeoverLink(context, unique, staleNonce) {
  if (removeOwnedLink(context, unique, staleNonce))
    return true;
  const beforePulse = observeFileFence(unique.path, staleNonce);
  if (beforePulse === null || !sameFenceIdentityAndContent(beforePulse, unique.fence))
    return false;
  const pulsePath = `${unique.path}.pulse-${randomBytes5(8).toString("hex")}`;
  try {
    linkSync(unique.path, pulsePath);
  } catch {
    return false;
  }
  let pulse = null;
  try {
    const pulseFence = observeFileFence(pulsePath, staleNonce);
    const refreshedUnique = observeFileFence(unique.path, staleNonce);
    if (pulseFence === null || refreshedUnique === null || !sameFenceIdentityAndContent(refreshedUnique, unique.fence)) {
      return false;
    }
    unique.fence.ctimeNs = refreshedUnique.ctimeNs;
    pulse = { path: pulsePath, fence: pulseFence };
    if (!removeOwnedLink(context, unique, staleNonce))
      return false;
    if (!refreshOwnedLinks(context, "takeover-reservation-unlinked", [pulse], staleNonce)) {
      return false;
    }
    const removed = removeOwnedLink(context, pulse, staleNonce);
    if (removed)
      pulse = null;
    return removed;
  } finally {
    if (pulse !== null)
      removeOwnedLink(context, pulse, staleNonce);
  }
}
async function completeReclaim(context, staleLock, ownedLinks) {
  const primary = ownedLinks[0];
  if (primary === undefined)
    return null;
  const ownedNow = observeFileFence(primary.path, staleLock.ownerNonce);
  const current = statBigInt(context.paths.lock);
  if (ownedNow === null || !sameFence(ownedNow, primary.fence) || current === null || !sameInode(ownedNow, current)) {
    return null;
  }
  const reread = parseLock(context.paths.lock);
  if (reread.kind === "unsupported") {
    throw new UiRuntimeVersionError(reread.version, context.paths.lock);
  }
  if (reread.kind !== "valid" || reread.value.ownerNonce !== staleLock.ownerNonce || context.pidAlive(reread.value.pid) || context.monotonicNow() >= context.monotonicDeadlineMs) {
    return null;
  }
  if (!removeStaleReadyRecord(context, reread.value))
    return null;
  const lockFence = observeFileFence(context.paths.lock, staleLock.ownerNonce);
  if (lockFence === null || !sameInode(lockFence, primary.fence))
    return null;
  if (!removeFencedPath(context, context.paths.lock, lockFence, staleLock.ownerNonce))
    return null;
  if (!refreshOwnedLinks(context, "stale-lock-unlinked", ownedLinks, staleLock.ownerNonce))
    return null;
  await context.onStaleLockUnlinked?.();
  const owner = createOwner(context);
  if (owner === null)
    return null;
  try {
    await context.onFreshLockAcquired?.();
  } catch (error) {
    owner.close();
    throw error;
  }
  return owner;
}
function eligibleTakeoverFence(context, claimPath, staleLock, expected) {
  const claimFence = observeFileFence(claimPath, staleLock.ownerNonce);
  const claimLock = parseLock(claimPath);
  const current = statBigInt(context.paths.lock);
  const currentLock = parseLock(context.paths.lock);
  if (claimFence === null || expected !== undefined && !sameFence(claimFence, expected) || claimLock.kind !== "valid" || claimLock.value.ownerNonce !== staleLock.ownerNonce || current === null || !sameInode(claimFence, current) || currentLock.kind !== "valid" || currentLock.value.ownerNonce !== staleLock.ownerNonce || context.pidAlive(currentLock.value.pid)) {
    context.futureClaimObservations.delete(claimPath);
    return null;
  }
  return claimFenceIsOldEnough(context, claimPath, claimFence) ? claimFence : null;
}
async function tryTakeover(context, claimPath, staleLock) {
  const eligibleFence = eligibleTakeoverFence(context, claimPath, staleLock);
  if (eligibleFence === null)
    return null;
  await context.onTakeoverEligible?.();
  if (eligibleTakeoverFence(context, claimPath, staleLock, eligibleFence) === null)
    return null;
  const takeoverPath = join12(context.paths.dir, `${RECLAIM_TAKEOVER_PREFIX}${context.pid}-${randomBytes5(8).toString("hex")}`);
  if (!takeOverWedgedClaim(claimPath, takeoverPath))
    return null;
  let unique = null;
  let reservation = null;
  try {
    const renamed = statBigInt(takeoverPath);
    if (renamed === null || !sameInode(renamed, eligibleFence))
      return null;
    unique = {
      path: takeoverPath,
      fence: { ...eligibleFence, ctimeNs: renamed.ctimeNs }
    };
    const uniqueFence = observeFileFence(takeoverPath, staleLock.ownerNonce);
    if (uniqueFence === null || !sameFence(uniqueFence, unique.fence))
      return null;
    await context.onTakeoverRenamed?.();
    try {
      linkSync(takeoverPath, claimPath);
    } catch (error) {
      if (error.code === "EEXIST" || error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
    if (!refreshOwnedLinkCtimes([unique], staleLock.ownerNonce))
      return null;
    const reservationFence = observeFileFence(claimPath, staleLock.ownerNonce);
    if (reservationFence === null || !sameInode(unique.fence, reservationFence) || unique.fence.ctimeNs !== reservationFence.ctimeNs || !sameFenceIdentityAndContent(unique.fence, reservationFence)) {
      return null;
    }
    reservation = { path: claimPath, fence: reservationFence };
    return await completeReclaim(context, staleLock, [unique, reservation]);
  } finally {
    if (reservation !== null && removeOwnedLink(context, reservation, staleLock.ownerNonce) && unique !== null) {
      refreshOwnedLinks(context, "takeover-reservation-unlinked", [unique], staleLock.ownerNonce);
    }
    if (unique !== null)
      removeUniqueTakeoverLink(context, unique, staleLock.ownerNonce);
  }
}
async function reclaimStaleLock(context, staleLock) {
  const observed = statBigInt(context.paths.lock);
  if (observed === null)
    return null;
  const claimPath = reclaimClaimPath(context.paths.dir, staleLock.ownerNonce, observed);
  const claim = claimObservedStaleLock(context, claimPath, observed, staleLock.ownerNonce);
  if (claim.kind === "changed")
    return null;
  if (claim.kind === "exists")
    return tryTakeover(context, claimPath, staleLock);
  try {
    await context.onReclaimClaimed?.();
    return await completeReclaim(context, staleLock, [claim.owned]);
  } finally {
    removeOwnedLink(context, claim.owned, staleLock.ownerNonce);
  }
}
function cleanOldNonAliasingClaims(context) {
  let names;
  try {
    names = readdirSync6(context.paths.dir);
  } catch (error) {
    if (error.code === "ENOENT")
      return [];
    throw error;
  }
  const lockStat = statBigInt(context.paths.lock);
  const deferredAliasing = [];
  for (const name of names) {
    if (!RECLAIM_CLAIM_NAME.test(name) && !RECLAIM_TAKEOVER_NAME.test(name))
      continue;
    const path7 = join12(context.paths.dir, name);
    const fence = observeFileFence(path7);
    const claimLock = parseLock(path7);
    if (fence === null || claimLock.kind !== "valid" || context.pidAlive(claimLock.value.pid)) {
      context.futureClaimObservations.delete(path7);
      continue;
    }
    if (!claimFenceIsOldEnough(context, path7, fence))
      continue;
    if (lockStat !== null && sameInode(fence, lockStat)) {
      deferredAliasing.push({ path: path7, fence });
      continue;
    }
    removeFencedPath(context, path7, fence, claimLock.value.ownerNonce);
  }
  return deferredAliasing;
}
function cleanDeferredReclaimArtifacts(context, deferred) {
  const lockStat = statBigInt(context.paths.lock);
  for (const expected of deferred) {
    const current = observeFileFence(expected.path, expected.fence.ownerNonce);
    const claimLock = parseLock(expected.path);
    if (current === null || !sameFenceIdentityAndContent(current, expected.fence) || lockStat !== null && sameInode(current, lockStat) || claimLock.kind !== "valid" || context.pidAlive(claimLock.value.pid)) {
      continue;
    }
    removeFencedPath(context, expected.path, current, claimLock.value.ownerNonce);
  }
}
function contentTypeIsJson(response) {
  return response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}
function safeJson(response) {
  return response.json().catch(() => null);
}
function validLaunchUrl(value, origin, focus) {
  if (typeof value !== "string")
    return false;
  const queryAt = value.indexOf("?");
  const fragmentAt = value.indexOf("#");
  const suffixAt = queryAt === -1 ? fragmentAt : fragmentAt === -1 ? queryAt : Math.min(queryAt, fragmentAt);
  if (value.slice(0, suffixAt === -1 ? value.length : suffixAt) !== origin)
    return false;
  try {
    const expected = new URL(origin);
    const launch = new URL(value);
    if (launch.protocol !== expected.protocol || launch.hostname !== expected.hostname || launch.port !== expected.port || launch.pathname !== expected.pathname || launch.username !== "" || launch.password !== "" || !/^#s=[0-9a-f]{64}$/.test(launch.hash)) {
      return false;
    }
    const launchNonce = launch.searchParams.get("launch");
    if (!/^[0-9a-f]{32}$/.test(launchNonce ?? ""))
      return false;
    if (focus === undefined)
      return launch.searchParams.size === 1;
    return launch.searchParams.size === 2 && launch.searchParams.get("focus") === focus;
  } catch {
    return false;
  }
}
async function requestExistingLaunch(context, record) {
  if (context.monotonicNow() >= context.monotonicDeadlineMs)
    return null;
  const remainingMs = Math.max(1, Math.floor(context.monotonicDeadlineMs - context.monotonicNow()));
  let response;
  try {
    response = await context.fetchImpl(new URL("/control/launch", record.origin), {
      method: "POST",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        "X-Mesh-UI": "1",
        "X-Mesh-UI-Control": record.controlCapability
      },
      body: JSON.stringify({
        requestedPort: context.requestedPort,
        ...context.focus === undefined ? {} : { focus: context.focus }
      }),
      signal: AbortSignal.timeout(remainingMs)
    });
  } catch {
    return null;
  }
  if (!contentTypeIsJson(response))
    return null;
  const body = await safeJson(response);
  if (!isObject(body))
    return null;
  if (response.status === 409 && body.error === "port_conflict" && body.liveOrigin === record.origin) {
    throw new UiPortConflictError(context.requestedPort, record.origin);
  }
  if (!response.ok || !validLaunchUrl(body.launchUrl, record.origin, context.focus))
    return null;
  return body.launchUrl;
}
function throwUnsupported(parsed, path7) {
  if (parsed.kind === "unsupported")
    throw new UiRuntimeVersionError(parsed.version, path7);
}
async function poll(context) {
  const remaining = context.monotonicDeadlineMs - context.monotonicNow();
  if (remaining <= 0)
    return;
  await context.sleep(Math.min(context.pollMs, remaining));
}
function readMatchingRuntimeRecord(machineDir2) {
  const paths = runtimePaths(machineDir2);
  const currentLock = parseLock(paths.lock);
  const currentRecord = parseRecord(paths.record);
  throwUnsupported(currentLock, paths.lock);
  throwUnsupported(currentRecord, paths.record);
  if (currentLock.kind === "absent" && currentRecord.kind === "absent") {
    return { paths, record: null };
  }
  if (currentLock.kind !== "valid" || currentRecord.kind !== "valid" || !recordsMatch(currentLock.value, currentRecord.value)) {
    throw new UiRuntimeStateError(paths.lock, paths.record);
  }
  return { paths, record: currentRecord.value };
}
async function requestUiControl(record, action, fetchImpl, timeoutMs) {
  let response;
  try {
    response = await fetchImpl(new URL(`/control/${action}`, record.origin), {
      method: "POST",
      redirect: "error",
      headers: {
        "X-Mesh-UI": "1",
        "X-Mesh-UI-Control": record.controlCapability
      },
      signal: AbortSignal.timeout(Math.max(1, timeoutMs))
    });
  } catch {
    return false;
  }
  if (!response.ok || !contentTypeIsJson(response))
    return false;
  const body = await safeJson(response);
  return isObject(body) && body.ok === true;
}
function readUnpublishedOwner(machineDir2, pidAlive) {
  const paths = runtimePaths(machineDir2);
  const lock = parseLock(paths.lock);
  const record = parseRecord(paths.record);
  throwUnsupported(lock, paths.lock);
  throwUnsupported(record, paths.record);
  if (lock.kind !== "valid" || record.kind !== "absent")
    return null;
  return {
    kind: pidAlive(lock.value.pid) ? "live" : "dead",
    paths,
    lock: lock.value
  };
}
async function inspectUiRuntime(options = {}) {
  const pidAlive = options.pidAlive ?? defaultPidAlive;
  const unpublished = readUnpublishedOwner(options.machineDir, pidAlive);
  if (unpublished?.kind === "dead")
    return { kind: "stale-unpublished", lock: unpublished.lock };
  if (unpublished?.kind === "live")
    return { kind: "starting", lock: unpublished.lock };
  const { record } = readMatchingRuntimeRecord(options.machineDir);
  if (record === null)
    return { kind: "stopped" };
  if (!pidAlive(record.pid))
    return { kind: "stale", record };
  const reachable = await requestUiControl(record, "status", options.fetch ?? globalThis.fetch, options.waitMs ?? DEFAULT_WAIT_MS);
  return reachable ? { kind: "running", record } : { kind: "unreachable", record };
}
async function reclaimDeadUnpublishedOwner(options) {
  const pidAlive = options.pidAlive ?? defaultPidAlive;
  const unpublished = readUnpublishedOwner(options.machineDir, pidAlive);
  if (unpublished?.kind !== "dead")
    return false;
  const { paths } = unpublished;
  const reclaimed = await acquireOrReuseUi({
    machineDir: options.machineDir,
    requestedPort: 0,
    waitMs: options.waitMs,
    pollMs: options.pollMs,
    monotonicNow: options.monotonicNow,
    pidAlive,
    sleep: options.sleep,
    fetch: options.fetch
  });
  if (reclaimed.kind !== "owner") {
    throw new UiRuntimeStateError(paths.lock, paths.record);
  }
  reclaimed.owner.close();
  return true;
}
async function stopUiRuntime(options = {}) {
  const pidAlive = options.pidAlive ?? defaultPidAlive;
  const unpublished = readUnpublishedOwner(options.machineDir, pidAlive);
  if (unpublished?.kind === "dead") {
    if (await reclaimDeadUnpublishedOwner(options))
      return { kind: "already-stopped" };
    throw new UiRuntimeStateError(unpublished.paths.lock, unpublished.paths.record);
  }
  if (unpublished?.kind === "live")
    throw new UiRuntimeStartingError(unpublished.lock);
  const initial = readMatchingRuntimeRecord(options.machineDir);
  if (initial.record === null)
    return { kind: "already-stopped" };
  const record = initial.record;
  if (!pidAlive(record.pid)) {
    const reclaimed = await acquireOrReuseUi({
      machineDir: options.machineDir,
      requestedPort: 0,
      waitMs: options.waitMs,
      pollMs: options.pollMs,
      monotonicNow: options.monotonicNow,
      pidAlive,
      sleep: options.sleep,
      fetch: options.fetch
    });
    if (reclaimed.kind !== "owner") {
      throw new UiRuntimeStateError(initial.paths.lock, initial.paths.record);
    }
    reclaimed.owner.close();
    return { kind: "stopped", record };
  }
  const waitMs = options.waitMs ?? DEFAULT_WAIT_MS;
  const pollMs = options.pollMs ?? DEFAULT_POLL_MS;
  const monotonicNow = options.monotonicNow ?? (() => performance.now());
  const sleep = options.sleep ?? sleepTimer;
  const deadline = monotonicNow() + waitMs;
  const accepted = await requestUiControl(record, "stop", options.fetch ?? globalThis.fetch, waitMs);
  if (!accepted)
    throw new UiRuntimeStateError(initial.paths.lock, initial.paths.record);
  for (;; ) {
    const currentLock = parseLock(initial.paths.lock);
    const currentRecord = parseRecord(initial.paths.record);
    throwUnsupported(currentLock, initial.paths.lock);
    throwUnsupported(currentRecord, initial.paths.record);
    if (currentLock.kind === "absent" && currentRecord.kind === "absent") {
      return { kind: "stopped", record };
    }
    if (currentLock.kind === "valid" && currentRecord.kind === "valid" && (!recordsMatch(currentLock.value, record) || !recordsMatch(currentLock.value, currentRecord.value))) {
      throw new UiRuntimeStateError(initial.paths.lock, initial.paths.record);
    }
    const remaining = deadline - monotonicNow();
    if (remaining <= 0)
      throw new UiRuntimeStateError(initial.paths.lock, initial.paths.record);
    await sleep(Math.min(pollMs, remaining));
  }
}
async function acquireOrReuseUi(options) {
  const waitMs = options.waitMs ?? DEFAULT_WAIT_MS;
  const pollMs = options.pollMs ?? DEFAULT_POLL_MS;
  const epochNow = options.now ?? Date.now;
  const monotonicNow = options.monotonicNow ?? (() => performance.now());
  const paths = runtimePaths(options.machineDir);
  const context = {
    paths,
    requestedPort: options.requestedPort,
    focus: options.focus,
    waitMs,
    pollMs,
    monotonicDeadlineMs: monotonicNow() + waitMs,
    epochNow,
    monotonicNow,
    futureClaimObservations: new Map,
    pid: options.pid ?? process.pid,
    pidAlive: options.pidAlive ?? defaultPidAlive,
    sleep: options.sleep ?? sleepTimer,
    fetchImpl: options.fetch ?? globalThis.fetch,
    onReclaimClaimed: options.onReclaimClaimed,
    onTakeoverEligible: options.onTakeoverEligible,
    onTakeoverRenamed: options.onTakeoverRenamed,
    onStaleLockUnlinked: options.onStaleLockUnlinked,
    onFreshLockAcquired: options.onFreshLockAcquired,
    onBeforeUnlink: options.onBeforeUnlink,
    onExclusiveLockCreated: options.onExclusiveLockCreated,
    onBeforeFenceRefresh: options.onBeforeFenceRefresh
  };
  for (;; ) {
    const currentLock = parseLock(paths.lock);
    throwUnsupported(currentLock, paths.lock);
    const currentRecord = parseRecord(paths.record);
    if (currentLock.kind === "malformed") {
      if (context.monotonicNow() >= context.monotonicDeadlineMs)
        throw new UiRuntimeStateError(paths.lock, paths.record);
      await poll(context);
      continue;
    }
    throwUnsupported(currentRecord, paths.record);
    const deferredReclaimArtifacts = cleanOldNonAliasingClaims(context);
    if (currentLock.kind === "absent") {
      const owner = createOwner(context);
      if (owner !== null) {
        const readyFence = observeFileFence(paths.record);
        const readyAfterClaim = parseRecord(paths.record);
        if (readyAfterClaim.kind === "unsupported") {
          owner.close();
          throw new UiRuntimeVersionError(readyAfterClaim.version, paths.record);
        }
        if (readyAfterClaim.kind !== "absent") {
          const expectedNonce = readyAfterClaim.kind === "valid" ? readyAfterClaim.value.ownerNonce : undefined;
          if (readyFence === null || !removeFencedPath(context, paths.record, readyFence, expectedNonce)) {
            owner.close();
            throw new UiRuntimeStateError(paths.lock, paths.record);
          }
        }
        return { kind: "owner", owner };
      }
    } else if (currentLock.kind === "valid") {
      const lockValue = currentLock.value;
      const ownerDead = !context.pidAlive(lockValue.pid);
      const readyMatches = currentRecord.kind === "valid" && recordsMatch(lockValue, currentRecord.value);
      if (ownerDead) {
        const owner = await reclaimStaleLock(context, lockValue);
        if (owner !== null) {
          try {
            cleanDeferredReclaimArtifacts(context, deferredReclaimArtifacts);
          } catch (error) {
            owner.close();
            throw error;
          }
          return { kind: "owner", owner };
        }
      } else if (readyMatches) {
        const launchUrl = await requestExistingLaunch(context, currentRecord.value);
        if (launchUrl !== null)
          return { kind: "existing", record: currentRecord.value, launchUrl };
        throw new UiRuntimeStateError(paths.lock, paths.record);
      }
    }
    if (context.monotonicNow() >= context.monotonicDeadlineMs)
      throw new UiRuntimeStateError(paths.lock, paths.record);
    await poll(context);
  }
}

// src/ui.ts
function ok7(message) {
  process.stdout.write(`${message}
`);
}
function parseUiPort(value) {
  if (value === undefined)
    return 0;
  if (!/^\d+$/.test(value)) {
    die6(`ui: --port "${value}" is not a valid port number (expected 0..65535)`);
  }
  const port = Number(value);
  if (!Number.isSafeInteger(port) || port > 65535) {
    die6(`ui: --port "${value}" is not a valid port number (expected 0..65535)`);
  }
  return port;
}
function openerFailure(command) {
  return () => {
    process.stderr.write(`ui: could not launch a browser (${command} not available) — run \`mesh ui --print\` and paste the URL manually
`);
  };
}
function openLaunchUrl(launchUrl, spawnOpener) {
  const { command, args: openerArgs } = openerFor(launchUrl);
  const onError = openerFailure(command);
  try {
    if (spawnOpener === undefined)
      defaultSpawnOpener(command, openerArgs, onError);
    else
      spawnOpener(command, openerArgs, onError);
  } catch {
    onError(new Error("opener failed"));
  }
}
function emitLaunch(launchUrl, origin, mode, spawnOpener) {
  if (mode.printOnly) {
    ok7(launchUrl);
    return;
  }
  if (mode.noOpen) {
    ok7(`ui: manager ${mode.existing ? "already running" : "listening"} at ${origin} — open this link:
${launchUrl}`);
    return;
  }
  openLaunchUrl(launchUrl, spawnOpener);
  const status = mode.existing ? `ui: opening existing manager at ${origin}` : `ui: manager running at ${origin} (Ctrl+C to stop)`;
  ok7(`${status}
ui: use the tab this command opens or refreshes; other old tabs can still show Session ended`);
}
function isAddressInUse(error) {
  return error instanceof Error && (error.code === "EADDRINUSE" || /EADDRINUSE/.test(error.message));
}
function startedAtLabel(record) {
  const date = new Date(record.startedAt);
  return Number.isNaN(date.getTime()) ? String(record.startedAt) : date.toISOString();
}
function dieUiRuntimeError(error) {
  if (error instanceof UiPortConflictError) {
    die6(`ui: one manager is already running at ${error.liveOrigin} — stop it before choosing --port ${error.requestedPort}`);
  }
  if (error instanceof UiRuntimeVersionError) {
    die6(`ui: another manager uses unsupported runtime state v${error.foundVersion} at ${error.statePath} — stop it and rerun with one mesh CLI version`);
  }
  if (error instanceof UiRuntimeStartingError) {
    die6(`ui: manager owner pid ${error.lock.pid} is still starting — retry this command in a moment`);
  }
  if (error instanceof UiRuntimeStateError) {
    die6(`ui: manager control state is unhealthy — run "mesh ui --status"; manual process termination and removal of ${error.lockPath} and ${error.recordPath} are last-resort recovery`);
  }
  throw error;
}
async function cmdUi(args2, deps = {}) {
  const statusRequested = flagBool4(args2, "status");
  const stopRequested = flagBool4(args2, "stop");
  const restartRequested = flagBool4(args2, "restart");
  const lifecycleActionCount = Number(statusRequested) + Number(stopRequested) + Number(restartRequested);
  if (lifecycleActionCount > 1) {
    die6("ui: --status, --stop, and --restart are mutually exclusive");
  }
  const printOnly = flagBool4(args2, "print");
  const noOpen = flagBool4(args2, "no-open");
  const profile = flag6(args2, "profile");
  const portValue = flag6(args2, "port");
  const hasLaunchFlags = portValue !== undefined || profile !== undefined || printOnly || noOpen;
  if (statusRequested && hasLaunchFlags)
    die6("ui: --status does not accept launch flags");
  if (stopRequested && hasLaunchFlags)
    die6("ui: --stop does not accept launch flags");
  if (statusRequested) {
    let status;
    try {
      status = await (deps.inspectUiRuntime ?? inspectUiRuntime)();
    } catch (error) {
      dieUiRuntimeError(error);
    }
    if (status.kind === "stopped") {
      ok7("ui: stopped — no machine-wide manager is running");
      return;
    }
    if (status.kind === "stale-unpublished") {
      ok7(`ui: stale — owner pid ${status.lock.pid} exited before publishing a ready URL`);
      ok7(`ui: owner started ${startedAtLabel(status.lock)}`);
      ok7("ui: scope: one machine-wide manager serves every browser, screen, profile, and agent");
      ok7("ui: run `mesh ui --restart` to reclaim stale ownership and open one fresh tab");
      return;
    }
    if (status.kind === "starting") {
      ok7(`ui: starting — owner pid ${status.lock.pid} has not published a ready URL yet`);
      ok7(`ui: owner started ${startedAtLabel(status.lock)}`);
      ok7("ui: scope: one machine-wide manager serves every browser, screen, profile, and agent");
      ok7("ui: retry `mesh ui --status` in a moment");
      return;
    }
    const state = status.kind === "unreachable" ? "unhealthy" : status.kind;
    ok7(`ui: ${state} at ${status.record.origin}`);
    ok7(`ui: owner pid ${status.record.pid}, started ${startedAtLabel(status.record)}`);
    ok7("ui: scope: one machine-wide manager serves every browser, screen, profile, and agent");
    if (status.kind === "stale") {
      ok7("ui: owner process is gone; run `mesh ui --restart` to reclaim stale ownership and open one fresh tab");
    } else if (status.kind === "unreachable") {
      ok7("ui: owner process is alive but its control route is unreachable; inspect that PID and terminate it manually only as a last resort");
    }
    return;
  }
  const port = parseUiPort(portValue);
  if (profile !== undefined && !listProfiles().includes(profile)) {
    die6(`ui: --profile "${profile}" has no local home — run "mesh keygen --profile ${profile}" first`);
  }
  if (stopRequested || restartRequested) {
    const action = restartRequested ? "restarting" : "stopping";
    ok7(`ui: warning: ${action} the machine-wide manager invalidates every connected tab, screen, and agent`);
    let stopped;
    try {
      stopped = await (deps.stopUiRuntime ?? stopUiRuntime)();
    } catch (error) {
      dieUiRuntimeError(error);
    }
    if (stopRequested) {
      ok7(stopped.kind === "already-stopped" ? "ui: already stopped — no machine-wide manager was running" : `ui: stopped manager at ${stopped.record.origin}`);
      return;
    }
    ok7(stopped.kind === "already-stopped" ? "ui: no previous manager was running; starting one now" : "ui: previous manager stopped; all established tabs are now invalid");
  }
  let ownership;
  try {
    ownership = await (deps.acquireOrReuseUi ?? acquireOrReuseUi)({
      requestedPort: port,
      ...profile === undefined ? {} : { focus: profile }
    });
  } catch (error) {
    dieUiRuntimeError(error);
  }
  if (ownership.kind === "existing") {
    emitLaunch(ownership.launchUrl, ownership.record.origin, { printOnly, noOpen, existing: true }, deps.spawnOpener);
    return;
  }
  const { owner } = ownership;
  let ownerClosed = false;
  const cleanupOwner = () => {
    if (ownerClosed)
      return;
    ownerClosed = true;
    owner.close();
  };
  const onExit = () => cleanupOwner();
  let removeLifecycleHooks = () => {};
  const resendSignal = (signal) => {
    removeLifecycleHooks();
    try {
      cleanupOwner();
    } finally {
      process.kill(process.pid, signal);
    }
  };
  const onSigint = () => resendSignal("SIGINT");
  const onSigterm = () => resendSignal("SIGTERM");
  removeLifecycleHooks = () => {
    process.removeListener("exit", onExit);
    process.removeListener("SIGINT", onSigint);
    process.removeListener("SIGTERM", onSigterm);
  };
  process.once("exit", onExit);
  process.once("SIGINT", onSigint);
  process.once("SIGTERM", onSigterm);
  let broker;
  try {
    broker = await (deps.createBroker ?? createBroker)({
      port,
      control: {
        capability: owner.controlCapability,
        isValidFocus: (value) => listProfiles().includes(value),
        onStop: () => {
          broker.close().catch(() => {
            process.stderr.write("ui: graceful manager stop failed; run `mesh ui --status` before attempting manual recovery\n");
          });
        }
      }
    });
  } catch (error) {
    removeLifecycleHooks();
    cleanupOwner();
    if (isAddressInUse(error)) {
      die6(`ui: port ${port} is already in use — pass --port <other> or stop the other process`);
    }
    throw error;
  }
  const closeBroker = broker.close.bind(broker);
  let closePromise;
  broker.close = () => {
    if (closePromise === undefined) {
      removeLifecycleHooks();
      closePromise = (async () => {
        try {
          await closeBroker();
        } finally {
          cleanupOwner();
        }
      })();
    }
    return closePromise;
  };
  try {
    deps.onBrokerReady?.(broker);
    const origin = `http://127.0.0.1:${broker.port}/`;
    owner.publish(origin);
    const token = broker.sessions.mintLaunch();
    const launchUrl = buildLaunchUrl(origin, token, profile);
    emitLaunch(launchUrl, origin, { printOnly, noOpen, existing: false }, deps.spawnOpener);
  } catch (error) {
    try {
      await broker.close();
    } catch {}
    throw error;
  }
}

// src/fs-status.ts
import { readFileSync as readFileSync12, statSync as statSync4, existsSync as existsSync7 } from "node:fs";
import { join as join13 } from "node:path";
async function statusScan(client2, opts) {
  const { prefix, root, home, deep } = opts;
  const normPrefix = prefix ? normalizeId(prefix) : "";
  const [treeResult, leasesResult] = await Promise.all([
    client2.getTree(prefix || undefined),
    client2.listLeases()
  ]);
  if ("error" in treeResult)
    die6(`fs status: [${treeResult.error}] ${treeResult.detail}`);
  if (!Array.isArray(leasesResult))
    die6(`fs status: [${leasesResult.error}] ${leasesResult.detail}`);
  const scanDir = normPrefix ? join13(root, normPrefix) : root;
  const isIgnored = makeIgnore(loadMeshignore(scanDir), {});
  const localAbsByPath = new Map;
  try {
    const st = statSync4(scanDir);
    if (st.isDirectory()) {
      for (const rel of walkDirFiles(scanDir, isIgnored)) {
        const repoPath = normalizeId([normPrefix, rel].filter((s) => s.length > 0).join("/"));
        localAbsByPath.set(repoPath, join13(scanDir, rel));
      }
    } else if (st.isFile() && normPrefix) {
      localAbsByPath.set(normPrefix, scanDir);
    }
  } catch {}
  const local = new Map;
  for (const [p, abs2] of localAbsByPath) {
    const bytes = readFileSync12(abs2);
    const text = isValidUtf8Bytes(new Uint8Array(bytes)) ? bytes.toString("utf8") : undefined;
    local.set(p, { hash: "r2:" + sha256hex(new Uint8Array(bytes)), text });
  }
  const tip = new Map(treeResult.tree.map((n) => [n.path, n]));
  const lease = new Map(leasesResult.map((l) => [l.path, { holder: l.holder, expiresAtMs: l.lease_expires }]));
  const sidecarOnlyPaths = (opts.roomKey !== undefined ? [...new Set([...listFolderSidecarPaths(root, opts.roomKey), ...opts.legacyAmbiguous ? [] : listSidecarPaths(client2.roomId, home)])] : opts.legacyAmbiguous ? [] : listSidecarPaths(client2.roomId, home)).filter((p) => !normPrefix || p === normPrefix || p.startsWith(normPrefix + "/"));
  const baseTipHash = new Map;
  for (const p of new Set([...local.keys(), ...tip.keys(), ...sidecarOnlyPaths])) {
    const sidecar = opts.roomKey !== undefined ? readSidecarResolved(root, opts.roomKey, client2.roomId, p, home, opts.legacyAmbiguous) : readSidecar(client2.roomId, p, home);
    if (sidecar)
      baseTipHash.set(p, sidecar.tip_hash);
  }
  const ignoredLocally = new Set;
  for (const p of tip.keys()) {
    if (local.has(p))
      continue;
    const rel = normPrefix && (p === normPrefix || p.startsWith(normPrefix + "/")) ? p.slice(normPrefix.length + 1) : p;
    if (isIgnored(rel) && existsSync7(join13(scanDir, rel)))
      ignoredLocally.add(p);
  }
  const rows = composeStatusRows({ local, tip, baseTipHash, lease, sidecarOnlyPaths, ignoredLocally }, Date.now());
  if (deep) {
    for (const row of rows) {
      if (row.state !== "diverged")
        continue;
      const localAbs = localAbsByPath.get(row.path);
      const node = tip.get(row.path);
      const sidecar = opts.roomKey !== undefined ? readSidecarResolved(root, opts.roomKey, client2.roomId, row.path, home, opts.legacyAmbiguous) : readSidecar(client2.roomId, row.path, home);
      if (!localAbs || !node?.content_hash || !sidecar || sidecar.content === undefined)
        continue;
      const localBytes = readFileSync12(localAbs);
      if (!isValidUtf8Bytes(new Uint8Array(localBytes)))
        continue;
      let hash;
      try {
        hash = hashFromRef(node.content_hash);
      } catch {
        continue;
      }
      const tipBlob = await client2.getArtifact(hash);
      if (!(tipBlob instanceof Uint8Array) || !isValidUtf8Bytes(tipBlob))
        continue;
      const verdict = dryRunMergeVerdict(threeWayMerge(sidecar.content, Buffer.from(tipBlob).toString("utf8"), localBytes.toString("utf8")));
      row.detail = row.detail ? `${row.detail}; ${verdict}` : verdict;
    }
  }
  return rows;
}
function resolveReadOnlyRoot(opts) {
  const twoLeg = resolveStatusRoot(opts.rootFlag, opts.cwd, { origin: opts.origin, roomId: opts.roomId });
  const resolved = twoLeg ?? (opts.membershipRoot !== undefined ? { root: opts.membershipRoot, source: "membership-default" } : null);
  if (resolved === null) {
    throw new Error(`${opts.command}: could not resolve a workspace root — tried --root, the nearest enclosing .mesh/ attachment, and this profile's registered default. Pass --root <dir>, or run "mesh fs get/put/hydrate" here once to attach this folder.`);
  }
  return {
    root: resolved.root,
    source: resolved.source,
    roomKey: roomKeyFor(opts.origin, opts.roomId),
    legacyAmbiguous: isRoomIdAmbiguous(opts.roomId, opts.home)
  };
}

// src/fs-prune-ignored.ts
async function pruneIgnoredPaths(opts) {
  const { root, roomKey, roomId, home, treePrefix, isIgnored, getTree, postDelete } = opts;
  const sidecarPaths = [...new Set([...listFolderSidecarPaths(root, roomKey), ...listSidecarPaths(roomId, home)])].filter((p) => !treePrefix || p === treePrefix || p.startsWith(treePrefix + "/"));
  const treeResult = await getTree(treePrefix || undefined);
  if ("error" in treeResult)
    return { ok: false, error: treeResult.error, detail: treeResult.detail };
  const tipPaths = new Set(treeResult.tree.map((n) => n.path));
  const rows = [];
  let prunedCount = 0;
  for (const p of sidecarPaths) {
    if (!tipPaths.has(p))
      continue;
    const rel = treePrefix && (p === treePrefix || p.startsWith(treePrefix + "/")) ? p.slice(treePrefix.length + 1) : p;
    if (!isIgnored(rel))
      continue;
    const r = await postDelete(p);
    if (r.ok) {
      dropFolderSidecar(root, roomKey, p);
      dropSidecar(roomId, p, home);
      prunedCount++;
      rows.push({ path: p, ok: true });
    } else {
      rows.push({ path: p, ok: false, error: r.error, detail: r.detail });
    }
  }
  return { ok: true, rows, prunedCount };
}

// src/version.ts
import { readFileSync as readFileSync13 } from "node:fs";
import { dirname as dirname9, resolve as resolve7 } from "node:path";
import { fileURLToPath } from "node:url";
function getVersion() {
  if (true)
    return "1.28.3";
  try {
    const here = dirname9(fileURLToPath(import.meta.url));
    return readFileSync13(resolve7(here, "../../../VERSION"), "utf8").trim();
  } catch {
    return "unknown";
  }
}

// src/main.ts
installPromiseWithResolvers();
function ok8(msg) {
  process.stdout.write(msg + `
`);
}
function wantsHelp(argv) {
  return argv.includes("--help") || argv.includes("-h");
}
function wantsVersion(argv) {
  return argv.includes("--version") || argv.includes("-V");
}
function grepLine(r) {
  return `${r.path}: ${r.snippet}`;
}
function formatGrepSkipNote(skippedCount) {
  return skippedCount > 0 ? `fs grep: ${skippedCount} file(s) excluded from the index (over the room's fts_max_file_bytes cap) — not searched: raise it via mesh fs config fts <bytes>` : undefined;
}
async function hydrateGrepWinners(client2, paths, into, roomId, roomKey, home, onProgress) {
  if (paths.length === 0)
    return { rows: [], exitCode: 0 };
  const result = await runGetBatch(client2, { roomId, home, into, roomKey, prune: false, targets: paths, explicitOnly: true, onProgress });
  for (const row of result.rows) {
    const line = formatGetRowMessage(row.repoPath, row.outcome);
    if (line)
      ok8(line);
  }
  return result;
}
async function hydrateSubtree(client2, prefix, into, roomId, roomKey, home, prune = false, onProgress) {
  const result = await runGetBatch(client2, { roomId, home, into, roomKey, prune, treePrefix: prefix || undefined, onProgress });
  for (const row of result.rows) {
    const line = formatGetRowMessage(row.repoPath, row.outcome);
    if (line)
      ok8(line);
  }
  return result;
}
function localSizes(paths, into) {
  const base = resolve8(into);
  const sizes = {};
  for (const path7 of paths) {
    const dest = resolve8(into, path7);
    if (dest !== base && !dest.startsWith(base + sep3))
      continue;
    try {
      sizes[path7] = statSync5(dest).size;
    } catch {}
  }
  return sizes;
}
function openDecisionsCount(state, selfId) {
  return decisionsAwaitingAuthority(state.decisions, selfId, myRoles(state.bindings, selfId)).length;
}
async function cmdKeygen(args2) {
  let id2 = flag6(args2, "id");
  if (!id2) {
    if (process.stdin.isTTY) {
      id2 = await promptLine("identity id");
      if (!id2)
        die6("keygen: identity id cannot be empty");
    } else {
      die6("keygen: --id <id> is required");
    }
  }
  const home = flag6(args2, "home");
  const homeDir = home ?? meshHome();
  const existing = loadIdentity(home);
  if (existing && !flagBool4(args2, "force")) {
    die6(`Identity "${existing.id}" already exists at ${homeDir} (pubkey ${existing.pubkey}).
` + `Use --force to overwrite — but note this MINTS A NEW KEYPAIR: rooms that bound the old
` + `key will reject you with id_taken. To act as a different participant, use a separate MESH_HOME.`);
  }
  const roles = (flag6(args2, "roles") ?? "").split(",").map((r) => r.trim()).filter(Boolean);
  const identity = createIdentity(id2, home, roles);
  ok8(`Created identity: ${identity.id}`);
  ok8(`  home:   ${homeDir}`);
  ok8(`  pubkey: ${identity.pubkey}`);
  if (roles.length > 0)
    ok8(`  roles:  ${roles.join(", ")}  (asserted in the card at join → verdict authority for these role refs)`);
  ok8(`To reuse this id elsewhere, COPY ${homeDir}/identity.json — never re-run keygen (that makes a new key).`);
}
async function cmdKeyRotate(args2) {
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentity(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const { identity: rotated, data } = rotateIdentityFile(identity);
  const secretBytes = new Uint8Array(Buffer.from(identity.secret, "base64"));
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes
  });
  const result = await client2.postEntry({ performative: "key.rotate", data });
  if (!result.ok)
    die6(`key rotate failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  persistOrExplain(rotated, home);
  ok8(`Rotated key for ${identity.id} (seq=${result.seq}). New pubkey: ${rotated.pubkey}`);
}
async function cmdKeyRetire(args2) {
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentity(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  if (!identity.next_pubkey) {
    die6(`key retire: ${identity.id} has no committed next key yet — run "mesh key rotate" once first (bootstrap), then retire.`);
  }
  const secretBytes = new Uint8Array(Buffer.from(identity.secret, "base64"));
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes
  });
  const result = await client2.postEntry({
    performative: "key.rotate",
    data: { reveal_pubkey: identity.next_pubkey, tombstone: true }
  });
  if (!result.ok)
    die6(`key retire failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  ok8(`Retired ${identity.id} (seq=${result.seq}). This identity may no longer author entries in ${roomId}.`);
}
async function cmdKey(args2) {
  const sub = args2.positional.shift();
  switch (sub) {
    case "rotate":
      return cmdKeyRotate(args2);
    case "retire":
      return cmdKeyRetire(args2);
    default:
      die6(`key: unknown action "${sub ?? ""}". Use: mesh key rotate|retire`);
  }
}
async function cmdCreateRoom(args2) {
  const home = flag6(args2, "home");
  let roomId = args2.positional[0];
  if (!roomId) {
    if (process.stdin.isTTY) {
      roomId = await promptLine("room id");
      if (!roomId)
        die6("create-room: room id cannot be empty");
    } else {
      die6("create-room: <room_id> positional argument is required");
    }
  }
  let ownerId = flag6(args2, "owner");
  if (!ownerId) {
    if (process.stdin.isTTY) {
      ownerId = await promptLine("owner id");
      if (!ownerId)
        die6("create-room: owner id cannot be empty");
    } else {
      die6("create-room: --owner <id> is required");
    }
  }
  const workerUrl = resolveRoomUrl(flag6(args2, "url"), home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6(`No identity found. Run "mesh keygen --id ${ownerId}" first.`);
  if (identity.id !== ownerId)
    die6(`Identity id "${identity.id}" does not match --owner "${ownerId}"`);
  const card = buildCard(identity.id, identity.pubkey, identity.secretBytes, { roles: identity.roles, host: flag6(args2, "host") ?? os5.hostname() });
  const joinSecret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex");
  const nextPubkey = identity.next_pubkey ?? ensureNextKey(loadIdentity(home), home).next_pubkey;
  const nextCommitment = keyCommitment(nextPubkey);
  const result = await createRoom(workerUrl, roomId, card, joinSecret, undefined, nextCommitment);
  if (!result.ok)
    die6(`create-room failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  const roomUrl = `${workerUrl.replace(/\/+$/, "")}/v1/rooms/${encodeURIComponent(roomId)}`;
  const joined = await joinRoom(roomUrl, roomId, joinSecret, card, identity.secretBytes, nextCommitment);
  if (!joined.ok) {
    die6(`create-room: room created but owner auto-join failed: [${joined.error}] ${joined.detail}${joined.hint ? " — " + joined.hint : ""}`);
  }
  upsertRoom(roomId, { url: roomUrl, token: joined.token, participant_id: joined.participant_id, join_secret: joinSecret }, home);
  try {
    registerHome(home ?? meshHome());
  } catch {}
  const createOrigin = normalizeOrigin(roomUrl);
  setActiveRoom(roomKeyFor(createOrigin, roomId), home);
  saveConfig({ defaultRoomUrl: workerUrl }, home);
  ok8(`Room created: ${roomUrl}`);
  ok8(`Joined as owner: ${joined.participant_id}`);
  ok8(`Invite:       ${result.invite}`);
  ok8(`Room pubkey:  ${result.room_pubkey}`);
  ok8(`
Share the invite with participants. They run:
  mesh room join ${roomUrl} ${result.invite}`);
}
async function cmdInit(args2) {
  if (!process.stdin.isTTY)
    die6("mesh init: requires an interactive terminal (stdin must be a TTY)");
  ok8(`Welcome to mesh! Let's get you set up.
`);
  const profile = await promptLine("Profile name", "default");
  setActiveProfile(profile);
  const profileHome = resolveProfileHome(profile);
  const id2 = await promptLine("Identity id");
  if (!id2)
    die6("init: identity id cannot be empty");
  const existingUrl = resolveRoomUrl(undefined, profileHome);
  const url = await promptLine("Room server URL", existingUrl);
  saveConfig({ defaultRoomUrl: url }, profileHome);
  const action = await promptChoice("Create a new room or join an existing one?", ["create", "join"]);
  if (action === "create") {
    const roomId = await promptLine("Room id");
    if (!roomId)
      die6("init: room id cannot be empty");
    if (!loadIdentity(profileHome)) {
      ok8(`
Creating identity "${id2}"…`);
      await cmdKeygen({ positional: [], flags: { id: id2, home: profileHome } });
    }
    ok8(`
Creating room…`);
    await cmdCreateRoom({ positional: [roomId], flags: { owner: id2, url, home: profileHome } });
  } else {
    const roomUrl = await promptLine("Room URL (from the invite)");
    const secret = await promptLine("Invite secret");
    if (!roomUrl || !secret)
      die6("init: room URL and invite secret are required to join");
    if (!loadIdentity(profileHome)) {
      ok8(`
Creating identity "${id2}"…`);
      await cmdKeygen({ positional: [], flags: { id: id2, home: profileHome } });
    }
    ok8(`
Joining room…`);
    await cmdJoin({ positional: [roomUrl, secret], flags: { home: profileHome } });
  }
}
function idTakenHelp(roomId, id2, pubkey, home) {
  return [
    `join failed: [id_taken] room "${roomId}" already bound "${id2}" to a DIFFERENT keypair than this one.`,
    ``,
    `  this MESH_HOME:   ${home}`,
    `  its ${id2} pubkey: ${pubkey}`,
    ``,
    `A participant id is permanently tied to the keypair that first used it in a room`,
    `(trust-on-first-use). You ran "mesh keygen --id ${id2}" in more than one MESH_HOME, so`,
    `"${id2}" now maps to two different keys — and this room only trusts the first one.`,
    ``,
    `Fix one of:`,
    `  • Reuse the original identity: copy identity.json from the MESH_HOME that first joined`,
    `    this room into ${home}/identity.json, then retry. Compare homes with: mesh whoami --home <dir>`,
    `  • Or act as a new participant under a different id:`,
    `      mesh keygen --id <other-id> --force --home ${home}   then   mesh room join …`
  ].join(`
`);
}
var JOIN_NEXT_STEPS = [
  "mesh brief",
  "mesh inbox",
  "mesh fs status"
];
async function cmdJoin(args2) {
  const roomUrl = args2.positional[0];
  const inviteStr = args2.positional[1];
  const passphrase = flag6(args2, "passphrase");
  if (!roomUrl || !inviteStr) {
    die6("join: usage: mesh join <room-url> <room>.<secret>   or   mesh join <room-url> <room> --passphrase <phrase>");
  }
  const home = flag6(args2, "home");
  let roomId;
  let joinSecret;
  if (passphrase !== undefined) {
    roomId = inviteStr;
  } else {
    const parts = inviteStr.split(".");
    if (parts.length < 2)
      die6("join: invite must be in format <room_id>.<join_secret> (or pass --passphrase <phrase> with a bare room id)");
    joinSecret = parts[parts.length - 1];
    roomId = parts.slice(0, -1).join(".");
  }
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity found. Run "mesh keygen --id <id>" first.');
  const card = buildCard(identity.id, identity.pubkey, identity.secretBytes, { roles: identity.roles, host: flag6(args2, "host") ?? os5.hostname() });
  const nextPubkey = identity.next_pubkey ?? ensureNextKey(loadIdentity(home), home).next_pubkey;
  const nextCommitment = keyCommitment(nextPubkey);
  const result = passphrase !== undefined ? await joinRoomWithPassphrase(roomUrl, roomId, passphrase, card, identity.secretBytes, nextCommitment) : await joinRoom(roomUrl, roomId, joinSecret, card, identity.secretBytes, nextCommitment);
  if (!result.ok) {
    if (result.error === "id_taken")
      die6(idTakenHelp(roomId, identity.id, identity.pubkey, home ?? meshHome()));
    die6(`join failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  }
  upsertRoom(roomId, { url: roomUrl, token: result.token, participant_id: result.participant_id }, home);
  try {
    registerHome(home ?? meshHome());
  } catch {}
  const joinOrigin = normalizeOrigin(roomUrl);
  setActiveRoom(roomKeyFor(joinOrigin, roomId), home);
  ok8(`Joined ${roomId} as ${result.participant_id}`);
  ok8(`Head: seq=${result.head.seq} ${result.head.entry_hash}`);
  ok8("");
  ok8("next steps:");
  for (const cmd of JOIN_NEXT_STEPS)
    ok8(`  ${cmd}`);
}
async function cmdRoom(args2) {
  const sub = args2.positional.shift();
  switch (sub) {
    case "create":
      return cmdCreateRoom(args2);
    case "join":
      return cmdJoin(args2);
    case "list":
      return cmdRoomList(args2);
    case "rm":
    case "remove":
    case "forget":
      return cmdRoomRm(args2);
    case "delete":
      return cmdRoomDelete(args2);
    case "log":
      return cmdLog(args2);
    case "invite":
      return cmdRoomInvite(args2);
    default:
      die6(`room: unknown action "${sub ?? ""}". Use: mesh room create|join|list|rm|delete|invite|log`);
  }
}
async function cmdRoomList(args2) {
  const home = flag6(args2, "home");
  const rooms = loadRooms(home);
  const roomKeys = Object.keys(rooms.memberships);
  if (roomKeys.length === 0) {
    ok8('No rooms joined. Run "mesh room join" first.');
    return;
  }
  const active = getActiveRoom(home);
  ok8(`Joined rooms (${roomKeys.length})${active ? `, active: ${active}` : ""}:`);
  for (const roomKey of roomKeys) {
    const r = rooms.memberships[roomKey];
    const id2 = roomIdFromRoomKey(roomKey);
    const mark = id2 === active ? "*" : " ";
    ok8(`${mark} ${id2}  —  as ${r.participant_id}  —  ${r.url}`);
  }
}
async function cmdRoomRm(args2) {
  const roomId = args2.positional[0];
  if (!roomId)
    die6("room rm: <room_id> is required");
  const home = flag6(args2, "home");
  const urlFlag = flag6(args2, "url");
  try {
    if (!removeRoom(roomId, home, urlFlag))
      die6(`room rm: "${roomId}" not in rooms.json`);
  } catch (e) {
    die6(e instanceof Error ? e.message : String(e));
  }
  ok8(`Forgot room ${roomId} locally (rooms.json). This does not delete the room on the server.`);
}
async function cmdRoomDelete(args2) {
  const roomId = args2.positional[0];
  if (!roomId)
    die6("room delete: <room_id> is required");
  const home = flag6(args2, "home");
  const urlFlag = flag6(args2, "url");
  let resolved;
  try {
    resolved = resolveRoom(roomId, home, urlFlag);
  } catch (e) {
    die6(`room delete: not joined to "${roomId}" locally — need its url + token to authorize. Run from the owner's MESH_HOME. (${e instanceof Error ? e.message : String(e)})`);
  }
  const room = resolved.entry;
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const result = await client2.deleteRoom();
  if (!result.ok) {
    if (result.status === 403)
      die6(`room delete: only the room owner may delete "${roomId}" — run this from the owner's MESH_HOME.`);
    die6(`room delete failed: ${result.error} (HTTP ${result.status})`);
  }
  removeRoom(roomId, home, urlFlag);
  ok8(`Deleted room "${roomId}" on the server and forgot it locally. Re-create the id to reuse it.`);
}
function extractInviteSecret(invite, roomId) {
  return invite.startsWith(roomId + ".") ? invite.slice(roomId.length + 1) : invite;
}
var PASSPHRASE_ADJECTIVES = [
  "angry",
  "brave",
  "calm",
  "clever",
  "curious",
  "dizzy",
  "eager",
  "fancy",
  "fierce",
  "fluffy",
  "gentle",
  "giddy",
  "glad",
  "grumpy",
  "happy",
  "hasty",
  "humble",
  "hungry",
  "jolly",
  "jumpy",
  "keen",
  "lazy",
  "loud",
  "lucky",
  "mellow",
  "mighty",
  "nifty",
  "nimble",
  "noisy",
  "odd",
  "patient",
  "perky",
  "plucky",
  "polite",
  "proud",
  "quick",
  "quiet",
  "rapid",
  "rowdy",
  "rusty",
  "salty",
  "shiny",
  "silly",
  "sleepy",
  "sly",
  "snappy",
  "sneaky",
  "spicy",
  "spry",
  "stormy",
  "sturdy",
  "sunny",
  "swift",
  "tame",
  "tidy",
  "tiny",
  "tough",
  "wild",
  "witty",
  "wobbly",
  "young",
  "zany",
  "zealous",
  "zesty"
];
var PASSPHRASE_ANIMALS = [
  "ant",
  "badger",
  "bat",
  "bear",
  "beaver",
  "bee",
  "bison",
  "camel",
  "cat",
  "cobra",
  "crab",
  "crane",
  "crow",
  "deer",
  "dingo",
  "dolphin",
  "donkey",
  "duck",
  "eagle",
  "falcon",
  "ferret",
  "finch",
  "fox",
  "frog",
  "gecko",
  "gibbon",
  "goat",
  "goose",
  "hare",
  "hawk",
  "heron",
  "horse",
  "hyena",
  "ibex",
  "jaguar",
  "koala",
  "lemur",
  "lion",
  "llama",
  "lynx",
  "mole",
  "moose",
  "mouse",
  "newt",
  "otter",
  "owl",
  "panda",
  "panther",
  "pig",
  "prawn",
  "puma",
  "rabbit",
  "raven",
  "seal",
  "shark",
  "sheep",
  "sloth",
  "swan",
  "tiger",
  "toad",
  "walrus",
  "weasel",
  "wolf",
  "yak"
];
function generatePassphrase() {
  const idx = crypto.getRandomValues(new Uint8Array(2));
  const adj = PASSPHRASE_ADJECTIVES[idx[0] % PASSPHRASE_ADJECTIVES.length];
  const animal = PASSPHRASE_ANIMALS[idx[1] % PASSPHRASE_ANIMALS.length];
  return `${adj}-${animal}`;
}
async function cmdRoomInvite(args2) {
  const roomId = args2.positional[0];
  const home = flag6(args2, "home");
  const showFlag = flagBool4(args2, "show");
  const rotateFlag = flagBool4(args2, "rotate");
  const forId = flag6(args2, "for");
  const listFlag = flagBool4(args2, "list");
  const revokeId = flag6(args2, "revoke");
  if (!showFlag && !rotateFlag && !forId && !listFlag && !revokeId) {
    die6("room invite: use --show | --rotate | --for <participant-id> [--passphrase <phrase>] [--ttl <seconds>] | --list | --revoke <participant-id>");
  }
  const { roomId: resolvedId, entry: room } = resolveRoom(roomId, home, flag6(args2, "url") || undefined);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  if (showFlag) {
    if (!room.join_secret) {
      die6(`room invite --show: no local join_secret for "${resolvedId}" (only the room creator has it; the room never stores plaintext)`);
    }
    ok8(`${resolvedId}.${room.join_secret}`);
    return;
  }
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId: resolvedId,
    secretBytes: identity.secretBytes
  });
  if (rotateFlag) {
    const result = await client2.rotateInvite();
    if (!result.ok) {
      if (result.status === 403)
        die6(`room invite --rotate: only the room owner may rotate "${resolvedId}" — run this from the owner's MESH_HOME.`);
      die6(`room invite --rotate failed: [${result.error}] ${result.detail}`);
    }
    const newSecret = extractInviteSecret(result.invite, resolvedId);
    upsertRoom(resolvedId, { ...room, join_secret: newSecret }, home);
    ok8(`New invite: ${result.invite}`);
    ok8(`Share with participants: mesh room join ${room.url} ${result.invite}`);
  } else if (forId) {
    const passphrase = flag6(args2, "passphrase") ?? generatePassphrase();
    const ttlRaw = flag6(args2, "ttl");
    const ttlS = ttlRaw !== undefined ? Number(ttlRaw) : undefined;
    if (ttlS !== undefined && (!Number.isFinite(ttlS) || ttlS <= 0))
      die6("room invite: --ttl must be a positive number of seconds");
    const result = await client2.createPassphraseInvite(forId, passphrase, ttlS);
    if (!result.ok) {
      if (result.status === 403)
        die6(`room invite --for: only the room owner may mint invites for "${resolvedId}" — run this from the owner's MESH_HOME.`);
      die6(`room invite --for failed: [${result.error}] ${result.detail}`);
    }
    const mins = Math.round((result.expires - Date.now()) / 60000);
    ok8(`Passphrase invite for "${forId}": ${passphrase}`);
    ok8(`Single-use, expires in ~${mins} min. Share the phrase out-of-band; they run:`);
    ok8(`  mesh keygen --id "${forId}"   (if they have no identity yet)`);
    ok8(`  mesh room join ${room.url} ${resolvedId} --passphrase ${passphrase}`);
    ok8(`Note: the phrase only admits an agent whose identity id is exactly "${forId}".`);
  } else if (listFlag) {
    const result = await client2.listPassphraseInvites();
    if (!result.ok) {
      if (result.status === 403)
        die6(`room invite --list: only the room owner may list invites for "${resolvedId}".`);
      die6(`room invite --list failed: [${result.error}] ${result.detail}`);
    }
    if (result.invites.length === 0) {
      ok8("No pending passphrase invites.");
      return;
    }
    ok8(`Pending passphrase invites (${result.invites.length}):`);
    for (const inv of result.invites) {
      const mins = Math.max(0, Math.round((inv.expires - Date.now()) / 60000));
      ok8(`  ${inv.participant_id}  —  expires in ~${mins} min${inv.attempts > 0 ? `  —  ${inv.attempts} failed attempt(s)` : ""}`);
    }
  } else if (revokeId) {
    const result = await client2.revokePassphraseInvite(revokeId);
    if (!result.ok) {
      if (result.status === 404)
        die6(`room invite --revoke: no pending invite for "${revokeId}".`);
      if (result.status === 403)
        die6(`room invite --revoke: only the room owner may revoke invites for "${resolvedId}".`);
      die6(`room invite --revoke failed: [${result.error}] ${result.detail}`);
    }
    ok8(`Revoked pending invite for "${revokeId}".`);
  }
}
function isFilePlaneEntry(performative) {
  return performative.startsWith("file.") || performative === "system.grant" || performative === "system.role" || performative === "system.lease_clear" || performative === "system.revoke" || performative === "system.config";
}
function flagOutOfScope(closure, canRead) {
  return closure.map((path7) => ({ path: path7, readable: canRead(path7) }));
}
function resolveLogExclude(all2) {
  return all2 ? undefined : [...COLLAB_LANE_EXCLUDE];
}
function collabLaneHint(all2) {
  return all2 ? undefined : "— collab lane: file/system entries hidden (mesh log --all) —";
}
async function fetchLogEntries(client2, exclude, maxEntries = 1e4) {
  const all2 = [];
  let since = -1;
  let head;
  for (;; ) {
    const page = await client2.getEntries({ since, limit: 100, exclude });
    head = page.head;
    if (page.entries.length === 0)
      break;
    all2.push(...page.entries);
    since = page.entries[page.entries.length - 1].seq;
    if (page.entries.length < 100 || all2.length >= maxEntries)
      break;
  }
  return { entries: all2, head };
}
async function cmdLog(args2) {
  const follow = flagBool4(args2, "f");
  const all2 = flagBool4(args2, "all");
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const roomIdFromUrl = room.url.split("/").pop() ?? "unknown";
  ok8(ansi(DIM, `room: ${roomIdFromUrl}`));
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId: roomIdFromUrl,
    secretBytes: identity.secretBytes
  });
  const exclude = resolveLogExclude(all2);
  const laneHint = collabLaneHint(all2);
  if (follow) {
    const [{ entries, head }, state] = await Promise.all([
      client2.getEntries({ limit: 100, exclude }),
      client2.getState().catch(() => null)
    ]);
    if (entries.length > 0)
      ok8(renderEntries(entries));
    let senderWidth;
    if (entries.length > 0) {
      const widths = entries.map((e) => e.submission.sender.length);
      senderWidth = Math.min(28, Math.max(12, Math.max(...widths)));
    }
    let since = head.seq;
    const tty = process.stdout.isTTY ?? false;
    const badge = state !== null ? composeBadge({ unread: 0, fsBehind: 0, fsConflict: 0, openDecisions: openDecisionsCount(state, identity.id) }) : null;
    const footer = ansi(DIM, `— streaming (Ctrl+C to exit) —${badge !== null ? "  " + badge : ""}${laneHint ? "  " + laneHint : ""}`);
    if (tty)
      process.stdout.write(footer);
    else
      ok8(footer);
    for await (const frame of client2.follow(since, undefined, { exclude })) {
      if (frame.type === "entry") {
        if (senderWidth === undefined) {
          senderWidth = Math.min(28, Math.max(12, frame.entry.submission.sender.length));
        }
        const line = renderEntry(frame.entry, { senderWidth });
        if (tty)
          printAboveFooter(line, footer);
        else
          ok8(line);
        since = frame.entry.seq;
      }
    }
    if (tty)
      process.stdout.write(`
`);
  } else {
    const { entries, head } = await fetchLogEntries(client2, exclude);
    if (entries.length === 0) {
      ok8("(no entries)");
    } else {
      ok8(renderEntries(entries));
    }
    ok8(renderStateHeader(head));
    if (laneHint)
      ok8(ansi(DIM, laneHint));
  }
}
async function cmdChat(args2) {
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const roomIdFromUrl = room.url.split("/").pop() ?? "unknown";
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId: roomIdFromUrl,
    secretBytes: identity.secretBytes
  });
  const [{ entries, head }, state] = await Promise.all([
    client2.getEntries({ limit: 50 }),
    client2.getState().catch(() => null)
  ]);
  if (entries.length > 0)
    ok8(renderEntries(entries));
  const widths = entries.map((e) => e.submission.sender.length);
  let senderWidth = widths.length > 0 ? Math.min(28, Math.max(12, Math.max(...widths))) : undefined;
  let since = head.seq;
  let inputExit;
  const inputClosed = new Promise((resolve9) => {
    inputExit = resolve9;
  });
  const ac = new AbortController;
  const badge = state !== null ? composeBadge({ unread: 0, fsBehind: 0, fsConflict: 0, openDecisions: openDecisionsCount(state, identity.id) }) : null;
  const input = startChatInput({
    prompt: "> ",
    status: ansi(DIM, `— chat as ${identity.id} in ${roomIdFromUrl} (Ctrl+D to exit) —${badge !== null ? "  " + badge : ""}`),
    onSubmit: async (line) => {
      const text = line.trim();
      if (!text)
        return;
      const result = await client2.postEntry({ performative: "request", body: text });
      if (!result.ok) {
        input.showAbove(ansi("\x1B[31m", `post failed: [${result.error}] ${result.detail}`));
      }
    },
    onExit: () => {
      ac.abort();
      inputExit();
    }
  });
  const followDone = (async () => {
    try {
      for await (const frame of client2.follow(since, ac.signal)) {
        if (frame.type === "entry") {
          if (senderWidth === undefined) {
            senderWidth = Math.min(28, Math.max(12, frame.entry.submission.sender.length));
          }
          input.showAbove(renderEntry(frame.entry, { senderWidth }));
          since = frame.entry.seq;
        }
      }
    } catch (err2) {
      const msg = err2 instanceof Error ? err2.message : String(err2);
      input.showAbove(ansi("\x1B[31m", `stream error: ${msg}`));
    }
  })();
  await Promise.race([inputClosed, followDone]);
  input.close();
  ac.abort();
  await followDone.catch(() => {});
}
async function cmdPost(args2) {
  const body = args2.positional[0] ?? flag6(args2, "body");
  if (!body)
    die6("post: body is required (positional or --body)");
  const thread = flag6(args2, "thread");
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const input = { performative: "request", body };
  if (thread)
    input.thread = thread;
  const result = await client2.postEntry(input);
  if (!result.ok)
    die6(`post failed: [${result.error}] ${result.detail}`);
  ok8(`Posted seq=${result.seq}`);
}
async function cmdAnnounce(args2) {
  const taskRef = args2.positional[0];
  if (!taskRef)
    die6("announce: <task_ref> is required");
  const body = requiredFlag(args2, "body", "announce");
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const verdictBy = flag6(args2, "verdict-by");
  const claimWinStr = flag6(args2, "claim-window-s");
  const leaseTtlStr = flag6(args2, "lease-ttl-s");
  const maxClaimStr = flag6(args2, "max-claim-s");
  const dependsOn = flag6(args2, "depends-on");
  const data = { mode: "volunteer" };
  if (verdictBy)
    data["verdict_by"] = verdictBy.split(",").map((s) => s.trim());
  if (claimWinStr)
    data["claim_window_s"] = parseInt(claimWinStr, 10);
  if (leaseTtlStr)
    data["lease_ttl_s"] = parseInt(leaseTtlStr, 10);
  if (maxClaimStr)
    data["max_claim_s"] = parseInt(maxClaimStr, 10);
  if (dependsOn)
    data["depends_on"] = dependsOn.split(",").map((s) => s.trim());
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const result = await client2.postEntry({ performative: "announce", task_ref: taskRef, body, data });
  if (!result.ok)
    die6(`announce failed: [${result.error}] ${result.detail}`);
  ok8(`Announced ${taskRef} (seq=${result.seq})`);
}
async function simpleTaskCmd(performative, args2, requireBody = false) {
  const taskRef = args2.positional[0];
  if (!taskRef)
    die6(`${performative}: <task_ref> is required`);
  const body = flag6(args2, "body");
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  if (requireBody && !body)
    die6(`${performative}: --body is required`);
  const artifacts = flag6(args2, "artifact");
  const input = { performative, task_ref: taskRef };
  if (body)
    input.body = body;
  if (artifacts)
    input.artifacts = artifacts.split(",").map((s) => s.trim());
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const result = await client2.postEntry(input);
  if (!result.ok)
    die6(`${performative} failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  ok8(`${performative} ${taskRef} (seq=${result.seq})`);
}
async function runAck(client2, args2) {
  const seqArg = args2.positional[0];
  const escalateSeq = seqArg !== undefined ? Number(seqArg) : NaN;
  if (!Number.isInteger(escalateSeq) || escalateSeq < 0)
    die6("ack: <escalate_seq> (a room entry seq) is required");
  const result = await client2.postEntry({
    performative: "escalate.ack",
    data: { escalate_seq: escalateSeq }
  });
  if (!result.ok)
    die6(`ack failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  ok8(`acked escalation ${escalateSeq} (seq=${result.seq})`);
}
async function cmdAck(args2) {
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  await runAck(client2, args2);
}
function resolveDeliverMode(a) {
  if (a.dir && a.artifact)
    throw new Error("deliver: --dir and --artifact are mutually exclusive");
  if (a.dir)
    return { mode: "dir", dir: a.dir };
  if (a.artifact)
    return { mode: "ref", artifacts: a.artifact.split(",").map((s) => s.trim()) };
  throw new Error("deliver: provide --dir <path> or --artifact <ref>");
}
async function runDeliver(client2, args2) {
  const taskRef = args2.positional[0];
  if (!taskRef)
    die6("deliver: <task_ref> is required");
  let m;
  try {
    m = resolveDeliverMode({ dir: flag6(args2, "dir"), artifact: flag6(args2, "artifact") });
  } catch (err2) {
    die6(err2 instanceof Error ? err2.message : String(err2));
  }
  const body = flag6(args2, "body");
  let artifacts;
  let uploadNote = "";
  if (m.mode === "dir") {
    const excludes = [".git", ".mesh", ".meshignore", ...meshignoreToTarExcludes(loadMeshignore(m.dir))];
    const { bytes, hash, size: size2 } = await packDir(m.dir, { exclude: excludes });
    const put = await client2.putArtifact(hash, bytes);
    if (!put.ok)
      die6(`deliver: artifact upload failed: [${put.error}] ${put.detail}`);
    artifacts = ["r2:" + hash];
    uploadNote = `  artifact r2:${hash}  (${size2} bytes, ${put.deduped ? "deduped" : "uploaded"})`;
  } else {
    artifacts = m.artifacts;
  }
  const r = await client2.postEntry({
    performative: "deliver",
    task_ref: taskRef,
    artifacts,
    ...body ? { body } : {}
  });
  if (!r.ok)
    die6(`deliver failed: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok8(m.mode === "dir" ? `delivered ${taskRef} (seq=${r.seq})${uploadNote}` : `deliver ${taskRef} (seq=${r.seq})`);
  const watchOutcomes = await registerDeliverAutoWatch(client2, taskRef);
  for (const outcome of watchOutcomes) {
    if (!outcome.ok) {
      ok8(`deliver: warning — watch registration failed [${outcome.error}] ${outcome.detail} — you will not be notified of the verdict`);
    }
  }
}
async function cmdDeliver(args2) {
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  await runDeliver(client2, args2);
}
function resolveFetchRef(arg, entries) {
  if (arg.startsWith("r2:"))
    return parseArtifactRef(arg);
  for (let i = entries.length - 1;i >= 0; i--) {
    const s = entries[i].submission;
    if (s.performative === "deliver" && s.task_ref === arg && s.artifacts?.length) {
      return parseArtifactRef(s.artifacts[0]);
    }
  }
  throw new Error(`fetch: no delivery found for task "${arg}"`);
}
async function collectAllEntries(client2) {
  const all2 = [];
  let since = -1;
  for (;; ) {
    const { entries } = await client2.getEntries({ since, limit: 100 });
    all2.push(...entries);
    if (entries.length < 100)
      break;
    since = entries[entries.length - 1].seq;
  }
  return all2;
}
async function cmdFetch(args2) {
  const arg = args2.positional[0];
  if (!arg)
    die6("fetch: <task|r2:hash> is required");
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const entries = arg.startsWith("r2:") ? [] : await collectAllEntries(client2);
  let ref;
  try {
    ref = resolveFetchRef(arg, entries);
  } catch (err2) {
    die6(err2 instanceof Error ? err2.message : String(err2));
  }
  if (ref.kind === "other") {
    ok8(`Artifact is not an R2 tarball: ${ref.raw} (fetch it manually)`);
    return;
  }
  const bytes = await client2.getArtifact(ref.hash);
  if (!(bytes instanceof Uint8Array))
    die6(`fetch: [${bytes.error}] ${bytes.detail}${bytes.hint ? " — " + bytes.hint : ""}`);
  const name = arg.startsWith("r2:") ? ref.hash : arg;
  const dest = resolve8(flag6(args2, "into") ?? join14(home ?? meshHome(), "artifacts", name));
  await unpackInto(bytes, dest);
  ok8(`Extracted to ${dest}`);
}
var REFETCH_DEBOUNCE_MS = 300;
var TICK_MS = 5000;
var RECENT_LINES_CAP = 6;
function cancelableDelay(ms) {
  const { promise, resolve: resolve9 } = Promise.withResolvers();
  const timer = setTimeout(resolve9, ms);
  return { promise, cancel: () => {
    clearTimeout(timer);
    resolve9();
  } };
}
function startTicker(ms, onTick) {
  let stopped = false;
  let cancelCurrent = () => {};
  const loop = (async () => {
    while (!stopped) {
      const d = cancelableDelay(ms);
      cancelCurrent = d.cancel;
      await d.promise;
      if (!stopped)
        onTick();
    }
  })();
  return {
    stop: async () => {
      stopped = true;
      cancelCurrent();
      await loop;
    }
  };
}
async function followFilePlane(client2, since, onLine) {
  let senderWidth;
  for await (const frame of client2.follow(since)) {
    if (frame.type === "entry" && isFilePlaneEntry(frame.entry.submission.performative)) {
      since = frame.entry.seq;
      if (senderWidth === undefined)
        senderWidth = Math.min(28, Math.max(12, frame.entry.submission.sender.length));
      onLine(scrubControl(renderEntry(frame.entry, { senderWidth })), since);
    }
  }
}
function makeRateRetry(onWait) {
  return async (attempt, isRateLimited, retryAfterS) => {
    let r = await attempt();
    let waited = 0;
    while (isRateLimited(r) && waited < 300) {
      const waitS = Math.min(Math.max(1, retryAfterS(r) ?? 5), Math.max(1, 300 - waited));
      waited += waitS;
      if (onWait)
        onWait(waited);
      else
        process.stderr.write(`  … rate-limited; waiting ${waitS}s
`);
      await new Promise((res) => setTimeout(res, waitS * 1000));
      r = await attempt();
    }
    return r;
  };
}
var withRateRetry = makeRateRetry();
function resolveArtifactCap(defaults) {
  const v = defaults?.artifact_max_bytes;
  return typeof v === "number" && v > 0 ? v : DEFAULT_ARTIFACT_MAX_BYTES;
}
function oversizedTargets(sizes, capBytes) {
  return sizes.filter((s) => s.size > capBytes).map((s) => s.path);
}
function artifactCapExceededMessage(oversized, capBytes) {
  return `fs put: ${oversized.length} file(s) exceed the room's ${humanSize(capBytes)} artifact cap: ${oversized.join(", ")} — exclude via .meshignore, or raise it: mesh fs config artifact <bytes>`;
}
function resolvePutRepoPath(localPath, asFlag, root) {
  assertShareablePutSource(localPath, root);
  const repoPath = asFlag !== undefined ? asFlag : normalizeId(rebasePutPathOntoRoot(localPath, root));
  assertLegalPutDestination(repoPath);
  return repoPath;
}
function resolvePutDirPrefix(localPath, asFlag, root) {
  assertShareablePutSource(localPath, root);
  const raw = asFlag !== undefined ? asFlag : rebasePutPathOntoRoot(localPath, root);
  const prefix = raw.replace(/\\/g, "/").split("/").filter((s) => s.length > 0 && s !== ".").join("/");
  if (prefix.length > 0)
    assertLegalPutDestination(prefix);
  return prefix;
}
function assertShareablePutSource(localPath, root) {
  try {
    if (lstatSync2(localPath).isSymbolicLink()) {
      throw new Error(`fs put: refusing to follow symbolic link: ${localPath}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("fs put:"))
      throw error;
  }
  const rootName = basename4(resolve8(root)).normalize("NFC").toLowerCase();
  if (rootName === ".mesh" || rootName === ".meshignore") {
    throw new Error(`fs put: refusing to share reserved local mesh state: ${root}`);
  }
  const absolute = resolve8(localPath);
  const relativePath = relative(root, absolute);
  const insideRoot = relativePath === "" || !relativePath.startsWith("..") && !isAbsolute3(relativePath);
  const pathToInspect = insideRoot ? relativePath : absolute;
  const segments = pathToInspect.normalize("NFC").split(sep3).map((segment) => segment.toLowerCase());
  if (segments.includes(".mesh") || segments.includes(".meshignore")) {
    throw new Error(`fs put: refusing to share reserved local mesh state: ${localPath}`);
  }
}
function assertLegalPutDestination(repoPath) {
  const legal = isLegalPath(repoPath);
  if (!legal.ok)
    throw new Error(`fs put: illegal room path '${repoPath}': ${legal.reason}`);
}
function rebasePutPathOntoRoot(localPath, root) {
  const rel = relative(root, resolve8(localPath));
  if (rel.startsWith("..") || isAbsolute3(rel)) {
    throw new Error(`fs put: ${localPath} resolves outside the workspace root ${root} — use --as <repopath> to name it explicitly, or --root to widen the workspace root`);
  }
  return rel;
}
var FS_CMDS = {
  put: async (client2, args2, senderId, origin) => {
    const localPath = args2.positional[0];
    if (!localPath)
      die6("fs put: <path> is required");
    let isDir = false, exists = true;
    try {
      isDir = statSync5(localPath).isDirectory();
    } catch {
      exists = false;
    }
    if (!exists)
      die6(`fs put: no such file or directory: ${localPath}`);
    const home = flag6(args2, "home") ?? meshHome();
    const strict = flagBool4(args2, "strict");
    const attach = resolveAndAttachRoot({ rootFlag: flag6(args2, "root"), cwd: process.cwd(), home, origin, roomId: client2.roomId });
    if (!attach.ok)
      die6(attach.error);
    const { root, resolved } = attach;
    if (resolved !== null && root !== resolve8(process.cwd()))
      process.stderr.write(`root: ${root} (resolved via ${resolved.source})
`);
    const roomKey = roomKeyFor(origin, client2.roomId);
    let candidates;
    let treePrefix;
    let batchLabel;
    let prunedCount = 0;
    if (isDir) {
      let prefix;
      try {
        prefix = resolvePutDirPrefix(localPath, flag6(args2, "as"), root);
      } catch (err2) {
        die6(err2 instanceof Error ? err2.message : String(err2));
      }
      const isIgnored = makeIgnore(loadMeshignore(localPath), { includeHidden: flagBool4(args2, "all") });
      const rels = walkDirFiles(localPath, isIgnored);
      if (rels.length === 0)
        die6(`fs put: ${localPath} has no eligible files (hidden entries skipped unless --all; .meshignore patterns applied)`);
      candidates = rels.map((rel) => ({
        repoPath: [prefix, rel].filter((s) => s.length > 0).join("/"),
        localAbs: join14(localPath, rel)
      }));
      try {
        for (const candidate of candidates)
          assertLegalPutDestination(candidate.repoPath);
      } catch (err2) {
        die6(err2 instanceof Error ? err2.message : String(err2));
      }
      treePrefix = prefix;
      batchLabel = `${rels.length} file(s) from ${localPath}/ → ${prefix || "(room root)"}`;
      if (flagBool4(args2, "prune-ignored")) {
        const pruneResult = await pruneIgnoredPaths({
          root,
          roomKey,
          roomId: client2.roomId,
          home,
          treePrefix,
          isIgnored,
          getTree: (p) => client2.getTree(p),
          postDelete: (p) => withRateRetry(() => client2.postEntry({ performative: "file.delete", data: { path: p } }), (x) => !x.ok && x.error === "rate_limited", (x) => !x.ok ? x.retry_after_s : undefined)
        });
        if (!pruneResult.ok)
          die6(`fs put --prune-ignored: [${pruneResult.error}] ${pruneResult.detail}`);
        for (const row of pruneResult.rows)
          ok8(row.ok ? `  pruned: ${row.path}` : `  pruned: ${row.path} FAILED: [${row.error}] ${row.detail}`);
        prunedCount = pruneResult.prunedCount;
      }
    } else {
      let repoPath;
      try {
        repoPath = resolvePutRepoPath(localPath, flag6(args2, "as"), root);
      } catch (err2) {
        die6(err2 instanceof Error ? err2.message : String(err2));
      }
      candidates = [{ repoPath, localAbs: localPath }];
      treePrefix = repoPath;
      batchLabel = repoPath;
    }
    let state;
    try {
      state = await client2.getState();
    } catch {
      state = undefined;
    }
    const capBytes = resolveArtifactCap(state?.defaults);
    const sizes = candidates.map((c) => ({ path: c.repoPath, size: statSync5(c.localAbs).size }));
    const oversized = oversizedTargets(sizes, capBytes);
    if (oversized.length > 0) {
      die6(artifactCapExceededMessage(oversized, capBytes));
    }
    const targets = candidates.map((c) => ({
      repoPath: c.repoPath,
      localAbs: c.localAbs,
      localBytes: new Uint8Array(readFileSync14(c.localAbs))
    }));
    const json = flagBool4(args2, "json");
    const mode = resolveMode(json, process.stderr.isTTY ?? false);
    const rateLimit = state?.defaults.rate_limit;
    const reporter = createReporter({ mode, rateLimit });
    const result = await runPutBatch(client2, targets, {
      roomId: client2.roomId,
      home,
      root,
      roomKey,
      selfId: senderId,
      strict,
      treePrefix,
      stopOnError: flagBool4(args2, "stop-on-error"),
      retry: makeRateRetry(reporter.onWait),
      onProgress: reporter.sink
    });
    if (json) {
      process.exitCode = result.exitCode;
      return;
    }
    const verbose = flagBool4(args2, "verbose") || flagBool4(args2, "v");
    for (const row of result.rows) {
      if (verbose || putRowNeedsAttention(row.outcome))
        ok8(formatPutRowMessage(row.repoPath, row.outcome));
    }
    if (result.hardError && result.rows.length === 0) {
      const e = result.hardError;
      process.stderr.write(`fs put failed: [${e.error}]${e.detail ? " " + e.detail : ""}${e.hint ? " — " + e.hint : ""}
`);
      process.exitCode = 2;
      return;
    }
    const summary = summarizePutRows(result.rows);
    ok8(`fs put ${result.stopped ? "stopped early" : "done"}: ${formatPutSummary(batchLabel, summary)}${prunedCount > 0 ? `, ${prunedCount} pruned` : ""}  [exit ${result.exitCode}]`);
    if (result.stopped) {
      const done = result.rows.length, total = targets.length;
      const where = result.hardError ? "see the cause below" : "see the flagged rows above";
      ok8(`  aborted at ${done}/${total} files — ${total - done} not attempted (${where}, resolve, then re-run to resume${flagBool4(args2, "stop-on-error") ? "; or drop --stop-on-error to skip failures and continue" : ""})`);
    }
    if (result.hardError) {
      const e = result.hardError;
      process.stderr.write(`  cause: [${e.error}]${e.detail ? " " + e.detail : ""}${e.hint ? " — " + e.hint : ""}
`);
    } else if (summary.errors > 0) {
      ok8(`  ${summary.errors} file(s) failed and were skipped (rows above); re-run to retry, or --stop-on-error to abort on the first failure`);
    }
    if (result.informed)
      ok8("  conflicts/forks/resurrections signaled (see 'mesh fs status')");
    ok8(`verify: mesh fs status${treePrefix ? " " + treePrefix : ""}${verbose ? "" : "   (--verbose for the full per-file list)"}`);
    process.exitCode = result.exitCode;
  },
  ls: async (client2, args2) => {
    const prefix = args2.positional[0];
    const follow = flagBool4(args2, "f");
    const into = resolveWorkspaceRoot(flag6(args2, "into"), flag6(args2, "root"));
    const [treeResult, leasesResult, state] = await Promise.all([
      client2.getTree(prefix),
      client2.listLeases(),
      client2.getState()
    ]);
    if ("error" in treeResult)
      die6(`fs ls: [${treeResult.error}] ${treeResult.detail}`);
    if (!Array.isArray(leasesResult))
      die6(`fs ls: [${leasesResult.error}] ${leasesResult.detail}`);
    let rows = treeResult.tree;
    let leases = leasesResult;
    let cachedLocalSizes = localSizes(rows.map((r) => r.path), into);
    const posture = normalizeDefaultAccess(state.defaults.default_access).write;
    const render = (recent = []) => renderWorkspace({
      roomId: client2.roomId,
      posture,
      into,
      rows,
      leases,
      localSizes: cachedLocalSizes,
      policyFor,
      now: Date.now(),
      recent
    });
    ok8(render());
    if (!follow)
      return;
    const refetch = async () => {
      const [t, freshLeases] = await Promise.all([client2.getTree(prefix), client2.listLeases()]);
      if ("error" in t) {
        process.stderr.write(`fs ls: [${t.error}] ${t.detail}
`);
        return;
      }
      if (!Array.isArray(freshLeases)) {
        process.stderr.write(`fs ls: [${freshLeases.error}] ${freshLeases.detail}
`);
        return;
      }
      rows = t.tree;
      leases = freshLeases;
      cachedLocalSizes = localSizes(rows.map((r) => r.path), into);
    };
    const tty = process.stdout.isTTY ?? false;
    const since = state.head.seq;
    if (tty) {
      const recentLines = [];
      const redraw = () => {
        process.stdout.write("\x1B[2J\x1B[H");
        ok8(render(recentLines));
      };
      let refetchPending = false;
      let debounceTimer;
      const scheduleRefetch = () => {
        if (refetchPending)
          return;
        refetchPending = true;
        debounceTimer = setTimeout(() => {
          refetchPending = false;
          refetch().then(redraw);
        }, REFETCH_DEBOUNCE_MS);
      };
      const ticker = startTicker(TICK_MS, redraw);
      try {
        await followFilePlane(client2, since, (line) => {
          recentLines.push(line);
          if (recentLines.length > RECENT_LINES_CAP)
            recentLines.shift();
          scheduleRefetch();
        });
      } finally {
        clearTimeout(debounceTimer);
        await ticker.stop();
      }
    } else {
      const footer = ansi(DIM, "— streaming fs entries (Ctrl+C to exit) —");
      ok8(footer);
      await followFilePlane(client2, since, (line) => {
        ok8(line);
      });
    }
  },
  get: async (client2, args2, senderId, origin) => {
    const repopath = args2.positional[0];
    if (!repopath)
      die6("fs get: <repopath> is required");
    const home = flag6(args2, "home") ?? meshHome();
    const attach = resolveAndAttachRoot({ rootFlag: resolveRootFlag(flag6(args2, "into"), flag6(args2, "root")), cwd: process.cwd(), home, origin, roomId: client2.roomId });
    if (!attach.ok)
      die6(attach.error);
    const { root: into, resolved } = attach;
    if (resolved !== null && into !== resolve8(process.cwd()))
      process.stderr.write(`root: ${into} (resolved via ${resolved.source})
`);
    const roomKey = roomKeyFor(origin, client2.roomId);
    const prune = flagBool4(args2, "prune");
    const json = flagBool4(args2, "json");
    const reporter = createReporter({ mode: resolveMode(json, process.stderr.isTTY ?? false) });
    const result = await runGetBatch(client2, {
      roomId: client2.roomId,
      home,
      into,
      roomKey,
      prune,
      treePrefix: repopath,
      targets: [repopath],
      onProgress: reporter.sink
    });
    if (json) {
      process.exitCode = result.hardError ? 2 : result.exitCode;
      return;
    }
    if (result.hardError) {
      const e = result.hardError;
      process.stderr.write(`fs get: [${e.error}]${e.detail ? " " + e.detail : ""}${e.hint ? " — " + e.hint : ""}
`);
      process.exitCode = 2;
      return;
    }
    if (result.rows.every((r) => r.outcome.kind === "noop"))
      die6(`fs get: not in tree: ${repopath}`);
    if (result.rows.length === 1 && result.rows[0].outcome.kind === "gated") {
      die6(`fs get: '${repopath}' is discoverable but its content is gated — you lack a read grant on this path`);
    }
    let printed = false;
    for (const row of result.rows) {
      const line = formatGetRowMessage(row.repoPath, row.outcome);
      if (line) {
        ok8(line);
        printed = true;
      }
    }
    if (!printed) {
      ok8(result.rows.length > 1 ? `  ${repopath} (${result.rows.length} file(s), all in sync)` : `  ${repopath} (unchanged)`);
    }
    if (result.rows.some((r) => getRowNeedsVerify(r.outcome)))
      ok8(`verify: mesh fs status ${repopath}`);
    process.exitCode = result.exitCode;
  },
  rm: async (client2, args2) => {
    const repopath = args2.positional[0];
    if (!repopath)
      die6("fs rm: <repopath> is required");
    if (flagBool4(args2, "r") || flagBool4(args2, "recursive")) {
      const t = await client2.getTree(repopath);
      if ("error" in t)
        die6(`fs rm: [${t.error}] ${t.detail}`);
      const norm = normalizeId(repopath);
      const targets = t.tree.filter((n) => n.path === norm || n.path.startsWith(norm + "/"));
      if (targets.length === 0)
        die6(`fs rm: nothing under: ${repopath}`);
      for (const n of targets) {
        const r2 = await withRateRetry(() => client2.postEntry({ performative: "file.delete", data: { path: n.path } }), (x) => !x.ok && x.error === "rate_limited", (x) => !x.ok ? x.retry_after_s : undefined);
        if (!r2.ok)
          die6(`fs rm: ${n.path}: [${r2.error}] ${r2.detail}${r2.hint ? " — " + r2.hint : ""}`);
        ok8(`  rm ${n.path}`);
      }
      ok8(`fs rm: ${targets.length} file(s) under ${norm}`);
      return;
    }
    const r = await withRateRetry(() => client2.postEntry({ performative: "file.delete", data: { path: repopath } }), (x) => !x.ok && x.error === "rate_limited", (x) => !x.ok ? x.retry_after_s : undefined);
    if (!r.ok)
      die6(`fs rm: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
    ok8(`fs rm ${repopath}`);
  },
  edit: fsCmdEdit,
  lock: async (client2, args2) => {
    const repopath = args2.positional[0];
    if (!repopath)
      die6("fs lock: <path> is required");
    const r = await client2.postEntry({ performative: "file.lock", data: { path: repopath } });
    if (!r.ok) {
      if (r.error === "path_locked") {
        const holder = extractLockHolder(r.detail) ?? "another participant";
        const sub2 = await subscribePathWatch(client2, repopath);
        if (!sub2.ok)
          ok8(`fs lock: warning — watch registration failed [${sub2.error}] ${sub2.detail} — you will not be notified of conflicts`);
        die6(`fs lock: path '${repopath}' is locked by '${holder}' — you will be notified when it frees`);
      }
      die6(`fs lock: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
    }
    ok8(`fs lock ${repopath} (seq=${r.seq})`);
    const sub = await subscribePathWatch(client2, repopath);
    if (!sub.ok)
      ok8(`fs lock: warning — lock succeeded but watch registration failed [${sub.error}] ${sub.detail} — you will not be notified of conflicts`);
  },
  unlock: async (client2, args2) => {
    const repopath = args2.positional[0];
    if (!repopath)
      die6("fs unlock: <path> is required");
    const r = await client2.postEntry({ performative: "file.unlock", data: { path: repopath } });
    if (!r.ok)
      die6(`fs unlock: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
    ok8(`fs unlock ${repopath} (seq=${r.seq})`);
    await unsubscribePathWatch(client2, repopath);
  },
  grep: async (client2, args2, senderId, origin) => {
    const query = args2.positional[0];
    if (!query)
      die6("fs grep: <query> is required");
    const prefix = flag6(args2, "prefix");
    const limitStr = flag6(args2, "limit");
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const doHydrate = flagBool4(args2, "hydrate");
    const result = await client2.search(query, { prefix, limit });
    if ("error" in result) {
      if (result.error === "search_unavailable") {
        process.stderr.write(`fs grep: search is unavailable — index not ready or host unreachable
`);
      } else {
        process.stderr.write(`fs grep: [${result.error}] ${result.detail}
`);
      }
      process.exit(1);
    }
    if (result.results.length === 0) {
      ok8("(no matches)");
    } else {
      for (const r of result.results)
        ok8(grepLine(r));
    }
    const skipNote = formatGrepSkipNote(result.skipped_count);
    if (skipNote)
      process.stderr.write(skipNote + `
`);
    if (result.results.length === 0)
      return;
    if (!doHydrate)
      return;
    const home = flag6(args2, "home") ?? meshHome();
    const attach = resolveAndAttachRoot({ rootFlag: resolveRootFlag(flag6(args2, "into"), flag6(args2, "root")), cwd: process.cwd(), home, origin, roomId: client2.roomId });
    if (!attach.ok)
      die6(attach.error);
    const { root: into, resolved } = attach;
    if (resolved !== null && into !== resolve8(process.cwd()))
      process.stderr.write(`root: ${into} (resolved via ${resolved.source})
`);
    const roomKey = roomKeyFor(origin, client2.roomId);
    const hydrateReporter = createReporter({ mode: resolveMode(false, process.stderr.isTTY ?? false) });
    const hydrateResult = await hydrateGrepWinners(client2, result.results.map((r) => r.path), into, client2.roomId, roomKey, home, hydrateReporter.sink);
    if (hydrateResult.hardError) {
      const e = hydrateResult.hardError;
      process.stderr.write(`fs grep --hydrate: [${e.error}]${e.detail ? " " + e.detail : ""}
`);
      process.exitCode = 2;
      return;
    }
    if (hydrateResult.rows.some((r) => getRowNeedsVerify(r.outcome)))
      ok8("verify: mesh fs status");
    process.exitCode = hydrateResult.exitCode;
  },
  hydrate: async (client2, args2, senderId, origin) => {
    const prefix = args2.positional[0] ?? "";
    const home = flag6(args2, "home") ?? meshHome();
    const attach = resolveAndAttachRoot({ rootFlag: resolveRootFlag(flag6(args2, "into"), flag6(args2, "root")), cwd: process.cwd(), home, origin, roomId: client2.roomId });
    if (!attach.ok)
      die6(attach.error);
    const { root: into, resolved } = attach;
    if (resolved !== null && into !== resolve8(process.cwd()))
      process.stderr.write(`root: ${into} (resolved via ${resolved.source})
`);
    const roomKey = roomKeyFor(origin, client2.roomId);
    const prune = flagBool4(args2, "prune");
    const reporter = createReporter({ mode: resolveMode(false, process.stderr.isTTY ?? false) });
    const result = await hydrateSubtree(client2, prefix, into, client2.roomId, roomKey, home, prune, reporter.sink);
    if (result.hardError) {
      const e = result.hardError;
      process.stderr.write(`fs hydrate: [${e.error}]${e.detail ? " " + e.detail : ""}
`);
      process.exitCode = 2;
      return;
    }
    if (result.rows.length === 0) {
      ok8("(nothing to hydrate)");
      return;
    }
    ok8(`fs hydrate: ${result.rows.length} path(s) under ${prefix || "(room root)"} → ${resolve8(into)}`);
    if (result.rows.some((r) => getRowNeedsVerify(r.outcome)))
      ok8(`verify: mesh fs status${prefix ? " " + prefix : ""}`);
    process.exitCode = result.exitCode;
  },
  log: async (client2, args2) => {
    const follow = flagBool4(args2, "f");
    const tty = process.stdout.isTTY ?? false;
    if (follow) {
      const { entries, head } = await client2.getEntries({ limit: 100 });
      const fsEntries = entries.filter((e) => isFilePlaneEntry(e.submission.performative));
      if (fsEntries.length > 0)
        ok8(renderEntries(fsEntries));
      let senderWidth;
      if (fsEntries.length > 0) {
        const widths = fsEntries.map((e) => e.submission.sender.length);
        senderWidth = Math.min(28, Math.max(12, Math.max(...widths)));
      }
      let since = head.seq;
      const footer = ansi(DIM, "— streaming fs entries (Ctrl+C to exit) —");
      if (tty)
        process.stdout.write(footer);
      else
        ok8(footer);
      for await (const frame of client2.follow(since)) {
        if (frame.type === "entry" && isFilePlaneEntry(frame.entry.submission.performative)) {
          if (senderWidth === undefined) {
            senderWidth = Math.min(28, Math.max(12, frame.entry.submission.sender.length));
          }
          const line = renderEntry(frame.entry, { senderWidth });
          if (tty)
            printAboveFooter(line, footer);
          else
            ok8(line);
          since = frame.entry.seq;
        }
      }
      if (tty)
        process.stdout.write(`
`);
    } else {
      const { entries, head } = await client2.getEntries({ limit: 200 });
      const fsEntries = entries.filter((e) => isFilePlaneEntry(e.submission.performative));
      if (fsEntries.length === 0) {
        ok8("(no file-plane entries)");
      } else {
        ok8(renderEntries(fsEntries));
      }
      ok8(renderStateHeader(head));
    }
  },
  grant: fsCmdGrant,
  grants: fsCmdGrants,
  revoke: fsCmdRevoke,
  role: fsCmdRole,
  roles: fsCmdRoles,
  "role-rm": fsCmdRoleRm,
  leases: fsCmdLeases,
  config: fsCmdConfig,
  deps: async (client2, args2, senderId) => {
    const entryPath = args2.positional[0];
    if (!entryPath)
      die6("fs deps: <path> is required");
    const treeResult = await client2.getTree();
    if ("error" in treeResult)
      die6(`fs deps: [${treeResult.error}] ${treeResult.detail}`);
    const read = async (p) => {
      const node = resolveNode(treeResult.tree, p);
      if (!node)
        return "";
      let hash;
      try {
        hash = hashFromRef(node.content_hash);
      } catch {
        return "";
      }
      const blob = await client2.getArtifact(hash);
      if (!(blob instanceof Uint8Array))
        return "";
      return Buffer.from(blob).toString("utf8");
    };
    const closure = await tsResolver.closure(entryPath, read);
    const state = await client2.getState();
    const defaultAccess = normalizeDefaultAccess(state.defaults.default_access).discover;
    const grantsResult = await client2.listGrants();
    if (!Array.isArray(grantsResult)) {
      die6(`fs deps: [${grantsResult.error}] ${grantsResult.detail}`);
      return;
    }
    const grants = grantsResult;
    const canRead = (p) => {
      if (defaultAccess === "open")
        return true;
      return grants.some((g) => {
        if (g.subject !== senderId)
          return false;
        return prefixCovers(g.path_prefix, p) && gte(g.access, "read");
      });
    };
    if (closure.length === 0) {
      ok8(`${entryPath}: no out-of-entry dependencies found`);
      return;
    }
    const flagged = flagOutOfScope(closure, canRead);
    for (const { path: path7, readable } of flagged) {
      const tag = readable ? "[readable]" : "[unreadable — run: mesh fs request " + path7 + "]";
      ok8(`  ${path7}  ${tag}`);
    }
  },
  request: async (client2, args2) => {
    const requestPath = args2.positional[0];
    if (!requestPath)
      die6("fs request: <path> is required");
    const grade = flag6(args2, "grade") ?? "read";
    if (!isAccessGrade(grade))
      die6("fs request: --grade must be discover|read|write|exclusive");
    const r = await client2.postEntry({ performative: "file.request", data: { path: requestPath, grade } });
    if (!r.ok)
      die6(`fs request: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
    ok8(`fs request ${grade} on ${requestPath} (seq=${r.seq})`);
  },
  status: async (client2, args2, _senderId, origin, room) => {
    const prefix = args2.positional[0] ?? "";
    const deep = flagBool4(args2, "deep");
    const porcelain = flagBool4(args2, "porcelain");
    const home = flag6(args2, "home") ?? meshHome();
    const rootFlag = flag6(args2, "root") || undefined;
    const resolved = resolveReadOnlyRoot({ command: "fs status", rootFlag, cwd: process.cwd(), origin, roomId: client2.roomId, home, membershipRoot: room.workspace_root });
    const { root, roomKey, legacyAmbiguous } = resolved;
    const rows = await statusScan(client2, { prefix, root, home, deep, roomKey, legacyAmbiguous });
    const normPrefix = prefix ? normalizeId(prefix) : "";
    if (!porcelain) {
      ok8(`fs status: ${rows.length} path(s) under ${normPrefix || "."} (room=${client2.roomId})`);
      if (resolved.source !== "flag" && root !== resolve8(process.cwd()))
        process.stderr.write(`  root: ${root} (resolved via ${resolved.source})
`);
    }
    for (const row of rows)
      ok8(formatStatusLine(row, { porcelain }));
    if (!porcelain) {
      const needsGet = rows.find((r) => r.state === "behind" || r.state === "diverged");
      if (needsGet)
        ok8(`next: mesh fs get ${needsGet.path}`);
    }
  },
  diff: async (client2, args2, _senderId, origin, room) => {
    const repopath = args2.positional[0];
    if (!repopath)
      die6("fs diff: <path> is required");
    const showBase = flagBool4(args2, "base");
    const home = flag6(args2, "home") ?? meshHome();
    const rootFlag = flag6(args2, "root") || undefined;
    const resolved = resolveReadOnlyRoot({ command: "fs diff", rootFlag, cwd: process.cwd(), origin, roomId: client2.roomId, home, membershipRoot: room.workspace_root });
    const { root, roomKey, legacyAmbiguous } = resolved;
    const t = await client2.getTree();
    if ("error" in t)
      die6(`fs diff: [${t.error}] ${t.detail}`);
    const node = resolveNode(t.tree, repopath);
    if (!node)
      die6(`fs diff: not in tree: ${repopath}`);
    if (!node.content_hash)
      die6(`fs diff: '${repopath}' is discoverable but its content is gated — you lack a read grant on this path`);
    const norm = normalizeId(repopath);
    let localBytes;
    try {
      localBytes = readFileSync14(join14(root, repopath));
    } catch {
      die6(`fs diff: no local copy at ${resolve8(root, repopath)} — run 'mesh fs get ${repopath}' first`);
    }
    let hash;
    try {
      hash = hashFromRef(node.content_hash);
    } catch (e) {
      die6(`fs diff: ${e instanceof Error ? e.message : String(e)}`);
    }
    const blob = await client2.getArtifact(hash);
    if (!(blob instanceof Uint8Array))
      die6(`fs diff: [${blob.error}] ${blob.detail}${blob.hint ? " — " + blob.hint : ""}`);
    if (!isValidUtf8Bytes(new Uint8Array(localBytes)) || !isValidUtf8Bytes(blob)) {
      ok8(`binary differs: ${localBytes.length}b vs ${blob.length}b`);
      return;
    }
    const mineText = localBytes.toString("utf8");
    const tipText = Buffer.from(blob).toString("utf8");
    const sidecar = readSidecarResolved(root, roomKey, client2.roomId, norm, home, legacyAmbiguous);
    if (!sidecar)
      ok8("(no sync base — comparing mine vs tip only)");
    if (showBase && sidecar) {
      if (sidecar.content === undefined) {
        ok8("(sidecar stores hash only — base text not cached locally; comparing mine vs tip only)");
      } else {
        ok8("# base -> mine");
        ok8(unifiedDiff(sidecar.content, mineText, "base", "mine"));
        ok8("# base -> tip");
        ok8(unifiedDiff(sidecar.content, tipText, "base", "tip"));
        return;
      }
    }
    ok8(unifiedDiff(mineText, tipText, "mine", "tip"));
  }
};
async function cmdRooms(_args) {
  const inventory = scanMachineInventory();
  if (inventory.length === 0) {
    ok8('No local identities found. Run "mesh keygen" first.');
    return;
  }
  const totalMemberships = inventory.reduce((n, h2) => n + h2.memberships.length, 0);
  if (totalMemberships === 0) {
    ok8('No room memberships found on this machine. Run "mesh room create <name>" or "mesh join <url> <room>".');
    return;
  }
  ok8("Legend: * = active room  ·  attachment = default local checkout (— = not attached)");
  for (const h2 of [...inventory].sort((a, b) => a.label.localeCompare(b.label))) {
    if (h2.memberships.length === 0)
      continue;
    ok8(`${h2.label} (${h2.identityId}):`);
    for (const m of [...h2.memberships].sort((a, b) => a.roomId.localeCompare(b.roomId))) {
      const mark = m.active ? "*" : " ";
      ok8(wrapHangingIndent(`${mark} ${m.roomId}  origin=${m.origin}  attachment=${m.workspace_root ?? "—"}`));
    }
  }
  if (registryIsUnreadable()) {
    ok8(`
(rebuilding) machine registry is unreadable — ad-hoc --home directories won't appear here until you run a mesh command in them again; default and named-profile homes are always shown by convention.`);
  }
}
function wrapHangingIndent(line, indent = 4, maxWidth = 100) {
  if (line.length <= maxWidth)
    return line;
  const pad = " ".repeat(indent);
  const words = line.split(" ");
  const out = [];
  let current = "";
  for (const word of words) {
    const next = current.length === 0 ? word : `${current} ${word}`;
    if (next.length > maxWidth && current.length > 0) {
      out.push(current);
      current = pad + word;
    } else {
      current = next;
    }
  }
  if (current.length > 0)
    out.push(current);
  return out.join(`
`);
}
function registryIsUnreadable() {
  const p = join14(machineDir(), "registry.json");
  if (!existsSync8(p))
    return false;
  try {
    JSON.parse(readFileSync14(p, "utf8"));
    return false;
  } catch {
    return true;
  }
}
async function cmdFs(args2) {
  const sub = args2.positional.shift();
  const handler = sub ? FS_CMDS[sub] : undefined;
  if (!handler) {
    die6(`usage: mesh fs put <path> [--as <repopath>] [--root <dir>] [--strict] [--prune-ignored] [--verbose] [--stop-on-error] [--json] | ls [<prefix>] [-f] [--into <dir>] | get <repopath> [--into <dir>] [--prune] [--json] | rm <repopath> | edit <path> [--into <dir>] | lock <path> | unlock <path> | grep <query> [--prefix <path-prefix>] [--limit <n>] [--hydrate [--into <dir>]] | hydrate [<prefix>] [--into <dir>] [--prune] | grant <subject> <path> <grade> | grants | revoke <subject> <path> | role <participant> <role> | roles | role-rm <participant> <role> | leases | config <open|closed> | deps <path> | request <path> [--grade read] | status [<prefix>] [--deep] [--porcelain] [--root <dir>] | diff <path> [--base] [--root <dir>]
  write policy by extension: code (.ts .js .py .go .rs …) -> merge on \`put\` · prose (.md .txt) -> shared CRDT via \`edit\` · opt-in serialize: \`lock\`/\`unlock\`
  grades: discover < read < write < exclusive`);
  }
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const origin = normalizeOrigin(room.url);
  await handler(client2, args2, identity.id, origin, room);
}
async function cmdDecide(args2) {
  const sub = args2.positional.shift();
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const handler = sub ? DECIDE_CMDS[sub] : undefined;
  if (!handler) {
    die6("usage: mesh decide wait-report [--since <ISO>] [--human <id[,id...]>]");
  }
  await handler(client2, args2, identity.id);
}
function claimStateMarkers(claim, selfId, nowMs) {
  const stalled = isClaimStalled({ state: claim.state, holder: claim.holder, max_claim_until: claim.max_claim_until != null ? Date.parse(claim.max_claim_until) : null }, selfId, nowMs) ? "  STALLED" : "";
  const rejected = claim.rejected_holder != null ? `  rejected(${claim.rejected_holder}@${claim.reject_seq})` : "";
  return `${stalled}${rejected}`;
}
async function cmdDoctor(args2) {
  const home = flag6(args2, "home") ?? meshHome();
  const roomArg = flag6(args2, "room");
  const urlFlag = flag6(args2, "url");
  const { roomId, entry: room } = resolveRoom(roomArg, home, urlFlag);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const origin = normalizeOrigin(room.url);
  const rootFlag = flag6(args2, "root") || undefined;
  const resolved = resolveReadOnlyRoot({ command: "mesh doctor", rootFlag, cwd: process.cwd(), origin, roomId, home, membershipRoot: room.workspace_root });
  if (resolved.source !== "flag" && resolved.root !== resolve8(process.cwd()))
    process.stderr.write(`root: ${resolved.root} (resolved via ${resolved.source})
`);
  await runDoctor(client2, args2, { root: resolved.root, home, roomKey: resolved.roomKey, legacyAmbiguous: resolved.legacyAmbiguous });
}
async function cmdState(args2) {
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const state = await client2.getState();
  ok8(renderStateHeader(state.head));
  ok8("");
  ok8("Claims:");
  if (state.claims.length === 0) {
    ok8("  (none)");
  } else {
    for (const claim of state.claims) {
      const holder = claim.holder ? `  holder=${claim.holder}` : "";
      const lease = claim.lease_expires ? `  lease=${claim.lease_expires}` : "";
      const markers = claimStateMarkers(claim, identity.id, Date.now());
      ok8(`  ${claim.task_ref}  ${claim.state}${holder}${lease}${markers}`);
    }
  }
  ok8("");
  ok8("Roster:");
  const rosterRows = state.roster.map((p) => ({
    participant_id: p.participant_id,
    roles: p.roles,
    specialties: p.specialties,
    owner_team: p.card.owner_team,
    host: p.card.host,
    last_seen_seq: p.last_seen_seq,
    condition: p.condition,
    condition_seq: p.condition_seq,
    condition_ts: p.condition_ts,
    retired_seq: p.retired_seq,
    pubkey: p.pubkey
  }));
  ok8(renderRoster(rosterRows));
  ok8("");
  ok8("Bindings:");
  const stateBindings = state.bindings ?? [];
  if (stateBindings.length === 0) {
    ok8("  (none)");
  } else {
    for (const b of stateBindings) {
      ok8(`  ${scrubControl(b.participant)}  ${scrubControl(b.role)}  ${fmtWindow(b.active_from, b.active_until)}  in_window=${b.in_window}`);
    }
  }
}
function buildWatchPredicate(args2) {
  const subCmd = args2.positional[0];
  if (subCmd === "task") {
    const taskRef = args2.positional[1];
    const state = args2.positional[2];
    if (!taskRef || !state)
      die6("watch task: usage: mesh watch task <task_ref> <STATE>");
    return { kind: "task_state", task_ref: taskRef, to: state };
  } else if (subCmd === "entry") {
    const perf = flag6(args2, "performative");
    const thread = flag6(args2, "thread");
    const mentionMe = flagBool4(args2, "mention-me");
    const path7 = flag6(args2, "path");
    const participant = flag6(args2, "participant");
    const taskRef = flag6(args2, "task-ref");
    return {
      kind: "entry",
      ...perf !== undefined ? { performative: perf } : {},
      ...thread !== undefined ? { thread } : {},
      ...mentionMe ? { mention_me: true } : {},
      ...path7 !== undefined ? { path: path7 } : {},
      ...participant !== undefined ? { participant } : {},
      ...taskRef !== undefined ? { task_ref: taskRef } : {}
    };
  }
  die6('watch: sub-command must be "task" or "entry"');
}
async function cmdWatch(args2) {
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const predicate = buildWatchPredicate(args2);
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const result = await client2.postWatch(predicate);
  if (!result.ok)
    die6(`watch failed: [${result.error}] ${result.detail}`);
  ok8(`Watch registered: ${result.watch_id}`);
}
async function cmdWhoami(args2) {
  const home = flag6(args2, "home");
  const identity = loadIdentity(home);
  if (!identity)
    die6('No identity. Run "mesh keygen --id <id>" first.');
  const h2 = home ?? meshHome();
  ok8(`id:     ${identity.id}`);
  ok8(`pubkey: ${identity.pubkey}`);
  if (identity.roles && identity.roles.length > 0)
    ok8(`roles:  ${identity.roles.join(", ")}`);
  ok8(`home:   ${h2}  (config dir — set MESH_HOME or --home to change)`);
  ok8(`        holds identity.json · rooms.json · active_room`);
  const rooms = loadRooms(home);
  const roomIds = Object.keys(rooms.memberships).map((k) => roomIdFromRoomKey(k));
  if (roomIds.length > 0) {
    const active = getActiveRoom(home);
    ok8(`rooms:  ${roomIds.map((r) => r === active ? `${r} (active)` : r).join(", ")}`);
  }
}
async function cmdInbox(args2) {
  const sinceStr = flag6(args2, "since");
  const mark = flagBool4(args2, "mark");
  const home = flag6(args2, "home");
  const roomArg = flag6(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home, flag6(args2, "url"));
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die6('No identity. Run "mesh keygen" first.');
  const client2 = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const opts = { mark };
  if (sinceStr !== undefined)
    opts.since = parseInt(sinceStr, 10);
  const [result, state] = await Promise.all([client2.getEntries(opts), client2.getState().catch(() => null)]);
  if (result.entries.length === 0 && result.notifies.length === 0) {
    ok8("(inbox empty)");
  } else {
    if (result.entries.length > 0)
      ok8(renderInboxDigest(result.entries));
    for (const n of result.notifies) {
      ok8(`  notify  watch=${n.watch_id}  entry_seq=${n.entry_seq}`);
    }
  }
  ok8(renderStateHeader(result.head));
  if (mark)
    ok8("(read cursor advanced)");
  const badge = composeBadge({
    unread: result.entries.length,
    fsBehind: 0,
    fsConflict: 0,
    openDecisions: state !== null ? openDecisionsCount(state, identity.id) : 0
  });
  if (badge !== null)
    ok8(badge);
  process.exitCode = inboxExitCode(result.entries.length, result.notifies.length);
}
function inboxExitCode(entryCount, notifyCount) {
  return entryCount > 0 || notifyCount > 0 ? 1 : 0;
}
var USAGE = `mesh v${getVersion()} — shared agent coordination & live workspace

identity:
  init                                                      Interactive setup: profile + identity + room
  keygen --id <id> [--roles <a,b>] [--force]                Generate an Ed25519 identity keypair (--force replaces an existing identity)
  use <profile-name>                                        Switch the active profile (persisted)
  profile list                                              List profiles (* = active)
  whoami                                                    Show current identity (id, pubkey, home)
  identity list                                             List local identities; flags id/key collisions
  identity copy --from <home> --to <home> [--force]         Reuse one keypair across homes (local-testing only)
  key rotate                                                 Rotate to the pre-committed next key (Intent A)
  key retire                                                 Retire this identity: no further entries may be authored

room:
  room create <room_id> --owner <id> [--url <base>] [--host <name>] Create a room and join as owner (--url: $ROOM_URL or hosted default)
  room join <room-url> <room>.<secret> [--host <name>]      Join an existing room
  room join <room-url> <room> --passphrase <phrase> [--host <name>] Join with a single-use passphrase invite
  room invite [<room_id>] [--show | --rotate]               Show or rotate the invite secret (owner only)
  room invite [<room_id>] --for <id> [--passphrase <p>] [--ttl <s>]  Mint a single-use passphrase invite for one participant id (owner only)
  room invite [<room_id>] [--list | --revoke <id>]          List or revoke pending passphrase invites (owner only)
  room list                                                 List locally-joined rooms (* = active)
  room rm <room_id>                                         Forget a room locally (not a server delete)
  room delete <room_id>                                     Delete the room on the server (owner only)
  room log [-f]                                             Alias for log
  rooms                                                     Machine-wide inventory: every profile × room membership, offline (Intent T)
    aliases: create-room → room create · join → room join

messaging:
  log [-f] [--all]                                          Show room log — collab lane by default (file.* / system.* entries hidden; use --all for the full log, or 'fs log' for the file plane). -f: follow
  chat                                                      Live stream + interactive post
  open [--read-only] [--print]                              Open the room's web view in a browser (write link signs as your identity; --read-only omits the key)
  ui [--port <n>] [--profile <name>] [--print] [--no-open] [--status | --stop | --restart]
                                                             Control one machine-wide manager; stop/restart invalidates every connected tab
  post <body> [--body <s>] [--thread <t>]                   Post a request entry (--body is the non-positional form)

tasks:
  announce <task_ref> --body <s> [--verdict-by <id>]        Post a claimable task
    [--claim-window-s <n>] [--lease-ttl-s <n>] [--max-claim-s <n>] [--depends-on <ref[,ref]>]
  claim <task_ref> [--body <s>] [--artifact <ref>]          Claim a task (first writer wins — CAS)
  release <task_ref> [--body <s>] [--artifact <ref>]        Release a held task
  deliver <task_ref> [--dir <path> | --artifact <ref>] [--body <s>]    Deliver artifacts (--dir: tars the tree, honoring .meshignore + always excluding .git)
  accept <task_ref> [--body <s>] [--artifact <ref>]         Accept delivery → DONE
  reject <task_ref> --body <reason> [--artifact <ref>]      Reject delivery → back to ANNOUNCED
  inform <task_ref> --body <s> [--artifact <ref>]           Post a progress update (no state change)
  ack <escalate_seq>                                        Mark an escalation handled (attributed; any member)
  fetch <task|r2:hash> [--into <dir>]                       Download + extract a delivered artifact
  watch task <task_ref> <STATE>                             Register a task-state watch
  watch entry [--performative <P>] [--thread <T>]           Register an entry watch
            [--mention-me] [--path <p>] [--participant <id>] [--task-ref <ref>]

files:
  (workspace root = a normal project folder; mutating fs put/get/hydrate/edit attach --root/--into, the nearest enclosing attachment, or cwd on first use; read-only fs status/diff/doctor fall back to the membership's first attached default; room paths are relative to that root; no .mesh/fs shadow copy)
  fs put <path|dir> [--as <repopath>] [--all] [--strict] [--prune-ignored] [--verbose|-v] [--stop-on-error] [--json]  Upload a file or directory (.meshignore excludes, --all includes hidden except reserved .mesh/.meshignore; --strict aborts on sync conflicts; --prune-ignored evicts room copies of paths .meshignore newly excludes, via file.delete). Streams a live progress line by default (in place on a TTY, throttled lines when captured), then a metrics summary — \`fs put done: … [exit N]\` — plus per-file lines only for outcomes needing attention. --verbose/-v lists every file; an oversized file fails the whole batch up front (client-side preflight against the room's artifact cap, names every offending file, before any upload), a server-rejected file mid-batch is skipped and reported, --stop-on-error aborts at the first failure; --json streams NDJSON.
  fs ls [<prefix>] [-f] [--into <dir>|--root <dir>]         List the shared workspace tree (-f: live view — tree, leases, hydration); local column compares against the workspace root
  fs get <repopath|prefix> [--into <dir>|--root <dir>] [--prune] [--json] Hydrate a file/subtree (streams a live progress line by default); --prune drops local copies the room cleanly deleted; --json streams NDJSON progress
  fs rm <repopath> [-r|--recursive]                         Delete a file (or a whole subtree recursively)
  fs edit <path> [--into <dir>|--root <dir>]                Subscribe + edit a live Yjs doc (Ctrl+C to exit)
  fs lock <path>                                            Acquire exclusive lease (file.lock)
  fs unlock <path>                                          Release exclusive lease (file.unlock)
  fs grep <query> [--prefix <p>] [--limit <n>] [--hydrate] [--into <dir>|--root <dir>] Search file content; --hydrate fetches matched files
  fs log [-f]                                               Show workspace changes (file.*, system.grant/role/revoke/lease_clear/config) (-f: follow)
  fs hydrate [<prefix>] [--into <dir>|--root <dir>] [--prune]  Bulk-download subtree to disk, into the workspace root (default: cwd); same safety + --prune as fs get
  fs grant <subject> <path> <grade>                         Issue a path grant (owner only; grade: discover|read|write|exclusive)
  fs grants                                                 List all path grants in the room
  fs revoke <subject> <path>                                Revoke a previously issued path grant (owner only)
  fs role <participant> <role> [--replaces <id>] [--depth <n>] [--from <iso>] [--until <iso>] [--override]
                                                             Bind (or swap) a participant to a file-plane role (owner only)
  fs roles                                                  List all role bindings in the room
  fs role-rm <participant> <role>                           Unbind a participant's file-plane role (owner only)
  fs leases                                                 List all active file leases
  fs config <open|closed> | write <open|closed> | discover <open|closed> | rate <spec> | authority-source <card|bindings> | archive <n> | fts <bytes> | artifact <bytes> | public-share <on|off>
                                                             Set default_access posture, rate limit, verdict authority posture, entries-axis checkpoint threshold (Intent P, 0=off), FTS per-file size cap, artifact size ceiling, or public browser file-view sharing — owner only
  fs deps <path>                                            Walk a file's import closure; flag deps you can't read
  fs request <path> [--grade <grade>]                       Post an advisory access request for a path
  fs status [<prefix>] [--deep] [--porcelain] [--root <dir>]  Awareness: per-file sync state vs the room (= in-sync ↑ ahead ↓ behind ⇅ diverged C markers \uD83D\uDD12 locked ? untracked ✝ room-deleted); --deep dry-runs a merge on diverged files; read-only, exit 0 always
  fs diff <path> [--base] [--root <dir>]                    Unified diff of your local copy against the room tip (no local writes); --base adds a 3-way base↔mine/base↔tip summary

agent:
  state                                                     Show claims table + roster
  inbox [--since <seq>] [--mark]                            Fetch entries since your read cursor
  brief                                                     Show room charter + your seat(s) + situation (Intent I)
  doctor [--porcelain] [--root <dir>]                       One-step health view: open escalations, stalled holds, lapsed/overdue
                                                             decisions, stale/gone conditions, local fs conflicts, chain integrity,
                                                             missing delivered artifacts; exit 0 clean / 1 problems found / 2 hard error

decisions:
  decide ask "<question>" --by <arm[,arm...]> [--deadline <ISO>]     Ask a named settler (id:<pid>|role:<name> arms)
    [--fallback-note <text>] [--ref <ref[,...]>]
  decide answer <decision-id> --resolution '<text-or-json>'          Settle an open decision you're authorized for
  decide list [--mine|--role <R>]                                    List decisions (deadline-ordered; --mine/--role filter)
  decide show <decision-id>                                          Show a decision + its thread's entries
  decide wait-report [--since <ISO>] [--human <id[,id...]>]          Measure question→answer wait times (no version gate)

Global options:
  --room <room_id>    Target room (if you have multiple rooms)
  --home <dir>        Override MESH_HOME (default: ~/.mesh)
  --profile <name>    Use a named profile (overridden by MESH_HOME / --home)
  ROOM_URL (env)      Room base URL when --url is omitted (else the hosted default)
  --help, -h          Show this usage (anywhere in the command line)
  --version, -V       Print the CLI version (also: mesh version)
`;
function usageText() {
  return USAGE;
}
function usage() {
  ok8(USAGE);
}
function expandHome(p) {
  return p.startsWith("~/") ? os5.homedir() + p.slice(1) : p;
}
async function cmdIdentity(args2) {
  const sub = args2.positional.shift();
  switch (sub) {
    case "list":
      return cmdIdentityList();
    case "copy":
      return cmdIdentityCopy(args2);
    default:
      die6(`identity: unknown action "${sub ?? ""}". Use: mesh identity list|copy`);
  }
}
function cmdIdentityList() {
  const homes = listIdentityHomes();
  if (homes.length === 0) {
    ok8('No identities under ~/.mesh*. Run "mesh keygen --id <id>".');
    return;
  }
  const current = process.env["MESH_HOME"] ?? meshHome();
  const keysById = new Map;
  for (const { identity } of homes) {
    const set = keysById.get(identity.id) ?? new Set;
    set.add(identity.pubkey);
    keysById.set(identity.id, set);
  }
  ok8(`Local identities (~/.mesh*) — current MESH_HOME: ${current}`);
  for (const { home, identity } of homes) {
    const mark = home === current ? "*" : " ";
    const dupe = (keysById.get(identity.id)?.size ?? 1) > 1 ? "  ⚠ id reused with a different key" : "";
    ok8(`${mark} ${home}`);
    ok8(`    ${identity.id}  ${identity.pubkey}${dupe}`);
  }
  const collided = [...keysById.entries()].filter(([, s]) => s.size > 1).map(([id2]) => id2);
  if (collided.length > 0) {
    ok8(``);
    ok8(`⚠ Same id, different keypairs: ${collided.join(", ")}. A room trusts only the FIRST key an id`);
    ok8(`  used (trust-on-first-use); the others hit id_taken on join. Reconcile into one identity:`);
    ok8(`    mesh identity copy --from <home-that-owns-the-room> --to <other-home> --force`);
  }
}
async function cmdIdentityCopy(args2) {
  const fromArg = flag6(args2, "from");
  const toArg = flag6(args2, "to");
  if (!fromArg || !toArg)
    die6("identity copy: usage: mesh identity copy --from <home> --to <home> [--force]");
  const from2 = expandHome(fromArg);
  const to = expandHome(toArg);
  if (from2 === to)
    die6("identity copy: --from and --to are the same home");
  const src = loadIdentity(from2);
  if (!src)
    die6(`identity copy: no identity.json in ${from2}`);
  const dst = loadIdentity(to);
  if (dst && !flagBool4(args2, "force")) {
    die6(`identity copy: ${to} already has identity "${dst.id}" (${dst.pubkey}). Use --force to overwrite.`);
  }
  saveIdentity(src, to);
  ok8(`Copied identity → ${to}`);
  ok8(`  ${src.id}  ${src.pubkey}`);
  ok8(`Both homes now share ONE keypair (local-testing only — they are now the SAME participant,`);
  ok8(`not isolated agents). Use separate keygen'd identities for anything real.`);
}
async function main() {
  const argv = process.argv.slice(2);
  if (wantsHelp(argv)) {
    usage();
    return;
  }
  if (wantsVersion(argv)) {
    ok8(`mesh v${getVersion()}`);
    return;
  }
  const args2 = parseArgs(argv, FLAG_ARITY);
  const specKey = specKeyFor(args2.positional);
  const flagErr = validateFlags(specKey, args2);
  if (flagErr !== null)
    die6(flagErr);
  const posErr = validatePositionals(specKey, args2);
  if (posErr !== null)
    die6(posErr);
  if (!flag6(args2, "home")) {
    args2.flags["home"] = resolveProfileHome(flag6(args2, "profile"));
  }
  const cmd = args2.positional.shift();
  switch (cmd) {
    case "init":
      return cmdInit(args2);
    case "keygen":
      return cmdKeygen(args2);
    case "create-room":
      return cmdCreateRoom(args2);
    case "join":
      return cmdJoin(args2);
    case "room":
      return cmdRoom(args2);
    case "rooms":
      return cmdRooms(args2);
    case "log":
      return cmdLog(args2);
    case "chat":
      return cmdChat(args2);
    case "open":
      return cmdOpen(args2);
    case "ui":
      return cmdUi(args2);
    case "post":
      return cmdPost(args2);
    case "announce":
      return cmdAnnounce(args2);
    case "claim":
      return simpleTaskCmd("claim", args2);
    case "release":
      return simpleTaskCmd("release", args2);
    case "deliver":
      return cmdDeliver(args2);
    case "accept":
      return simpleTaskCmd("accept", args2);
    case "reject":
      return simpleTaskCmd("reject", args2, true);
    case "inform":
      return simpleTaskCmd("inform", args2, true);
    case "ack":
      return cmdAck(args2);
    case "state":
      return cmdState(args2);
    case "watch":
      return cmdWatch(args2);
    case "whoami":
      return cmdWhoami(args2);
    case "identity":
      return cmdIdentity(args2);
    case "key":
      return cmdKey(args2);
    case "inbox":
      return cmdInbox(args2);
    case "brief":
      return cmdBrief(args2);
    case "fetch":
      return cmdFetch(args2);
    case "fs":
      return cmdFs(args2);
    case "decide":
      return cmdDecide(args2);
    case "doctor":
      return cmdDoctor(args2);
    case "version":
      ok8(`mesh v${getVersion()}`);
      return;
    case "use": {
      const name = args2.positional.shift();
      if (!name)
        die6("use: <profile-name> is required");
      setActiveProfile(name);
      ok8(`Active profile set to "${name}".`);
      return;
    }
    case "profile": {
      const sub = args2.positional.shift();
      if (sub === "list") {
        const profiles = listProfiles();
        if (profiles.length === 0) {
          ok8("No profiles. Create one with: mesh use <name>");
          return;
        }
        const active = getActiveProfile();
        for (const p of profiles)
          ok8(`${p === active ? "*" : " "} ${p}`);
        return;
      }
      die6(`profile: unknown subcommand "${sub ?? ""}". Available: list`);
      return;
    }
    case "help":
    case undefined:
      usage();
      break;
    default: {
      const roomSubs = ["rm", "delete", "list", "create", "join", "remove", "forget"];
      if (cmd && roomSubs.includes(cmd))
        die6(`Unknown command: ${cmd}. Did you mean "mesh room ${cmd}"?`);
      die6(`Unknown command: ${cmd}. Run "mesh help" for usage.`);
    }
  }
}
main().catch((err2) => {
  const msg = err2 instanceof Error ? err2.message : String(err2);
  process.stderr.write(`mesh: ${msg}
`);
  process.exit(1);
});
export {
  wantsVersion,
  wantsHelp,
  usageText,
  runDeliver,
  runAck,
  resolvePutRepoPath,
  resolvePutDirPrefix,
  resolveLogExclude,
  resolveFetchRef,
  resolveDeliverMode,
  resolveArtifactCap,
  oversizedTargets,
  openDecisionsCount,
  makeRateRetry,
  localSizes,
  isFilePlaneEntry,
  inboxExitCode,
  hydrateSubtree,
  hydrateGrepWinners,
  grepLine,
  generatePassphrase,
  formatGrepSkipNote,
  flagOutOfScope,
  fetchLogEntries,
  extractInviteSecret,
  collectAllEntries,
  collabLaneHint,
  cmdRooms,
  cmdRoomRm,
  cmdRoom,
  cmdFs,
  cmdDoctor,
  cmdCreateRoom,
  claimStateMarkers,
  buildWatchPredicate,
  artifactCapExceededMessage,
  JOIN_NEXT_STEPS,
  COLLAB_LANE_EXCLUDE
};
