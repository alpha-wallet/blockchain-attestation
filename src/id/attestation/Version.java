/**
 * This file was generated by the Objective Systems ASN1C Compiler
 * (http://www.obj-sys.com).  Version: 7.3.4, Date: 19-Nov-2019.
 */
package id.attestation;

import com.objsys.asn1j.runtime.*;

public class Version extends Asn1Integer {
   private static final long serialVersionUID = 55;
   static {
      _setKey (_TICKET_ATTESTATIONRtkey._rtkey);
      Asn1Type._setLicLocation(_TICKET_ATTESTATIONRtkey._licLocation);
   }

   public String getAsn1TypeName()  {
      return "Version";
   }

   public final static int v1 = 0;
   public final static int v2 = 1;
   public final static int v3 = 2;

   public Version () {
      super();
   }

   public Version (long value_) {
      super (value_);
   }

}
