package com.alphawallet.attestation.eip712;

import com.alphawallet.attestation.AttestationRequestWithUsage;
import com.alphawallet.attestation.FullProofOfExponent;
import com.alphawallet.attestation.IdentifierAttestation.AttestationType;
import com.alphawallet.attestation.core.SignatureUtility;
import com.alphawallet.attestation.core.URLUtility;
import com.alphawallet.attestation.core.Validateable;
import com.alphawallet.attestation.core.Verifiable;
import com.alphawallet.attestation.eip712.Eip712AttestationRequestWithUsageEncoder.AttestationRequestWUsageData;
import com.alphawallet.attestation.eip712.Eip712AttestationUsageEncoder.AttestationUsageData;
import java.io.IOException;
import org.bouncycastle.crypto.params.AsymmetricKeyParameter;
import org.tokenscript.eip712.Eip712Issuer;
import org.tokenscript.eip712.Eip712Validator;
import org.tokenscript.eip712.JsonEncodable;

public class Eip712AttestationRequestWithUsage extends Eip712Validator implements JsonEncodable,
    Verifiable, Validateable {
  public static final long DEFAULT_TOKEN_TIME_LIMIT = Eip712AttestationUsage.DEFAULT_TOKEN_TIME_LIMIT;
  public static final long DEFAULT_TIME_LIMIT_MS = Eip712AttestationRequest.DEFAULT_TIME_LIMIT_MS;

  private final long maxTokenValidityInMs;
  private final long acceptableTimeLimit;
  private final AttestationRequestWithUsage attestationRequestWithUsage;
  private final AttestationRequestWUsageData data;
  private final String jsonEncoding;
  private final AsymmetricKeyParameter userPublicKey;

  public Eip712AttestationRequestWithUsage(String attestorDomain, String identifier,
      AttestationRequestWithUsage attestationRequestWithUsage, AsymmetricKeyParameter signingKey) {
    this(attestorDomain, DEFAULT_TIME_LIMIT_MS, DEFAULT_TOKEN_TIME_LIMIT,
        identifier, attestationRequestWithUsage, signingKey);
  }

  public Eip712AttestationRequestWithUsage(String attestorDomain,
      long acceptableTimeLimit, long maxTokenValidityInMs, String identifier,
      AttestationRequestWithUsage attestationRequestWithUsage, AsymmetricKeyParameter signingKey) {
    super(attestorDomain, new Eip712AttestationRequestWithUsageEncoder());
    try {
      this.acceptableTimeLimit = acceptableTimeLimit;
      this.maxTokenValidityInMs = maxTokenValidityInMs;
      this.attestationRequestWithUsage = attestationRequestWithUsage;
      this.jsonEncoding = makeToken(identifier, attestationRequestWithUsage, signingKey);
      this.userPublicKey = retrieveUserPublicKey(jsonEncoding, AttestationRequestWUsageData.class);
      this.data = retrieveUnderlyingObject(jsonEncoding, AttestationRequestWUsageData.class);
    } catch (Exception e ) {
      throw new IllegalArgumentException("Could not encode object");
    }
    constructorCheck();
  }

  public Eip712AttestationRequestWithUsage(String attestorDomain, String jsonEncoding) {
    this(attestorDomain, DEFAULT_TIME_LIMIT_MS, DEFAULT_TOKEN_TIME_LIMIT, jsonEncoding);
  }

  public Eip712AttestationRequestWithUsage(String attestorDomain,
      long acceptableTimeLimit, long maxTokenValidityInMs, String jsonEncoding) {
    super(attestorDomain, new Eip712AttestationRequestWithUsageEncoder());
    try {
      this.acceptableTimeLimit = acceptableTimeLimit;
      this.maxTokenValidityInMs = maxTokenValidityInMs;
      this.jsonEncoding = jsonEncoding;
      this.userPublicKey = retrieveUserPublicKey(jsonEncoding, AttestationRequestWUsageData.class);
      this.data = retrieveUnderlyingObject(jsonEncoding, AttestationRequestWUsageData.class);
      this.attestationRequestWithUsage = new AttestationRequestWithUsage(URLUtility.decodeData(data.getPayload()));
    } catch (Exception e ) {
      throw new IllegalArgumentException("Could not decode object");
    }
    constructorCheck();
  }

  void constructorCheck() throws IllegalArgumentException {
    if (!verify()) {
      throw new IllegalArgumentException("Could not verify Eip712 use attestation");
    }
  }

  String makeToken(String identifier, AttestationRequestWithUsage attestationRequestWithUsage,
      AsymmetricKeyParameter signingKey) throws IOException {
    Eip712Issuer issuer = new Eip712Issuer<AttestationUsageData>(signingKey, encoder);
    String encodedUseAttestation = URLUtility.encodeData(attestationRequestWithUsage.getDerEncoding());
    Timestamp now = new Timestamp();
    Timestamp expirationTime = new Timestamp(now.getTime() + maxTokenValidityInMs);
    AttestationRequestWUsageData data = new AttestationRequestWUsageData(
        encoder.getUsageValue(), identifier, encodedUseAttestation, now, expirationTime);
    return issuer.buildSignedTokenFromJsonObject(data, domain);
  }

  public String getIdentifier() {
    return data.getIdentifier();
  }

  public AsymmetricKeyParameter getUserPublicKey() {
    return userPublicKey;
  }

  public FullProofOfExponent getPok() {
    return attestationRequestWithUsage.getPok();
  }

  public AttestationType getType() {
    return attestationRequestWithUsage.getType();
  }

  public AsymmetricKeyParameter getSessionPublicKey() {
    return attestationRequestWithUsage.getSessionPublicKey();
  }

  @Override
  public String getJsonEncoding() {
    return jsonEncoding;
  }

  @Override
  public boolean checkValidity() {
    long nonceMinTime = Timestamp.stringTimestampToLong(data.getTimestamp()) - acceptableTimeLimit;
    long nonceMaxTime = Timestamp.stringTimestampToLong(data.getTimestamp()) + acceptableTimeLimit;
    if (!Nonce.validateNonce(attestationRequestWithUsage.getPok().getNonce(),
        SignatureUtility.addressFromKey(userPublicKey), domain, new Timestamp(nonceMinTime), new Timestamp(nonceMaxTime))) {
      return false;
    }
    if (!data.getDescription().equals(encoder.getUsageValue())) {
      return false;
    }
    Timestamp time = new Timestamp(data.getTimestamp());
    time.setValidity(maxTokenValidityInMs);
    if (!time.validateAgainstExpiration(Timestamp.stringTimestampToLong(data.getExpirationTime()))) {
      return false;
    }
    return true;
  }

  @Override
  public boolean verify() {
    if (!attestationRequestWithUsage.verify()) {
      return false;
    }
    return true;
  }
}