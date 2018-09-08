### Introduction

Very often, we will need to use Attestations like "Alice lives in Australia" on the blockchain; that is issued by a valid issuer off chain for privacy reasons and is revokable inside a smart contract.

An issuer can create a smart contract where he revokes multiple attestations in one go by building a bloom filter of all the hashes of the revoked attestations.

An issuer can also put the validation method in their smart contract that can be called by other smart contracts who need to validate attestations issued by them. This allows each attester to update their attestation format separately.

### Purpose

This ERC provides an interface for attestation issuers to manage their attestation signing keys and the attestations that are issued off chain for actions such as revocation and validation.

In our draft implementation we include functions to hold cryptographic attestations,
change the issuing contracts of attestations, revoke attestations and verify the authenticity
of a cryptographic attestation.

### Example use cases

Let's say that our friend, Alice, wants to buy a bottle of wine to consume
with her friends. She wants to do the order online and have it delivered to her
home address whilst paying for it with Ether.

Alice has a cryptographic attestation from her local Road and Meritime Services
who
attests to her age, date of birth, country of residence and ability to drive.

Alice is able to split up this attestation (see merkle tree attestations ERC
  [here](https://github.com/alpha-wallet/blockchain-attestation/blob/master/ethereum/lib/MerkleTreeAttestation.sol))
   and provide only the leaf that states she is over the age of 21.

Alice goes to buy the wine through the wine vendors smart contract and feeds in
the merkle tree attestation proving that she is above 21 and can thus buy the
wine, whilst attaching the appropriate amount of ether to complete the purchase.

The issuer smart contract is able to validate her attestation, check
that the issuer contract is valid and capable of performing such an
attestation to her age. In this case it would have to be from someone
like a driver's licence authority, as attestations to age from a
school id are not of a high enough capability.

The wine vendors smart contract validates the attestation, checks the payment
 amount is correct and credits Alice with the wine tokens she needs to complete
 the sale and deliver the wine.

 When the wine vendor shows up to her apartment with the wine, there is no need
 to prove her age again.

### Draft interface

`/* each attestation issuer should provide their own verify() for the
 * attestations they issued. There are two reasons for this. First, we
 * need to leave room for new attestation methods other than the
 * Merkle Tree format we are recommending. Second, the validity of the
 * attestation may depend on the context that only the attester
 * knows. For example, a ticket as an attestation issued on a
 * successful redemption of an American Express credit */
contract Issuer {
  struct Attestation
    {
        bytes32[] merklePath;
        bool valid;
        uint8 v;
        bytes32 r;
        bytes32 s;
        address attester;
        address recipient;
        bytes32 salt;
        bytes32 key;
        bytes32 val;
    }
  /* Verify the authenticity of an attestation */
  function verify(Attestation attestation);
  function addAttesterKey(address newAttester, string capacity, uint expiry);

  /* this should call the revoke first */
  function replaceKey(address attesterToReplace, string capacity, uint expiry, address newAttester);

  /* this revokes a single key */
  function removeKey(address attester);

  /* if the key exists with such capacity and isn't revoked or expired */
  function validateKey(address attester, string capacity) returns (bool);

  /* revoke an attestation by replace the bloom filter, this helps preserve privacy */
  function revokeAttestations(Bloomfilter b);

}`

https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=0x7d63340EC0B3c3702f8159488A6b7E71898d3649&endblock=99999999&startblock=1

Please click [here](https://github.com/alpha-wallet/blockchain-attestation/blob/master/ethereum/example-james-squire/james-squire.sol)
to see a draft implementation of this interface