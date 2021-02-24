import {base64ToUint8array, hexStringToArray, stringToArray, uint8ToBn, uint8toBuffer, uint8tohex} from "./utils";
import {Asn1Der} from "./DerUtility";
import {CURVE_SECP256k1, Point} from "./Point";
import {AsnParser} from "@peculiar/asn1-schema";
import {
    PrivateKeyData,
    PrivateKeyInfo, PublicKeyInfoValue,
    SubjectPublicKeyInfo
} from "../asn1/shemas/AttestationFramework";
import {ethers} from "ethers";

let EC = require("elliptic");
let ec = new EC.ec('secp256k1');

let sha3 = require("js-sha3");

const ASN1 = require('@lapo/asn1js');

// G x, y values taken from official secp256k1 document
const G = new Point(55066263022277343669578718895168534326250603453777594175500187360389116729240n,
    32670510020758816978083085130507043184471273380659243275938904335757337482424n);

export class KeyPair {
    private constructor() {}
    private privKey: Uint8Array;
    private pubKey: Uint8Array;
    private ethereumPrefix: string = "\u0019Ethereum Signed Message:\n";
    getPrivateAsHexString(): string{
        return uint8tohex(this.privKey);
    }
    getPrivateAsBigInt(): bigint{
        return uint8ToBn(this.privKey);
    }
    static privateFromBigInt(priv: bigint): KeyPair {
        let me = new this();
        me.privKey = new Uint8Array(hexStringToArray(priv.toString(16).padStart(64, '0')));
        return me;
    }

    // hex string 129-130 symbols with leading 04 (it means uncompressed)
    // TODO test if correct input string
    static fromPublicHex(publicHex: string){
        if (publicHex.length < 129 || publicHex.length > 130) {
            throw new Error('Wrong public hex length');
        }
        let me = new this();
        me.pubKey = new Uint8Array(hexStringToArray(publicHex));
        return me;
    }

    static publicFromBase64(base64: string): KeyPair {
        let me = new this();

        let publicUint8 = base64ToUint8array(base64);

        let pub: PublicKeyInfoValue = AsnParser.parse( uint8toBuffer(publicUint8), PublicKeyInfoValue);

        me.pubKey = new Uint8Array(pub.publicKey);
        return me;
    }

    static publicFromSubjectPublicKeyInfo(spki: SubjectPublicKeyInfo): KeyPair {
        let me = new this();
        me.pubKey = spki.value.publicKey;
        return me;
    }

    static publicFromUint(key: Uint8Array): KeyPair {
        let me = new this();

        if (key.byteLength != 65) {
            console.error('Wrong public key length');
            throw new Error('Wrong public key length');
        }
        me.pubKey = new Uint8Array(key);
        return me;
    }

    static privateFromKeyInfo(spki: PrivateKeyInfo): KeyPair {
        let me = new this();

        let privateKeyObj: PrivateKeyData = AsnParser.parse( spki.keysData, PrivateKeyData);

        me.privKey = new Uint8Array(privateKeyObj.privateKey);
        return me;
    }

    /*
    static privateFromAsn1base64(base64: string): KeyPair {
        let me = new this();

        let privateUint8 = base64ToUint8array(base64);

        let mainSequence = ASN1.decode(privateUint8);
        if (mainSequence.typeName() != "SEQUENCE" || mainSequence.sub.length != 3) {
            throw new Error('Wrong Private Key format(mainSequence)');
        }
        let octetsAsWrapper = mainSequence.sub[2];

        if (octetsAsWrapper.typeName() != "OCTET_STRING" || octetsAsWrapper.sub.length != 1) {
            throw new Error('Wrong Private Key format(octetsAsWrapper)');
        }

        let SequenseAsWrapper = octetsAsWrapper.sub[0];

        if (SequenseAsWrapper.typeName() != "SEQUENCE" || SequenseAsWrapper.sub.length != 4) {
            throw new Error('Wrong Private Key format(SequenseAsWrapper)');
        }

        let privateKeyOctetString = SequenseAsWrapper.sub[1].toHexString();

        let asn1 = new Asn1Der();
        me.privateInHex = asn1.decode(Uint8Array.from(hexStringToArray(privateKeyOctetString)));
        return me;
    }
     */

    // Generate a private key
    static async generateKeyAsync(): Promise<KeyPair> {
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
        const exported = await crypto.subtle.exportKey("raw", keyPair);

        (new Uint8Array(exported)).forEach(i => {
            var h = i.toString(16);
            if (h.length % 2) { h = '0' + h; }
            hex.push(h);
        });
        // the next line works if AES key is always positive

        return this.privateFromBigInt(BigInt(hex.join('')) % CURVE_SECP256k1.n);
    }

    static createKeys(): KeyPair {
        return this.privateFromBigInt(BigInt('0x'+uint8tohex(crypto.getRandomValues(new Uint8Array(32))) ) % CURVE_SECP256k1.n);
    }

    getPublicKeyAsHexStr(): string {
        if (this.pubKey) {
            return uint8tohex(this.pubKey);
        } else {
            let pubPoint = G.multiplyDA(this.getPrivateAsBigInt());
            // prefix 04 means it is uncompressed key
            return '04' + pubPoint.x.toString(16).padStart(64, '0') + pubPoint.y.toString(16).padStart(64, '0')
        }
    }

    getAsnDerPublic():string {
        var pubPoint = this.getPublicKeyAsHexStr();
        // TODO algorithm hardcoded
        let pubPointTypeDescrDER = "3081EC06072A8648CE3D02013081E0020101302C06072A8648CE3D0101022100FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F3044042000000000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000000000000000000704410479BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8022100FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141020101";
        return Asn1Der.encode('SEQUENCE_30',
            pubPointTypeDescrDER +
            Asn1Der.encode('BIT_STRING', pubPoint)
        );
    }

    getAddress(): string {
        var pubPoint = this.getPublicKeyAsHexStr();
        pubPoint = pubPoint.substr(2);
        let hash = sha3.keccak256(hexStringToArray(pubPoint));
        return "0x" + hash.substr(-40);
    }

    signMessage(message: string){
        // TODO
    }
    signBytes(bytes: number[]): string{
        let ecKey = ec.keyFromPrivate(this.getPrivateAsHexString(), 'hex');
        let encodingHash = sha3.keccak256(bytes)
        let signature = ecKey.sign(encodingHash);
        return signature.toDER('hex');
    }

    signStringWithEthereum(message: string): string{
        let ecKey = ec.keyFromPrivate(this.getPrivateAsHexString(), 'hex');
        let finalMsg = this.ethereumPrefix + message.length + message;
        let encodingHash = sha3.keccak256(stringToArray(finalMsg));
        let signature = ecKey.sign(encodingHash);
        return signature.toDER('hex');
    }

    signHexStringWithEthereum(message: string): string{
        return this.signStringWithEthereum('0x' + message);
    }

    signBytesWithEthereum(bytes: number[]): string{
        let message = '0x' + uint8tohex(new Uint8Array(bytes));
        return this.signStringWithEthereum(message);
    }

    verifyHexStringWithEthereum(message: string, signature: string): boolean{
        let finalMsg = '0x' + message;
        let encodingHash = sha3.keccak256(stringToArray(this.ethereumPrefix + finalMsg.length + finalMsg));

        let ecKey = ec.keyFromPublic(this.getPublicKeyAsHexStr(), 'hex');
        var m = signature.match(/([a-f\d]{64})/gi);

        let sign = {
            r: m[0],
            s: m[1]
        };

        // let s = {
        //   r: '5170cdcfb680fa5d7dcb15fa0465be7bc3e75105c986c37ebbab7b1e269b9f41',
        //   s: '5a52405154b46d1b6a5593e45e4b5dbe40a22a713dcc3b43783ff4aaa465886a'
        // };
        return ecKey.verify(encodingHash, sign);
    }
}
