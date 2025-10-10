/**
 * Reference: https://github.com/spruceid/siwe/blob/main/packages/siwe/lib/client.ts
 */

import { ETHEREUM_GRAMMAR, TRON_GRAMMAR } from './message-grammar';
import { ParsedMessage, parseMessage } from './parsed-message';

export const ethereumGrammarParser: (message: string) => ParsedMessage = parseMessage(ETHEREUM_GRAMMAR, 'sign-in-with-ethereum');
export const tronGrammarParser: (message: string) => ParsedMessage = parseMessage(TRON_GRAMMAR, 'sign-in-with-tron');
