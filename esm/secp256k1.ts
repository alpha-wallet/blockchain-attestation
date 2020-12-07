const CURVE = {
  P: 2n ** 256n - 2n ** 32n - 977n,
  n: 2n ** 256n - 432420386565659656852420866394968145599n
};
class Point {
  static ZERO = new Point(0n, 0n); // Point at infinity aka identity point aka zero
  constructor(public x: bigint, public y: bigint) {}

  // Adds point to itself. http://hyperelliptic.org/EFD/g1p/auto-shortw.html
  double(): Point {
    const X1 = this.x;
    const Y1 = this.y;
    const lam = mod(3n * X1 ** 2n * invert(2n * Y1, CURVE.P));
    const X3 = mod(lam * lam - 2n * X1);
    const Y3 = mod(lam * (X1 - X3) - Y1);
    return new Point(X3, Y3);
  }

  // Adds point to other point. http://hyperelliptic.org/EFD/g1p/auto-shortw.html
  add(other: Point): Point {
    const [a, b] = [this, other];
    const [X1, Y1, X2, Y2] = [a.x, a.y, b.x, b.y];
    if (X1 === 0n || Y1 === 0n) return b;
    if (X2 === 0n || Y2 === 0n) return a;
    if (X1 === X2 && Y1 === Y2) return this.double();
    if (X1 === X2 && Y1 === -Y2) return Point.ZERO;
    const lam = mod((Y2 - Y1) * invert(X2 - X1, CURVE.P));
    const X3 = mod(lam * lam - X1 - X2);
    const Y3 = mod(lam * (X1 - X3) - Y1);
    return new Point(X3, Y3);
  }

  // Elliptic curve point multiplication with double-and-add algo.
  multiplyDA(n: bigint) {
    let p = Point.ZERO;
    let d: Point = this;
    while (n > 0n) {
      if (n & 1n) p = p.add(d);
      d = d.double();
      n >>= 1n;
    }
    return p;
  }

  // Generate a private key
  static async generateKey(): Promise<bigint> {
    // using subtlecrypto to generate a key. note that we are using an AES key
    // as an secp256k1 key here, since browsers don't support the latter;
    // that means all the keys must be created exportable to work with.
    const keyPair = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt']
    );
    let hex = ['0x'];
    const exported = await crypto.subtle.exportKey('raw', keyPair);
    (new Uint8Array(exported)).forEach(i => {
      var h = i.toString(16);
      if (h.length % 2) { h = '0' + h; }
      hex.push(h);
    });
    // the next line works if AES key is always positive
    return BigInt(hex.join('')) % CURVE.n;
  }
}

function mod(a: bigint, b: bigint = CURVE.P): bigint {
  const result = a % b;
  return result >= 0 ? result : b + result;
}

// Eucledian GCD
// https://brilliant.org/wiki/extended-euclidean-algorithm/
function egcd(a: bigint, b: bigint) {
  let [x, y, u, v] = [0n, 1n, 1n, 0n];
  while (a !== 0n) {
    let [q, r] = [b / a, b % a];
    let [m, n] = [x - u * q, y - v * q];
    [b, a] = [a, r];
    [x, y] = [u, v];
    [u, v] = [m, n];
  }
  return [b, x, y];
}

function invert(number: bigint, modulo: bigint = CURVE.P) {
  if (number === 0n || modulo <= 0n) {
    throw new Error('invert: expected positive integers');
  }
  let [gcd, x] = egcd(mod(number, modulo), modulo);
  if (gcd !== 1n) {
    throw new Error('invert: does not exist');
  }
  return mod(x, modulo);
}

// G x, y values taken from official secp256k1 document
const G = new Point(55066263022277343669578718895168534326250603453777594175500187360389116729240n,
		    32670510020758816978083085130507043184471273380659243275938904335757337482424n);
