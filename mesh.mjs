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
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

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
function normalizeId(path) {
  return path.normalize("NFC").replace(/\\/g, "/").split("/").filter((s) => s.length > 0).map((s) => s.toLowerCase()).join("/");
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
  "system.decision_lapse": true
};
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
  "system.decision_lapse": true
};
var PARTICIPANT_PERFORMATIVES = Object.keys(PERFORMATIVE_SET).filter((p) => !(p in ROOM_ONLY));
// ../proto/src/machine.ts
var MAX_DURATION_S = 30 * 24 * 60 * 60;
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
// src/config.ts
function meshHome() {
  return process.env["MESH_HOME"] ?? path.join(os.homedir(), ".mesh");
}
var PROFILES_ROOT = () => process.env["MESH_HOME_ROOT"] ?? path.join(os.homedir(), ".mesh");
function readCwdProfile(cwd) {
  let dir = cwd;
  for (;; ) {
    const f = path.join(dir, ".mesh-profile");
    if (fs.existsSync(f))
      return fs.readFileSync(f, "utf8").trim() || null;
    const up = path.dirname(dir);
    if (up === dir)
      return null;
    dir = up;
  }
}
function resolveProfileHome(profileFlag, cwd = process.cwd()) {
  if (process.env["MESH_HOME"])
    return process.env["MESH_HOME"];
  const name = profileFlag ?? readCwdProfile(cwd) ?? getActiveProfile();
  return name ? path.join(PROFILES_ROOT(), "profiles", name) : path.join(os.homedir(), ".mesh");
}
function loadConfig(home) {
  const f = path.join(home ?? meshHome(), "config.json");
  if (!fs.existsSync(f))
    return {};
  const raw = JSON.parse(fs.readFileSync(f, "utf8"));
  if (typeof raw !== "object" || raw === null)
    return {};
  return raw;
}
function saveConfig(cfg, home) {
  const dir = home ?? meshHome();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "config.json"), JSON.stringify(cfg, null, 2));
}
function setActiveProfile(name) {
  const root = PROFILES_ROOT();
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, "active_profile"), name + `
`);
}
function getActiveProfile() {
  const p = path.join(PROFILES_ROOT(), "active_profile");
  if (!fs.existsSync(p))
    return null;
  try {
    return fs.readFileSync(p, "utf8").trim() || null;
  } catch {
    return null;
  }
}
function listProfiles() {
  const dir = path.join(PROFILES_ROOT(), "profiles");
  if (!fs.existsSync(dir))
    return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}
function loadIdentity(home) {
  const p = path.join(home ?? meshHome(), "identity.json");
  if (!fs.existsSync(p))
    return null;
  try {
    fs.chmodSync(p, 384);
  } catch {}
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function saveIdentity(identity, home) {
  const dir = home ?? meshHome();
  fs.mkdirSync(dir, { recursive: true, mode: 448 });
  const finalPath = path.join(dir, "identity.json");
  const tmpPath = path.join(dir, `.identity.json.tmp-${process.pid}-${Date.now()}`);
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(identity, null, 2) + `
`, { encoding: "utf8", mode: 384 });
    fs.renameSync(tmpPath, finalPath);
  } catch (err2) {
    try {
      fs.rmSync(tmpPath, { force: true });
    } catch {}
    throw err2;
  }
}
function persistOrExplain(identity, home, persist = saveIdentity) {
  try {
    persist(identity, home);
  } catch (err2) {
    const identityPath = path.join(home ?? meshHome(), "identity.json");
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
function listIdentityHomes(root = os.homedir()) {
  let names;
  try {
    names = fs.readdirSync(root);
  } catch {
    return [];
  }
  const out = [];
  for (const name of names) {
    if (name !== ".mesh" && !name.startsWith(".mesh-"))
      continue;
    const home = path.join(root, name);
    const identity = loadIdentity(home);
    if (identity)
      out.push({ home, identity });
  }
  return out.sort((a, b) => a.home.localeCompare(b.home));
}
function loadRooms(home) {
  const p = path.join(home ?? meshHome(), "rooms.json");
  if (!fs.existsSync(p))
    return {};
  try {
    fs.chmodSync(p, 384);
  } catch {}
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function saveRooms(rooms, home) {
  const dir = home ?? meshHome();
  fs.mkdirSync(dir, { recursive: true, mode: 448 });
  fs.writeFileSync(path.join(dir, "rooms.json"), JSON.stringify(rooms, null, 2) + `
`, { encoding: "utf8", mode: 384 });
}
function upsertRoom(roomId, entry, home) {
  const rooms = loadRooms(home);
  rooms[roomId] = entry;
  saveRooms(rooms, home);
}
function removeRoom(roomId, home) {
  const rooms = loadRooms(home);
  if (!(roomId in rooms))
    return false;
  delete rooms[roomId];
  saveRooms(rooms, home);
  if (getActiveRoom(home) === roomId)
    setActiveRoom(null, home);
  return true;
}
function activeRoomPath(home) {
  return path.join(home ?? meshHome(), "active_room");
}
function getActiveRoom(home) {
  const p = activeRoomPath(home);
  if (!fs.existsSync(p))
    return null;
  try {
    return fs.readFileSync(p, "utf8").trim() || null;
  } catch {
    return null;
  }
}
function setActiveRoom(roomId, home) {
  const p = activeRoomPath(home);
  if (roomId === null) {
    try {
      fs.rmSync(p, { force: true });
    } catch {}
    return;
  }
  const dir = home ?? meshHome();
  fs.mkdirSync(dir, { recursive: true, mode: 448 });
  fs.writeFileSync(p, roomId + `
`, { encoding: "utf8", mode: 384 });
}
function resolveRoom(roomIdOpt, home) {
  const rooms = loadRooms(home);
  if (roomIdOpt) {
    const entry = rooms[roomIdOpt];
    if (!entry) {
      throw new Error(`Room "${roomIdOpt}" not in ${path.join(home ?? meshHome(), "rooms.json")}. Run "mesh room join" first.`);
    }
    setActiveRoom(roomIdOpt, home);
    return { roomId: roomIdOpt, entry };
  }
  const ids = Object.keys(rooms);
  if (ids.length === 0)
    throw new Error('No rooms joined. Run "mesh room join" first.');
  if (ids.length === 1)
    return { roomId: ids[0], entry: rooms[ids[0]] };
  const active = getActiveRoom(home);
  if (active && rooms[active])
    return { roomId: active, entry: rooms[active] };
  throw new Error(`Multiple rooms: ${ids.join(", ")}. Use --room <room_id> (it'll be remembered next time).`);
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

// src/client.ts
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
    let body = {};
    try {
      body = await res.json();
    } catch {}
    return {
      ok: false,
      error: body["error"] ?? "unknown_error",
      detail: body["detail"] ?? res.statusText,
      hint: body["hint"] ?? body["tip"],
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
    const qs = params.toString();
    const res = await this._get(`/entries${qs ? "?" + qs : ""}`);
    if (!res.ok)
      throw Object.assign(new Error(`GET /entries failed: ${res.status}`), { status: res.status });
    return res.json();
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
  async* follow(since, signal) {
    const cursor = { seq: since ?? -1 };
    let handshakeFailures = 0;
    while (!signal?.aborted) {
      const opened = yield* this.streamOnce(cursor, signal);
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
  async* streamOnce(cursor, signal) {
    const wsBase = this.opts.roomUrl.replace(/^http/, "ws");
    const params = new URLSearchParams({ token: this.opts.token });
    if (cursor.seq >= 0)
      params.set("since", String(cursor.seq));
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
          if (item.value.type === "entry")
            cursor.seq = item.value.entry.seq;
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
  "system.decision_lapse": { label: "lapsed", color: C2.yellow }
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
  const { sender, performative, task_ref, body, artifacts } = submission;
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
  const artStr = artifacts && artifacts.length > 0 ? `  ${ansi(C2.cyan, `→ ${artifacts.map(scrubControl).join(", ")}`)}` : "";
  return `${seqLabel} ${dateStr}${timeLabel}  ${senderStr}  ${label}  ${taskStr}${bodySnippet}${artStr}`;
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
function renderStateHeader(head) {
  return ansi(DIM, `head: seq=${head.seq}  ${head.entry_hash}`);
}
function renderTable(headers, rows) {
  const widths = headers.map((h2, i) => Math.max(h2.length, ...rows.map((row) => row[i]?.length ?? 0)));
  const fmt = (cols) => cols.map((c, i) => c.padEnd(widths[i] ?? 0)).join("  ");
  return [fmt(headers), ...rows.map(fmt)].join(`
`);
}
function renderRoster(rows) {
  const dash = (s) => s === undefined || s === "" ? "-" : String(s);
  const short = (pk) => pk.replace(/^ed25519-pk:/, "").slice(0, 8);
  return renderTable(["id", "team", "host", "specialties", "last", "cond", "cond@seq", "retired", "pubkey"], rows.map((r) => {
    const specialties = r.specialties ?? r.roles;
    return [
      scrubControl(r.participant_id),
      scrubControl(dash(r.owner_team)),
      scrubControl(dash(r.host)),
      specialties.length ? specialties.map(scrubControl).join(",") : "-",
      dash(r.last_seen_seq),
      scrubControl(dash(r.condition ?? undefined)),
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
    dash(r.condition)
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

// src/artifact.ts
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdirSync as mkdirSync2 } from "node:fs";
function sha256hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
var DEFAULT_EXCLUDES = [".git", "node_modules"];
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
  mkdirSync2(dir, { recursive: true });
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

// src/merge.ts
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

// src/fs.ts
function resolveNode(tree, repopath) {
  const id = normalizeId(repopath);
  return tree.find((n) => n.path === id);
}
function hashFromRef(content_hash) {
  const m = /^r2:([0-9a-f]{64})$/.exec(content_hash);
  if (!m)
    throw new Error(`not an r2 content ref: ${content_hash}`);
  return m[1];
}
async function fsPutOcc(client, repopath, bytes) {
  const hash = sha256hex(bytes);
  const treeResult = await client.getTree(repopath);
  let baseHashRef;
  if ("tree" in treeResult) {
    const node = resolveNode(treeResult.tree, repopath);
    baseHashRef = node?.content_hash;
  }
  const up = await client.putArtifact(hash, bytes);
  if (!up.ok)
    return { ok: false, kind: "error", error: up.error, detail: up.detail };
  const postData = {
    path: repopath,
    content_hash: "r2:" + hash,
    size: bytes.length
  };
  if (baseHashRef !== undefined)
    postData["base_hash"] = baseHashRef;
  const r = await client.postEntry({ performative: "file.write", data: postData });
  if (r.ok)
    return { ok: true, seq: r.seq, deduped: up.deduped, hash };
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
      return { ok: false, kind: "error", error: up2.error, detail: up2.detail };
    const r2 = await client.postEntry({
      performative: "file.write",
      data: { path: repopath, content_hash: "r2:" + mergedHash, size: mergedBytes.length, base_hash: tipRef }
    });
    if (!r2.ok)
      return { ok: false, kind: "error", error: r2.error, detail: r2.detail, hint: r2.hint };
    return { ok: true, seq: r2.seq, deduped: up2.deduped, hash: mergedHash };
  }
  return { ok: false, kind: "error", error: r.error, detail: r.detail, hint: r.hint };
}

// src/main.ts
import { readFileSync as readFileSync4, writeFileSync as writeFileSync4, mkdirSync as mkdirSync5, statSync } from "node:fs";
import * as os2 from "node:os";
import { resolve as resolve2, join as join4, dirname as dirname5, sep as sep2 } from "node:path";

// src/deps.ts
import { dirname as dirname2, join as join2, normalize } from "node:path";
var IMPORT_RE = /(?:import|export)[^"']*?from\s*["']([^"']+)["']|import\s*["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;
function resolveRel(fromFile, spec) {
  if (!spec.startsWith("."))
    return null;
  const p = normalize(join2(dirname2(fromFile), spec));
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
var callAll = (fs2, args, i = 0) => {
  try {
    for (;i < fs2.length; i++) {
      fs2[i](...args);
    }
  } finally {
    if (i < fs2.length) {
      callAll(fs2, args, i + 1);
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
    dss[dssI].clients.forEach((delsLeft, client) => {
      if (!merged.clients.has(client)) {
        const dels = delsLeft.slice();
        for (let i = dssI + 1;i < dss.length; i++) {
          appendTo(dels, dss[i].clients.get(client) || []);
        }
        merged.clients.set(client, dels);
      }
    });
  }
  sortAndMergeDeleteSet(merged);
  return merged;
};
var addToDeleteSet = (ds, client, clock, length2) => {
  setIfUndefined(ds.clients, client, () => []).push(new DeleteItem(clock, length2));
};
var createDeleteSet = () => new DeleteSet;
var createDeleteSetFromStructStore = (ss) => {
  const ds = createDeleteSet();
  ss.clients.forEach((structs, client) => {
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
      ds.clients.set(client, dsitems);
    }
  });
  return ds;
};
var writeDeleteSet = (encoder, ds) => {
  writeVarUint(encoder.restEncoder, ds.clients.size);
  from(ds.clients.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, dsitems]) => {
    encoder.resetDsCurVal();
    writeVarUint(encoder.restEncoder, client);
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
    const client = readVarUint(decoder.restDecoder);
    const numberOfDeletes = readVarUint(decoder.restDecoder);
    if (numberOfDeletes > 0) {
      const dsField = setIfUndefined(ds.clients, client, () => []);
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
    const client = readVarUint(decoder.restDecoder);
    const numberOfDeletes = readVarUint(decoder.restDecoder);
    const structs = store.clients.get(client) || [];
    const state = getState(store, client);
    for (let i2 = 0;i2 < numberOfDeletes; i2++) {
      const clock = decoder.readDsClock();
      const clockEnd = clock + decoder.readDsLen();
      if (clock < state) {
        if (state < clockEnd) {
          addToDeleteSet(unappliedDS, client, state, clockEnd - state);
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
        addToDeleteSet(unappliedDS, client, clock, clockEnd - clock);
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
    this.whenLoaded = create4((resolve) => {
      this.on("load", () => {
        this.isLoaded = true;
        resolve(this);
      });
    });
    const provideSyncedPromise = () => create4((resolve) => {
      const eventHandler = (isSynced) => {
        if (isSynced === undefined || isSynced === true) {
          this.off("sync", eventHandler);
          resolve();
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
  writeClient(client) {
    writeVarUint(this.restEncoder, client);
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
  writeClient(client) {
    this.clientEncoder.write(client);
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
var writeStructs = (encoder, structs, client, clock) => {
  clock = max(clock, structs[0].id.clock);
  const startNewStructs = findIndexSS(structs, clock);
  writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
  encoder.writeClient(client);
  writeVarUint(encoder.restEncoder, clock);
  const firstStruct = structs[startNewStructs];
  firstStruct.write(encoder, clock - firstStruct.id.clock);
  for (let i = startNewStructs + 1;i < structs.length; i++) {
    structs[i].write(encoder, 0);
  }
};
var writeClientsStructs = (encoder, store, _sm) => {
  const sm = new Map;
  _sm.forEach((clock, client) => {
    if (getState(store, client) > clock) {
      sm.set(client, clock);
    }
  });
  getStateVector(store).forEach((_clock, client) => {
    if (!_sm.has(client)) {
      sm.set(client, 0);
    }
  });
  writeVarUint(encoder.restEncoder, sm.size);
  from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
    writeStructs(encoder, store.clients.get(client), client, clock);
  });
};
var readClientsStructRefs = (decoder, doc) => {
  const clientRefs = create();
  const numOfStateUpdates = readVarUint(decoder.restDecoder);
  for (let i = 0;i < numOfStateUpdates; i++) {
    const numberOfStructs = readVarUint(decoder.restDecoder);
    const refs = new Array(numberOfStructs);
    const client = decoder.readClient();
    let clock = readVarUint(decoder.restDecoder);
    clientRefs.set(client, { i: 0, refs });
    for (let i2 = 0;i2 < numberOfStructs; i2++) {
      const info = decoder.readInfo();
      switch (BITS5 & info) {
        case 0: {
          const len = decoder.readLen();
          refs[i2] = new GC(createID(client, clock), len);
          clock += len;
          break;
        }
        case 10: {
          const len = readVarUint(decoder.restDecoder);
          refs[i2] = new Skip(createID(client, clock), len);
          clock += len;
          break;
        }
        default: {
          const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
          const struct = new Item(createID(client, clock), null, (info & BIT8) === BIT8 ? decoder.readLeftID() : null, null, (info & BIT7) === BIT7 ? decoder.readRightID() : null, cantCopyParentInfo ? decoder.readParentInfo() ? doc.get(decoder.readString()) : decoder.readLeftID() : null, cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null, readItemContent(decoder, info));
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
  const updateMissingSv = (client, clock) => {
    const mclock = missingSV.get(client);
    if (mclock == null || mclock > clock) {
      missingSV.set(client, clock);
    }
  };
  let stackHead = curStructsTarget.refs[curStructsTarget.i++];
  const state = new Map;
  const addStackToRestSS = () => {
    for (const item of stack) {
      const client = item.id.client;
      const inapplicableItems = clientsStructRefs.get(client);
      if (inapplicableItems) {
        inapplicableItems.i--;
        restStructs.clients.set(client, inapplicableItems.refs.slice(inapplicableItems.i));
        clientsStructRefs.delete(client);
        inapplicableItems.i = 0;
        inapplicableItems.refs = [];
      } else {
        restStructs.clients.set(client, [item]);
      }
      clientsStructRefsIds = clientsStructRefsIds.filter((c) => c !== client);
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
    for (const [client, clock] of pending.missing) {
      if (clock < getState(store, client)) {
        retry = true;
        break;
      }
    }
    if (restStructs) {
      for (const [client, clock] of restStructs.missing) {
        const mclock = pending.missing.get(client);
        if (mclock == null || mclock > clock) {
          pending.missing.set(client, clock);
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
    const client = readVarUint(decoder.restDecoder);
    const clock = readVarUint(decoder.restDecoder);
    ss.set(client, clock);
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
  constructor(client, clock) {
    this.client = client;
    this.clock = clock;
  }
}
var compareIDs = (a, b) => a === b || a !== null && b !== null && a.client === b.client && a.clock === b.clock;
var createID = (client, clock) => new ID(client, clock);
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
    snapshot.sv.forEach((clock, client) => {
      if (clock < getState(store, client)) {
        getItemCleanStart(transaction, createID(client, clock));
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
  store.clients.forEach((structs, client) => {
    const struct = structs[structs.length - 1];
    sm.set(client, struct.id.clock + struct.length);
  });
  return sm;
};
var getState = (store, client) => {
  const structs = store.clients.get(client);
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
  if (transaction.deleteSet.clients.size === 0 && !any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) {
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
  for (const [client, deleteItems] of ds.clients.entries()) {
    const structs = store.clients.get(client);
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
  ds.clients.forEach((deleteItems, client) => {
    const structs = store.clients.get(client);
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
      const fs2 = [];
      transaction.changed.forEach((subs, itemtype) => fs2.push(() => {
        if (itemtype._item === null || !itemtype._item.deleted) {
          itemtype._callObserver(transaction, subs);
        }
      }));
      fs2.push(() => {
        transaction.changedParentTypes.forEach((events, type) => {
          if (type._dEH.l.length > 0 && (type._item === null || !type._item.deleted)) {
            events = events.filter((event) => event.target._item === null || !event.target._item.deleted);
            events.forEach((event) => {
              event.currentTarget = type;
              event._path = null;
            });
            events.sort((event1, event2) => event1.path.length - event2.path.length);
            fs2.push(() => {
              callEventHandlerListeners(type._dEH, events, transaction);
            });
          }
        });
        fs2.push(() => doc.emit("afterTransaction", [transaction, doc]));
        fs2.push(() => {
          if (transaction._needFormattingCleanup) {
            cleanupYTextAfterTransaction(transaction);
          }
        });
      });
      callAll(fs2, []);
    } finally {
      if (doc.gc) {
        tryGcDeleteSet(ds, store, doc.gcFilter);
      }
      tryMergeDeleteSet(ds, store);
      transaction.afterState.forEach((clock, client) => {
        const beforeClock = transaction.beforeState.get(client) || 0;
        if (beforeClock !== clock) {
          const structs = store.clients.get(client);
          const firstChangePos = max(findIndexSS(structs, beforeClock), 1);
          for (let i2 = structs.length - 1;i2 >= firstChangePos; ) {
            i2 -= 1 + tryToMergeWithLefts(structs, i2);
          }
        }
      });
      for (let i2 = mergeStructs.length - 1;i2 >= 0; i2--) {
        const { client, clock } = mergeStructs[i2].id;
        const structs = store.clients.get(client);
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
    const client = decoder.readClient();
    let clock = readVarUint(decoder.restDecoder);
    for (let i2 = 0;i2 < numberOfStructs; i2++) {
      const info = decoder.readInfo();
      if (info === 10) {
        const len = readVarUint(decoder.restDecoder);
        yield new Skip(createID(client, clock), len);
        clock += len;
      } else if ((BITS5 & info) !== 0) {
        const cantCopyParentInfo = (info & (BIT7 | BIT8)) === 0;
        const struct = new Item(createID(client, clock), null, (info & BIT8) === BIT8 ? decoder.readLeftID() : null, null, (info & BIT7) === BIT7 ? decoder.readRightID() : null, cantCopyParentInfo ? decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID() : null, cantCopyParentInfo && (info & BIT6) === BIT6 ? decoder.readString() : null, readItemContent(decoder, info));
        yield struct;
        clock += struct.length;
      } else {
        const len = decoder.readLen();
        yield new GC(createID(client, clock), len);
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
    const { client, clock } = left.id;
    return new GC(createID(client, clock + diff), left.length - diff);
  } else if (left.constructor === Skip) {
    const { client, clock } = left.id;
    return new Skip(createID(client, clock + diff), left.length - diff);
  } else {
    const leftItem = left;
    const { client, clock } = leftItem.id;
    return new Item(createID(client, clock + diff), null, createID(client, clock + diff - 1), null, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
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
  const path2 = [];
  while (child._item !== null && child !== parent) {
    if (child._item.parentSub !== null) {
      path2.unshift(child._item.parentSub);
    } else {
      let i = 0;
      let c = child._item.parent._start;
      while (c !== child._item && c !== null) {
        if (!c.deleted && c.countable) {
          i += c.length;
        }
        c = c.right;
      }
      path2.unshift(i);
    }
    child = child._item.parent;
  }
  return path2;
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
  for (const [client, afterClock] of transaction.afterState.entries()) {
    const clock = transaction.beforeState.get(client) || 0;
    if (afterClock === clock) {
      continue;
    }
    iterateStructs(transaction, doc.store.clients.get(client), clock, afterClock, (item) => {
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
  const { client, clock } = leftItem.id;
  const rightItem = new Item(createID(client, clock + diff), leftItem, createID(client, clock + diff - 1), leftItem.right, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
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
import { mkdirSync as mkdirSync4, writeFileSync as writeFileSync3, readFileSync as readFileSync3 } from "node:fs";
import { resolve, dirname as dirname4, sep } from "node:path";

// src/edit-base.ts
import * as fs2 from "node:fs";
import * as path2 from "node:path";
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
  return path2.join(home ?? meshHome(), "edit-base", roomId, encodeURIComponent(repopath));
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
  const dir = path2.dirname(p);
  fs2.mkdirSync(dir, { recursive: true, mode: 448 });
  fs2.writeFileSync(p, JSON.stringify(sidecar), { encoding: "utf8", mode: 384 });
  try {
    fs2.chmodSync(p, 384);
  } catch {}
  try {
    fs2.chmodSync(dir, 448);
  } catch {}
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
  if (localBytes === undefined) {
    return { kind: "clean", text: tipText, sidecar: { content: tipText, tip_hash: tipHash } };
  }
  if (sidecar !== undefined && localBytes.equals(Buffer.from(sidecar.content, "utf8"))) {
    return { kind: "clean", text: tipText, sidecar: { content: tipText, tip_hash: tipHash } };
  }
  const base = sidecar?.content ?? tipText;
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
    if (sidecar === undefined) {
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

// src/watch-auto.ts
function isExactPathWatch(predicate, path3) {
  if (predicate.kind !== "entry")
    return false;
  const p = predicate;
  return p.path === path3 && p.performative === undefined && p.thread === undefined && p.mention_me === undefined && p.participant === undefined;
}
async function subscribePathWatch(client, path3) {
  const result = await client.postWatch({ kind: "entry", path: path3 });
  if (!result.ok)
    return { ok: false, error: result.error, detail: result.detail };
  return { ok: true };
}
async function unsubscribePathWatch(client, path3) {
  try {
    const watches = await client.getWatches();
    const mine = watches.find((w) => isExactPathWatch(w.predicate, path3));
    if (!mine)
      return false;
    await client.deleteWatch(mine.id);
    return true;
  } catch {
    return false;
  }
}
function extractLockHolder(detail) {
  const m = /is locked by '([^']+)'/.exec(detail);
  return m?.[1];
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
async function fsCmdEdit(client, args2, _senderId) {
  const repopath = args2.positional[0];
  if (!repopath)
    die("fs edit: <path> is required");
  const into = flag(args2, "into") ?? ".mesh/fs";
  const ac = new AbortController;
  const buffered = [];
  let liveApply = false;
  const editState = { doc: newDoc() };
  const followTask = (async () => {
    try {
      for await (const frame of client.follow(undefined, ac.signal)) {
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
  const treeResult = await client.getTree(repopath);
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
      const blob = await client.getArtifact(hashHex);
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
  const fsBase = resolve(into);
  const fsDest = resolve(into, repopath);
  if (fsDest !== fsBase && !fsDest.startsWith(fsBase + sep)) {
    ac.abort();
    await followTask;
    die("fs edit: path escapes target directory");
  }
  mkdirSync4(dirname4(fsDest), { recursive: true });
  const roomId = client.roomId;
  const tipText = docToText(editState.doc);
  let localBytes;
  try {
    localBytes = readFileSync3(fsDest);
  } catch {
    localBytes = undefined;
  }
  if (hasPreExistingConflictMarkers(localBytes)) {
    ac.abort();
    await followTask;
    die(`fs edit: ${repopath} contains unresolved conflict markers from a previous session — resolve them (or delete the local file) and re-run`);
  }
  const decision = decideEditWrite({
    sidecar: readSidecar(roomId, repopath),
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
      writeFileSync3(fsDest, decision.text, "utf8");
      writeSidecar(roomId, repopath, decision.sidecar);
      ok(`fs edit: loaded ${repopath} → ${fsDest}`);
      break;
    case "merged":
      setText(editState.doc, decision.text);
      writeFileSync3(fsDest, decision.text, "utf8");
      writeSidecar(roomId, repopath, decision.sidecar);
      if (decision.warning)
        ok(decision.warning);
      ok(`fs edit: loaded ${repopath} → ${fsDest} (local edits merged with room tip)`);
      break;
    case "conflict":
      writeFileSync3(fsDest, decision.text, "utf8");
      conflictPending = true;
      conflictBaseText = tipText;
      ok(decision.warning);
      ok(`fs edit: loaded ${repopath} → ${fsDest} (conflict markers written — resolve before publishing)`);
      break;
  }
  const watchSub = await subscribePathWatch(client, repopath);
  if (!watchSub.ok)
    ok(`fs edit: warning — watch registration failed [${watchSub.error}] ${watchSub.detail} — you will not be notified of conflicts`);
  await client.relay(repopath, encodeStateB64(editState.doc));
  const publishSnapshot = async () => {
    let localText;
    try {
      localText = readFileSync3(fsDest, "utf8");
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
        writeFileSync3(fsDest, fold.text, "utf8");
        ok(fold.warning);
        return;
      }
      if (fold.kind === "merged") {
        writeFileSync3(fsDest, fold.text, "utf8");
        ok(fold.warning);
      }
      setText(editState.doc, fold.text);
      conflictPending = false;
      conflictBaseText = fold.text;
    }
    const snapBytes = snapshotToBytes(editState.doc);
    const snapHash = sha256hex(snapBytes);
    const up = await client.putArtifact(snapHash, snapBytes);
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
    const r = await client.postEntry({ performative: "file.write", data: postData });
    if (r.ok) {
      nodeHashRef = "r2:" + snapHash;
      writeSidecar(roomId, repopath, { content: docToText(editState.doc), tip_hash: nodeHashRef });
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
    await unsubscribePathWatch(client, repopath);
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
  await unsubscribePathWatch(client, repopath);
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
async function fsCmdGrant(client, args2, _senderId) {
  const subject = args2.positional[0];
  const path3 = args2.positional[1];
  const grade = args2.positional[2];
  if (!subject || !path3 || !grade)
    die2("fs grant: <subject> <path> <grade> are required");
  if (!isAccessGrade(grade)) {
    die2("fs grant: grade must be discover|read|write|exclusive");
  }
  const r = await client.grant(subject, path3, grade);
  if (!r.ok)
    die2(`fs grant: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok2(`fs grant ${grade} on ${path3} → ${subject} (seq=${r.seq})`);
}
async function fsCmdRevoke(client, args2, _senderId) {
  const subject = args2.positional[0];
  const path3 = args2.positional[1];
  if (!subject || !path3)
    die2("fs revoke: <subject> <path> are required");
  const r = await client.revokeGrant(subject, path3);
  if (!r.ok)
    die2(`fs revoke: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok2(`fs revoke: removed grant on ${path3} from ${subject} (seq=${r.seq})`);
}
async function fsCmdGrants(client, _args, _senderId) {
  const grants = await client.listGrants();
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
async function fsCmdRole(client, args2, _senderId) {
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
  const r = await client.assignRole(participant, role, {
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
    const roles = await client.listRoles();
    if (Array.isArray(roles) && roles.some((row) => row.participant === replaces && row.role === role)) {
      process.stderr.write(`fs role: WARNING — ${replaces} still holds ${role} after the swap. ` + `This room may predate roster registry v1.12.0 and silently ignored --replaces. ` + `Run 'mesh fs role-rm ${replaces} ${role}' to finish the swap manually.
`);
    }
  }
}
async function fsCmdRoleRm(client, args2, _senderId) {
  const participant = args2.positional[0];
  const role = args2.positional[1];
  if (!participant || !role)
    die2("fs role-rm: <participant> <role> are required");
  const r = await client.removeRole(participant, role);
  if (!r.ok)
    die2(`fs role-rm: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok2(`fs role-rm: unbound ${participant} from ${role} (seq=${r.seq})`);
}
async function fsCmdRoles(client, _args, _senderId) {
  const roles = await client.listRoles();
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
async function fsCmdLeases(client, _args, _senderId) {
  const leases = await client.listLeases();
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
async function fsCmdConfig(client, args2, _senderId) {
  const access = args2.positional[0];
  if (access !== "open" && access !== "closed")
    die2("fs config: <open|closed> is required");
  const r = await client.setDefaultAccess(access);
  if (!r.ok)
    die2(`fs config: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok2(`fs config: default_access → ${access} (seq=${r.seq})`);
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
async function fetchAllEntries(client) {
  const all2 = [];
  let since = -1;
  for (;; ) {
    const page = await client.getEntries({ since, limit: 100 });
    if (page.entries.length === 0)
      break;
    all2.push(...page.entries);
    since = page.entries[page.entries.length - 1].seq;
    if (page.entries.length < 100)
      break;
  }
  return all2;
}
async function decideCmdWaitReport(client, args2, _senderId) {
  const sinceIso = flag3(args2, "since");
  const humanArg = flag3(args2, "human");
  const humanIds = humanArg ? humanArg.split(",").map((s) => s.trim()) : undefined;
  const [entries, state] = await Promise.all([fetchAllEntries(client), client.getState()]);
  const report = computeWaitReport(entries, state.claims, state.defaults, { sinceIso, humanIds });
  ok3(JSON.stringify(report.rows, null, 2));
  ok3("");
  ok3(`questions: ${report.summary.count}  answered: ${report.summary.answered} (${report.summary.answered_pct.toFixed(1)}%)`);
  ok3(`wait_ms  p50=${report.summary.p50_wait_ms ?? "-"}  p90=${report.summary.p90_wait_ms ?? "-"}  p95=${report.summary.p95_wait_ms ?? "-"}`);
  ok3(`lease-starved (>=80% of lease_ttl_ms burned while waiting): ${report.summary.lease_starved_count}`);
  ok3(`match confidence  strict=${report.summary.strict_count}  loose=${report.summary.loose_count}`);
}
async function decideCmdAsk(client, args2, _senderId) {
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
  const result = await client.postEntry({ performative: "decide.request", thread: decisionId, data });
  if (!result.ok)
    die3(`decide ask failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  ok3(`Decision ${decisionId} asked (seq=${result.seq})`);
}
async function decideCmdAnswer(client, args2, _senderId) {
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
  const result = await client.postEntry({ performative: "decide.resolve", thread: decisionId, data: { resolution } });
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
async function decideCmdList(client, args2, senderId) {
  const mine = args2.flags["mine"] !== undefined ? senderId : undefined;
  const role = flag3(args2, "role");
  const state = await client.getState();
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
async function decideCmdShow(client, args2, _senderId) {
  const decisionId = args2.positional[0];
  if (!decisionId)
    die3(`decide show: <decision-id> is required`);
  const state = await client.getState();
  const row = state.decisions.find((d) => d.id === decisionId);
  if (!row)
    die3(`decide show: unknown decision ${decisionId}`);
  ok3(renderDecisions([row]));
  const resolutionLine = renderResolutionLine(row);
  if (resolutionLine !== null)
    ok3(scrubControl(resolutionLine));
  ok3("");
  const entries = await fetchAllEntries(client);
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

// src/main.ts
function parseArgs(argv) {
  const positional = [];
  const flags = {};
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      let key;
      let inlineVal;
      if (eq !== -1) {
        key = arg.slice(2, eq);
        inlineVal = arg.slice(eq + 1);
      } else {
        key = arg.slice(2);
        inlineVal = undefined;
      }
      if (inlineVal !== undefined) {
        flags[key] = inlineVal;
        i++;
      } else {
        const next = argv[i + 1];
        if (next !== undefined && !next.startsWith("-")) {
          flags[key] = next;
          i += 2;
        } else {
          flags[key] = true;
          i++;
        }
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
function flag4(args2, name) {
  const v = args2.flags[name];
  return typeof v === "string" ? v : undefined;
}
function flagBool2(args2, name) {
  return args2.flags[name] !== undefined;
}
function requiredFlag(args2, name, cmd) {
  const v = flag4(args2, name);
  if (!v)
    die4(`${cmd}: --${name} is required`);
  return v;
}
function die4(msg) {
  process.stderr.write(msg + `
`);
  process.exit(1);
}
function ok4(msg) {
  process.stdout.write(msg + `
`);
}
function grepLine(r) {
  return `${r.path}: ${r.snippet}`;
}
async function hydrateGrepWinners(client, paths, into) {
  if (paths.length === 0)
    return;
  const t = await client.getTree();
  if ("error" in t) {
    process.stderr.write(`fs grep: hydrate: [${t.error}] ${t.detail}
`);
    process.exit(1);
  }
  for (const p of paths) {
    const node = resolveNode(t.tree, p);
    if (!node) {
      process.stderr.write(`fs grep: hydrate: not in tree: ${p}
`);
      continue;
    }
    let hash;
    try {
      hash = hashFromRef(node.content_hash);
    } catch (e) {
      process.stderr.write(`fs grep: hydrate: ${e instanceof Error ? e.message : String(e)}
`);
      continue;
    }
    const blob = await client.getArtifact(hash);
    if (!(blob instanceof Uint8Array)) {
      process.stderr.write(`fs grep: hydrate: [${blob.error}] ${blob.detail}
`);
      continue;
    }
    const base = resolve2(into);
    const dest = resolve2(into, node.path);
    if (dest !== base && !dest.startsWith(base + sep2)) {
      process.stderr.write(`fs grep: hydrate: path escapes target directory: ${p}
`);
      continue;
    }
    mkdirSync5(dirname5(dest), { recursive: true });
    writeFileSync4(dest, blob);
    ok4(dest);
  }
}
async function hydrateSubtree(client, prefix, into) {
  const t = await client.getTree(prefix || undefined);
  if ("error" in t) {
    process.stderr.write(`fs hydrate: [${t.error}] ${t.detail}
`);
    process.exit(1);
  }
  const written = [];
  for (const node of t.tree) {
    let hash;
    try {
      hash = hashFromRef(node.content_hash);
    } catch (e) {
      process.stderr.write(`fs hydrate: ${e instanceof Error ? e.message : String(e)}
`);
      continue;
    }
    const blob = await client.getArtifact(hash);
    if (!(blob instanceof Uint8Array)) {
      process.stderr.write(`fs hydrate: [${blob.error}] ${blob.detail}
`);
      continue;
    }
    const base = resolve2(into);
    const dest = resolve2(into, node.path);
    if (dest !== base && !dest.startsWith(base + sep2)) {
      process.stderr.write(`fs hydrate: path escapes target directory: ${node.path}
`);
      continue;
    }
    mkdirSync5(dirname5(dest), { recursive: true });
    writeFileSync4(dest, blob);
    written.push(dest);
  }
  return written;
}
function localSizes(paths, into) {
  const base = resolve2(into);
  const sizes = {};
  for (const path3 of paths) {
    const dest = resolve2(into, path3);
    if (dest !== base && !dest.startsWith(base + sep2))
      continue;
    try {
      sizes[path3] = statSync(dest).size;
    } catch {}
  }
  return sizes;
}
async function cmdKeygen(args2) {
  let id2 = flag4(args2, "id");
  if (!id2) {
    if (process.stdin.isTTY) {
      id2 = await promptLine("identity id");
      if (!id2)
        die4("keygen: identity id cannot be empty");
    } else {
      die4("keygen: --id <id> is required");
    }
  }
  const home = flag4(args2, "home");
  const homeDir = home ?? meshHome();
  const existing = loadIdentity(home);
  if (existing && !flagBool2(args2, "force")) {
    die4(`Identity "${existing.id}" already exists at ${homeDir} (pubkey ${existing.pubkey}).
` + `Use --force to overwrite — but note this MINTS A NEW KEYPAIR: rooms that bound the old
` + `key will reject you with id_taken. To act as a different participant, use a separate MESH_HOME.`);
  }
  const roles = (flag4(args2, "roles") ?? "").split(",").map((r) => r.trim()).filter(Boolean);
  const identity = createIdentity(id2, home, roles);
  ok4(`Created identity: ${identity.id}`);
  ok4(`  home:   ${homeDir}`);
  ok4(`  pubkey: ${identity.pubkey}`);
  if (roles.length > 0)
    ok4(`  roles:  ${roles.join(", ")}  (asserted in the card at join → verdict authority for these role refs)`);
  ok4(`To reuse this id elsewhere, COPY ${homeDir}/identity.json — never re-run keygen (that makes a new key).`);
}
async function cmdKeyRotate(args2) {
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentity(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const { identity: rotated, data } = rotateIdentityFile(identity);
  const secretBytes = new Uint8Array(Buffer.from(identity.secret, "base64"));
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes
  });
  const result = await client.postEntry({ performative: "key.rotate", data });
  if (!result.ok)
    die4(`key rotate failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  persistOrExplain(rotated, home);
  ok4(`Rotated key for ${identity.id} (seq=${result.seq}). New pubkey: ${rotated.pubkey}`);
}
async function cmdKeyRetire(args2) {
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentity(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  if (!identity.next_pubkey) {
    die4(`key retire: ${identity.id} has no committed next key yet — run "mesh key rotate" once first (bootstrap), then retire.`);
  }
  const secretBytes = new Uint8Array(Buffer.from(identity.secret, "base64"));
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes
  });
  const result = await client.postEntry({
    performative: "key.rotate",
    data: { reveal_pubkey: identity.next_pubkey, tombstone: true }
  });
  if (!result.ok)
    die4(`key retire failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  ok4(`Retired ${identity.id} (seq=${result.seq}). This identity may no longer author entries in ${roomId}.`);
}
async function cmdKey(args2) {
  const sub = args2.positional.shift();
  switch (sub) {
    case "rotate":
      return cmdKeyRotate(args2);
    case "retire":
      return cmdKeyRetire(args2);
    default:
      die4(`key: unknown action "${sub ?? ""}". Use: mesh key rotate|retire`);
  }
}
async function cmdCreateRoom(args2) {
  const home = flag4(args2, "home");
  let roomId = args2.positional[0];
  if (!roomId) {
    if (process.stdin.isTTY) {
      roomId = await promptLine("room id");
      if (!roomId)
        die4("create-room: room id cannot be empty");
    } else {
      die4("create-room: <room_id> positional argument is required");
    }
  }
  let ownerId = flag4(args2, "owner");
  if (!ownerId) {
    if (process.stdin.isTTY) {
      ownerId = await promptLine("owner id");
      if (!ownerId)
        die4("create-room: owner id cannot be empty");
    } else {
      die4("create-room: --owner <id> is required");
    }
  }
  const workerUrl = flag4(args2, "url") ?? loadConfig(home).defaultRoomUrl ?? "http://localhost:8787";
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4(`No identity found. Run "mesh keygen --id ${ownerId}" first.`);
  if (identity.id !== ownerId)
    die4(`Identity id "${identity.id}" does not match --owner "${ownerId}"`);
  const card = buildCard(identity.id, identity.pubkey, identity.secretBytes, { roles: identity.roles, host: flag4(args2, "host") ?? os2.hostname() });
  const joinSecret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex");
  const nextPubkey = identity.next_pubkey ?? ensureNextKey(loadIdentity(home), home).next_pubkey;
  const nextCommitment = keyCommitment(nextPubkey);
  const result = await createRoom(workerUrl, roomId, card, joinSecret, undefined, nextCommitment);
  if (!result.ok)
    die4(`create-room failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  const joined = await joinRoom(result.room_url, roomId, joinSecret, card, identity.secretBytes, nextCommitment);
  if (!joined.ok) {
    die4(`create-room: room created but owner auto-join failed: [${joined.error}] ${joined.detail}${joined.hint ? " — " + joined.hint : ""}`);
  }
  upsertRoom(roomId, { url: result.room_url, token: joined.token, participant_id: joined.participant_id, join_secret: joinSecret }, home);
  setActiveRoom(roomId, home);
  saveConfig({ defaultRoomUrl: workerUrl }, home);
  ok4(`Room created: ${result.room_url}`);
  ok4(`Joined as owner: ${joined.participant_id}`);
  ok4(`Invite:       ${result.invite}`);
  ok4(`Room pubkey:  ${result.room_pubkey}`);
  ok4(`
Share the invite with participants. They run:
  mesh room join ${result.room_url} ${result.invite}`);
}
async function cmdInit(args2) {
  if (!process.stdin.isTTY)
    die4("mesh init: requires an interactive terminal (stdin must be a TTY)");
  ok4(`Welcome to mesh! Let's get you set up.
`);
  const profile = await promptLine("Profile name", "default");
  setActiveProfile(profile);
  const profileHome = resolveProfileHome(profile);
  const id2 = await promptLine("Identity id");
  if (!id2)
    die4("init: identity id cannot be empty");
  const existingUrl = loadConfig(profileHome).defaultRoomUrl ?? "http://localhost:8787";
  const url = await promptLine("Room server URL", existingUrl);
  saveConfig({ defaultRoomUrl: url }, profileHome);
  const action = await promptChoice("Create a new room or join an existing one?", ["create", "join"]);
  if (action === "create") {
    const roomId = await promptLine("Room id");
    if (!roomId)
      die4("init: room id cannot be empty");
    if (!loadIdentity(profileHome)) {
      ok4(`
Creating identity "${id2}"…`);
      await cmdKeygen({ positional: [], flags: { id: id2, home: profileHome } });
    }
    ok4(`
Creating room…`);
    await cmdCreateRoom({ positional: [roomId], flags: { owner: id2, url, home: profileHome } });
  } else {
    const roomUrl = await promptLine("Room URL (from the invite)");
    const secret = await promptLine("Invite secret");
    if (!roomUrl || !secret)
      die4("init: room URL and invite secret are required to join");
    if (!loadIdentity(profileHome)) {
      ok4(`
Creating identity "${id2}"…`);
      await cmdKeygen({ positional: [], flags: { id: id2, home: profileHome } });
    }
    ok4(`
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
async function cmdJoin(args2) {
  const roomUrl = args2.positional[0];
  const inviteStr = args2.positional[1];
  const passphrase = flag4(args2, "passphrase");
  if (!roomUrl || !inviteStr) {
    die4("join: usage: mesh join <room-url> <room>.<secret>   or   mesh join <room-url> <room> --passphrase <phrase>");
  }
  if (passphrase === undefined && flagBool2(args2, "passphrase")) {
    die4("join: --passphrase requires a value, e.g. --passphrase angry-lion");
  }
  const home = flag4(args2, "home");
  let roomId;
  let joinSecret;
  if (passphrase !== undefined) {
    roomId = inviteStr;
  } else {
    const parts = inviteStr.split(".");
    if (parts.length < 2)
      die4("join: invite must be in format <room_id>.<join_secret> (or pass --passphrase <phrase> with a bare room id)");
    joinSecret = parts[parts.length - 1];
    roomId = parts.slice(0, -1).join(".");
  }
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity found. Run "mesh keygen --id <id>" first.');
  const card = buildCard(identity.id, identity.pubkey, identity.secretBytes, { roles: identity.roles, host: flag4(args2, "host") ?? os2.hostname() });
  const nextPubkey = identity.next_pubkey ?? ensureNextKey(loadIdentity(home), home).next_pubkey;
  const nextCommitment = keyCommitment(nextPubkey);
  const result = passphrase !== undefined ? await joinRoomWithPassphrase(roomUrl, roomId, passphrase, card, identity.secretBytes, nextCommitment) : await joinRoom(roomUrl, roomId, joinSecret, card, identity.secretBytes, nextCommitment);
  if (!result.ok) {
    if (result.error === "id_taken")
      die4(idTakenHelp(roomId, identity.id, identity.pubkey, home ?? meshHome()));
    die4(`join failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  }
  upsertRoom(roomId, { url: roomUrl, token: result.token, participant_id: result.participant_id }, home);
  setActiveRoom(roomId, home);
  ok4(`Joined ${roomId} as ${result.participant_id}`);
  ok4(`Head: seq=${result.head.seq} ${result.head.entry_hash}`);
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
      die4(`room: unknown action "${sub ?? ""}". Use: mesh room create|join|list|rm|delete|invite|log`);
  }
}
async function cmdRoomList(args2) {
  const home = flag4(args2, "home");
  const rooms = loadRooms(home);
  const ids = Object.keys(rooms);
  if (ids.length === 0) {
    ok4('No rooms joined. Run "mesh room join" first.');
    return;
  }
  const active = getActiveRoom(home);
  ok4(`Joined rooms (${ids.length})${active ? `, active: ${active}` : ""}:`);
  for (const id2 of ids) {
    const r = rooms[id2];
    const mark = id2 === active ? "*" : " ";
    ok4(`${mark} ${id2}  —  as ${r.participant_id}  —  ${r.url}`);
  }
}
async function cmdRoomRm(args2) {
  const roomId = args2.positional[0];
  if (!roomId)
    die4("room rm: <room_id> is required");
  const home = flag4(args2, "home");
  if (!removeRoom(roomId, home))
    die4(`room rm: "${roomId}" not in rooms.json`);
  ok4(`Forgot room ${roomId} locally (rooms.json). This does not delete the room on the server.`);
}
async function cmdRoomDelete(args2) {
  const roomId = args2.positional[0];
  if (!roomId)
    die4("room delete: <room_id> is required");
  const home = flag4(args2, "home");
  const room = loadRooms(home)[roomId];
  if (!room)
    die4(`room delete: not joined to "${roomId}" locally — need its url + token to authorize. Run from the owner's MESH_HOME.`);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const result = await client.deleteRoom();
  if (!result.ok) {
    if (result.status === 403)
      die4(`room delete: only the room owner may delete "${roomId}" — run this from the owner's MESH_HOME.`);
    die4(`room delete failed: ${result.error} (HTTP ${result.status})`);
  }
  removeRoom(roomId, home);
  ok4(`Deleted room "${roomId}" on the server and forgot it locally. Re-create the id to reuse it.`);
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
  const home = flag4(args2, "home");
  const showFlag = flagBool2(args2, "show");
  const rotateFlag = flagBool2(args2, "rotate");
  const forId = flag4(args2, "for");
  const listFlag = flagBool2(args2, "list");
  const revokeId = flag4(args2, "revoke");
  if (!showFlag && !rotateFlag && !forId && !listFlag && !revokeId) {
    die4("room invite: use --show | --rotate | --for <participant-id> [--passphrase <phrase>] [--ttl <seconds>] | --list | --revoke <participant-id>");
  }
  const { roomId: resolvedId, entry: room } = resolveRoom(roomId, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  if (showFlag) {
    if (!room.join_secret) {
      die4(`room invite --show: no local join_secret for "${resolvedId}" (only the room creator has it; the room never stores plaintext)`);
    }
    ok4(`${resolvedId}.${room.join_secret}`);
    return;
  }
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId: resolvedId,
    secretBytes: identity.secretBytes
  });
  if (rotateFlag) {
    const result = await client.rotateInvite();
    if (!result.ok) {
      if (result.status === 403)
        die4(`room invite --rotate: only the room owner may rotate "${resolvedId}" — run this from the owner's MESH_HOME.`);
      die4(`room invite --rotate failed: [${result.error}] ${result.detail}`);
    }
    const newSecret = extractInviteSecret(result.invite, resolvedId);
    upsertRoom(resolvedId, { ...room, join_secret: newSecret }, home);
    ok4(`New invite: ${result.invite}`);
    ok4(`Share with participants: mesh room join ${room.url} ${result.invite}`);
  } else if (forId) {
    const passphrase = flag4(args2, "passphrase") ?? generatePassphrase();
    const ttlRaw = flag4(args2, "ttl");
    const ttlS = ttlRaw !== undefined ? Number(ttlRaw) : undefined;
    if (ttlS !== undefined && (!Number.isFinite(ttlS) || ttlS <= 0))
      die4("room invite: --ttl must be a positive number of seconds");
    const result = await client.createPassphraseInvite(forId, passphrase, ttlS);
    if (!result.ok) {
      if (result.status === 403)
        die4(`room invite --for: only the room owner may mint invites for "${resolvedId}" — run this from the owner's MESH_HOME.`);
      die4(`room invite --for failed: [${result.error}] ${result.detail}`);
    }
    const mins = Math.round((result.expires - Date.now()) / 60000);
    ok4(`Passphrase invite for "${forId}": ${passphrase}`);
    ok4(`Single-use, expires in ~${mins} min. Share the phrase out-of-band; they run:`);
    ok4(`  mesh keygen --id "${forId}"   (if they have no identity yet)`);
    ok4(`  mesh room join ${room.url} ${resolvedId} --passphrase ${passphrase}`);
    ok4(`Note: the phrase only admits an agent whose identity id is exactly "${forId}".`);
  } else if (listFlag) {
    const result = await client.listPassphraseInvites();
    if (!result.ok) {
      if (result.status === 403)
        die4(`room invite --list: only the room owner may list invites for "${resolvedId}".`);
      die4(`room invite --list failed: [${result.error}] ${result.detail}`);
    }
    if (result.invites.length === 0) {
      ok4("No pending passphrase invites.");
      return;
    }
    ok4(`Pending passphrase invites (${result.invites.length}):`);
    for (const inv of result.invites) {
      const mins = Math.max(0, Math.round((inv.expires - Date.now()) / 60000));
      ok4(`  ${inv.participant_id}  —  expires in ~${mins} min${inv.attempts > 0 ? `  —  ${inv.attempts} failed attempt(s)` : ""}`);
    }
  } else if (revokeId) {
    const result = await client.revokePassphraseInvite(revokeId);
    if (!result.ok) {
      if (result.status === 404)
        die4(`room invite --revoke: no pending invite for "${revokeId}".`);
      if (result.status === 403)
        die4(`room invite --revoke: only the room owner may revoke invites for "${resolvedId}".`);
      die4(`room invite --revoke failed: [${result.error}] ${result.detail}`);
    }
    ok4(`Revoked pending invite for "${revokeId}".`);
  }
}
function isFilePlaneEntry(performative) {
  return performative.startsWith("file.") || performative === "system.grant" || performative === "system.role" || performative === "system.lease_clear" || performative === "system.revoke" || performative === "system.config";
}
function flagOutOfScope(closure, canRead) {
  return closure.map((path3) => ({ path: path3, readable: canRead(path3) }));
}
async function cmdLog(args2) {
  const follow = flagBool2(args2, "f");
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const roomIdFromUrl = room.url.split("/").pop() ?? "unknown";
  ok4(ansi(DIM, `room: ${roomIdFromUrl}`));
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId: roomIdFromUrl,
    secretBytes: identity.secretBytes
  });
  if (follow) {
    const { entries, head } = await client.getEntries({ limit: 100 });
    if (entries.length > 0)
      ok4(renderEntries(entries));
    let senderWidth;
    if (entries.length > 0) {
      const widths = entries.map((e) => e.submission.sender.length);
      senderWidth = Math.min(28, Math.max(12, Math.max(...widths)));
    }
    let since = head.seq;
    const tty = process.stdout.isTTY ?? false;
    const footer = ansi(DIM, "— streaming (Ctrl+C to exit) —");
    if (tty)
      process.stdout.write(footer);
    else
      ok4(footer);
    for await (const frame of client.follow(since)) {
      if (frame.type === "entry") {
        if (senderWidth === undefined) {
          senderWidth = Math.min(28, Math.max(12, frame.entry.submission.sender.length));
        }
        const line = renderEntry(frame.entry, { senderWidth });
        if (tty)
          printAboveFooter(line, footer);
        else
          ok4(line);
        since = frame.entry.seq;
      }
    }
    if (tty)
      process.stdout.write(`
`);
  } else {
    const { entries, head } = await client.getEntries({ limit: 200 });
    if (entries.length === 0) {
      ok4("(no entries)");
    } else {
      ok4(renderEntries(entries));
    }
    ok4(renderStateHeader(head));
  }
}
async function cmdChat(args2) {
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const roomIdFromUrl = room.url.split("/").pop() ?? "unknown";
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId: roomIdFromUrl,
    secretBytes: identity.secretBytes
  });
  const { entries, head } = await client.getEntries({ limit: 50 });
  if (entries.length > 0)
    ok4(renderEntries(entries));
  const widths = entries.map((e) => e.submission.sender.length);
  let senderWidth = widths.length > 0 ? Math.min(28, Math.max(12, Math.max(...widths))) : undefined;
  let since = head.seq;
  let inputExit;
  const inputClosed = new Promise((resolve3) => {
    inputExit = resolve3;
  });
  const ac = new AbortController;
  const input = startChatInput({
    prompt: "> ",
    status: ansi(DIM, `— chat as ${identity.id} in ${roomIdFromUrl} (Ctrl+D to exit) —`),
    onSubmit: async (line) => {
      const text = line.trim();
      if (!text)
        return;
      const result = await client.postEntry({ performative: "request", body: text });
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
      for await (const frame of client.follow(since, ac.signal)) {
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
  const body = args2.positional[0] ?? flag4(args2, "body");
  if (!body)
    die4("post: body is required (positional or --body)");
  const thread = flag4(args2, "thread");
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const input = { performative: "request", body };
  if (thread)
    input.thread = thread;
  const result = await client.postEntry(input);
  if (!result.ok)
    die4(`post failed: [${result.error}] ${result.detail}`);
  ok4(`Posted seq=${result.seq}`);
}
async function cmdAnnounce(args2) {
  const taskRef = args2.positional[0];
  if (!taskRef)
    die4("announce: <task_ref> is required");
  const body = requiredFlag(args2, "body", "announce");
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const verdictBy = flag4(args2, "verdict-by");
  const claimWinStr = flag4(args2, "claim-window-s");
  const leaseTtlStr = flag4(args2, "lease-ttl-s");
  const maxClaimStr = flag4(args2, "max-claim-s");
  const dependsOn = flag4(args2, "depends-on");
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
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const result = await client.postEntry({ performative: "announce", task_ref: taskRef, body, data });
  if (!result.ok)
    die4(`announce failed: [${result.error}] ${result.detail}`);
  ok4(`Announced ${taskRef} (seq=${result.seq})`);
}
async function simpleTaskCmd(performative, args2, requireBody = false) {
  const taskRef = args2.positional[0];
  if (!taskRef)
    die4(`${performative}: <task_ref> is required`);
  const body = flag4(args2, "body");
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  if (requireBody && !body)
    die4(`${performative}: --body is required`);
  const artifacts = flag4(args2, "artifact");
  const input = { performative, task_ref: taskRef };
  if (body)
    input.body = body;
  if (artifacts)
    input.artifacts = artifacts.split(",").map((s) => s.trim());
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const result = await client.postEntry(input);
  if (!result.ok)
    die4(`${performative} failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  ok4(`${performative} ${taskRef} (seq=${result.seq})`);
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
async function cmdDeliver(args2) {
  if (!args2.positional[0])
    die4("deliver: <task_ref> is required");
  let m;
  try {
    m = resolveDeliverMode({ dir: flag4(args2, "dir"), artifact: flag4(args2, "artifact") });
  } catch (err2) {
    die4(err2 instanceof Error ? err2.message : String(err2));
  }
  if (m.mode === "ref") {
    return simpleTaskCmd("deliver", args2);
  }
  const taskRef = args2.positional[0];
  const body = flag4(args2, "body");
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const { bytes, hash, size: size2 } = await packDir(m.dir);
  const put = await client.putArtifact(hash, bytes);
  if (!put.ok)
    die4(`deliver: artifact upload failed: [${put.error}] ${put.detail}`);
  const r = await client.postEntry({
    performative: "deliver",
    task_ref: taskRef,
    artifacts: ["r2:" + hash],
    ...body ? { body } : {}
  });
  if (!r.ok)
    die4(`deliver failed: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
  ok4(`delivered ${taskRef} (seq=${r.seq})  artifact r2:${hash}  (${size2} bytes, ${put.deduped ? "deduped" : "uploaded"})`);
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
async function collectAllEntries(client) {
  const all2 = [];
  let since = 0;
  for (;; ) {
    const { entries } = await client.getEntries({ since, limit: 100 });
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
    die4("fetch: <task|r2:hash> is required");
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const entries = arg.startsWith("r2:") ? [] : await collectAllEntries(client);
  let ref;
  try {
    ref = resolveFetchRef(arg, entries);
  } catch (err2) {
    die4(err2 instanceof Error ? err2.message : String(err2));
  }
  if (ref.kind === "other") {
    ok4(`Artifact is not an R2 tarball: ${ref.raw} (fetch it manually)`);
    return;
  }
  const bytes = await client.getArtifact(ref.hash);
  if (!(bytes instanceof Uint8Array))
    die4(`fetch: [${bytes.error}] ${bytes.detail}${bytes.hint ? " — " + bytes.hint : ""}`);
  const name = arg.startsWith("r2:") ? ref.hash : arg;
  const dest = resolve2(flag4(args2, "into") ?? join4(home ?? meshHome(), "artifacts", name));
  await unpackInto(bytes, dest);
  ok4(`Extracted to ${dest}`);
}
var REFETCH_DEBOUNCE_MS = 300;
var TICK_MS = 5000;
var RECENT_LINES_CAP = 6;
function cancelableDelay(ms) {
  const { promise, resolve: resolve3 } = Promise.withResolvers();
  const timer = setTimeout(resolve3, ms);
  return { promise, cancel: () => {
    clearTimeout(timer);
    resolve3();
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
async function followFilePlane(client, since, onLine) {
  let senderWidth;
  for await (const frame of client.follow(since)) {
    if (frame.type === "entry" && isFilePlaneEntry(frame.entry.submission.performative)) {
      since = frame.entry.seq;
      if (senderWidth === undefined)
        senderWidth = Math.min(28, Math.max(12, frame.entry.submission.sender.length));
      onLine(scrubControl(renderEntry(frame.entry, { senderWidth })), since);
    }
  }
}
var FS_CMDS = {
  put: async (client, args2) => {
    const localPath = args2.positional[0];
    if (!localPath)
      die4("fs put: <path> is required");
    const as = flag4(args2, "as") ?? localPath;
    const bytes = new Uint8Array(readFileSync4(localPath));
    const result = await fsPutOcc(client, as, bytes);
    if (!result.ok) {
      if (result.kind === "conflict") {
        writeFileSync4(localPath, result.conflictedText, "utf8");
        die4(`fs put: merge conflict in ${as} — conflict markers written to ${localPath}`);
      }
      die4(`fs put: [${result.error}]${result.detail ? " " + result.detail : ""}${result.hint ? " — " + result.hint : ""}`);
    }
    ok4(`fs put ${as} (r2:${result.hash}, ${bytes.length} bytes, ${result.deduped ? "deduped" : "uploaded"})`);
  },
  ls: async (client, args2) => {
    const prefix = args2.positional[0];
    const follow = flagBool2(args2, "f");
    const into = flag4(args2, "into") ?? ".mesh/fs";
    const [treeResult, leasesResult, state] = await Promise.all([
      client.getTree(prefix),
      client.listLeases(),
      client.getState()
    ]);
    if ("error" in treeResult)
      die4(`fs ls: [${treeResult.error}] ${treeResult.detail}`);
    if (!Array.isArray(leasesResult))
      die4(`fs ls: [${leasesResult.error}] ${leasesResult.detail}`);
    let rows = treeResult.tree;
    let leases = leasesResult;
    let cachedLocalSizes = localSizes(rows.map((r) => r.path), into);
    const posture = state.defaults.default_access ?? "open";
    const render = (recent = []) => renderWorkspace({
      roomId: client.roomId,
      posture,
      into,
      rows,
      leases,
      localSizes: cachedLocalSizes,
      policyFor,
      now: Date.now(),
      recent
    });
    ok4(render());
    if (!follow)
      return;
    const refetch = async () => {
      const [t, freshLeases] = await Promise.all([client.getTree(prefix), client.listLeases()]);
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
        ok4(render(recentLines));
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
        await followFilePlane(client, since, (line) => {
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
      ok4(footer);
      await followFilePlane(client, since, (line) => {
        ok4(line);
      });
    }
  },
  get: async (client, args2) => {
    const repopath = args2.positional[0];
    if (!repopath)
      die4("fs get: <repopath> is required");
    const into = flag4(args2, "into") ?? ".mesh/fs";
    const t = await client.getTree();
    if ("error" in t)
      die4(`fs get: [${t.error}] ${t.detail}`);
    const node = resolveNode(t.tree, repopath);
    if (!node)
      die4(`fs get: not in tree: ${repopath}`);
    let hash;
    try {
      hash = hashFromRef(node.content_hash);
    } catch (e) {
      die4(`fs get: ${e instanceof Error ? e.message : String(e)}`);
    }
    const blob = await client.getArtifact(hash);
    if (!(blob instanceof Uint8Array))
      die4(`fs get: [${blob.error}] ${blob.detail}${blob.hint ? " — " + blob.hint : ""}`);
    const base = resolve2(into);
    const dest = resolve2(into, node.path);
    if (dest !== base && !dest.startsWith(base + sep2))
      die4("fs get: path escapes target directory");
    mkdirSync5(dirname5(dest), { recursive: true });
    writeFileSync4(dest, blob);
    ok4(dest);
  },
  rm: async (client, args2) => {
    const repopath = args2.positional[0];
    if (!repopath)
      die4("fs rm: <repopath> is required");
    const r = await client.postEntry({ performative: "file.delete", data: { path: repopath } });
    if (!r.ok)
      die4(`fs rm: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
    ok4(`fs rm ${repopath}`);
  },
  edit: fsCmdEdit,
  lock: async (client, args2) => {
    const repopath = args2.positional[0];
    if (!repopath)
      die4("fs lock: <path> is required");
    const r = await client.postEntry({ performative: "file.lock", data: { path: repopath } });
    if (!r.ok) {
      if (r.error === "path_locked") {
        const holder = extractLockHolder(r.detail) ?? "another participant";
        const sub2 = await subscribePathWatch(client, repopath);
        if (!sub2.ok)
          ok4(`fs lock: warning — watch registration failed [${sub2.error}] ${sub2.detail} — you will not be notified of conflicts`);
        die4(`fs lock: path '${repopath}' is locked by '${holder}' — you will be notified when it frees`);
      }
      die4(`fs lock: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
    }
    ok4(`fs lock ${repopath} (seq=${r.seq})`);
    const sub = await subscribePathWatch(client, repopath);
    if (!sub.ok)
      ok4(`fs lock: warning — lock succeeded but watch registration failed [${sub.error}] ${sub.detail} — you will not be notified of conflicts`);
  },
  unlock: async (client, args2) => {
    const repopath = args2.positional[0];
    if (!repopath)
      die4("fs unlock: <path> is required");
    const r = await client.postEntry({ performative: "file.unlock", data: { path: repopath } });
    if (!r.ok)
      die4(`fs unlock: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
    ok4(`fs unlock ${repopath} (seq=${r.seq})`);
    await unsubscribePathWatch(client, repopath);
  },
  grep: async (client, args2) => {
    const query = args2.positional[0];
    if (!query)
      die4("fs grep: <query> is required");
    const prefix = flag4(args2, "prefix");
    const limitStr = flag4(args2, "limit");
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const doHydrate = flagBool2(args2, "hydrate");
    const into = flag4(args2, "into") ?? ".mesh/fs";
    const result = await client.search(query, { prefix, limit });
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
      ok4("(no matches)");
      return;
    }
    for (const r of result.results)
      ok4(grepLine(r));
    if (!doHydrate)
      return;
    await hydrateGrepWinners(client, result.results.map((r) => r.path), into);
  },
  hydrate: async (client, args2) => {
    const prefix = args2.positional[0] ?? "";
    const into = flag4(args2, "into") ?? ".mesh/fs";
    const paths = await hydrateSubtree(client, prefix, into);
    if (paths.length === 0) {
      ok4("(nothing to hydrate)");
      return;
    }
    ok4(`hydrated ${paths.length} file(s) into ${resolve2(into)}`);
  },
  log: async (client, args2) => {
    const follow = flagBool2(args2, "f");
    const tty = process.stdout.isTTY ?? false;
    if (follow) {
      const { entries, head } = await client.getEntries({ limit: 100 });
      const fsEntries = entries.filter((e) => isFilePlaneEntry(e.submission.performative));
      if (fsEntries.length > 0)
        ok4(renderEntries(fsEntries));
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
        ok4(footer);
      for await (const frame of client.follow(since)) {
        if (frame.type === "entry" && isFilePlaneEntry(frame.entry.submission.performative)) {
          if (senderWidth === undefined) {
            senderWidth = Math.min(28, Math.max(12, frame.entry.submission.sender.length));
          }
          const line = renderEntry(frame.entry, { senderWidth });
          if (tty)
            printAboveFooter(line, footer);
          else
            ok4(line);
          since = frame.entry.seq;
        }
      }
      if (tty)
        process.stdout.write(`
`);
    } else {
      const { entries, head } = await client.getEntries({ limit: 200 });
      const fsEntries = entries.filter((e) => isFilePlaneEntry(e.submission.performative));
      if (fsEntries.length === 0) {
        ok4("(no file-plane entries)");
      } else {
        ok4(renderEntries(fsEntries));
      }
      ok4(renderStateHeader(head));
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
  deps: async (client, args2, senderId) => {
    const entryPath = args2.positional[0];
    if (!entryPath)
      die4("fs deps: <path> is required");
    const treeResult = await client.getTree();
    if ("error" in treeResult)
      die4(`fs deps: [${treeResult.error}] ${treeResult.detail}`);
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
      const blob = await client.getArtifact(hash);
      if (!(blob instanceof Uint8Array))
        return "";
      return Buffer.from(blob).toString("utf8");
    };
    const closure = await tsResolver.closure(entryPath, read);
    const state = await client.getState();
    const defaultAccess = state.defaults.default_access ?? "open";
    const grantsResult = await client.listGrants();
    if (!Array.isArray(grantsResult)) {
      die4(`fs deps: [${grantsResult.error}] ${grantsResult.detail}`);
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
      ok4(`${entryPath}: no out-of-entry dependencies found`);
      return;
    }
    const flagged = flagOutOfScope(closure, canRead);
    for (const { path: path3, readable } of flagged) {
      const tag = readable ? "[readable]" : "[unreadable — run: mesh fs request " + path3 + "]";
      ok4(`  ${path3}  ${tag}`);
    }
  },
  request: async (client, args2) => {
    const requestPath = args2.positional[0];
    if (!requestPath)
      die4("fs request: <path> is required");
    const grade = flag4(args2, "grade") ?? "read";
    if (!isAccessGrade(grade))
      die4("fs request: --grade must be discover|read|write|exclusive");
    const r = await client.postEntry({ performative: "file.request", data: { path: requestPath, grade } });
    if (!r.ok)
      die4(`fs request: [${r.error}] ${r.detail}${r.hint ? " — " + r.hint : ""}`);
    ok4(`fs request ${grade} on ${requestPath} (seq=${r.seq})`);
  }
};
async function cmdFs(args2) {
  const sub = args2.positional.shift();
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const handler = sub ? FS_CMDS[sub] : undefined;
  if (!handler) {
    die4(`usage: mesh fs put <path> [--as <repopath>] | ls [<prefix>] [-f] [--into <dir>] | get <repopath> [--into <dir>] | rm <repopath> | edit <path> [--into <dir>] | lock <path> | unlock <path> | grep <query> [--prefix <path-prefix>] [--limit <n>] [--hydrate [--into <dir>]] | hydrate [<prefix>] [--into <dir>] | grant <subject> <path> <grade> | grants | revoke <subject> <path> | role <participant> <role> | roles | role-rm <participant> <role> | leases | config <open|closed> | deps <path> | request <path> [--grade read]
  write policy by extension: code (.ts .js .py .go .rs …) -> merge on \`put\` · prose (.md .txt) -> shared CRDT via \`edit\` · opt-in serialize: \`lock\`/\`unlock\`
  grades: discover < read < write < exclusive`);
  }
  await handler(client, args2, identity.id);
}
async function cmdDecide(args2) {
  const sub = args2.positional.shift();
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const handler = sub ? DECIDE_CMDS[sub] : undefined;
  if (!handler) {
    die4("usage: mesh decide wait-report [--since <ISO>] [--human <id[,id...]>]");
  }
  await handler(client, args2, identity.id);
}
async function cmdState(args2) {
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const state = await client.getState();
  ok4(renderStateHeader(state.head));
  ok4("");
  ok4("Claims:");
  if (state.claims.length === 0) {
    ok4("  (none)");
  } else {
    for (const claim of state.claims) {
      const holder = claim.holder ? `  holder=${claim.holder}` : "";
      const lease = claim.lease_expires ? `  lease=${claim.lease_expires}` : "";
      ok4(`  ${claim.task_ref}  ${claim.state}${holder}${lease}`);
    }
  }
  ok4("");
  ok4("Roster:");
  const rosterRows = state.roster.map((p) => ({
    participant_id: p.participant_id,
    roles: p.roles,
    specialties: p.specialties,
    owner_team: p.card.owner_team,
    host: p.card.host,
    last_seen_seq: p.last_seen_seq,
    condition: p.condition,
    condition_seq: p.condition_seq,
    retired_seq: p.retired_seq,
    pubkey: p.pubkey
  }));
  ok4(renderRoster(rosterRows));
}
async function cmdWatch(args2) {
  const subCmd = args2.positional[0];
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  let predicate;
  if (subCmd === "task") {
    const taskRef = args2.positional[1];
    const state = args2.positional[2];
    if (!taskRef || !state)
      die4("watch task: usage: mesh watch task <task_ref> <STATE>");
    predicate = { kind: "task_state", task_ref: taskRef, to: state };
  } else if (subCmd === "entry") {
    const perf = flag4(args2, "performative");
    const thread = flag4(args2, "thread");
    const mentionMe = flagBool2(args2, "mention-me");
    const path3 = flag4(args2, "path");
    const participant = flag4(args2, "participant");
    predicate = {
      kind: "entry",
      ...perf !== undefined ? { performative: perf } : {},
      ...thread !== undefined ? { thread } : {},
      ...mentionMe ? { mention_me: true } : {},
      ...path3 !== undefined ? { path: path3 } : {},
      ...participant !== undefined ? { participant } : {}
    };
  } else {
    die4('watch: sub-command must be "task" or "entry"');
  }
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const result = await client.postWatch(predicate);
  if (!result.ok)
    die4(`watch failed: [${result.error}] ${result.detail}`);
  ok4(`Watch registered: ${result.watch_id}`);
}
async function cmdWhoami(args2) {
  const home = flag4(args2, "home");
  const identity = loadIdentity(home);
  if (!identity)
    die4('No identity. Run "mesh keygen --id <id>" first.');
  const h2 = home ?? meshHome();
  ok4(`id:     ${identity.id}`);
  ok4(`pubkey: ${identity.pubkey}`);
  if (identity.roles && identity.roles.length > 0)
    ok4(`roles:  ${identity.roles.join(", ")}`);
  ok4(`home:   ${h2}  (config dir — set MESH_HOME or --home to change)`);
  ok4(`        holds identity.json · rooms.json · active_room`);
  const rooms = loadRooms(home);
  const roomIds = Object.keys(rooms);
  if (roomIds.length > 0) {
    const active = getActiveRoom(home);
    ok4(`rooms:  ${roomIds.map((r) => r === active ? `${r} (active)` : r).join(", ")}`);
  }
}
async function cmdInbox(args2) {
  const sinceStr = flag4(args2, "since");
  const mark = flagBool2(args2, "mark");
  const home = flag4(args2, "home");
  const roomArg = flag4(args2, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die4('No identity. Run "mesh keygen" first.');
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const opts = { mark };
  if (sinceStr !== undefined)
    opts.since = parseInt(sinceStr, 10);
  const result = await client.getEntries(opts);
  if (result.entries.length === 0 && result.notifies.length === 0) {
    ok4("(inbox empty)");
  } else {
    if (result.entries.length > 0)
      ok4(renderEntries(result.entries));
    for (const n of result.notifies) {
      ok4(`  notify  watch=${n.watch_id}  entry_seq=${n.entry_seq}`);
    }
  }
  ok4(renderStateHeader(result.head));
  if (mark)
    ok4("(read cursor advanced)");
}
function usage() {
  ok4(`mesh — shared agent coordination & live workspace

identity:
  init                                                      Interactive setup: profile + identity + room
  keygen --id <id> [--roles a,b]                            Generate an Ed25519 identity keypair
  use <name>                                                Switch the active profile (persisted)
  profile list                                              List profiles (* = active)
  whoami                                                    Show current identity (id, pubkey, home)
  identity list                                             List local identities; flags id/key collisions
  identity copy --from <home> --to <home> [--force]         Reuse one keypair across homes (local-testing only)
  key rotate                                                 Rotate to the pre-committed next key (Intent A)
  key retire                                                 Retire this identity: no further entries may be authored

room:
  room create <room> --owner <id> [--url <base>]            Create a room and join as owner
  room join <room-url> <room>.<secret>                      Join an existing room
  room join <room-url> <room> --passphrase <phrase>         Join with a single-use passphrase invite
  room invite [--show | --rotate]                           Show or rotate the invite secret (owner only)
  room invite --for <id> [--passphrase <p>] [--ttl <s>]     Mint a single-use passphrase invite for one participant id (owner only)
  room invite [--list | --revoke <id>]                      List or revoke pending passphrase invites (owner only)
  room list                                                 List locally-joined rooms (* = active)
  room rm <room_id>                                         Forget a room locally (not a server delete)
  room delete <room_id>                                     Delete the room on the server (owner only)
  room log [-f]                                             Alias for log
    aliases: create-room → room create · join → room join

messaging:
  log [-f]                                                  Show room log (-f: follow)
  chat                                                      Live stream + interactive post
  post <body> [--thread <t>]                                Post a request entry

tasks:
  announce <task_ref> --body <s> [options]                  Post a claimable task
    options: --verdict-by <id>, --claim-window-s <n>,
             --lease-ttl-s <n>, --max-claim-s <n>,
             --depends-on <ref[,ref]>
  claim <task_ref>                                          Claim a task (first writer wins — CAS)
  release <task_ref>                                        Release a held task
  deliver <task_ref> [--dir <path> | --artifact <ref>] [--body <s>]    Deliver artifacts
  accept <task_ref> [--body <s>]                            Accept delivery → DONE
  reject <task_ref> --body <reason>                         Reject delivery → back to ANNOUNCED
  inform <task_ref> --body <s>                              Post a progress update (no state change)
  fetch <task|r2:hash> [--into <dir>]                       Download + extract a delivered artifact
  watch task <task_ref> <STATE>                             Register a task-state watch
  watch entry [--performative P] [--thread T]               Register an entry watch
            [--mention-me] [--path <p>] [--participant <id>]

files:
  fs put <path> [--as <repopath>]                           Upload file to the shared workspace (OCC merge-on-write)
  fs ls [<prefix>] [-f] [--into <dir>]                      List the shared workspace tree (-f: live view — tree, leases, hydration)
  fs get <repopath> [--into <dir>]                          Hydrate a file from the workspace (default: .mesh/fs)
  fs rm <repopath>                                          Delete a file from the workspace
  fs edit <path> [--into <dir>]                             Subscribe + edit a live Yjs doc (Ctrl+C to exit)
  fs lock <path>                                            Acquire exclusive lease (file.lock)
  fs unlock <path>                                          Release exclusive lease (file.unlock)
  fs grep <query> [--prefix p] [--limit n] [--hydrate]     Search file content; --hydrate fetches matched files
  fs log [-f]                                               Show workspace changes (file.*, system.grant/role/revoke/lease_clear/config) (-f: follow)
  fs hydrate [<prefix>] [--into <dir>]                      Bulk-download subtree to disk (default: .mesh/fs)
  fs grant <subject> <path> <grade>                         Issue a path grant (owner only; grade: discover|read|write|exclusive)
  fs grants                                                 List all path grants in the room
  fs revoke <subject> <path>                                Revoke a previously issued path grant (owner only)
  fs role <participant> <role> [--replaces <id>] [--depth <n>] [--from <iso>] [--until <iso>] [--override]
                                                             Bind (or swap) a participant to a file-plane role (owner only)
  fs roles                                                  List all role bindings in the room
  fs role-rm <participant> <role>                           Unbind a participant's file-plane role (owner only)
  fs leases                                                 List all active file leases
  fs config <open|closed>                                   Set the room's default_access posture (owner only)
  fs deps <path>                                            Walk a file's import closure; flag deps you can't read
  fs request <path> [--grade read]                          Post an advisory access request for a path

agent:
  state                                                     Show claims table + roster
  inbox [--since <seq>] [--mark]                            Fetch entries since your read cursor

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
`);
}
function expandHome(p) {
  return p.startsWith("~/") ? os2.homedir() + p.slice(1) : p;
}
async function cmdIdentity(args2) {
  const sub = args2.positional.shift();
  switch (sub) {
    case "list":
      return cmdIdentityList();
    case "copy":
      return cmdIdentityCopy(args2);
    default:
      die4(`identity: unknown action "${sub ?? ""}". Use: mesh identity list|copy`);
  }
}
function cmdIdentityList() {
  const homes = listIdentityHomes();
  if (homes.length === 0) {
    ok4('No identities under ~/.mesh*. Run "mesh keygen --id <id>".');
    return;
  }
  const current = process.env["MESH_HOME"] ?? meshHome();
  const keysById = new Map;
  for (const { identity } of homes) {
    const set = keysById.get(identity.id) ?? new Set;
    set.add(identity.pubkey);
    keysById.set(identity.id, set);
  }
  ok4(`Local identities (~/.mesh*) — current MESH_HOME: ${current}`);
  for (const { home, identity } of homes) {
    const mark = home === current ? "*" : " ";
    const dupe = (keysById.get(identity.id)?.size ?? 1) > 1 ? "  ⚠ id reused with a different key" : "";
    ok4(`${mark} ${home}`);
    ok4(`    ${identity.id}  ${identity.pubkey}${dupe}`);
  }
  const collided = [...keysById.entries()].filter(([, s]) => s.size > 1).map(([id2]) => id2);
  if (collided.length > 0) {
    ok4(``);
    ok4(`⚠ Same id, different keypairs: ${collided.join(", ")}. A room trusts only the FIRST key an id`);
    ok4(`  used (trust-on-first-use); the others hit id_taken on join. Reconcile into one identity:`);
    ok4(`    mesh identity copy --from <home-that-owns-the-room> --to <other-home> --force`);
  }
}
async function cmdIdentityCopy(args2) {
  const fromArg = flag4(args2, "from");
  const toArg = flag4(args2, "to");
  if (!fromArg || !toArg)
    die4("identity copy: usage: mesh identity copy --from <home> --to <home> [--force]");
  const from2 = expandHome(fromArg);
  const to = expandHome(toArg);
  if (from2 === to)
    die4("identity copy: --from and --to are the same home");
  const src = loadIdentity(from2);
  if (!src)
    die4(`identity copy: no identity.json in ${from2}`);
  const dst = loadIdentity(to);
  if (dst && !flagBool2(args2, "force")) {
    die4(`identity copy: ${to} already has identity "${dst.id}" (${dst.pubkey}). Use --force to overwrite.`);
  }
  saveIdentity(src, to);
  ok4(`Copied identity → ${to}`);
  ok4(`  ${src.id}  ${src.pubkey}`);
  ok4(`Both homes now share ONE keypair (local-testing only — they are now the SAME participant,`);
  ok4(`not isolated agents). Use separate keygen'd identities for anything real.`);
}
async function main() {
  const argv = process.argv.slice(2);
  const args2 = parseArgs(argv);
  if (!flag4(args2, "home")) {
    args2.flags["home"] = resolveProfileHome(flag4(args2, "profile"));
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
    case "log":
      return cmdLog(args2);
    case "chat":
      return cmdChat(args2);
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
    case "fetch":
      return cmdFetch(args2);
    case "fs":
      return cmdFs(args2);
    case "decide":
      return cmdDecide(args2);
    case "use": {
      const name = args2.positional.shift();
      if (!name)
        die4("use: <profile-name> is required");
      setActiveProfile(name);
      ok4(`Active profile set to "${name}".`);
      return;
    }
    case "profile": {
      const sub = args2.positional.shift();
      if (sub === "list") {
        const profiles = listProfiles();
        if (profiles.length === 0) {
          ok4("No profiles. Create one with: mesh use <name>");
          return;
        }
        const active = getActiveProfile();
        for (const p of profiles)
          ok4(`${p === active ? "*" : " "} ${p}`);
        return;
      }
      die4(`profile: unknown subcommand "${sub ?? ""}". Available: list`);
      return;
    }
    case "help":
    case "--help":
    case "-h":
    case undefined:
      usage();
      break;
    default: {
      const roomSubs = ["rm", "delete", "list", "create", "join", "remove", "forget"];
      if (cmd && roomSubs.includes(cmd))
        die4(`Unknown command: ${cmd}. Did you mean "mesh room ${cmd}"?`);
      die4(`Unknown command: ${cmd}. Run "mesh help" for usage.`);
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
  resolveFetchRef,
  resolveDeliverMode,
  localSizes,
  isFilePlaneEntry,
  hydrateSubtree,
  hydrateGrepWinners,
  grepLine,
  generatePassphrase,
  flagOutOfScope,
  extractInviteSecret,
  collectAllEntries
};
