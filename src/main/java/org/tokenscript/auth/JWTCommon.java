package org.tokenscript.auth;

import com.auth0.jwt.algorithms.Algorithm;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

public abstract class JWTCommon {
  public static final long TIMELIMIT_IN_MS = 10000;

  protected Algorithm getAlgorithm(PublicKey pk, PrivateKey secretKey) {
    // SHA 512 is always used for hashing since Auth0 will never accept a key with domain less than the digest size
    // This means that if we are unlucky it won't even accept a 512 bit ECDSA key here if the bit representation happen to be too small
    if (pk instanceof ECPublicKey) {
      return Algorithm.ECDSA512((ECPublicKey) pk, (ECPrivateKey) secretKey);
    } else if (pk instanceof RSAPublicKey) {
      return Algorithm.RSA512((RSAPublicKey) pk, (RSAPrivateKey) secretKey);
    } else {
      throw new UnsupportedOperationException("The key used to sign with is not EC or RSA which are currently the only supported types.");
    }
  }

}