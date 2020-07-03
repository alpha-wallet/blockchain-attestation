/**
 * This file was generated by the Objective Systems ASN1C Compiler
 * (http://www.obj-sys.com).  Version: 7.4.2, Date: 03-Jul-2020.
 */
package dk.alexandra.stormbird.cheque;

import com.objsys.asn1j.runtime.*;

public class Proof extends Asn1Seq {
   private static final long serialVersionUID = 55;
   static {
      _setKey (_RedeemChequeRtkey._rtkey);
      Asn1Type._setLicLocation(_RedeemChequeRtkey._licLocation);
   }

   public String getAsn1TypeName()  {
      return "Proof";
   }

   public Asn1OctetString base;
   public Asn1OctetString riddle;
   public Asn1OctetString challengePoint;
   public Asn1OctetString reponseValue;

   public Proof () {
      super();
      init();
   }

   /**
    * This constructor sets all elements to references to the 
    * given objects
    */
   public Proof (
      Asn1OctetString base_,
      Asn1OctetString riddle_,
      Asn1OctetString challengePoint_,
      Asn1OctetString reponseValue_
   ) {
      super();
      base = base_;
      riddle = riddle_;
      challengePoint = challengePoint_;
      reponseValue = reponseValue_;
   }

   /**
    * This constructor allows primitive data to be passed for all 
    * primitive elements.  It will create new object wrappers for 
    * the primitive data and set other elements to references to 
    * the given objects 
    */
   public Proof (byte[] base_,
      byte[] riddle_,
      byte[] challengePoint_,
      byte[] reponseValue_
   ) {
      super();
      base = new Asn1OctetString (base_);
      riddle = new Asn1OctetString (riddle_);
      challengePoint = new Asn1OctetString (challengePoint_);
      reponseValue = new Asn1OctetString (reponseValue_);
   }

   public void init () {
      base = null;
      riddle = null;
      challengePoint = null;
      reponseValue = null;
   }

   public int getElementCount() { return 4; }


   public Object getElementValue(int index){
      switch(index)  {
         case 0: return base;
         case 1: return riddle;
         case 2: return challengePoint;
         case 3: return reponseValue;
         default: return null;
      }
   }


   public String getElementName(int index){
      switch(index)  {
         case 0: return "base";
         case 1: return "riddle";
         case 2: return "challengePoint";
         case 3: return "reponseValue";
         default: return null;
      }
   }


   public void decode
      (Asn1BerDecodeBuffer buffer, boolean explicit, int implicitLength)
      throws Asn1Exception, java.io.IOException
   {
      int llen = (explicit) ?
         matchTag (buffer, Asn1Tag.SEQUENCE) : implicitLength;

      init ();

      // decode SEQUENCE

      Asn1BerDecodeContext _context =
         new Asn1BerDecodeContext (buffer, llen);

      IntHolder elemLen = new IntHolder();

      // decode base

      if (_context.matchElemTag (Asn1Tag.UNIV, Asn1Tag.PRIM, 4, elemLen, false)) {
         buffer.getContext().eventDispatcher.startElement("base", -1);

         this.base = new Asn1OctetString();
         this.base.decode (buffer, true, elemLen.value);

         buffer.getContext().eventDispatcher.endElement("base", -1);
      }
      else throw new Asn1MissingRequiredException (buffer, "base");

      // decode riddle

      if (_context.matchElemTag (Asn1Tag.UNIV, Asn1Tag.PRIM, 4, elemLen, false)) {
         buffer.getContext().eventDispatcher.startElement("riddle", -1);

         this.riddle = new Asn1OctetString();
         this.riddle.decode (buffer, true, elemLen.value);

         buffer.getContext().eventDispatcher.endElement("riddle", -1);
      }
      else throw new Asn1MissingRequiredException (buffer, "riddle");

      // decode challengePoint

      if (_context.matchElemTag (Asn1Tag.UNIV, Asn1Tag.PRIM, 4, elemLen, false)) {
         buffer.getContext().eventDispatcher.startElement("challengePoint", -1);

         this.challengePoint = new Asn1OctetString();
         this.challengePoint.decode (buffer, true, elemLen.value);

         buffer.getContext().eventDispatcher.endElement("challengePoint", -1);
      }
      else throw new Asn1MissingRequiredException (buffer, "challengePoint");

      // decode reponseValue

      if (_context.matchElemTag (Asn1Tag.UNIV, Asn1Tag.PRIM, 4, elemLen, false)) {
         buffer.getContext().eventDispatcher.startElement("reponseValue", -1);

         this.reponseValue = new Asn1OctetString();
         this.reponseValue.decode (buffer, true, elemLen.value);

         buffer.getContext().eventDispatcher.endElement("reponseValue", -1);
      }
      else throw new Asn1MissingRequiredException (buffer, "reponseValue");

      if (!_context.expired()) {
         Asn1Tag _tag = buffer.peekTag ();
         if (_tag.equals (Asn1Tag.UNIV, Asn1Tag.PRIM, 4))  {
            throw new Asn1UnexpectedElementException();
         }

      }
   }

   public int encode (Asn1BerEncodeBuffer buffer, boolean explicit)
      throws Asn1Exception
   {
      int _aal = 0, len;

      // encode reponseValue

      if (this.reponseValue != null) {
         buffer.getContext().eventDispatcher.startElement("reponseValue", -1);

         len = this.reponseValue.encode (buffer, true);
         _aal += len;

         buffer.getContext().eventDispatcher.endElement("reponseValue", -1);
      }
      else throw new Asn1MissingRequiredException ("reponseValue");

      // encode challengePoint

      if (this.challengePoint != null) {
         buffer.getContext().eventDispatcher.startElement("challengePoint", -1);

         len = this.challengePoint.encode (buffer, true);
         _aal += len;

         buffer.getContext().eventDispatcher.endElement("challengePoint", -1);
      }
      else throw new Asn1MissingRequiredException ("challengePoint");

      // encode riddle

      if (this.riddle != null) {
         buffer.getContext().eventDispatcher.startElement("riddle", -1);

         len = this.riddle.encode (buffer, true);
         _aal += len;

         buffer.getContext().eventDispatcher.endElement("riddle", -1);
      }
      else throw new Asn1MissingRequiredException ("riddle");

      // encode base

      if (this.base != null) {
         buffer.getContext().eventDispatcher.startElement("base", -1);

         len = this.base.encode (buffer, true);
         _aal += len;

         buffer.getContext().eventDispatcher.endElement("base", -1);
      }
      else throw new Asn1MissingRequiredException ("base");

      if (explicit) {
         _aal += buffer.encodeTagAndLength (Asn1Tag.SEQUENCE, _aal);
      }

      return (_aal);
   }

   public void print (java.io.PrintWriter _out, String _varName, int _level)
   {
      indent (_out, _level);
      _out.println (_varName + " {");
      if (base != null) base.print (_out, "base", _level+1);
      if (riddle != null) riddle.print (_out, "riddle", _level+1);
      if (challengePoint != null) challengePoint.print (_out, "challengePoint", _level+1);
      if (reponseValue != null) reponseValue.print (_out, "reponseValue", _level+1);
      indent (_out, _level);
      _out.println ("}");
   }

}
