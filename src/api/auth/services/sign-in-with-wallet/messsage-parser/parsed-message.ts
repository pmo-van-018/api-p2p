/**
 * References: https://github.com/spruceid/siwe/blob/main/packages/siwe-parser/lib/abnf.ts
 */

import apgApi from 'apg-js/src/apg-api/api';
import apgLib from 'apg-js/src/apg-lib/node-exports';

export type ParsedMessage = {
  /**
   * RFC 4501 dns authority that is requesting the signing.
   */
  domain: string;
  address: string;
  /**
   * Human-readable ASCII assertion that the user will sign, and it must not
   * contain `\n`.
   */
  statement?: string;
  /**
   * RFC 3986 URI referring to the resource that is the subject of the signing
   *  (as in the __subject__ of a claim).
   */
  uri: string;
  /**
   * Current version of the message.
   */
  version: string;
  /**
   * EIP-155 Chain ID to which the session is bound, and the network where
   * Contract Accounts must be resolved.
   */
  chainId: number;
  /**
   * Randomized token used to prevent replay attacks, at least 8 alphanumeric
   * characters.
   */
  nonce: string;
  /**
   * ISO 8601 datetime string of the current time.
   */
  issuedAt: string;
  /**
   * ISO 8601 datetime string that, if present, indicates when the signed
   * authentication message is no longer valid.
   */
  expirationTime?: string;
  /**
   * ISO 8601 datetime string that, if present, indicates when the signed
   * authentication message will become valid.
   */
  notBefore?: string;
  /**
   * System-specific identifier that may be used to uniquely refer to the
   * sign-in request.
   */
  requestId?: string;
  /**
   * List of information or references to information the user wishes to have
   * resolved as part of authentication by the relying party. They are
   * expressed as RFC 3986 URIs separated by `\n- `.
   */
  resources?: string[];
  /**@deprecated
   * Signature of the message signed by the wallet.
   *
   * This field will be removed in future releases, an additional parameter
   * was added to the validate function were the signature goes to validate
   * the message.
   */
  signature?: string;
};

const parser = new apgLib.parser();
parser.ast = new apgLib.ast();
const id = apgLib.ids;

const domain = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.domain = apgLib.utils.charsToString(
      chars,
      phraseIndex,
      phraseLength
    );
  }
  return ret;
};

const address = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.address = apgLib.utils.charsToString(
      chars,
      phraseIndex,
      phraseLength
    );
  }
  return ret;
};

const statement = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.statement = apgLib.utils.charsToString(
      chars,
      phraseIndex,
      phraseLength
    );
  }
  return ret;
};

const uri = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    if (!data.uri) {
      data.uri = apgLib.utils.charsToString(
        chars,
        phraseIndex,
        phraseLength
      );
    }
  }
  return ret;
};

const version = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.version = apgLib.utils.charsToString(
      chars,
      phraseIndex,
      phraseLength
    );
  }
  return ret;
};

const chainId = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.chainId = apgLib.utils.charsToString(chars, phraseIndex, phraseLength);
  }
  return ret;
};

const nonce = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.nonce = apgLib.utils.charsToString(
      chars,
      phraseIndex,
      phraseLength
    );
  }
  return ret;
};

const issuedAt = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.issuedAt = apgLib.utils.charsToString(
      chars,
      phraseIndex,
      phraseLength
    );
  }
  return ret;
};

const expirationTime = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.expirationTime = apgLib.utils.charsToString(
      chars,
      phraseIndex,
      phraseLength
    );
  }
  return ret;
};

const notBefore = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.notBefore = apgLib.utils.charsToString(
      chars,
      phraseIndex,
      phraseLength
    );
  }
  return ret;
};

const requestId = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.requestId = apgLib.utils.charsToString(
      chars,
      phraseIndex,
      phraseLength
    );
  }
  return ret;
};

const resources = (state, chars, phraseIndex, phraseLength, data) => {
  const ret = id.SEM_OK;
  if (state === id.SEM_PRE) {
    data.resources = apgLib.utils
      .charsToString(chars, phraseIndex, phraseLength)
      .slice(3)
      .split('\n- ');
  }
  return ret;
};

parser.ast.callbacks.domain = domain;
parser.ast.callbacks.address = address;
parser.ast.callbacks.statement = statement;
parser.ast.callbacks.version = version;
parser.ast.callbacks.uri = uri;
parser.ast.callbacks['chain-id'] = chainId;
parser.ast.callbacks.nonce = nonce;
parser.ast.callbacks['issued-at'] = issuedAt;
parser.ast.callbacks['expiration-time'] = expirationTime;
parser.ast.callbacks['not-before'] = notBefore;
parser.ast.callbacks['request-id'] = requestId;
parser.ast.callbacks.resources = resources;

class GrammarApi {
  public static generateApi(grammar: string) {
    const api = new apgApi(grammar);
    api.generate();
    if (api.errors.length) {
      console.error(api.errorsToAscii());
      console.error(api.linesToAscii());
      console.error(api.displayAttributeErrors());
      throw new Error(`ABNF grammar has errors`);
    }
    return api.toObject();
  }
}

type FnParseMessage = (message: string) => ParsedMessage;

export const parseMessage = (grammar: string, startRule: string): FnParseMessage => {
  const grammarApi = GrammarApi.generateApi(grammar);
  return (message: string): ParsedMessage => {
    const result = parser.parse(grammarApi, startRule, message);
    if (!result.success) {
      throw new Error(`Invalid message: ${JSON.stringify(result)}`);
    }
    const elements = {};
    parser.ast.translate(elements);
    return Object.assign({} as ParsedMessage, elements);
  };
};
