package org.devcon.ticket;

import com.alphawallet.attestation.core.AttestationCrypto;
import com.alphawallet.attestation.core.DERUtility;
import com.alphawallet.attestation.core.URLUtility;
import com.alphawallet.attestation.ticket.Ticket;
import org.bouncycastle.asn1.ASN1InputStream;
import org.bouncycastle.asn1.ASN1Primitive;
import org.bouncycastle.crypto.AsymmetricCipherKeyPair;
import org.bouncycastle.crypto.util.SubjectPublicKeyInfoFactory;

import java.io.File;
import java.io.FileNotFoundException;
import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Scanner;

public class Issuer {
    static SecureRandom rand = new SecureRandom();

    public static void main(String... args) throws java.lang.Exception {
        int curveLength = AttestationCrypto.curveOrder.toString(2).length();
        /* secret shared between the issuer and the ticket holder */
        BigInteger sharedSecret = new BigInteger(curveLength, rand);
        if (sharedSecret.compareTo(AttestationCrypto.curveOrder) >= 0) {
            main(args);
            return;
        }

        if (args.length != 5) {
            System.err.println("Commandline Options:");
            System.err.println("{key.pem}\tPath to the PEM file that contains the issuer private key.");
            System.err.println("{mail}\tThe email address of the ticket owner.");
            System.err.println("{devconID}\tAn integer which is 6 for Devcon 6.");
            System.err.println("{ticketID}\tAn integer ticket ID.");
            System.err.println("{ticketClass}\tAn integer representing the ticket class.");
        } else {
            File keyFile = new File(args[0]);
            String mail = args[1];
            int devconID = Integer.parseInt(args[2]);
            BigInteger ticketID = new BigInteger(args[3]);
            int ticketClass = Integer.parseInt(args[4]);
            byte[] dataCER = DERUtility.restoreBytes(readFile(keyFile));
            ASN1InputStream asn1InputStream = new ASN1InputStream(dataCER);
            ASN1Primitive dataASN1 = asn1InputStream.readObject();
            asn1InputStream.close();
            // will throw up badly if dataASN1 is not instanceof ASN1Sequence
            AsymmetricCipherKeyPair issuerKeyPair= DERUtility.restoreRFC5915Key(dataASN1);
            Ticket ticket = new Ticket(mail, devconID, ticketID, ticketClass, issuerKeyPair, sharedSecret);
            byte[] senderPublicKey = SubjectPublicKeyInfoFactory.createSubjectPublicKeyInfo(issuerKeyPair.getPublic()).getPublicKeyData().getEncoded();
            String url = URLUtility.encodeList(Arrays.asList(ticket.getDerEncoding(), senderPublicKey));
            url= "https://ticket.devcon.org?ticket=" + url + ";secret=0x" + sharedSecret.toString(16);
            System.out.println(url);
        }
    }

    private static String readFile(File file) throws FileNotFoundException {
        Scanner reader = new Scanner(file);
        StringBuffer buf = new StringBuffer();
        while (reader.hasNextLine()) {
            buf.append(reader.nextLine());
            buf.append(System.lineSeparator());
        }
        reader.close();
        return buf.toString();
    }
}
