import {CURVE_BN256, CURVE_SECP256k1} from "./Point";
let sha3 = require("js-sha3");

export function stringToHex(str: string) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}

export function hexStringToArray(str: string = '') {
    let arr = [];
    let strArr = [...str];
    if (strArr.length % 2) strArr.unshift('0');
    let tempStr = '';
    if (!strArr.length) return [];
    if (typeof strArr != "undefined" && strArr){
        while (strArr.length) {
            tempStr = '';
            // @ts-ignore
            tempStr += strArr.shift() + strArr.shift();
            arr.push(parseInt(tempStr,16));
        }
    }

    return arr;
}

export function mod(a: bigint, b: bigint = CURVE_BN256.P): bigint {
    const result = a % b;
    return result >= 0 ? result : b + result;
}

export function invert(number: bigint, modulo: bigint = CURVE_BN256.P) {
    if (number === 0n || modulo <= 0n) {
        throw new Error('invert: expected positive integers');
    }
    let [gcd, x] = egcd(mod(number, modulo), modulo);
    if (gcd !== 1n) {
        throw new Error('invert: does not exist');
    }
    return mod(x, modulo);
}

// Eucledian GCD
// https://brilliant.org/wiki/extended-euclidean-algorithm/
export function egcd(a: bigint, b: bigint) {
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

export function uint8ToBn(uint8: Uint8Array): bigint{
    return bufToBn(uint8);
}

export function bufToBn(buf: Uint8Array) {
    let hex: string[] = [];
    let u8 = Uint8Array.from(buf);

    u8.forEach(function (i) {
        var h = i.toString(16);
        if (h.length % 2) { h = '0' + h; }
        hex.push(h);
    });

    return BigInt('0x' + hex.join(''));
}

export function bnToUint8(bn: bigint): Uint8Array{
    return bnToBuf(bn);
}

export function bnToBuf(bn: bigint, length = 0): Uint8Array {
    var hex = BigInt(bn).toString(16).padStart(length * 2,'0');
    if (hex.length % 2) { hex = '0' + hex; }

    var len = hex.length / 2;
    var u8 = new Uint8Array(len);

    var i = 0;
    var j = 0;
    while (i < len) {
        u8[i] = parseInt(hex.slice(j, j+2), 16);
        i += 1;
        j += 2;
    }

    return u8;
}

export function uint8merge(list : Uint8Array[]): Uint8Array{
    if (list.length === 1) return list[0];

    let out = Uint8Array.from([]);
    if (list.length === 0) return out;

    for (let i = 0; i< list.length; i++){
        let temp = new Uint8Array(out.length + list[i].length);
        temp.set(out);
        temp.set(list[i], out.length);
        out = temp;
    }
    return out;
}

export function uint8arrayToBase64( bytes: Uint8Array ): string {
    let binary = '';
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }

    if (typeof Buffer !== 'undefined') {
        let buff = new Buffer(binary);
        return buff.toString('base64');
    } else {
        return window.btoa( binary );
    }
}

export function base64toBase64Url(base64: string): string {
    return base64.split('/').join('_')
        .split('+').join('-')
        .split('=').join('.');
}

export function pemOrBase64Orbase64urlToString(base64str: string): string {
    // maybe remove first and last line and concat lines
    let base64StrArray = base64str.split(/\r?\n/);
    if (base64str.slice(0,3) === "---") {
        base64StrArray.shift();
        base64StrArray.pop();
    }
    base64str = base64StrArray.join('')

    // maybe change base64url to base64
    base64str = base64str.split('_').join('/')
        .split('-').join('+')
        .split('.').join('=');

    return base64str;
}
/*
Convert pem/base64/base64url to Uint8Array
 */
export function base64ToUint8array( base64str: string ): Uint8Array {

    base64str = pemOrBase64Orbase64urlToString(base64str);

    let res: Uint8Array;
    if (typeof Buffer !== 'undefined') {
        res = Uint8Array.from(Buffer.from(base64str, 'base64'));
    } else {
        res = Uint8Array.from(atob(base64str), c => c.charCodeAt(0));
    }
    // var asciiStr = window.atob( base64str );
    // let byteArray: number[] = [];
    // for (var i = 0; i < asciiStr.length; i++) {
    //     byteArray.push(asciiStr.charCodeAt(i));
    // }
    // return Uint8Array.from( byteArray );
    return res;
}

export function stringToArray(str: string) {
    var arr = [];
    for(var i=0;i<str.length;i++) {
        arr.push(str.charCodeAt(i));
    }
    return arr;
}

export function BnPowMod(base: bigint, n: bigint, mod: bigint) {
    let res = 1n, cur = base;
    while (n > 0n) {
        if (n & 1n)
            res = (res * cur) % mod;
        cur = (cur * cur) % mod ;
        n >>= 1n;
    }
    return res;
}

export function uint8tohex(uint8: Uint8Array): string {
    return Array.from(uint8).map(i => ('0' + i.toString(16)).slice(-2)).join('');
}

export function uint8toBuffer(uint8: Uint8Array): any {
    if (typeof Buffer != "undefined"){
        // node Buffer
        return Buffer.from(uint8);
    } else {
        // browser ArrayBuffer
        return uint8;
    }
}
// TODO unit test it
export function getInt64Bytes(x: number) {
    let y= Math.floor(x/2**32);
    return new Uint8Array( [y,(y<<8),(y<<16),(y<<24), x,(x<<8),(x<<16),(x<<24)].map(z=> z>>>24) );
}

export function hashStringTo32bytesUint8(str: string): Uint8Array {
    return hashUint8To32bytesUint8(Uint8Array.from( stringToArray(str)));
}

export function hashUint8To32bytesUint8(data: Uint8Array): Uint8Array{
    let arr: number[] = Array.from(data);
    return uint8merge([new Uint8Array(32), new Uint8Array(hexStringToArray(sha3.keccak256(arr)))]).slice(-32);
}
