import {AttestedObject} from "./AttestedObject";
import {hexToBuf} from "bigint-conversion";
import {UseToken} from "../asn1/shemas/UseToken";
import {XMLconfigData} from "../data/tokenData";
import {KeyPair} from "./KeyPair";
import {Ticket} from "../Ticket";
import {SignatureUtility} from "./SignatureUtility";
// const { URL } = require('url');
// const { Url } = require('url');
// const {URL} = require('url')
const url = require('url');

export class Eip712Validator {
    private XMLConfig: any;
    protected domain: string;

    constructor() {
        this.XMLConfig = XMLconfigData;
    }

    static stringIsAValidUrl(domain: string): boolean {
        let parsedUrl;

        try {
            parsedUrl = new URL(domain);
        } catch (e) {
            console.log('cant construct url. Error:' + e);
            return false;
        }

        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    };

    setDomain(domain: string){
        if (!Eip712Validator.stringIsAValidUrl(domain)) throw new Error('wrong domain');
        this.domain = domain;
    }

    getDomain(): string{
        return this.domain;
    }

    validateRequest(jsonInput: string) {
        try {
            let authenticationData = JSON.parse(jsonInput);

            let authenticationRootNode = JSON.parse(authenticationData.jsonSigned);

            // console.log(authenticationRootNode);

            let eip712Domain = authenticationRootNode.domain;
            let eip712Message = authenticationRootNode.message;

            console.log('eip712Domain');
            console.log(eip712Domain);
            console.log(eip712Message);

            let attestedObject = this.retrieveAttestedObject(eip712Message);
            //
            // boolean accept = true;
            // accept &= validateDomain(eip712Domain);
            // accept &= validateAuthentication(auth);
            // accept &= verifySignature(authenticationData, attestedObject.getUserPublicKey());
            // accept &= validateAttestedObject(attestedObject);
            // return accept;
        } catch (e) {
            console.error('Validate error!');
            console.error(e);
            return false;
        }
    }

    retrieveAttestedObject(auth: any){
        let attestedObjectHex = auth.payload;

        let attestorKey = KeyPair.publicFromBase64(XMLconfigData.base64attestorPubKey);
        let issuerKey = KeyPair.publicFromBase64(XMLconfigData.base64senderPublicKey);

        let decodedAttestedObject = AttestedObject.fromBytes(new Uint8Array(hexToBuf(attestedObjectHex)), UseToken, attestorKey, Ticket, issuerKey);
        return decodedAttestedObject;
    }

    public verifySignature(signedJsonInput: string, pkAddress: string): boolean {
        // TODO implement

        // console.log('signedJsonInput');
        // console.log(signedJsonInput);
        // console.log(pkAddress);

        let tokenData = JSON.parse(signedJsonInput);
        let signatureInHex = tokenData.signatureInHex;
        let jsonSigned = JSON.parse(tokenData.jsonSigned);

        let publicKey = SignatureUtility.recoverPublicKeyFromTypedMessageSignature(jsonSigned, signatureInHex);
        let userKey = KeyPair.fromPublicHex(publicKey.substr(2));

        console.log('publicKey: ' + publicKey);
        console.log('userKey.getAddress(): ' + userKey.getAddress());

        if (pkAddress.toLowerCase() !== jsonSigned.message.address.toLowerCase()){
            return false;
        }
        return true;

    }
}