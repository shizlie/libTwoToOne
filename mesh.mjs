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
var sha512 = /* @__PURE__ */ createHasher(() => new SHA512);

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
  "system.genesis": true,
  "system.join": true,
  "system.leave": true,
  "system.roles": true
};
var ROOM_ONLY = {
  escalate: true,
  "system.genesis": true,
  "system.join": true,
  "system.leave": true,
  "system.roles": true
};
var PARTICIPANT_PERFORMATIVES = Object.keys(PERFORMATIVE_SET).filter((p) => !(p in ROOM_ONLY));
// ../proto/src/machine.ts
var MAX_DURATION_S = 30 * 24 * 60 * 60;
// ../proto/src/ws.ts
var WS_PING = '{"type":"ping"}';
// src/config.ts
function meshHome() {
  return process.env["MESH_HOME"] ?? path.join(os.homedir(), ".mesh");
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
  fs.writeFileSync(path.join(dir, "identity.json"), JSON.stringify(identity, null, 2) + `
`, { encoding: "utf8", mode: 384 });
}
function createIdentity(id, home) {
  const { pubkey, secret } = keygen();
  const identity = {
    id,
    pubkey,
    secret: Buffer.from(secret).toString("base64")
  };
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
    secretBytes: new Uint8Array(Buffer.from(identity.secret, "base64"))
  };
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
function resolveRoom(roomIdOpt, home) {
  const rooms = loadRooms(home);
  if (roomIdOpt) {
    const entry = rooms[roomIdOpt];
    if (!entry) {
      throw new Error(`Room "${roomIdOpt}" not in ${path.join(home ?? meshHome(), "rooms.json")}. Run "mesh join" first.`);
    }
    return { roomId: roomIdOpt, entry };
  }
  const ids = Object.keys(rooms);
  if (ids.length === 0)
    throw new Error('No rooms joined. Run "mesh join" first.');
  if (ids.length > 1)
    throw new Error(`Multiple rooms: ${ids.join(", ")}. Use --room <room_id>.`);
  const roomId = ids[0];
  return { roomId, entry: rooms[roomId] };
}
function buildCard(id, pubkey, secretBytes, opts = {}) {
  const owner_team = opts.owner_team ?? id.split("@")[1] ?? "default";
  const partial = {
    id,
    owner_team,
    skills: opts.skills ?? [],
    roles: opts.roles ?? [],
    pubkey
  };
  const msg = new TextEncoder().encode(jcs(partial));
  return { ...partial, card_sig: signBytes(msg, secretBytes) };
}

// src/client.ts
class MeshClient {
  opts;
  constructor(opts) {
    this.opts = opts;
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
  async _err(res) {
    let body = {};
    try {
      body = await res.json();
    } catch {}
    return {
      ok: false,
      error: body["error"] ?? "unknown_error",
      detail: body["detail"] ?? res.statusText,
      hint: body["hint"],
      retry_after_s: body["retry_after_s"],
      status: res.status
    };
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
      throw new Error(`GET /state failed: ${res.status}`);
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
      throw new Error(`GET /watches failed: ${res.status}`);
    return res.json();
  }
  async deleteWatch(id) {
    await this._delete(`/watches/${encodeURIComponent(id)}`);
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
async function createRoom(workerBaseUrl, roomId, ownerCard, joinSecret, defaults) {
  const url = `${workerBaseUrl}/v1/rooms/${encodeURIComponent(roomId)}/create`;
  const body = {
    owner_id: ownerCard.id,
    owner_card: ownerCard,
    join_secret: joinSecret
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
async function joinRoom(roomUrl, roomId, joinSecret, card, secretBytes) {
  const ts = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const challengeBytes = new TextEncoder().encode(jcs({ room: roomId, id: card.id, ts }));
  const challenge_sig = signBytes(challengeBytes, secretBytes);
  const res = await fetch(`${roomUrl}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ join_secret: joinSecret, card, ts, challenge_sig })
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
  "system.roles": { label: "roles", color: C2.grey }
};
function truncate(s, max) {
  return s.length <= max ? s : s.slice(0, max - 1) + "…";
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
  const { sender, performative, task_ref, body } = submission;
  const seqStr = String(seq).padStart(4, "0");
  const timeStr = fmtTime(room_ts);
  const dateStr = opts.datePrefix ? `${opts.datePrefix} ` : "";
  const style = PERF_STYLE[performative] ?? { label: performative, color: C2.white };
  const labelRaw = style.label.padEnd(8);
  const label = style.bold ? ansi(BOLD + style.color, labelRaw.toUpperCase()) : ansi(style.color, labelRaw);
  const senderStr = ansi(DIM, sender.padEnd(opts.senderWidth));
  const seqLabel = ansi(DIM, `[${seqStr}]`);
  const timeLabel = ansi(DIM, timeStr);
  const taskStr = task_ref ? ansi(C2.yellow, task_ref) + "  " : "";
  const bodyWidth = opts.bodyWidth ?? DEFAULT_BODY_WIDTH;
  const bodySnippet = body ? ansi(DIM, `"${truncate(body, bodyWidth)}"`) : "";
  return `${seqLabel} ${dateStr}${timeLabel}  ${senderStr}  ${label}  ${taskStr}${bodySnippet}`;
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

// src/chat.ts
import { createInterface } from "node:readline";
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
    const rl = createInterface({ input: process.stdin, terminal: false });
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
function flag(args, name) {
  const v = args.flags[name];
  return typeof v === "string" ? v : undefined;
}
function flagBool(args, name) {
  return args.flags[name] !== undefined;
}
function requiredFlag(args, name, cmd) {
  const v = flag(args, name);
  if (!v)
    die(`${cmd}: --${name} is required`);
  return v;
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
async function cmdKeygen(args) {
  const id = requiredFlag(args, "id", "keygen");
  const home = flag(args, "home");
  const existing = loadIdentity(home);
  if (existing && !flagBool(args, "force")) {
    die(`Identity already exists at ${meshHome()}. Use --force to overwrite.`);
  }
  const identity = createIdentity(id, home);
  ok(`Created identity: ${identity.id}`);
  ok(`  pubkey: ${identity.pubkey}`);
}
async function cmdCreateRoom(args) {
  const roomId = args.positional[0];
  if (!roomId)
    die("create-room: <room_id> positional argument is required");
  const ownerId = requiredFlag(args, "owner", "create-room");
  const workerUrl = flag(args, "url") ?? "http://localhost:8787";
  const home = flag(args, "home");
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die(`No identity found. Run "mesh keygen --id ${ownerId}" first.`);
  if (identity.id !== ownerId)
    die(`Identity id "${identity.id}" does not match --owner "${ownerId}"`);
  const card = buildCard(identity.id, identity.pubkey, identity.secretBytes);
  const joinSecret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex");
  const result = await createRoom(workerUrl, roomId, card, joinSecret);
  if (!result.ok)
    die(`create-room failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  const joined = await joinRoom(result.room_url, roomId, joinSecret, card, identity.secretBytes);
  if (!joined.ok) {
    die(`create-room: room created but owner auto-join failed: [${joined.error}] ${joined.detail}${joined.hint ? " — " + joined.hint : ""}`);
  }
  upsertRoom(roomId, { url: result.room_url, token: joined.token, participant_id: joined.participant_id }, home);
  ok(`Room created: ${result.room_url}`);
  ok(`Joined as owner: ${joined.participant_id}`);
  ok(`Invite:       ${result.invite}`);
  ok(`Room pubkey:  ${result.room_pubkey}`);
  ok(`
Share the invite with participants. They run:
  mesh join ${result.room_url} ${result.invite}`);
}
async function cmdJoin(args) {
  const roomUrl = args.positional[0];
  const inviteStr = args.positional[1];
  if (!roomUrl || !inviteStr)
    die("join: usage: mesh join <room-url> <room>.<secret>");
  const home = flag(args, "home");
  const parts = inviteStr.split(".");
  if (parts.length < 2)
    die("join: invite must be in format <room_id>.<join_secret>");
  const joinSecret = parts[parts.length - 1];
  const roomId = parts.slice(0, -1).join(".");
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die('No identity found. Run "mesh keygen --id <id>" first.');
  const card = buildCard(identity.id, identity.pubkey, identity.secretBytes);
  const result = await joinRoom(roomUrl, roomId, joinSecret, card, identity.secretBytes);
  if (!result.ok)
    die(`join failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  upsertRoom(roomId, { url: roomUrl, token: result.token, participant_id: result.participant_id }, home);
  ok(`Joined ${roomId} as ${result.participant_id}`);
  ok(`Head: seq=${result.head.seq} ${result.head.entry_hash}`);
}
async function cmdLog(args) {
  const follow = flagBool(args, "f");
  const home = flag(args, "home");
  const roomArg = flag(args, "room");
  const { entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die('No identity. Run "mesh keygen" first.');
  const roomIdFromUrl = room.url.split("/").pop() ?? "unknown";
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
      ok(renderEntries(entries));
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
      ok(footer);
    for await (const frame of client.follow(since)) {
      if (frame.type === "entry") {
        if (senderWidth === undefined) {
          senderWidth = Math.min(28, Math.max(12, frame.entry.submission.sender.length));
        }
        const line = renderEntry(frame.entry, { senderWidth });
        if (tty)
          printAboveFooter(line, footer);
        else
          ok(line);
        since = frame.entry.seq;
      }
    }
    if (tty)
      process.stdout.write(`
`);
  } else {
    const { entries, head } = await client.getEntries({ limit: 200 });
    if (entries.length === 0) {
      ok("(no entries)");
    } else {
      ok(renderEntries(entries));
    }
    ok(renderStateHeader(head));
  }
}
async function cmdChat(args) {
  const home = flag(args, "home");
  const roomArg = flag(args, "room");
  const { entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die('No identity. Run "mesh keygen" first.');
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
    ok(renderEntries(entries));
  const widths = entries.map((e) => e.submission.sender.length);
  let senderWidth = widths.length > 0 ? Math.min(28, Math.max(12, Math.max(...widths))) : undefined;
  let since = head.seq;
  let inputExit;
  const inputClosed = new Promise((resolve) => {
    inputExit = resolve;
  });
  const ac = new AbortController;
  const input = startChatInput({
    prompt: "> ",
    status: ansi(DIM, `— chat as ${identity.id} (Ctrl+D to exit) —`),
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
async function cmdPost(args) {
  const body = args.positional[0] ?? flag(args, "body");
  if (!body)
    die("post: body is required (positional or --body)");
  const thread = flag(args, "thread");
  const home = flag(args, "home");
  const roomArg = flag(args, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die('No identity. Run "mesh keygen" first.');
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
    die(`post failed: [${result.error}] ${result.detail}`);
  ok(`Posted seq=${result.seq}`);
}
async function cmdAnnounce(args) {
  const taskRef = args.positional[0];
  if (!taskRef)
    die("announce: <task_ref> is required");
  const body = requiredFlag(args, "body", "announce");
  const home = flag(args, "home");
  const roomArg = flag(args, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die('No identity. Run "mesh keygen" first.');
  const verdictBy = flag(args, "verdict-by");
  const claimWinStr = flag(args, "claim-window-s");
  const leaseTtlStr = flag(args, "lease-ttl-s");
  const maxClaimStr = flag(args, "max-claim-s");
  const dependsOn = flag(args, "depends-on");
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
    die(`announce failed: [${result.error}] ${result.detail}`);
  ok(`Announced ${taskRef} (seq=${result.seq})`);
}
async function simpleTaskCmd(performative, args, requireBody = false) {
  const taskRef = args.positional[0];
  if (!taskRef)
    die(`${performative}: <task_ref> is required`);
  const body = flag(args, "body");
  const home = flag(args, "home");
  const roomArg = flag(args, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die('No identity. Run "mesh keygen" first.');
  if (requireBody && !body)
    die(`${performative}: --body is required`);
  const artifacts = flag(args, "artifact");
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
    die(`${performative} failed: [${result.error}] ${result.detail}${result.hint ? " — " + result.hint : ""}`);
  ok(`${performative} ${taskRef} (seq=${result.seq})`);
}
async function cmdState(args) {
  const home = flag(args, "home");
  const roomArg = flag(args, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die('No identity. Run "mesh keygen" first.');
  const client = new MeshClient({
    roomUrl: room.url,
    token: room.token,
    senderId: identity.id,
    roomId,
    secretBytes: identity.secretBytes
  });
  const state = await client.getState();
  ok(renderStateHeader(state.head));
  ok("");
  ok("Claims:");
  if (state.claims.length === 0) {
    ok("  (none)");
  } else {
    for (const claim of state.claims) {
      const holder = claim.holder ? `  holder=${claim.holder}` : "";
      const lease = claim.lease_expires ? `  lease=${claim.lease_expires}` : "";
      ok(`  ${claim.task_ref}  ${claim.state}${holder}${lease}`);
    }
  }
  ok("");
  ok("Roster:");
  for (const p of state.roster) {
    ok(`  ${p.id}  [${p.roles.join(", ")}]`);
  }
}
async function cmdWatch(args) {
  const subCmd = args.positional[0];
  const home = flag(args, "home");
  const roomArg = flag(args, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die('No identity. Run "mesh keygen" first.');
  let predicate;
  if (subCmd === "task") {
    const taskRef = args.positional[1];
    const state = args.positional[2];
    if (!taskRef || !state)
      die("watch task: usage: mesh watch task <task_ref> <STATE>");
    predicate = { kind: "task_state", task_ref: taskRef, to: state };
  } else if (subCmd === "entry") {
    const perf = flag(args, "performative");
    const thread = flag(args, "thread");
    const mentionMe = flagBool(args, "mention-me");
    predicate = { kind: "entry" };
    if (perf)
      predicate.performative = perf;
    if (thread)
      predicate.thread = thread;
    if (mentionMe)
      predicate.mention_me = true;
  } else {
    die('watch: sub-command must be "task" or "entry"');
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
    die(`watch failed: [${result.error}] ${result.detail}`);
  ok(`Watch registered: ${result.watch_id}`);
}
async function cmdWhoami(args) {
  const home = flag(args, "home");
  const identity = loadIdentity(home);
  if (!identity)
    die('No identity. Run "mesh keygen --id <id>" first.');
  ok(`id:     ${identity.id}`);
  ok(`pubkey: ${identity.pubkey}`);
  const rooms = loadRooms(home);
  const roomIds = Object.keys(rooms);
  if (roomIds.length > 0) {
    ok(`rooms:  ${roomIds.join(", ")}`);
  }
}
async function cmdInbox(args) {
  const sinceStr = flag(args, "since");
  const mark = flagBool(args, "mark");
  const home = flag(args, "home");
  const roomArg = flag(args, "room");
  const { roomId, entry: room } = resolveRoom(roomArg, home);
  const identity = loadIdentityWithSecret(home);
  if (!identity)
    die('No identity. Run "mesh keygen" first.');
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
    ok("(inbox empty)");
  } else {
    if (result.entries.length > 0)
      ok(renderEntries(result.entries));
    for (const n of result.notifies) {
      ok(`  notify  watch=${n.watch_id}  entry_seq=${n.entry_seq}`);
    }
  }
  ok(renderStateHeader(result.head));
  if (mark)
    ok("(read cursor advanced)");
}
function usage() {
  ok(`mesh — room coordination CLI

Commands:
  keygen --id <id>                                    Generate identity
  create-room <room> --owner <id> [--url <base-url>]  Create a new room
  join <room-url> <room>.<secret>                     Join a room
  log [-f]                                            Show room log (-f: follow)
  chat                                                Live stream + interactive post
  post <body> [--thread <t>]                          Post a request
  announce <task_ref> --body <s> [options]            Announce a task
    options: --verdict-by <id>, --claim-window-s <n>,
             --lease-ttl-s <n>, --max-claim-s <n>,
             --depends-on <ref[,ref]>
  claim <task_ref>                                    Claim a task (CAS)
  release <task_ref>                                  Release a held task
  deliver <task_ref> --artifact <ref> [--body <s>]    Deliver artifacts
  accept <task_ref> [--body <s>]                      Accept delivery
  reject <task_ref> --body <reason>                   Reject delivery
  inform <task_ref> --body <s>                        Post progress inform
  state                                               Show claims + roster
  watch task <task_ref> <STATE>                       Register task-state watch
  watch entry [--performative P] [--thread T]         Register entry watch
            [--mention-me]
  inbox [--since <seq>] [--mark]                      Fetch from read cursor
  whoami                                              Show current identity

Global options:
  --room <room_id>   Target room (if you have multiple rooms)
  --home <dir>       Override MESH_HOME (default: ~/.mesh)
`);
}
async function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const cmd = args.positional.shift();
  switch (cmd) {
    case "keygen":
      return cmdKeygen(args);
    case "create-room":
      return cmdCreateRoom(args);
    case "join":
      return cmdJoin(args);
    case "log":
      return cmdLog(args);
    case "chat":
      return cmdChat(args);
    case "post":
      return cmdPost(args);
    case "announce":
      return cmdAnnounce(args);
    case "claim":
      return simpleTaskCmd("claim", args);
    case "release":
      return simpleTaskCmd("release", args);
    case "deliver":
      return simpleTaskCmd("deliver", args);
    case "accept":
      return simpleTaskCmd("accept", args);
    case "reject":
      return simpleTaskCmd("reject", args, true);
    case "inform":
      return simpleTaskCmd("inform", args, true);
    case "state":
      return cmdState(args);
    case "watch":
      return cmdWatch(args);
    case "whoami":
      return cmdWhoami(args);
    case "inbox":
      return cmdInbox(args);
    case "help":
    case "--help":
    case "-h":
    case undefined:
      usage();
      break;
    default:
      die(`Unknown command: ${cmd}. Run "mesh help" for usage.`);
  }
}
main().catch((err2) => {
  const msg = err2 instanceof Error ? err2.message : String(err2);
  process.stderr.write(`mesh: ${msg}
`);
  process.exit(1);
});
