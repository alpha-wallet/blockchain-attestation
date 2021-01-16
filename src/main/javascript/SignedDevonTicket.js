import {
  BitString,
  compareSchema,
  Integer,
  OctetString,
  Sequence,
  fromBER,
  ObjectIdentifier
} from "asn1js";
import { getParametersValue, clearProps, bufferToHexCodes } from "pvutils";
import PublicKeyInfo from "./pki_src/PublicKeyInfo.js";

export class DevconTicket {
  //**********************************************************************************
  /**
   * Constructor for Attribute class
   * @param {Object} [source={}] source is an object
   * @param {Object} [source:ArrayBuffer] source is DER encoded
   * @param {Object} [source:String]  source is CER encoded
   */
  constructor(source = {}) {
    if (typeof (source) == "string") {
      throw new TypeError("Unimplemented: Not accepting string yet.")
    }
    if (source instanceof ArrayBuffer) {
      const asn1 = fromBER(source)
      this.fromSchema(asn1.result);
    } else {
      this.devconId = getParametersValue(
          source,
          "devconId"
      );
      this.ticketId = getParametersValue(
          source,
          "ticketId"
      );
      this.ticketClass = getParametersValue(
          source,
          "ticketClass"
      );
    }
  }

  static schema(parameters = {}) {
    const names = getParametersValue(parameters, "names", {});

    return new Sequence({
      name: names.blockName || "ticket",
      value: [
        new Integer({
          name: names.devconId || "devconId",
        }),
        new Integer({
          name: names.ticketId || "ticketId",
        }),
        new Integer({
          name: names.ticketClass || "ticketClass",
        }),
      ],
    });
  }

  //**********************************************************************************
  /**
   * Convert parsed asn1js object into current class
   * @param {!Object} schema
   */
  fromSchema(schema) {
    //region Clear input data first
    clearProps(schema, [
      //   "ticket",
      "devconId",
      "ticketId",
      "ticketClass",
    ]);
    //endregion

    //region Check the schema is valid
    const asn1 = compareSchema(schema, schema, DevconTicket.schema());

    if (asn1.verified === false)
      throw new Error("Object's schema was not verified against input data for DevconTicket");

    //endregion

    //region Get internal properties from parsed schema
    // noinspection JSUnresolvedVariable

    if ("devconId" in asn1.result) {
      const devconId = asn1.result["devconId"].valueBlock._valueHex;
      this.devconId = asn1.result["devconId"].valueBlock._valueHex;
      // this.devconId = BigInt("0x" + bufferToHexCodes(devconId));
    }

    if ("ticketId" in asn1.result) {
      const ticketId = asn1.result["ticketId"].valueBlock._valueHex;
      this.ticketId = asn1.result["ticketId"].valueBlock._valueHex;

      // this.ticketId = BigInt("0x" + bufferToHexCodes(ticketId));
    }

    if ("ticketClass" in asn1.result) {
      const ticketClass = asn1.result["ticketClass"].valueBlock._valueHex;
      this.ticketClass = asn1.result["ticketClass"].valueBlock._valueHex;

      // this.ticketClass = BigInt("0x" + bufferToHexCodes(ticketClass));
    }

    //endregion
  }

  toSchema() {
    //region Construct and return new ASN.1 schema for this object

    const ticketSequence = new Sequence({
      name: "ticket",
      value: [
        new Integer({
          name: "devconId",
          isHexOnly: true,
          valueHex: this.devconId,
        }),
        new Integer({
          name: "ticketId",
          isHexOnly: true,
          valueHex: this.ticketId,
        }),
        new Integer({
          name: "ticketClass",
          isHexOnly: true,
          valueHex: this.ticketClass,
        }),
      ],
    });

    // verifying the sequence against schema
    const result = compareSchema(ticketSequence, ticketSequence, DevconTicket.schema());
    console.log(result.verified);

    return ticketSequence;
    //endregion
  }

  toJSON() {
    const object = {
      devconId: this.devconId,
      ticketId: this.ticketId,
      ticketClass: this.ticketClass
    };

    return object;
  }
}

export class SignedDevconTicket {
  //**********************************************************************************
  /**
   * Constructor for Attribute class
   * @param {Object} [source={}] source is an object
   * @param {Object} [source:ArrayBuffer] source is DER encoded
   * @param {Object} [source:String]  source is DER encoded
   */
  constructor(source = {}) {
    if (typeof(source) == "string") {

      const ticketEncoded = (source.startsWith("https://")) ?
          (new URL(source)).searchParams.get('ticket') : source;
      
      let base64str = ticketEncoded
          .split('_').join('+')
          .split('-').join('/')
          .split('.').join('=');

      // source = Uint8Array.from(Buffer.from(base64str, 'base64')).buffer;
      if (typeof Buffer !== 'undefined') {
        source = Uint8Array.from(Buffer.from(base64str, 'base64')).buffer;
      } else {
        source = Uint8Array.from(atob(base64str), c => c.charCodeAt(0)).buffer;
      }
      
    }
    if (source instanceof ArrayBuffer) {
      const asn1 = fromBER(source);
      this.fromSchema(asn1.result);
    } else {
      this.ticket = new DevconTicket(source.ticket);

      this.commitment = getParametersValue(
          source,
          "commitment"
      );

      // TODO: issue #75
      // this.signatureAlgorithm = new AlgorithmIdentifier(source.signatureAlgorithm);
	  if(source.publicKeyInfo){
	   //this.publicKeyInfo = new PublicKeyInfo(source.publicKeyInfo);
        this.publicKeyInfo = getParametersValue(
            source,
            "publicKeyInfo",
            SignedDevconTicket.defaultValues("publicKeyInfo")
          );
	  }


      this.signatureValue = getParametersValue(
          source,
          "signatureValue"
      );
    }
  }

  static defaultValues(memberName) {
      switch (memberName) {
        case "publicKeyInfo":
          return new PublicKeyInfo();
        default:
          throw new Error(`Invalid member name for SignedDevconTicket class: ${memberName}`);
      }
    }
  //**********************************************************************************
  /**
   * Return value of pre-defined ASN.1 schema for current class
   *
   * ASN.1 schema:
   * ```asn1
   * CertificateList  ::=  SEQUENCE  {
   *    tbsCertList          TBSCertList,
   *    signatureAlgorithm   AlgorithmIdentifier,
   *    signatureValue       BIT STRING  }
   * ```
   *
   * @param {Object} parameters Input parameters for the schema
   * @returns {Object} asn1js schema object
   */
  static schema(parameters = {}) {
    /**
     * @type {Object}
     * @property {string} [blockName]
     * @property {string} [signatureAlgorithm]
     * @property {string} [signatureValue]
     */
    const names = getParametersValue(parameters, "names", {});

    return new Sequence({
      name: names.blockName || "SignedDevconTicket",
      value: [
        DevconTicket.schema(parameters),
        new OctetString({
          name: "commitment",
        }),
        /* PublicKeyInfo is specified in schema here but not appearing in the constructed data object.
         * This is because the underlying AlgorithmIdentifier isn't fully implemented and also
         * that this data is not important for the 1st delivery deadline, won't be read by client anyway.
         * TODO: add support for PublicKeyInfo https://github.com/TokenScript/attestation/issues/75
         */

        PublicKeyInfo.schema(
            names.publicKeyInfo || {
              names: {
                blockName: "publicKeyInfo",
              },
              optional: true
            }
        ),
        new BitString({
          name: "signatureValue",
        }),
      ],
    });
  }
  //**********************************************************************************
  /**
   * Convert parsed asn1js object into current class
   * @param {!Object} schema
   */
  fromSchema(schema) {
    //region Clear input data first
    clearProps(schema, [
      //   "ticket",
      "ticket",
      "commitment",
      // TODO: #75
	  "publicKeyInfo",
      "signatureValue",
    ]);
    //endregion

    //region Check the schema is valid
    const asn1 = compareSchema(schema, schema, SignedDevconTicket.schema());

    if (asn1.verified === false)
		throw new Error("Object's schema was not verified against input data for SignedDevconTicket");

    //endregion

    //region Get internal properties from parsed schema
    // noinspection JSUnresolvedVariable

    this.ticket = new DevconTicket(asn1.result.ticket.valueBeforeDecode);

    if ("commitment" in asn1.result)
      this.commitment = asn1.result["commitment"].valueBlock.valueHex;

    // TODO: issue #75
    // this.signatureAlgorithm = new AlgorithmIdentifier(asn1.result.signatureAlgorithm);
    if(asn1.result.publicKeyInfo)
	this.publicKeyInfo = new PublicKeyInfo({
      schema: asn1.result.publicKeyInfo,
    });

    const signatureValue = asn1.result.signatureValue;
    this.signatureValue = signatureValue.valueBlock.valueHex;    //endregion
  }

  toSchema() {
    //region Create array for output sequence
    const outputArray = [];

    outputArray.push(this.ticket.toSchema());
    outputArray.push(new OctetString({ valueHex: this.commitment }));

    if (this.publicKeyInfo)
        outputArray.push(new PublicKeyInfo(this.publicKeyInfo).toSchema());

    outputArray.push( new BitString({ valueHex: this.signatureValue } ) );

    //endregion

    //region Construct and return new ASN.1 schema for this object
    return (new Sequence({
      name:"SignedDevconTicket",
      value: outputArray,
    }));
    //endregion
  }
  /**
   * Convertion for the class to JSON object
   * @returns {Object}
   */
  toJSON() {
    const object = {
      ticket: this.ticket.toJSON(),
      commitment: this.commitment,
      signatureValue: this.signatureValue
    };

    return object;
  }

  serialize() {
    let sequence = this.toSchema();

    //verify the sequence against the schema. TODO: we can through the exception in case of invalid schema
    const result = compareSchema(sequence, sequence, SignedDevconTicket.schema());
    console.log(result.verified);

    const signedDevconTicketBER = sequence.toBER(false);
    return new Uint8Array(signedDevconTicketBER)

  }
}